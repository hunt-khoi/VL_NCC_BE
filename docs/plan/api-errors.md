# Log lỗi API phát hiện khi test frontend

Ghi lại lỗi đến từ backend (`D:\NCC_API`, .NET 10, chạy ở `https://localhost:7243`) gặp trong lúc kiểm tra bản nâng cấp Angular 22. Frontend **không sửa API**; mục nào cần xử lý thì bên backend quyết định.

Cập nhật: 2026-11-20.

| # | Ngày | Màn hình | Request | Phản hồi | Ghi chú |
|---|---|---|---|---|---|
| 1 | 2026-11-20 | Niên hạn (`/nien-han`, `/nien-han-duyet`) | `GET api/nhap-nien-han/get-range` | Không còn route (bị hiểu thành `{id}`) | Bị xoá ở commit backend `754cacd` (2026-09-03), không có API thay thế. Frontend dùng `range` để chọn giao diện cho người dùng cấp cơ cấu 2 |
| 2 | 2026-11-20 | Di chuyển (`/di-chuyen`) — nút xem trước đơn đề nghị | `GET api/di-chuyen/get-don-de-nghi?iddc=&idncc=` | Không còn route | Bị xoá ở commit backend `09ff657` (2026-10-05); chỉ còn `export-don-de-nghi` (xuất file) |
| 3 | 2026-11-20 | Cơ cấu tổ chức (`/co-cau-to-chuc`) — form sửa, ô "Chế độ làm việc" | `GET api/lite/GetListShift` | Không còn route | Bị xoá ở commit backend `c79e961` (2026-08-07); ô chọn sẽ trống |
| 4 | 2026-11-20 | Hướng dẫn sử dụng (`/hdsd`) | `GET api/lite/get-version` | Không còn route (đã comment trong `LiteController`) | Frontend đã bỏ lời gọi, dòng "Phiên bản" tự ẩn |
| 5 | 2026-11-20 | Sơ đồ tổ chức (`/so-do-to-chuc`) | `GET api/so-do-to-chuc/` (không có `jobtitleid`) | `400` `The jobtitleid field is required.` | Backend bật `<Nullable>enable</Nullable>`: tham số `string` không có `?` bị coi là bắt buộc. Backend có 37 tham số `string` kiểu này (ô chọn tỉnh/huyện/xã, chức vụ/chức danh...): chỗ nào frontend gửi trống sẽ bị `400` |
| 6 | 2026-11-20 | Mọi màn danh sách | `GET ...?sortField=&sortOrder=...` | `400` `The sortField field is required.` | Cùng nguyên nhân #5. Frontend đã thôi gửi `sortField`/`sortOrder` khi trống (`HttpUtilsService`) |
| 7 | 2026-11-20 | Nhật ký (`/log`), vai trò Chuyên viên sở | `GET api/log/list`, `GET api/log` | `403` | API cần quyền `51`; menu vẫn cho vai trò này vào màn (cả backend cũ lẫn mới) |
| 8 | 2026-11-20 | Hồ sơ cá nhân (`/profile`) | Ảnh `https://localhost:44306/dulieu/images/NguoiDung/...` | `net::ERR_FAILED` | Đường dẫn ảnh/emoji backend trả về trỏ cổng `44306` (không có gì chạy); nhiều khả năng cấu hình `LinkAPI` |
| 9 | 2026-11-20 | Danh mục: cấp quản lý, dân tộc, tôn giáo, chức vụ, chức danh, khóm ấp | Các API danh sách | `NgayCapNhat`/`LastModified` dạng chuỗi `"14/12/2017 11:56"` | Bản cũ trả DateTime (ISO). Frontend đã thêm pipe `viDate` để đọc cả hai dạng |
| 10 | 2026-11-20 | Mẫu số liệu (`/mau-so-lieu`) | API danh sách | `MaxChild: null` | Bản cũ không có trường khi rỗng; frontend đã sửa template để nhận `null` |
| 11 | 2026-11-20 | Thống kê số lượng hồ sơ (`/thong-ke-so-luong-ho-so`) | — | Trang 404 ở frontend | Có trong `Dps_Menu` nhưng frontend không có route (có từ trước nâng cấp) |
| 12 | 2026-11-20 | — | `PUT api/dantoc/999999` (id không tồn tại, chỉ để thử) | `status 0`, `"Có gì đó không đúng"` (mã `0000`, lỗi hệ thống) | Sửa bản ghi không tồn tại bị báo là lỗi hệ thống thay vì "không tồn tại"; có thể kéo theo email báo lỗi |

Các route backend đã đổi tên và frontend đã đổi theo (theo yêu cầu "làm cho khớp api mới"): xem mục "Tiếp tục từ đâu" trong `2026-11-14-angular-22-implementation-plan.md` và commit `46f0f51`, `4d68ff6`, `e737599`.
