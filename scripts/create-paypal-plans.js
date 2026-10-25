/**
 * Tạo PayPal Product + Billing Plans cho VIP Subscription (USD, có 7 ngày dùng thử)
 * Chạy:  node scripts/create-paypal-plans.js
 * Cần trong .env.local (hoặc .env): PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_BASE
 *
 * Lưu ý: PayPal KHÔNG hỗ trợ VND nên chỉ tạo plan USD.
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_BASE || 'https://api-m.sandbox.paypal.com';
const PRODUCT_ID = 'PROD_AITHUBS_VIP';
const TRIAL_DAYS = 7;

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
  console.error('❌ Thiếu PAYPAL_CLIENT_ID hoặc PAYPAL_SECRET trong .env.local');
  process.exit(1);
}

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Auth failed: ${data.error_description || res.status}`);
  return data.access_token;
}

async function paypal(token, method, path, body, requestId) {
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(requestId && { 'PayPal-Request-Id': requestId }),
    },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : {} };
}

async function ensureProduct(token, id = PRODUCT_ID, name = 'AIThubs VIP Membership') {
  const existing = await paypal(token, 'GET', `/v1/catalogs/products/${id}`);
  if (existing.ok) return;

  const created = await paypal(token, 'POST', '/v1/catalogs/products', {
    id,
    name,
    description: name,
    type: 'SERVICE',
    category: 'SOFTWARE',
  }, `product-${id}`);
  if (!created.ok) throw new Error(`Create product failed: ${JSON.stringify(created.data)}`);
}

function planData(name, intervalUnit, price) {
  return {
    product_id: PRODUCT_ID,
    name,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: { interval_unit: 'DAY', interval_count: TRIAL_DAYS },
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: 1,
        pricing_scheme: { fixed_price: { value: '0', currency_code: 'USD' } },
      },
      {
        frequency: { interval_unit: intervalUnit, interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 2,
        total_cycles: 0, // không giới hạn
        pricing_scheme: { fixed_price: { value: price, currency_code: 'USD' } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  };
}

const plans = [
  { envKey: 'PAYPAL_PLAN_VIP_MONTHLY_USD', data: planData('AIThubs VIP Monthly', 'MONTH', '9.99') },
  { envKey: 'PAYPAL_PLAN_VIP_YEARLY_USD', data: planData('AIThubs VIP Yearly', 'YEAR', '99.00') },
];

// Gói listing cho vendor (không dùng thử). Giá phải khớp bảng vendor_plans.
const VENDOR_PRODUCT_ID = 'PROD_AITHUBS_VENDOR';
const vendorPlans = [
  { slug: 'starter', name: 'Starter', monthly: '9.99', yearly: '99.99' },
  { slug: 'pro', name: 'Pro', monthly: '29.99', yearly: '299.99' },
  { slug: 'enterprise', name: 'Enterprise', monthly: '99.99', yearly: '999.99' },
];

function vendorPlanData(name, intervalUnit, price) {
  return {
    product_id: VENDOR_PRODUCT_ID,
    name,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: { interval_unit: intervalUnit, interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: price, currency_code: 'USD' } },
      },
    ],
    payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CONTINUE', payment_failure_threshold: 3 },
  };
}

async function main() {
  console.log(`🔐 PayPal: ${PAYPAL_BASE}`);
  const token = await getAccessToken();

  console.log(`📦 Đảm bảo product ${PRODUCT_ID} tồn tại...`);
  await ensureProduct(token);

  const results = [];
  for (const plan of plans) {
    const res = await paypal(token, 'POST', '/v1/billing/plans', plan.data, `plan-${plan.envKey}`);
    if (!res.ok) {
      console.error(`❌ ${plan.data.name}: ${JSON.stringify(res.data)}`);
      continue;
    }
    console.log(`✅ ${plan.data.name}: ${res.data.id}`);
    results.push(`${plan.envKey}=${res.data.id}`);
  }

  console.log('\n🎉 Thêm vào Supabase secrets:\n');
  console.log(results.join('\n'));

  console.log(`\n📦 Đảm bảo product ${VENDOR_PRODUCT_ID} tồn tại...`);
  await ensureProduct(token, VENDOR_PRODUCT_ID, 'AIThubs Vendor Listing');

  const sql = [];
  for (const v of vendorPlans) {
    const ids = {};
    for (const [interval, unit, price] of [['monthly', 'MONTH', v.monthly], ['yearly', 'YEAR', v.yearly]]) {
      const res = await paypal(
        token, 'POST', '/v1/billing/plans',
        vendorPlanData(`AIThubs Vendor ${v.name} (${interval})`, unit, price),
        `vendor-plan-${v.slug}-${interval}`,
      );
      if (!res.ok) {
        console.error(`❌ Vendor ${v.name} ${interval}: ${JSON.stringify(res.data)}`);
        continue;
      }
      console.log(`✅ Vendor ${v.name} ${interval}: ${res.data.id}`);
      ids[interval] = res.data.id;
    }
    if (ids.monthly && ids.yearly) {
      sql.push(`update public.vendor_plans set paypal_plan_id_monthly = '${ids.monthly}', paypal_plan_id_yearly = '${ids.yearly}' where slug = '${v.slug}';`);
    }
  }

  console.log('\n🗄️  Chạy SQL sau trong Supabase SQL Editor:\n');
  console.log(sql.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
