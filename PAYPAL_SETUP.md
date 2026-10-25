# Thiết lập thanh toán PayPal

PayPal là **cổng thanh toán duy nhất** của site (khách quốc tế, USD).
Khách trả bằng tài khoản PayPal hoặc thẻ Visa/Mastercard (guest checkout) ngay trên trang PayPal.
Giao diện thanh toán dùng i18n (`src/locales/{en,vi}/payment.json`), mặc định tiếng Anh.

## Luồng thanh toán

```
Ebook:  /checkout/ebook?ebookId=3
          → create-checkout-session  (server tự tính giá từ _shared/pricing.ts, tạo PayPal order)
          → PayPal (người mua approve)
          → /payment/success?orderId=...&token=...
          → paypal-confirm            (capture tiền, đối chiếu số tiền, trả link tải)
          → webhook (dự phòng nếu người mua đóng trình duyệt trước khi quay về)

VIP:    /checkout/vip → create-checkout-session (tạo PayPal subscription, 7 ngày dùng thử)
          → PayPal → /payment/success → paypal-confirm (kiểm tra subscription ACTIVE → cấp VIP)
          → webhook xử lý gia hạn / hủy / hết hạn
```

## 1. PayPal Developer Dashboard

1. Vào https://developer.paypal.com/ → **Apps & Credentials** → Create App (loại **Merchant**).
2. Lấy **Client ID** và **Secret** (Sandbox để test, Live khi chạy thật).
3. Tạo plan VIP (sẽ tự tạo product `PROD_AITHUBS_VIP`):
   ```bash
   # cần PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_BASE trong .env.local
   node scripts/create-paypal-plans.js
   ```
   Script in ra `PAYPAL_PLAN_VIP_MONTHLY_USD` và `PAYPAL_PLAN_VIP_YEARLY_USD`.
4. **Webhooks** → Add Webhook:
   - URL: `https://<PROJECT_REF>.supabase.co/functions/v1/webhook?gateway=paypal`
   - Events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`,
     `PAYMENT.SALE.COMPLETED`, `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.UPDATED`,
     `BILLING.SUBSCRIPTION.RE-ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`,
     `BILLING.SUBSCRIPTION.SUSPENDED`, `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - Copy **Webhook ID**. Webhook không có chữ ký hợp lệ sẽ bị từ chối (401).

## 2. Supabase secrets

```bash
supabase secrets set \
  PAYPAL_CLIENT_ID=... \
  PAYPAL_SECRET=... \
  PAYPAL_BASE=https://api-m.sandbox.paypal.com \
  PAYPAL_WEBHOOK_ID=... \
  PAYPAL_PLAN_VIP_MONTHLY_USD=P-... \
  PAYPAL_PLAN_VIP_YEARLY_USD=P-... \
  SITE_URL=https://aithubs.com \
  PAYMENT_GATEWAYS=paypal \
  RESEND_API_KEY=re_... \
  FROM_EMAIL="AIThubs <noreply@aithubs.com>"
```

`SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` được Supabase cấp sẵn cho Edge Functions.
`PAYMENT_GATEWAYS` mặc định là `paypal`. Code Stripe/VNPay/MoMo vẫn còn ở server nhưng bị **tắt hoàn toàn**
(cả checkout lẫn callback) — đừng bật khi chưa cấu hình đủ secret của cổng đó.

## 3. Frontend (.env.local / Netlify env)

```
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

## 4. Database & deploy

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push                      # gồm migration 20240101000004_secure_payments.sql
./scripts/deploy-edge-functions.sh    # webhook được deploy với --no-verify-jwt
```

## 5. Giá & sản phẩm

- Giá thật nằm ở `supabase/functions/_shared/pricing.ts` (server). `src/data/ebooks.ts` chỉ để hiển thị —
  đổi giá phải sửa **cả hai** nơi.
- Quyền lợi gói VIP hiển thị ở checkout: điền mảng `vip.plans.<id>.features` trong `payment.json` (en + vi).
- Link tải ebook trả phí (`deliveryUrl`) chỉ nằm ở server. Nên đặt file Google Drive ở chế độ
  hạn chế hoặc dùng Supabase Storage + signed URL nếu muốn chống chia sẻ link.

## 6. Test bằng Sandbox

1. Tạo tài khoản người mua ở **Sandbox → Accounts** (Personal).
2. Đăng nhập website → `/ebooks` → chọn ebook trả phí → thanh toán bằng tài khoản sandbox.
3. Kiểm tra: trang success hiện nút tải, bảng `orders` có `status = COMPLETED`, `payment_intent_id` = capture id.
4. VIP: `/checkout/vip` → subscribe → bảng `subscriptions` có `status = active`.
5. Hủy VIP (Dashboard → Cancel subscription): subscription PayPal bị hủy ngay (không trừ tiền kỳ sau),
   VIP giữ tới hết kỳ đã trả. Khách cũng có thể hủy trong PayPal → Automatic payments; webhook xử lý tương tự.
6. Thử webhook: PayPal Dashboard → Webhooks → **Webhook simulator** không có chữ ký thật nên sẽ bị trả 401
   — đó là đúng. Hãy test bằng giao dịch sandbox thật.

## 7. Lên production

- Đổi `PAYPAL_BASE=https://api-m.paypal.com`, dùng Client ID/Secret **Live**.
- Chạy lại `create-paypal-plans.js` với credentials Live, tạo lại webhook Live, cập nhật secrets.
