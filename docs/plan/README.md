# Tài liệu nâng cấp Angular 22 — đọc file này trước

Cập nhật: 2026-11-20. **Đây là nơi duy nhất ghi trạng thái hiện tại.** Mỗi phiên làm việc cập nhật bảng dưới đây; các file khác không chép lại trạng thái.

## Tóm tắt

Đã lên Angular 22.3 trên nhánh `upgrade-angular-22`, build 6/6 cấu hình. Đang ở giai đoạn **nghiệm thu**: chạy e2e với backend .NET 10 thật và sửa lỗi lúc chạy. **Chưa nghiệm thu**: chưa kiểm tay, nhóm e2e `@rw` chưa chạy.

**Việc tiếp theo:** [Task 1 trong kế hoạch nghiệm thu](2026-11-20-angular-22-acceptance-plan.md#task-1-chạy-lại-testro-vai-trò-administrator).

## Hiện trạng

| Hạng mục | Trạng thái |
|---|---|
| Nhánh | `upgrade-angular-22`, đã push hết (khớp `origin`). Tag: `upgrade/ng22` → `35b31b3` (đã push); `smoke-a`, `smoke-b` chỉ có trên máy |
| Phiên bản | Angular/CLI/Material/CDK 22.3.0, NgRx 22.0.1, TypeScript 6.0.3, RxJS 7.8.2, zone.js 0.15.1; thư viện bên thứ ba đã lên bản cho 22, trừ Chart.js 2.9 (cố ý giữ) |
| Build | 6/6 PASS lần cuối ngày 2026-11-19; từ đó chỉ chạy `verify:dev` |
| E2E `test:ro` (2026-11-20) | Chuyên viên sở: 36 qua / 41 bỏ qua / 3 lỗi (đều do API). Administrator: 48 qua / 24 bỏ qua / 8 lỗi, **chạy trước commit `e737599`, cần chạy lại** (Task 1) |
| Lỗi frontend còn mở | 3: nút Đăng xuất không hiện; `/vai-tro` và `/xuat-du-lieu` treo khi chờ guard (Task 2) |
| Lỗi API | 12 mục, xem [`api-errors.md`](api-errors.md). Không sửa API |
| Kiểm tay | Chưa làm (Task 3). Giao diện chưa được xem bằng mắt kể từ Task 5 |
| E2E `@rw` | Chưa chạy, đang chờ database bản sao (Task 5) |
| Chờ quyết định | TinyMCE tiếng Việt; Karma hay Vitest (Task 4) |
| Lint | 409 lỗi có từ trước, không chặn build |

## Các file

| File | Dùng để |
|---|---|
| [`2026-11-20-angular-22-acceptance-plan.md`](2026-11-20-angular-22-acceptance-plan.md) | Việc còn lại, theo task |
| [`api-errors.md`](api-errors.md) | Lỗi đến từ backend .NET 10 |
| [`angular_22_smoke_checklist.md`](angular_22_smoke_checklist.md) | Checklist kiểm tay |
| [`archive/2026-11-14-angular-22-implementation-plan.md`](archive/2026-11-14-angular-22-implementation-plan.md) | Lịch sử: kế hoạch gốc Task 1–20b, commit từng task, chỗ làm khác plan, quyết định của người phụ trách, các lỗi đã sửa ngày 2026-11-20 |
| [`ho_so_ncc_edit_page_improvements.md`](ho_so_ncc_edit_page_improvements.md) | Đề xuất cải tiến màn sửa hồ sơ NCC; **không thuộc đợt nâng cấp**, chưa làm |
| `archive/angular_9_upgrade_guide.md`, `archive/implementation_plan_angular10.md` | Tài liệu đợt nâng cấp cũ (Angular 8 → 10) |

## Môi trường (máy người phụ trách)

- Node 24.15.0 (yêu cầu `^22.22.3` hoặc `>= 24.15.0`); `yarn start` ở cổng 3105.
- Backend .NET 10 (`D:\NCC_API`) ở `https://localhost:7243`, do người phụ trách tự chạy và hay khởi động lại. Nếu test lỗi `ERR_CONNECTION_REFUSED` hàng loạt thì kiểm backend trước.
- Cache yarn ở `D:\DPS_Project\.yarn-cache`. Ổ C: gần đầy nên khi build đặt `TEMP`/`TMP` sang ổ D:.
- E2E: file `tools/e2e/.env` (không commit) có `E2E_USER=admin`, mật khẩu, `E2E_VAITRO=Chuyên viên sở`. Lệnh: `cd tools/e2e && yarn test:ro` (khoảng 10 phút, 3 luồng); thêm `E2E_VAITRO=Administrator` cho lượt thứ hai (khoảng 12 phút). Token chỉ sống 10 phút; bộ test tự đăng nhập lại. Chi tiết: `tools/e2e/README.md`, `tools/e2e/KNOWN_ISSUES.md`.
- Dò lỗi route frontend ↔ backend: `tools/route-diff/README.md`.
- Phiên cloud (Claude Code trên web): không gọi được backend, không push được tag.
