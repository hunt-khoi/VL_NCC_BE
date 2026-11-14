# Checklist smoke test — nâng cấp Angular 22

Chạy `yarn start` (cổng 3105), đăng nhập, rồi đi hết các mục. Dùng ở các mốc A–E của
[kế hoạch nâng cấp](2026-11-14-angular-22-implementation-plan.md). Mỗi mốc chép lại danh sách này và đánh dấu.

## Đăng nhập và phiên

- [ ] Đăng nhập thành công
- [ ] Đăng nhập sai nhiều lần thì hiện reCAPTCHA, tích xong đăng nhập được
- [ ] Đăng xuất
- [ ] Hết phiên do không thao tác (ng-idle) thì bị đưa về màn đăng nhập

## Khung giao diện

- [ ] Menu bên trái mở, thu gọn, chuyển trang
- [ ] Menu dropdown trên topbar (người dùng, thao tác nhanh)
- [ ] Bảng thông báo trên topbar, các tab bên trong
- [ ] Đổi ngôn ngữ

## Danh sách và dialog

- [ ] Một danh sách: phân trang, sắp xếp cột, lọc
- [ ] Mở và đóng dialog thêm mới
- [ ] Mở dialog sửa, lưu, danh sách cập nhật
- [ ] Xoá có hộp xác nhận
- [ ] Snackbar thông báo sau khi lưu

## Form

- [ ] Thêm và sửa hồ sơ NCC, thông báo lỗi validate hiện đúng chỗ
- [ ] Ô chọn có tìm kiếm (ngx-mat-select-search)
- [ ] Chip: thêm, xoá
- [ ] Datepicker và datetime-picker (chọn giờ)
- [ ] Ô nhập có mask (số, ngày)
- [ ] Checkbox, radio, tab trong form

## Tệp và in ấn

- [ ] Upload file
- [ ] Xem file (file viewer)
- [ ] In (ngx-print) ở Bảo hiểm y tế → Thống kê theo đối tượng
- [ ] Xuất PDF

## Thành phần đặc biệt

- [ ] Biểu đồ trên dashboard
- [ ] Biểu đồ ở Quỹ đền ơn đáp nghĩa → Quản lý quỹ
- [ ] Carousel thống kê trên dashboard
- [ ] TinyMCE
- [ ] angular-editor
- [ ] CKEditor ở Danh mục → Căn cứ biểu mẫu → Biểu mẫu quà
- [ ] Bình luận: popover, avatar, reaction
- [ ] Thanh tiến độ ở Mẫu số liệu → Giao và ở Kế hoạch vận động
- [ ] Thông báo thời gian thực (SignalR)
