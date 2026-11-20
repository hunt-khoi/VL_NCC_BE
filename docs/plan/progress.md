# Tiến độ nâng cấp Angular 13 → 22

Cập nhật: 2026-11-20. **Nơi duy nhất ghi trạng thái.** Sau mỗi task: cập nhật "Hiện trạng", đánh dấu task trong [kế hoạch](2026-11-20-angular-22-acceptance-plan.md), thêm một dòng vào "Nhật ký".

| File | Dùng để |
|---|---|
| [`2026-11-20-angular-22-acceptance-plan.md`](2026-11-20-angular-22-acceptance-plan.md) | Kế hoạch chính: việc còn lại và checklist kiểm tay |
| [`api-errors.md`](api-errors.md) | Lỗi đến từ backend .NET 10 (không sửa API, chỉ ghi) |
| `progress.md` (file này) | Trạng thái, việc đã xong, quyết định, nhật ký |

## Hiện trạng

**Giai đoạn:** nghiệm thu. Đã lên Angular 22.3, build 6/6. Đang chạy e2e với backend .NET 10 thật và sửa lỗi lúc chạy. **Việc tiếp theo:** Task 2 (lỗi frontend còn mở) và các quyết định ở Task 4.

| Hạng mục | Trạng thái |
|---|---|
| Nhánh | `upgrade-angular-22`; các commit dọn tài liệu ngày 2026-11-20 chưa push (người phụ trách tự push). Nhánh cloud thừa `ccr-4b9d79c1-rjbqa4` đã xoá trên GitHub (đã gộp hết từ 2026-11-19). Tag `upgrade/ng22` → `35b31b3` (đã push); `smoke-a` (`b94edbf`, cuối Chặng 1), `smoke-b` (`d4fb968`, sau MDC) chỉ có trên máy |
| Phiên bản | Angular/CLI/Material/CDK 22.3.0, NgRx 22.0.1, TypeScript 6.0.3, RxJS 7.8.2, zone.js 0.15.1, angular-eslint 22.8.0. Thư viện bên thứ ba đã lên bản cho 22, trừ Chart.js 2.9 (cố ý giữ) |
| Build | 6/6 cấu hình PASS, 0 lỗi (lần cuối 2026-11-19); từ đó chỉ chạy `verify:dev` |
| E2E `test:ro` (2026-11-20, sau khi dọn file) | Administrator: **50 qua / 26 bỏ qua / 4 lỗi** (3 do API: #5, #8, #11; 1 frontend: đăng xuất). Chuyên viên sở: **42 / 32 / 6** (3 do API: #7, #8, #11; 3 timeout ở `beforeEach` của `layout.spec.ts`). Kết quả **chưa ổn định**: lượt Chuyên viên sở chạy ngay sau khi dev server build lại có 11 timeout lúc dựng phiên (`storageState`). Chưa đạt yêu cầu 3 lượt liên tiếp |
| Lỗi frontend còn mở | (a) nút Đăng xuất không hiện (Administrator); (b) `layout.spec.ts`: `beforeEach` hết 30 giây ở vai trò Chuyên viên sở (menu trái, dropdown người dùng), lúc có lúc không; (c) dựng phiên `storageState` hết giờ khi server vừa build lại. `/vai-tro`, `/xuat-du-lieu` không còn lỗi |
| Lỗi API | 12 mục trong `api-errors.md` |
| Kiểm tay | Chưa làm. Giao diện chưa được xem bằng mắt kể từ Task 5 |
| E2E `@rw` | Chưa chạy, chờ database bản sao |
| Bảo mật | Đã kiểm 2026-11-20 (Task 6): `yarn audit` gói chạy trong app 2 critical / 12 high / 18 moderate / 6 low; **stored XSS ở bình luận** (S1); chưa sửa mục nào |
| Chờ quyết định | TinyMCE tiếng Việt; Karma hay Vitest; TinyMCE 6 hay 7+ (lỗ hổng XSS); CKEditor giữ hay thay |
| Lint | 409 lỗi có từ trước (361 là `template/eqeqeq`), không chặn build; kiểm lại 2026-11-20: vẫn 409 |

### Tiến độ theo task (kế hoạch nghiệm thu)

| Task | Nội dung | Trạng thái |
|---|---|---|
| 1 | Chạy lại `test:ro` vai trò Administrator | **Xong 2026-11-20**: 50 / 26 / 4 |
| 2 | Sửa lỗi frontend còn mở (a), (b), (c) | Chưa làm (file chẩn đoán `zz-diag.spec.ts` đã xoá theo yêu cầu người phụ trách) |
| 3 | Kiểm tay (người phụ trách) | Chưa làm |
| 4 | Quyết định TinyMCE, Karma/Vitest, CKEditor | Chờ người phụ trách |
| 5 | E2E `@rw` | Bị chặn: cần database bản sao + `E2E_RESTORE_CMD` |
| 6 | Bảo mật (S1–S11) | Đã kiểm, chưa sửa |
| 7 | Build 6 cấu hình, tag nghiệm thu | Chưa làm |

## Môi trường (máy người phụ trách)

- Node 24.15.0 (yêu cầu `^22.22.3` hoặc `>= 24.15.0`); `yarn start` ở cổng 3105.
- Backend .NET 10 (`D:\NCC_API`) ở `https://localhost:7243`, người phụ trách tự chạy và hay khởi động lại. Test lỗi `ERR_CONNECTION_REFUSED` hàng loạt thì kiểm backend trước.
- Cache yarn ở `D:\DPS_Project\.yarn-cache`. Ổ C: gần đầy nên khi build đặt `TEMP`/`TMP` sang ổ D:.
- E2E: `tools/e2e/.env` (không commit) có `E2E_USER=admin`, mật khẩu, `E2E_VAITRO=Chuyên viên sở`. `cd tools/e2e && yarn test:ro` (khoảng 10 phút, 3 luồng); lượt hai thêm `E2E_VAITRO=Administrator` (khoảng 12 phút). Tài khoản `admin` có 2 vai trò: Administrator (nhóm 1), Chuyên viên sở (nhóm 26, có quyền 1086 cho Hồ sơ NCC). Token sống 10 phút; bộ test tự đăng nhập lại. Lấy lý do bỏ qua/lỗi: `PLAYWRIGHT_JSON_OUTPUT_NAME=<file> ... --reporter=line,json`.
- Dò lỗi route frontend ↔ backend: `tools/route-diff/README.md`.
- Phiên cloud (Claude Code trên web): không gọi được backend, không push được tag.
- `ng update` khi máy có prettier toàn cục: chạy với `NODE_PATH` rỗng, nếu không CLI sẽ format mọi file.
- Linux phân biệt hoa/thường đường dẫn import, Windows thì không: viết import đúng tên thư mục.

## Đã xong: nâng cấp (Task 1–20b, 2026-11-14 → 2026-11-19)

Mọi task đều qua `yarn verify:dev` với 0 lỗi. Kế hoạch gốc chi tiết: `git show 8f30f46:docs/plan/archive/2026-11-14-angular-22-implementation-plan.md`.

| Task | Nội dung | Commit |
|---|---|---|
| 1, 1B | Script `verify:*`, `.yarnrc`, `yarn.lock`, checklist; công cụ so ảnh `tools/visual/` (về sau bỏ cổng ảnh) | `404ca04`, `489ca4e`, `845a129` |
| 1C | Bộ e2e Playwright `tools/e2e/` (83 test, viết trên Angular 22) | `6a78ada` |
| 2–4 | Gỡ custom-webpack, Protractor, `ngrx-store-freeze`; xoá `entryComponents`; import mặc định moment, `jwt-decode` 4 | `7623c24`, `4e3bcf2`, `8ae925c` |
| 5–7 | Thay thư viện ngừng bảo trì; gỡ ng-bootstrap (chép mã 5.3.1); giữ Chart.js 2.9 | `6943e4b`, `b0c266d`, `b0ccd4a` |
| 8–9 | Thư viện lên bản Ivy; theme Material sang `@use` | `ba289ad`, `b94edbf` |
| 10–11 | Angular 14, 15 (Material legacy) | `f126980`, `3bb717c` |
| 12 | Material legacy → MDC (bỏ qua duyệt giao diện) | `d4fb968` |
| 13–14 | Angular 16, 17 | `ac357c7`, `9848a70` |
| 15 | Angular 18, chuyển builder esbuild (output giữ thư mục cũ) | `2d188eb`, `e2e095b` |
| 16–19 | Angular 19, 20, 21, 22 | `c51cb1c`, `9620de7`, `928a949`…`78b9bb2`, `177eef7` |
| 20 | Hoàn thiện: ESLint 22, README, build 6/6 | `980bbe4` |
| 20b | RxJS 7 và mọi thư viện bên thứ ba lên bản cho 22 (TinyMCE 6.8.6, ngx-translate 18, ngx-mask 22…) | `73f4b03`…`2613038` |

## Đã xong: sửa lỗi lúc chạy với backend .NET 10 (2026-11-20)

| Lỗi | Sửa | Commit |
|---|---|---|
| `$localize is not defined` khi mở dashboard | Bỏ thuộc tính `i18n` trong mã ng-bootstrap chép | `2b4cf95` |
| Route API đổi ở backend mới | Frontend đổi theo: `quanlyquy/*`, `dm_donvi` REST, `wards`, `bh-bao-cao`, `ho-tro/*`, `comment/*`, lite GET; không gửi `sortField` rỗng | `46f0f51`, `4d68ff6` |
| Ngày dạng chuỗi `dd/MM/yyyy` làm pipe `date` lỗi/đảo ngày tháng | Pipe `viDate`, thay 11 chỗ | `626d304` |
| Template đọc dữ liệu chưa có (`column-option`, `ho-so-ncc`, `hdsd`, `mau-so-lieu` `MaxChild: null`) | Bọc `@if`, dùng `?.` | `c1afd3d`, `612d0be`, `8f9fd9c` |
| `cdk-tree` CDK 22 báo thiếu data source | Khởi tạo `ArrayDataSource([])` ở 8 component | `e737599` |
| `user-manager/list`, `bao-hiem/download-template` đổi route | Đổi theo backend | `e737599` |
| E2E: token 10 phút, đổi vai trò, chờ guard, selector "đang tải" | Tự đăng nhập lại, `E2E_VAITRO`, 3 luồng, chờ 10 s/test 30 s, không retry (31 → 8 phút) | `b0abb4a`, `c1afd3d`, `32058b2` |

## Chỗ làm khác plan gốc (cần nhớ khi sửa code)

- **ng-bootstrap:** gỡ package, chép mã TypeScript ng-bootstrap 5.3.1 (dropdown, tooltip, progressbar, tabset, carousel, timepicker) vào `src/app/views/partials/lib/ngb/` (`NgbLiteModule`), giữ markup Bootstrap 4.
- **Chart.js 2.9 + `ng2-charts` 2.4.3 chép** vào `lib/ng2-charts/`: giữ giao diện biểu đồ, đổi lại không còn bản vá bảo mật.
- **Popover bình luận:** chép `ngx-smart-popover` vào `lib/popover/` (cần cho gợi ý `@nhắc tên`).
- **MDC:** 33 quy tắc SCSS sửa tay có comment `// MDC:`; 46 chỗ trong thẻ `<style>` của 24 template sửa ở Task 16.
- **Forms:** dùng `FormGroup`/`FormBuilder`… không dùng `Untyped*`.
- **`tsconfig.json`:** `"strict": false`, `"ignoreDeprecations": "6.0"` (TypeScript 6; còn dùng `baseUrl`).
- **Angular 22:** `in` là toán tử template nên 22 chỗ `(click)="in(...)"` đổi thành `this.in(...)`; `ComponentFactoryResolver` bị xoá; migration thêm `ChangeDetectionStrategy.Eager` vào 144 component và `withXhr()`.
- **Template còn cú pháp cũ:** `config-edit`, `comment` (migration control flow bỏ qua).
- **`resolutions`** ghim `caniuse-lite` và `browserslist`; CKEditor ghim CDN 4.21.0.
- **ESLint:** chỉ bộ khuyến nghị của angular-eslint; tắt `prefer-inject`, `prefer-standalone`, `prefer-on-push`, `prefer-control-flow`.
- Xoá `.angular/cache` sau mỗi lần cài/gỡ package.

## Quyết định của người phụ trách

| Ngày | Quyết định |
|---|---|
| 2026-11-19 | Bỏ cổng so ảnh và bộ ảnh gốc; không chạy `verify:prod` từng bước; bỏ smoke A/B, xem giao diện một lần ở cuối |
| 2026-11-19 | Nâng RxJS 7 và mọi thư viện bên thứ ba ngay, không đợi smoke test |
| 2026-11-20 | **Chỉ sửa frontend, cấm sửa/đề xuất sửa API**; lỗi API ghi `api-errors.md` |
| 2026-11-20 | Backend .NET 10 (`D:\NCC_API`) sẽ thay backend cũ: frontend đổi theo route API mới |
| 2026-11-20 | E2E: thao tác 10 s, test 30 s, không retry; SignalR, ng-idle tạm `test.fixme` ("kệ nó test sau") |
| 2026-11-20 | Tài liệu gọn còn 3 file: kế hoạch, lỗi API, tiến độ |
| 2026-11-20 | Xoá file thừa: công cụ so ảnh `tools/visual` (`screens.json`, `serve.mjs` chuyển sang `tools/e2e`), CKEditor 4.13.1 trong `assets` (không được tải), file chẩn đoán e2e. **Giữ:** `certificates/`, `.claude/` (phiên cloud cần), `.superpowers/` (không có trên git) |
| 2026-11-20 | Mọi thay đổi code phải qua "Cổng test bắt buộc" trong kế hoạch; kiểm bảo mật thành Task 6 |
| 2026-11-20 | Sau khi dọn file: `verify:dev` PASS (95 giây), lint 409 lỗi (không tăng), e2e như bảng "Hiện trạng" |

## Nhật ký

| Ngày | Việc |
|---|---|
| 2026-11-14 | Lập kế hoạch nâng cấp 13 → 22 |
| 2026-11-19 | Xong Task 1–20b: lên Angular 22.3, build 6/6, tag `upgrade/ng22` |
| 2026-11-20 | Node 24.15 trên máy người phụ trách; backend local 7243; chạy e2e với backend thật, sửa lỗi lúc chạy (bảng trên); lập `api-errors.md` |
| 2026-11-20 | Dọn tài liệu: còn kế hoạch nghiệm thu, `api-errors.md`, `progress.md` |
