# Vấn đề đã biết của bộ e2e

Cập nhật: 2026-11-19.

## Chưa chạy với backend

Bộ test được viết sau khi đã lên Angular 22, trong môi trường không có backend và tài khoản. Selector lấy từ template trong mã nguồn. Mới chạy thật được nhóm `@nologin` (2 test, PASS trên bản build `prod`). Các test còn lại **chưa chạy lần nào**: lần chạy đầu trên máy có backend có thể lộ selector sai hoặc cách chờ chưa đủ. Khi sửa:

- Test lúc đạt lúc không: sửa cách chờ (`waitFor`, chờ request), không tăng `retries`.
- Lỗi console có sẵn và chấp nhận được: thêm vào `known-console-errors.json` sau khi người phụ trách duyệt.
- Chức năng hỏng thật: sửa app; nếu chưa sửa ngay thì đánh dấu `test.fixme` và ghi vào đây.

Plan gốc yêu cầu chốt baseline trên Angular 13; không làm được vì nhánh đã qua bản 22. Lần chạy đầu trên Angular 22 sẽ là baseline.

## Chưa có test tự động (kiểm tay theo checklist)

- reCAPTCHA (cần nhập sai nhiều lần, dễ khoá tài khoản)
- Lọc danh sách (ô lọc nằm trong `kt-column-option`, mỗi trang một kiểu)
- Sửa, xoá bản ghi (`@rw` đang `test.fixme`: cần cách tìm lại dòng vừa thêm)
- Form hồ sơ NCC (test validate đang dùng dialog Loại giấy tờ), ô chọn có tìm kiếm, chip, ô có mask, datetime-picker
- Upload, xem file, in, xuất PDF
- TinyMCE, angular-editor, CKEditor, bình luận (popover, reaction), thanh tiến độ
- Biểu đồ Quản lý quỹ; thông báo thời gian thực giữa hai người dùng
- Hiệu ứng ripple/hover/nhãn nổi, in ra máy in thật

## Ghi chú

- Sau khi nâng thư viện (2026-11-19), khi chạy với backend dễ lộ lỗi ở: ô có mask (`ngx-mask` 22), TinyMCE 6, upload (`ng2-file-upload` 12), nút In (`ngx-print` 22). Xem việc số 5 trong plan.
- Trang có TinyMCE sẽ báo lỗi console `Unexpected token '<'` do thiếu `tinymce/langs/vi.js` (lỗi có từ trước, xem plan). Nếu chưa sửa thì ghi vào `known-console-errors.json` sau khi người phụ trách duyệt.

- Giao diện không có bộ chọn ngôn ngữ; test chỉ kiểm không còn khoá dịch (dạng `COMMON.CREATE`) trên trang đăng nhập và dashboard.
- Nhóm `@rw` chưa chạy: chưa có database bản sao và `E2E_RESTORE_CMD`.

## SignalR (tạm gác, người phụ trách quyết định 2026-11-20)

Hai test đang `test.fixme`, sẽ xem lại sau:

- `realtime.spec.ts` — SignalR kết nối được: app dùng `skipNegotiation` + WebSockets (không có request `negotiate`); test đã viết lại để chờ socket `/signalr` và gói bắt tay, chưa chạy được lượt nào ổn định.
- `auth.spec.ts` — hết phiên do không thao tác (ng-idle): test tua đồng hồ của trang khoảng 15 phút; trong lúc tua, kết nối SignalR báo `Server timeout elapsed without receiving a message from the server` liên tục (do đồng hồ giả, không phải lỗi app) và việc tua mất hơn 30 giây thật. Muốn bật lại cần người phụ trách duyệt: bỏ qua lỗi đó riêng cho test này, hoặc cho test này thời gian dài hơn.
