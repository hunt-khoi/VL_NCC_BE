# Công cụ dò lỗi frontend ↔ API

Script viết trong lúc kiểm tra bản Angular 22 với backend .NET 10 (`D:\NCC_API`). Chỉ **đọc** mã nguồn backend và gọi API GET; không sửa backend. Lỗi API tìm được ghi vào `docs/plan/api-errors.md`.

## So route (chạy ở bất kỳ đâu)

| Script | Làm gì | Cách chạy |
|---|---|---|
| `be-diff.cjs` | Liệt kê route đổi/mất giữa hai bản backend, theo tên controller + action | `node be-diff.cjs <Controllers cũ> <Controllers mới>` |
| `routes-diff.cjs` | Rút mọi URL frontend gọi (`environment.ApiRoot + '...'`) và báo URL không có route ở backend. Đặt `DUMP_FE=<file>` để xuất danh sách URL frontend ra JSON (`fe.json`) cho các script dưới | `DUMP_FE=fe.json node routes-diff.cjs <src frontend> <Controllers>` |
| `be-diff2.cjs` | Route (verb + path) có ở bản backend cũ, frontend có gọi, nhưng bản mới không còn | `node be-diff2.cjs <Controllers cũ> <Controllers mới> fe.json` |
| `fe-vs-new.cjs` | URL frontend không khớp route nào của một bản backend | `node fe-vs-new.cjs <Controllers> fe.json` |
| `fe-literal-vs-param.cjs` | URL frontend chỉ khớp nhờ route có `{id}` mà đoạn đó ở frontend là chữ cố định (ví dụ `user-manager/list` ↔ `user-manager/{id}`) | `node fe-literal-vs-param.cjs <Controllers> fe.json` |
| `date-diff.cjs` | Trường JSON bản cũ trả DateTime, bản mới định dạng thành chuỗi `dd/MM/yyyy` | `node date-diff.cjs <NCC_API cũ> <NCC_API mới>` |

**Mốc so sánh đúng:** frontend đã được chỉnh theo backend `NCC_API` ở commit backend `1773208` (2026-09-04, cùng ngày commit frontend `2e21a10` "change route"). Lấy thư mục controller của mốc đó: `git -C D:\NCC_API archive 1773208 NCC_API/Controllers | tar -x -C <thư mục tạm>`. Bản `VL_NCC_API` (.NET Core 3.1) **không** phải mốc của frontend hiện tại.

**Lỗ hổng đã biết:** route `{id}` nuốt mất đường dẫn con (dùng thêm `fe-literal-vs-param.cjs`); controller đổi tên class thì `be-diff.cjs` báo "mất controller" (đối chiếu bằng route); URL frontend dựng động (nối biến giữa chừng) không rút được.

## Kiểm tra trên app đang chạy (chạy trong `tools/e2e`, cần `yarn start` + backend 7243 + `tools/e2e/.env`)

| Script | Làm gì |
|---|---|
| `stack.cjs` | Đăng nhập (đổi vai trò theo `E2E_VAITRO`), mở từng trang, in lỗi console kèm stack, request API lỗi, thời gian mở và URL cuối (bị chuyển `/error/403` hay không) |
| `dom.cjs` | Đăng nhập, in cấu trúc vùng nội dung từng trang (thẻ `kt-*`, bảng, phần tử đang hiện) |
| `api.cjs` | Đăng nhập lấy token rồi gọi GET các đường dẫn API, in mã trạng thái và nội dung trả về |

Ví dụ (Git Bash trên Windows cần `MSYS_NO_PATHCONV=1` để đường dẫn `/...` không bị đổi):

```bash
cd tools/e2e
E2E_VAITRO=Administrator MSYS_NO_PATHCONV=1 node ../route-diff/stack.cjs /nguoi-dung /so-do-to-chuc
NODE_TLS_REJECT_UNAUTHORIZED=0 MSYS_NO_PATHCONV=1 node ../route-diff/api.cjs '/api/user/PermissionUrl?currentUrl=/ho-so-ncc'
```
