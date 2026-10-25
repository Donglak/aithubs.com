// supabase/functions/_shared/paypal.ts
// Helper PayPal REST API dùng chung cho các Edge Function
import type { VipPlan } from './pricing.ts';

const paypalBase = Deno.env.get('PAYPAL_BASE') || 'https://api-m.sandbox.paypal.com';

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPaypalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  if (!clientId || !secret) throw new Error('PayPal is not configured (PAYPAL_CLIENT_ID / PAYPAL_SECRET)');

  const res = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`PayPal auth failed: ${data.error_description || res.status}`);

  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export async function paypalFetch(path: string, init: RequestInit & { requestId?: string } = {}) {
  const token = await getPaypalAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  // PayPal-Request-Id giúp request idempotent (gọi lại không bị tạo/capture 2 lần)
  if (init.requestId) headers['PayPal-Request-Id'] = init.requestId;

  const res = await fetch(`${paypalBase}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

export function approveLink(resource: { links?: { rel: string; href: string }[] }): string | undefined {
  return resource.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href;
}

/** Số tiền dạng cents -> chuỗi PayPal ("19.99") */
export function centsToPaypal(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Chuỗi PayPal ("19.99") -> cents */
export function paypalToCents(value: string | undefined): number {
  return Math.round(parseFloat(value || '0') * 100);
}

/**
 * Capture một PayPal order đã được người mua approve.
 * An toàn khi gọi nhiều lần (từ trang success và từ webhook).
 */
export async function capturePaypalOrder(paypalOrderId: string) {
  const res = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    requestId: `capture-${paypalOrderId}`,
  });
  if (res.ok) return res.data;

  // Đã capture trước đó -> lấy lại trạng thái order
  const issue = res.data?.details?.[0]?.issue;
  if (res.status === 422 && issue === 'ORDER_ALREADY_CAPTURED') {
    const order = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
    if (order.ok) return order.data;
  }
  throw new Error(`PayPal capture failed: ${issue || res.data?.message || res.status}`);
}

/** Lấy thông tin capture đầu tiên từ response order của PayPal */
export function firstCapture(order: any) {
  const unit = order?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    status: capture?.status as string | undefined,
    captureId: capture?.id as string | undefined,
    amountCents: paypalToCents(capture?.amount?.value ?? unit?.amount?.value),
    currency: (capture?.amount?.currency_code ?? unit?.amount?.currency_code)?.toLowerCase() as string | undefined,
    customId: (capture?.custom_id ?? unit?.custom_id) as string | undefined,
  };
}

export async function getPaypalSubscription(subscriptionId: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (!res.ok) throw new Error(`PayPal get subscription failed: ${res.status}`);
  return res.data;
}

const PLAN_ENV: Record<VipPlan, string> = {
  vip_monthly: 'PAYPAL_PLAN_VIP_MONTHLY_USD',
  vip_yearly: 'PAYPAL_PLAN_VIP_YEARLY_USD',
};

export function paypalPlanId(plan: VipPlan): string {
  const id = Deno.env.get(PLAN_ENV[plan]);
  if (!id) throw new Error(`Missing ${PLAN_ENV[plan]} secret`);
  return id;
}

export function planFromPaypalPlanId(planId: string | undefined): VipPlan | null {
  for (const plan of Object.keys(PLAN_ENV) as VipPlan[]) {
    if (planId && Deno.env.get(PLAN_ENV[plan]) === planId) return plan;
  }
  return null;
}

/**
 * Xác thực chữ ký webhook bằng API verify-webhook-signature của PayPal.
 * Giữ nguyên raw body của event (không JSON.parse rồi stringify lại) vì
 * PayPal tính chữ ký trên đúng chuỗi byte đã gửi.
 */
export async function verifyPaypalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
  const fields = {
    auth_algo: headers.get('paypal-auth-algo'),
    cert_url: headers.get('paypal-cert-url'),
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    transmission_time: headers.get('paypal-transmission-time'),
    webhook_id: webhookId,
  };
  if (Object.values(fields).some((v) => !v)) return false;

  const body = `${JSON.stringify(fields).slice(0, -1)},"webhook_event":${rawBody}}`;
  const res = await paypalFetch('/v1/notifications/verify-webhook-signature', { method: 'POST', body });
  return res.ok && res.data?.verification_status === 'SUCCESS';
}
