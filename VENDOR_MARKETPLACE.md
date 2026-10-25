# Vendor Marketplace

Vendor trả thuê bao (PayPal, tháng/năm) để được đăng sản phẩm số lên AIThubs.
Khách mua sản phẩm **trên site của vendor** (nút "Get This Product" dẫn tới `external_sales_link`).
AIThubs chỉ thu tiền thuê bao, không thu hoa hồng, không giữ tiền bán hàng.

## Luồng

```
Vendor:  /become-vendor → đăng nhập → tạo store (tự động active + dùng thử 14 ngày)
         → /vendor (dashboard) → /vendor/products/new → Submit for review
         → trước khi hết trial: chọn gói → PayPal → /vendor/subscription?paypal=return
Admin:   /admin/products → Approve / Reject (kèm lý do) / Feature / Suspend
Khách:   /marketplace → /products/:slug → mua qua link của vendor (hoặc gửi lead nếu gói Pro+)
```

| Gói | Tháng | Năm | Listing | Analytics | Lead form | Featured |
|---|---|---|---|---|---|---|
| Free Trial (14 ngày) | $0 | — | 3 | ✓ | | |
| Starter | $9.99 | $99.99 | 5 | ✓ | | |
| Pro | $29.99 | $299.99 | 25 | ✓ | ✓ | |
| Enterprise | $99.99 | $999.99 | không giới hạn | ✓ | ✓ | đủ điều kiện |

Giá/giới hạn nằm trong bảng `vendor_plans` — sửa ở đó **và** tạo lại plan PayPal tương ứng
(PayPal không cho đổi giá plan đang có người dùng).

## Dùng thử 14 ngày

- Tự kích hoạt khi vendor tạo store (trigger `trg_start_vendor_trial`), không cần thẻ/PayPal.
- Mỗi tài khoản chỉ 1 lần (`vendors.trial_started_at`, vendor không tự sửa được); tài khoản đã từng có gói không được trial.
- Hết trial: listing tự ẩn; sản phẩm đã duyệt hiện lại ngay khi vendor đăng ký gói trả phí.
- Đăng ký gói trong lúc trial: gói trả phí thay thế trial ngay khi PayPal kích hoạt (không cộng dồn ngày trial còn lại).
- Đổi thời hạn/số listing của trial: sửa `interval '14 days'` trong `start_vendor_trial` và `max_listings` của plan `trial`.

## Analytics & Dashboard

- Trang sản phẩm ghi sự kiện `impression` (view), `outbound_click` (bấm sang site vendor), `lead_capture`.
- Trigger `trg_aggregate_analytics_event` cộng dồn vào `product_analytics_daily` và các cột `total_*`
  → `/vendor` (dashboard) và `/vendor/analytics` đọc số liệu thật (trước đây luôn = 0).
- Sự kiện được ghi từ trình duyệt nên có thể bị bơm số ảo; đủ dùng cho thống kê tham khảo, không dùng để tính tiền.

## Quy tắc (được ép ở database, không chỉ ở UI)

- Sản phẩm chỉ hiển thị công khai khi **đã được admin duyệt** VÀ **vendor còn gói hiệu lực**.
  Hết gói / thanh toán thất bại → toàn bộ listing tự ẩn; gia hạn lại → tự hiện, không cần duyệt lại.
- Vendor sửa nội dung sản phẩm đã duyệt → sản phẩm quay về trạng thái chờ duyệt.
- Vendor không thể tự duyệt, tự featured, hay sửa số liệu (trigger `protect_product_columns`).
- Giới hạn số sản phẩm theo gói (draft + submitted + approved; archived/rejected không tính).
  Chưa có gói vẫn soạn được tối đa 3 bản nháp.
- Hủy gói: PayPal dừng trừ tiền ngay, listing vẫn hiển thị tới hết kỳ đã trả.
- Đổi gói: tạo subscription mới; khi mới active thì subscription cũ tự bị hủy trên PayPal
  (không tính tiền theo tỷ lệ — vendor trả kỳ mới từ ngày đổi).

## Cấu hình (làm tay)

1. **Database**: chạy `supabase/check_migrations.sql` trong SQL Editor để xem file nào còn thiếu, rồi chạy
   lần lượt các file "CẦN CHẠY" trong `supabase/migrations/` theo đúng thứ tự bảng kết quả.
2. **PayPal plans** cho 3 gói × 2 kỳ (6 plan, USD, không dùng thử). Có thể tạo bằng
   `node scripts/create-paypal-plans.js` (script in sẵn câu SQL), hoặc tạo tay rồi chạy:
   ```sql
   update public.vendor_plans set paypal_plan_id_monthly = 'P-...', paypal_plan_id_yearly = 'P-...' where slug = 'starter';
   update public.vendor_plans set paypal_plan_id_monthly = 'P-...', paypal_plan_id_yearly = 'P-...' where slug = 'pro';
   update public.vendor_plans set paypal_plan_id_monthly = 'P-...', paypal_plan_id_yearly = 'P-...' where slug = 'enterprise';
   ```
   Gói chưa có PayPal plan id sẽ báo "not available for purchase yet".
3. **Webhook**: dùng chung webhook PayPal ở `PAYPAL_SETUP.md` (các event `BILLING.SUBSCRIPTION.*`,
   `PAYMENT.SALE.COMPLETED`). Webhook tự phân biệt vendor (`custom_id = vendor:<user_id>`) và VIP.
4. **Deploy** function mới: `supabase functions deploy vendor-billing`.
5. **Tài khoản admin** (SQL Editor):
   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
   ```
6. **Supabase Auth → URL Configuration → Redirect URLs**: thêm `https://aithubs.com/**`
   để đăng nhập Google quay lại đúng trang (ví dụ `/become-vendor#start`).

## Test bằng Sandbox

1. Tài khoản A: `/become-vendor` → "Start free trial" → tạo store → dashboard hiện "Free trial — 14 days left".
2. Tạo sản phẩm thứ 4 trong lúc trial → bị chặn (giới hạn 3).
3. `/vendor/subscription` → chọn Starter → thanh toán sandbox → "Your subscription is active".
4. Tạo sản phẩm có `https://` purchase link → Submit → chưa thấy ở `/marketplace`.
5. Tài khoản admin: `/admin/products` → Approve → sản phẩm xuất hiện ở `/marketplace`.
6. Thử tạo sản phẩm thứ 6 với gói Starter → bị chặn "Listing limit reached".
7. Mở trang sản phẩm vài lần + bấm "Get This Product" → số liệu hiện trên dashboard.
8. Hủy gói → listing vẫn hiện tới `current_period_end`. Đặt `current_period_end` về quá khứ trong DB
   → listing biến mất khỏi `/marketplace`.
