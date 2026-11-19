# Checklist smoke test — nâng cấp Angular 22

Chạy `yarn start` (cổng 3105), đăng nhập, rồi đi hết các mục. Dùng ở các mốc A–E của
[kế hoạch nâng cấp](2026-11-14-angular-22-implementation-plan.md). Mỗi mốc chép lại danh sách này và đánh dấu.

Mục có `(e2e)` đã có test tự động trong `tools/e2e/` (xem `tools/e2e/README.md`); vẫn kiểm tay cho tới khi bộ e2e chạy ổn định với backend (`tools/e2e/KNOWN_ISSUES.md`). Mục không đánh dấu luôn phải kiểm tay.

## Đăng nhập và phiên

- [ ] Đăng nhập thành công (e2e)
- [ ] Đăng nhập sai nhiều lần thì hiện reCAPTCHA, tích xong đăng nhập được
- [ ] Đăng xuất (e2e)
- [ ] Hết phiên do không thao tác (ng-idle) thì bị đưa về màn đăng nhập (e2e)

## Khung giao diện

- [ ] Menu bên trái mở, thu gọn, chuyển trang (e2e)
- [ ] Menu dropdown trên topbar (người dùng, thao tác nhanh) (e2e: dropdown người dùng)
- [ ] Bảng thông báo trên topbar, các tab bên trong (e2e)
- [ ] Đổi ngôn ngữ (e2e: chỉ kiểm không còn khoá dịch; giao diện không có bộ chọn ngôn ngữ)

## Danh sách và dialog

- [ ] Một danh sách: phân trang, sắp xếp cột, lọc (e2e: phân trang, sắp xếp; lọc kiểm tay)
- [ ] Mở và đóng dialog thêm mới (e2e)
- [ ] Mở dialog sửa, lưu, danh sách cập nhật
- [ ] Xoá có hộp xác nhận
- [ ] Snackbar thông báo sau khi lưu (e2e, nhóm @rw)

## Form

- [ ] Thêm và sửa hồ sơ NCC, thông báo lỗi validate hiện đúng chỗ (e2e: chỉ validate ở dialog Loại giấy tờ; hồ sơ NCC kiểm tay)
- [ ] Ô chọn có tìm kiếm (ngx-mat-select-search)
- [ ] Chip: thêm, xoá
- [ ] Datepicker và datetime-picker (chọn giờ) (e2e: datepicker; datetime-picker kiểm tay)
- [ ] Ô nhập có mask (số, ngày)
- [ ] Checkbox, radio, tab trong form

## Tệp và in ấn

- [ ] Upload file
- [ ] Xem file (file viewer)
- [ ] In (ngx-print) ở Bảo hiểm y tế → Thống kê theo đối tượng
- [ ] Xuất PDF

## Thành phần đặc biệt

- [ ] Biểu đồ trên dashboard (e2e)
- [ ] Biểu đồ ở Quỹ đền ơn đáp nghĩa → Quản lý quỹ
- [ ] Carousel thống kê trên dashboard (e2e)
- [ ] TinyMCE
- [ ] angular-editor
- [ ] CKEditor ở Danh mục → Căn cứ biểu mẫu → Biểu mẫu quà
- [ ] Bình luận: popover, avatar, reaction
- [ ] Thanh tiến độ ở Mẫu số liệu → Giao và ở Kế hoạch vận động
- [ ] Thông báo thời gian thực (SignalR) (e2e: kết nối; thông báo giữa hai người dùng kiểm tay)
