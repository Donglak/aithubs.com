# Vendor Marketplace

Theo chiến lược "kiếm tiền khi chưa có traffic": **listing miễn phí**, AIThubs kiếm tiền từ affiliate
(link affiliate + mã giảm giá độc quyền của vendor). Gói trả phí (PayPal) đang **tạm dừng** và chỉ mở lại khi
traffic đạt ~5.000 lượt/tháng (công bố ở `/stats`).
Khách mua **trên site của vendor** (nút "Get This Product" dẫn tới `affiliate_url`, nếu không có thì `external_sales_link`).

## Luồng

```
Vendor:  /become-vendor → đăng nhập → tạo store (tự động active, gói Free)
         → /vendor/products/new → điền deal độc quyền HOẶC URL trang có badge (/badge) → Submit for review
Admin:   /admin/products → Approve / Reject (kèm lý do) / Feature / Suspend
Khách:   /marketplace → /products/:slug → mua qua link của vendor (hoặc gửi lead nếu gói Pro+)
```

| Loại listing | Giá | Điều kiện | Được gì |
|---|---|---|---|
| Free | $0 | Gắn badge "Featured on AIThubs" (`badge_url`) | Listing vĩnh viễn, analytics, tối đa 3 sản phẩm |
| Deal Partner | $0 | Mã giảm giá độc quyền ≥ 20% + link affiliate | Như Free + đủ điều kiện Featured (admin bấm Feature), lên `/deals` |
| Basic $19 / Featured $59 | một lần | Chỉ hiển thị "Opens at 5,000 visits/month" | Chưa bán |

- Gói hiệu lực = thuê bao trả phí còn hạn, nếu không có thì gói `free` (`public.vendor_active_plan`,
  migration `20240101000007`). Không còn trial 14 ngày; listing không bị ẩn khi hết trial/hủy gói.
- Điều kiện badge/deal được ép ở DB khi gửi duyệt (`protect_product_columns`, `public.is_deal_partner`).
  Admin vẫn phải mở "Check badge" ở `/admin/products` để xác nhận badge có thật trên site vendor.
- Sửa deal / link affiliate / badge của sản phẩm đã duyệt → quay về chờ duyệt.
- Bảng giá công khai nằm ở `src/data/listingTiers.ts` (ngưỡng traffic `PAID_LISTING_TRAFFIC_THRESHOLD`).

### Bật lại gói trả phí (khi đủ traffic)

```sql
update public.vendor_plans set is_active = true where slug in ('starter', 'pro', 'enterprise');
```
UI tự hiện lại plan cards ở `/become-vendor` và `/vendor/subscription` khi có gói `is_active = true`.
Thuê bao PayPal đang chạy vẫn đồng bộ/hủy bình thường trong lúc tạm dừng.
Giá/giới hạn nằm trong bảng `vendor_plans` — sửa ở đó **và** tạo lại plan PayPal tương ứng
(PayPal không cho đổi giá plan đang có người dùng).

## Analytics & Dashboard

- Trang sản phẩm ghi sự kiện `impression` (view), `outbound_click` (bấm sang site vendor), `lead_capture`.
- Trigger `trg_aggregate_analytics_event` cộng dồn vào `product_analytics_daily` và các cột `total_*`
  → `/vendor` (dashboard) và `/vendor/analytics` đọc số liệu thật (trước đây luôn = 0).
- Sự kiện được ghi từ trình duyệt nên có thể bị bơm số ảo; đủ dùng cho thống kê tham khảo, không dùng để tính tiền.

## Quy tắc (được ép ở database, không chỉ ở UI)

- Sản phẩm chỉ hiển thị công khai khi **đã được admin duyệt** VÀ **vendor đang active** (gói trả phí hoặc Free).
  Vendor bị suspend → toàn bộ listing tự ẩn.
- Vendor sửa nội dung sản phẩm đã duyệt → sản phẩm quay về trạng thái chờ duyệt.
- Vendor không thể tự duyệt, tự featured, hay sửa số liệu (trigger `protect_product_columns`).
- Giới hạn số sản phẩm theo gói (draft + submitted + approved; archived/rejected không tính). Free = 3.
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

## Test

1. Tài khoản A: `/become-vendor` → "List your tool free" → tạo store → dashboard hiện "Free listing".
2. Tạo sản phẩm không có deal/badge → Submit → bị chặn ("Free listings need the badge...").
3. Điền mã giảm 30% + link affiliate `https://` → Submit → thành công, form hiện "Qualifies as Deal Partner".
4. Admin `/admin/products` → thấy "Deal Partner · 30% · CODE" → Approve → Feature.
5. `/marketplace` hiện sản phẩm có nhãn Featured; `/products/:slug` hiện ô deal; `/deals` liệt kê deal.
6. Tạo sản phẩm thứ 4 → bị chặn "Listing limit reached".
