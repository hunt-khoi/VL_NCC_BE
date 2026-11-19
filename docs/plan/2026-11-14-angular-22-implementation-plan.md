# Angular 13 → 22 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa dự án `VL_NCC_BE` từ Angular 13.3.12 lên Angular 22.2.x, app chạy đúng như hiện tại ở cả 6 cấu hình build.

> **Trạng thái (2026-11-19, tạm dừng để tiếp tục ở phiên mới):** đã lên **Angular 22.3**; RxJS 7 và mọi thư viện bên thứ ba đã lên bản cho Angular 22 (trừ Chart.js 2.9, cố ý giữ); cả 6 cấu hình build qua với 0 lỗi; bộ e2e đã viết. **Chưa nghiệm thu:** chưa đăng nhập vào app lần nào sau nâng cấp (chưa smoke test với backend), bộ e2e chưa chạy với backend. Việc tiếp theo: mục "Tiếp tục từ đâu". **Cần Node `^22.22.3` hoặc `>= 24.15.0`.**

**Architecture:** Ba chặng. (1) Dọn dẹp ngay trên Angular 13: gỡ mọi thứ sẽ chặn đường (thư viện View Engine, `entryComponents`, custom-webpack, ng-bootstrap) trong lúc app còn chạy được. (2) Nâng từng bản major bằng `ng update`, mỗi bản một commit, build `dev` + `prod` sau mỗi bản. (3) Hoàn thiện sau khi tới 22. Vì dự án gần như không có test tự động, "test" của mỗi task là build thành công, cổng giao diện, bộ e2e tự động (Task 1C) và 5 mốc smoke test tay cho những gì e2e không tự động được. Mỗi bản major có một tag git làm điểm rollback (xem mục "Phương án rollback").

**Tech Stack:** Angular CLI, Angular Material (MDC), NgRx, RxJS, yarn 1.22, Node 24.

**Spec:** Không có tài liệu spec riêng; plan này là tài liệu duy nhất. Hiện trạng lúc lập plan (2026-11-14): 1006 file TS, 495 component, 159 module, 6 file spec; Material dùng ở 323 file; build `dev` trên Angular 13 thành công trên Node 24.14.0.

## Trạng thái thực hiện (cập nhật 2026-11-19)

Nhánh `upgrade-angular-22` (trùng với nhánh phiên cloud `ccr-4b9d79c1-rjbqa4`, cùng commit `6a78ada` trở về sau). Mọi task đã xong đều qua `yarn verify:dev` với 0 lỗi. Chi tiết từng quyết định nằm trong sổ theo dõi `.superpowers/sdd/2026-11-14-angular-22-implementation-plan/progress.md` (không commit); bảng dưới là bản tóm tắt.

| Task | Nội dung | Commit | Kết quả |
|---|---|---|---|
| 1 | Script `verify:dev`/`verify:prod`, `.yarnrc`, commit `yarn.lock`, checklist smoke | `404ca04` | Xong |
| 1B | Công cụ chụp và so ảnh `tools/visual/` | `489ca4e`, `845a129` | Công cụ xong; **bỏ bộ ảnh gốc và cổng giao diện** theo quyết định người phụ trách |
| 1C | Bộ test e2e `tools/e2e/` | `6a78ada` | Đã viết 83 test (8 file) trên Angular 22; mới chạy được 2 test `@nologin` vì môi trường làm không có backend (xem `tools/e2e/KNOWN_ISSUES.md`) |
| 2 | Gỡ custom-webpack, ESLint, e2e Protractor, `ngrx-store-freeze`, `@angular/platform-server` | `7623c24` | Xong |
| 3 | Xoá `entryComponents` (55 file) | `4e3bcf2` | Xong (người phụ trách commit với tên `temp`) |
| 4 | Import mặc định cho moment (28 file) và `jwt-decode` 4 | `4e3bcf2`, `8ae925c` | Xong |
| 5 | Thay thư viện ngừng bảo trì | `6943e4b` | Xong, khác plan (xem dưới) |
| 6 | Gỡ package ng-bootstrap | `b0c266d` | Xong, khác plan (xem dưới) |
| 7 | Biểu đồ | `b0ccd4a` | Xong, khác plan: **giữ Chart.js 2.9** |
| 8 | Thư viện lên bản Ivy cho Angular 13 | `ba289ad` | Xong; 5 thư viện giữ bản View Engine tới Task 10 |
| 9 | Theme Material sang `@use` | `b94edbf` | Xong; `styles.css` biên dịch ra giống hệt từng byte |
| 10 | Angular 13 → 14 | `f126980` | Xong; không còn thư viện View Engine |
| 11 | Angular 14 → 15 (Material legacy) | `3bb717c` | Xong |
| 12 | Material legacy → MDC | `d4fb968` | Build xong; **người phụ trách bỏ qua smoke test và duyệt giao diện** |
| 13 | Angular 15 → 16 | `ac357c7` | Xong; không đổi gì thêm (không còn thư viện View Engine nên bỏ ngcc không ảnh hưởng) |
| 14 | Angular 16 → 17 | `9848a70` | Xong; xoá import thừa `_ParseAST` (API nội bộ đã bị bỏ); migration mã hoá ký tự `@` trong 2 template |
| 15 | Angular 17 → 18, chuyển sang esbuild | `2d188eb`, `e2e095b` | Xong; output giữ đúng thư mục cũ (`outputPath.browser = ""`); build `dev` còn 101 giây |
| 16 | Angular 18 → 19 | `c51cb1c` | Xong; `standalone: false` ở 387 file; sửa style trong thẻ `<style>` của template (xem dưới) |
| 17 | Angular 19 → 20 | `9620de7` | Xong; `PortalInjector` (đã bị CDK 20 xoá) thay bằng `Injector.create` trong `LoadingService` |
| 18 | Angular 20 → 21 | `928a949`, `681753a`, `78b9bb2` | Xong; NgRx 21.1.1; migration Material không đổi gì; sửa 2 lỗi template do migration control flow (xem dưới) |
| 19 | Angular 21 → 22 | `177eef7` | Xong; Material/CDK 22.3.0, NgRx 22.0.1, TypeScript 6.0; chỉ kiểm màn hình đăng nhập (không có backend) |
| 20 | Hoàn thiện, nghiệm thu | `980bbe4` | Build xong cả 6 cấu hình; ESLint 22; README; **smoke test tay chưa làm** |
| 20b | RxJS 7 và thư viện bên thứ ba lên bản cho Angular 22 (ngoài plan gốc: các task 10–19 đã bỏ sót bảng version) | `73f4b03` … `2613038` | Xong; build 6/6, chỉ kiểm được trang đăng nhập và TinyMCE trên trang thử (xem dưới) |

### Tiếp tục từ đâu

#### Hiện trạng (2026-11-19)

| Hạng mục | Trạng thái |
|---|---|
| Nhánh | `upgrade-angular-22` trên GitHub (trùng `ccr-4b9d79c1-rjbqa4`); xem `git log` để biết commit cuối |
| Phiên bản | Angular/CLI 22.3.0, Material/CDK 22.3.0, NgRx 22.0.1, TypeScript 6.0.3, angular-eslint 22.8.0, RxJS 7.8.2, zone.js 0.15.1; thư viện bên thứ ba xem bảng ở việc số 5 |
| Build | 6/6 cấu hình PASS, 0 lỗi (bảng dưới) |
| Chạy thử | Màn hình đăng nhập của bản `dev` và `prod` lên được, chữ dịch đúng, không lỗi JS (e2e `@nologin` PASS). TinyMCE 6 khởi tạo được với đúng config của app trên một trang thử. Chưa đăng nhập vào app lần nào sau khi nâng cấp (môi trường làm không có backend) |
| Smoke test tay | **Chưa làm.** Giao diện chưa được kiểm bằng mắt từ Task 5 |
| E2E | 83 test đã viết (`tools/e2e/`); mới chạy 2 test `@nologin` (PASS) |
| Lint | `yarn lint` chạy được; 409 lỗi có từ trước (361 là `template/eqeqeq`), không chặn build |
| Tag | `upgrade/ng22` chưa có trên GitHub (xem việc số 2) |

Kết quả build sau khi nâng thư viện (container Linux, Node 22.23.5, 2026-11-19):

| Cấu hình | Kết quả | Thời gian |
|---|---|---|
| `dev` | PASS, 0 lỗi | 19 giây |
| `production` | PASS, 0 lỗi; initial 3,21 MB (539 kB nén) | 24 giây |
| `test` | PASS, 0 lỗi | 22 giây |
| `prod` | PASS, 0 lỗi; initial 3,21 MB (539 kB nén) | 24 giây |
| `prod_SOTBVL` | PASS, 0 lỗi | 24 giây |
| `prod_KG` | PASS, 0 lỗi | 22 giây |

Cảnh báo còn lại đều có từ trước: Sass `@import` deprecation; 5 thư viện CommonJS (`moment`, `html2canvas`, `chartjs-plugin-labels`, `dompurify`, `rgbcolor`); ở các cấu hình tối ưu có 3 dòng `Unable to locate stylesheet` cho `line-awesome.css`, `flaticon.css`, `flaticon2.css` (bước inline critical CSS chạy trước khi chép `assets`; file vẫn có trong output, không ảnh hưởng). Output `prod` có đủ `.htaccess`, `sw.js`, `tinymce/`.

#### Việc còn lại, theo thứ tự

1. **Nâng Node trên máy phát triển** lên `>= 24.15.0` (hoặc `^22.22.3`); máy đang dùng 24.14.0 không chạy được Angular 22. Rồi `yarn install`, `yarn start`.
2. **Tag `upgrade/ng22`** trỏ vào `35b31b3` (bản build được sau Task 20). Phiên cloud bị GitHub chặn push tag (403), nên tạo từ máy người phụ trách: `git fetch origin`, `git tag -a upgrade/ng22 35b31b3 -m "Angular 22.3"`, `git push origin upgrade/ng22`. Bản build `prod` không lưu trong repo (`build/` bị ignore); build lại từ tag khi cần.
3. **Chạy bộ e2e lần đầu với backend:** điền `tools/e2e/.env` (xem `tools/e2e/README.md`), `yarn --cwd tools/e2e install`, `npx --prefix tools/e2e playwright install chromium`, `yarn --cwd tools/e2e test:ro`. Selector lấy từ mã nguồn, chưa chạy thật: sửa selector/cách chờ theo `tools/e2e/KNOWN_ISSUES.md`, chạy 3 lần liên tiếp PASS thì coi là baseline. Nhóm `@rw` cần database bản sao và `E2E_RESTORE_CMD`; viết nốt test sửa/xoá đang `test.fixme`.
4. **Smoke test tay** theo `docs/plan/angular_22_smoke_checklist.md` (mục không có `(e2e)` bắt buộc làm tay). Ưu tiên: 33 chỗ SCSS có comment `// MDC:`; 2 dialog chọn nhiều có nút đóng vừa sửa (`chon-nhieu-nhan-vien-list`, `chon-nhieu-bieu-mau-list`); các nút In (đổi sang `this.in(...)`); tooltip/tab/dropdown của `NgbLiteModule` (`ComponentFactoryResolver` đã bỏ); icon SVG (`ng-inline-svg-2` 20); 2 template còn cú pháp cũ (`config-edit`, `comment`); các thư viện vừa nâng ở việc số 5, nhất là ô có mask, TinyMCE, upload, in.
5. **Kiểm lúc chạy các thư viện vừa nâng (2026-11-19).** Build qua nhưng chưa chạy với backend; gộp vào smoke test (việc số 4). Đã nâng:

   | Gói | Trước | Sau | Đổi mã / rủi ro cần kiểm |
   |---|---|---|---|
   | `rxjs` | 6.6.7 | 7.8.2 | `Subject<void>` ở 3 màn auth; `race()` trong `ngb/util/autoclose.ts`. 20 chỗ `toPromise()` giữ nguyên (deprecated, vẫn chạy) |
   | `@ngx-translate/core` | 14.0.0 | 18.1.0 | Bỏ `TranslateModule`: `provideTranslateService()` ở `AppModule`, các module import `TranslatePipe`/`TranslateDirective`; `setDefaultLang` → `setFallbackLang`. Đã kiểm: trang đăng nhập dịch đúng. Kiểm thêm: nhãn trong app, phân trang (`CustomMatPaginatorIntl`) |
   | `ngx-mask` | 14.3.3 | 22.2.5 | Bỏ `NgxMaskModule.forRoot()`: `DPSCommonModule` dùng `NgxMaskDirective`/`NgxMaskPipe` + `provideNgxMask()`. **Kiểm kỹ:** 26 template có `mask=` (nhất là `separator,3` với `thousandSeparator` ở form trợ cấp: giá trị lưu xuống có đúng là số không) và pipe `mask` ở hồ sơ nhà ở |
   | `tinymce` / `@tinymce/tinymce-angular` | 5.10.9 / 7.0.0 | 6.8.6 / 9.1.2 | Config ở `CommonService.tinyConfig`: bỏ plugin đã vào core (`print`, `hr`, `textpattern`, `noneditable`) hoặc trả phí (`toc`, `imagetools`); đổi tên nút toolbar và tuỳ chọn; `promotion: false`. Giao diện editor của bản 6 khác bản 5 (skin oxide mới). Kiểm ở Căn cứ biểu mẫu → Biểu mẫu |
   | `ckeditor4-angular` | 4.0.1 | 5.2.1 | Không đổi mã; thẻ `<ckeditor>` duy nhất vẫn ghim CDN 4.21.0 (mặc định mới là 4.25.1-lts, bản thương mại) |
   | `@ng-idle/core`, `keepalive` | 12.0.4 | 16.0.0 | Không đổi mã. Kiểm tự đăng xuất khi hết phiên (e2e có test) |
   | `ng2-file-upload` | 3.0.0 | 12.0.0 | Không đổi mã. Kiểm upload file |
   | `@kolkov/angular-editor` | 2.1.0 | 3.4.0 | Không đổi mã. Kiểm thanh công cụ editor |
   | `ngx-print` | 1.3.1 | 22.2.1 | Không đổi mã. Kiểm các nút In |
   | `ngx-avatars` | 1.4.1 | 1.10.3 | Không đổi mã |
   | `ngx-mat-select-search` | 7.0.10 | 9.0.0 | Không đổi mã. Kiểm ô chọn có tìm kiếm |
   | `@ngx-loading-bar/core` | 6.0.2 | 7.0.1 | Không đổi mã |
   | `ngx-cookie-service` | 14.0.1 | 22.2.0 | Không đổi mã |
   | `ngx-drag-drop` | 14.0.0 | 22.1.0 | Không đổi mã. Kiểm kéo thả ở Sơ đồ tổ chức |
   | `ngx-permissions` | 14.1.0 | 19.0.0 | Không đổi mã. Kiểm ẩn/hiện menu và nút theo quyền |
   | `chart.js`, `ng2-charts` | 2.9.4 / mã chép | giữ nguyên | Cố ý giữ (Task 7) |

   Lỗi có từ trước, chưa sửa: config TinyMCE đặt `language: 'vi'` nhưng gói `tinymce` (cả bản 5 lẫn 6) không có `langs/vi.js`, nên trình duyệt báo `Unexpected token '<'` (server trả `index.html`) và editor hiện tiếng Anh. Muốn editor tiếng Việt thì thêm gói ngôn ngữ (ví dụ `tinymce-i18n`) vào `assets`; nếu không thì bỏ dòng `language`.
6. **Karma/`ng test`:** chưa xử lý. `src/test.ts` dùng `require.context` nên `ng test` không chạy với builder esbuild; quyết định xoá hoặc chuyển Vitest (`ng update @angular/cli --name migrate-karma-to-vitest`).
7. Tuỳ chọn, không chặn phát hành: sửa lỗi lint; chuyển 2 template còn `*ngIf`/`*ngFor`; Sass `@import` → `@use` cho theme Metronic; bỏ `baseUrl` (TypeScript 7 sẽ không hỗ trợ).

#### Ghi chú cho phiên làm việc mới

- **Phiên cloud (Claude Code trên web):** không gọi được backend (`vinh-long-ncc-api.vts-demo.com` bị chặn mạng), không có tài khoản test, không push được tag. Push nhánh thì được. Muốn chạy e2e ở đó cần cho phép host API trong cài đặt môi trường và có tài khoản test.
- **Linux phân biệt hoa/thường đường dẫn:** Windows thì không. Đã sửa 52 import ở Task 18; import mới phải viết đúng tên thư mục.
- **`ng update` và prettier:** nếu máy có prettier toàn cục (hoặc qua `NODE_PATH`), CLI tự format mọi file migration đụng tới. Chạy với `NODE_PATH` rỗng (`env -u NODE_PATH npx ng update ...`).
- **Build:** `yarn verify:dev` (khoảng 20 giây trong container) là kiểm tra nhanh nhất; `--output-path` của script `verify:*` làm output có thêm thư mục con `browser/`, còn các script `build*` ra đúng thư mục trong `angular.json`.
- **Máy người phụ trách:** cache yarn ở `D:\DPS_Project\.yarn-cache`; khi cài/build dài nên đặt `TEMP`/`TMP` sang ổ D: vì ổ C: gần đầy.
- **Tag nội bộ (chưa push, chỉ có trên máy người phụ trách):** `smoke-a` = cuối Chặng 1 (`b94edbf`), `smoke-b` = sau MDC (`d4fb968`), dùng để khoanh vùng lỗi giao diện. Chưa tạo các tag `upgrade/ng<N>` của mục "Phương án rollback"; điểm rollback dùng commit trong bảng trên.

### Những chỗ thực tế khác plan

| Task | Plan ghi | Đã làm | Lý do |
|---|---|---|---|
| 5 | Popover bình luận → `mat-menu` | Chép mã `ngx-smart-popover` 1.5.0 (MIT) vào `src/app/views/partials/lib/popover/` | Popover còn làm khung gợi ý `@nhắc tên` theo vị trí con trỏ; đổi sang `mat-menu` phải viết lại logic và đổi giao diện |
| 5 | Directive perfect-scrollbar tự viết | Như plan, thêm input `[disabled]` | Menu trái dùng `[disabled]` của thư viện cũ, plan bỏ sót |
| 5 | Chỉ đổi thẻ avatar ở 2 template | Đổi ở 5 template | Còn `nguoi-dung-dps-list`, `profile`, `user-profile` |
| 6 | Thay ng-bootstrap bằng Material và markup tự viết | Chép mã TypeScript ng-bootstrap **5.3.1** (MIT) cho dropdown, tooltip, progressbar, tabset, carousel, timepicker vào `src/app/views/partials/lib/ngb/` (`NgbLiteModule`); 19 template không đổi | ng-bootstrap 12+ bỏ `ngb-tabset` và chuyển tooltip, progressbar sang markup Bootstrap 5; theme dùng Bootstrap 4 |
| 7 | Chart.js 2 → 3/4 | Giữ Chart.js 2.9.4 + `chartjs-plugin-labels`; chép mã `ng2-charts` 2.4.3 (ISC) vào `src/app/views/partials/lib/ng2-charts/` | Chart.js 3/4 đổi giao diện biểu đồ. Đổi lại Chart.js 2 không còn bản vá bảo mật |
| 8 | Nâng mọi thư viện lên bản cho Angular 13 | `@ng-idle`, `ngx-print`, `ckeditor4-angular`, `ng2-file-upload` giữ bản cũ tới Task 10 | Bản Ivy của chúng được build bằng Angular 14–16 dù peer dependency ghi `*`/`>=9`. Kiểm tra phiên bản build thật trong gói trước khi nâng |
| 10 | Giữ `UntypedFormGroup`… do migration tạo | Đổi lại về `FormGroup`/`FormBuilder`/`FormControl`/`FormArray` | Người phụ trách yêu cầu; build 0 lỗi kiểu |
| 10 | — | `resolutions` ghim `caniuse-lite` 1.0.30001793 và `browserslist` 4.28.2 | Angular 14 kéo về bản dữ liệu mới, lệch với bản cũ, làm mọi file CSS lỗi `Unknown version 148 of android` |
| 10 | — | CKEditor ghim `editorUrl` CDN 4.21.0 | Bản cũ tải 4.21.0; `ckeditor4-angular` 4 mặc định tải 4.22.1 có banner cảnh báo bảo mật |
| 12 | Schematic MDC rồi chỉnh SCSS | Thêm: đổi 29 `mat-chip-list` còn sót sang `mat-chip-listbox`/`mat-chip-option`; `MatChipList` → `MatChipGrid`; trả lại tên class Metronic mà schematic đổi nhầm (`.mat-table__*`, `.mat-form-field-invalid`); 36 quy tắc SCSS đổi sang class MDC, đánh dấu `// MDC:` | Schematic đổi nhầm class riêng của theme, bỏ sót một số selector |
| 15 | — | Xoá `HttpClientModule` còn sót trong `exports` của `DPSCommonModule` | Migration sang `provideHttpClient` quên xoá, gây hơn 500 lỗi dây chuyền |
| 15 | Kiểm `tinymce/`, `sw.js`, `index.html` trong output | Đã kiểm, kèm `.htaccess`, CKEditor local và script toàn cục | `favicon.ico` không có trong mã nguồn lẫn bản build cũ, không phải lỗi mới |
| 16 | — | Sửa 46 chỗ trong thẻ `<style>` của 24 template: `>>>` → `::ng-deep`, class Material cũ → MDC | Schematic MDC chỉ xét file `.scss`/`.css`; các quy tắc này đã mất tác dụng từ Task 12 |
| 16 | — | Ổ C: đầy làm hỏng lần cài đầu; cache yarn chuyển sang `D:\DPS_Project\.yarn-cache`, thêm `network-timeout` vào `.yarnrc` | Theo yêu cầu người phụ trách dùng ổ D: |
| 17 | — | `PortalInjector` → `Injector.create` | API bị xoá ở Angular CDK 20 |
| 18 | — | Sửa hoa/thường ở 52 import (`Services/`, `Model/` → `services/`, `model/`) trong 39 file | Thư mục thật viết thường; Windows bỏ qua, Linux build lỗi `Could not resolve` |
| 18 | — | `*ngIf=""` ở tab "Hồ sơ, giấy tờ đính kèm" (`form-tong-hop`) bị migration đổi thành `@if ()` không hợp lệ; đổi thành `@if (false)` | Giữ hành vi cũ: biểu thức rỗng là false nên tab chưa bao giờ hiện |
| 18 | — | `trackByIndex` ở `danh-sach-tang-qua` nhận thêm tham số thứ 2 | Migration sinh `track trackByIndex(j, ng)` |
| 18 | — | Migration control flow bỏ qua `config-edit` (HTML lỗi sau khi chuyển) và `comment` (trùng tên `#bindText`); 2 template này vẫn dùng `*ngIf`/`*ngFor` | Cú pháp cũ vẫn chạy ở 21; xử lý ở Task 20 nếu cần |
| 18 | — | Chạy lại migration bootstrap làm hỏng `src/main.ts` (lặp khoá `applicationProviders`); đã hoàn tác, giữ bản từ lần chạy đầu | Lỗi của migration khi chạy lần hai |
| 19 | — | `tsconfig.json`: thêm `"strict": false` và `"ignoreDeprecations": "6.0"` | TypeScript 6 mặc định bật `strict` (hơn 300 lỗi kiểu) và báo `baseUrl` sắp bị bỏ; bỏ `baseUrl` phải sửa mọi import `app/...` |
| 19 | — | Gỡ khối `extendedDiagnostics` migration thêm vào `src/tsconfig.app.json`/`spec.json`, không thêm vào `serve.json` | Gây lỗi NG4003 khi `strictTemplates: false` |
| 19 | — | `ComponentFactoryResolver` (bị xoá ở 22) → truyền thẳng class vào `createComponent` ở `ngb/util/popup.ts`, `ngb/tooltip/tooltip.ts`, `ho-so-ncc-edit-dialog` | API bị xoá |
| 19 | — | `ng-inline-svg-2` 14.0.2 → 20.0.2 | Bản 14 import `ComponentFactoryResolver` |
| 19 | — | 22 chỗ `(click)="in(...)"` → `this.in(...)` | Từ 22, `in` là toán tử trong template |
| 19 | — | 2 nút đóng (`chon-nhieu-nhan-vien-list`, `chon-nhieu-bieu-mau-list`) có cả `mat-button`, `mat-raised-button`, `mat-mini-fab`; chỉ giữ `mat-mini-fab` như mọi dialog khác | Lỗi NG8023. Nhiều khả năng từ Material MDC (Task 12) hai dialog này đã lỗi NG0300 lúc mở (chưa kiểm chứng) |
| 19 | — | Migration thêm `changeDetection: ChangeDetectionStrategy.Eager` vào 144 component, `withXhr()` vào `provideHttpClient` | Giữ hành vi trước 22 |
| 20 | `ng add angular-eslint`, chuyển rule | `eslint.config.js` chỉ dùng bộ khuyến nghị của angular-eslint (như `.eslintrc.json` cũ), tắt `prefer-inject`, `prefer-standalone`, `prefer-on-push-component-change-detection`, `template/prefer-control-flow`; bỏ qua `src/assets/` | Các rule mới này đòi viết lại code (gần 4.800 lỗi); bộ rule cũ không có |
| 20 | Xoá `webpack.config.js` nếu script `rtl` không còn dùng | Đã xoá cùng script `rtl` và `webpack-cli`, `webpack-messages`, `webpack-rtl-plugin`, `css-loader` | Script đã hỏng sẵn (thiếu `webpack`, `mini-css-extract-plugin`, `del`); SCSS theme do `angular.json` biên dịch |
| 20 | Step 4b, Step 5 (cổng giao diện, smoke E) | Không làm | Cổng ảnh đã bỏ theo quyết định người phụ trách; smoke cần backend và làm tay |
| 1C | Viết và chốt baseline trên Angular 13 | Viết sau khi đã lên 22; baseline sẽ là lần chạy đầu trên 22 | Nhánh đã qua bản 15 trước khi làm Task 1C |
| 1C | Đủ các nhóm test trong Step 4–5 | Có: routes, auth, layout, list, form, widgets, realtime, 1 test `@rw` (thêm mới). Chưa có: lọc, sửa/xoá (`test.fixme`), editor, upload, in/PDF, chip, mask, bình luận | Không có backend để xác định selector cho các thao tác phức tạp; các mục này vẫn kiểm tay |
| 1C | `@playwright/test` mới nhất | Ghim 1.63.0 | Trùng bản Chromium có sẵn trong môi trường làm |
| 20b | Thư viện nâng dần theo bảng version ở Task 10–19 | Các task 10–19 chỉ chạy `ng update` cho Angular/Material/NgRx; thư viện bên thứ ba nâng một lượt ở 22 (RxJS 7 trước vì nhiều gói đòi) | Bản cũ vẫn build được qua linker nên không bị phát hiện ở từng task |
| 20b | `@ngx-translate/core` 18 theo cách cũ | Chuyển hẳn sang API mới (không còn `TranslateModule`) | Bản 17+ xoá `TranslateModule` và `setDefaultLang` |
| 20b | — | `tools/e2e/fixtures.ts`: khi `E2E_OFFLINE=1` bỏ qua lỗi theo đối tượng `HttpErrorResponse` thay vì theo chữ | Bản `prod` đổi tên class rút gọn sau mỗi lần build |
| Mọi task | Xoá `.angular/cache` không có trong plan | Xoá sau mỗi lần cài/gỡ package | Cache giữ lại file đã xoá (137 locale moment, +0,5 MB `vendor.js`) |

### Quyết định của người phụ trách trong lúc làm

- 2026-11-19: bỏ cổng so sánh ảnh và bộ ảnh gốc (chụp quá lâu).
- 2026-11-19: không chạy `yarn verify:prod` ở bất kỳ bước nào.
- 2026-11-19: dồn smoke A vào smoke B, rồi bỏ qua luôn smoke B ("tiếp lun"); giao diện sẽ được xem một lần ở cuối.
- 2026-11-19: dùng lại tên `FormGroup`/`FormBuilder`/`FormControl`/`FormArray`, không dùng `Untyped*`.
- 2026-11-19: làm tiếp Angular 21 từ commit WIP (không revert); nâng tiếp lên 22 và làm Task 20, cho phép build `prod`.
- 2026-11-19: đưa toàn bộ nhánh phiên cloud về `upgrade-angular-22` (fast-forward); tạo tag `upgrade/ng22`.
- 2026-11-19: làm Task 1C (e2e) dù không có backend; chạy và sửa ở phiên sau trên máy có backend.
- 2026-11-19: nâng RxJS 7 và toàn bộ thư viện bên thứ ba lên bản cho Angular 22 ngay (không đợi smoke test).

## Global Constraints

- Nhánh làm việc: `upgrade-angular-22` (tách từ `upgrade-2026` sau commit tài liệu). Không đụng `main`.
- Package manager: `yarn` 1.22 với `--ignore-engines`. Không dùng `npm install`.
- Node: dùng Node 24 cho toàn bộ quá trình (baseline Angular 13 đã build được trên Node 24.14.0). Trước Task 19 phải nâng Node lên `>= 24.15.0`. Nếu một bản CLI trung gian từ chối chạy trên Node 24, cài nvm-windows và dùng Node 18.20 (Angular 14–17) hoặc Node 20.19 (Angular 18–19) cho riêng bản đó.
- Đích: `@angular/core` 22.2.x, TypeScript `>=6.0 <6.1`, zone.js `~0.15.0 || ~0.16.0`, RxJS `^6.5.3 || ^7.4.0` (đang giữ 6.6.7, xem "Các quyết định chính").
- Vẫn dùng NgModule và zone.js. Không chuyển standalone, không chuyển zoneless, không gõ type cho forms, không đổi sang control flow mới.
- Giữ nguyên CSS Bootstrap 4 của theme Metronic. Không nâng Bootstrap.
- Mỗi task kết thúc bằng một commit. Không gộp hai bản major vào một commit.
- **Cập nhật 2026-11-19 (người phụ trách quyết định):** không chạy `yarn verify:prod` ở bất kỳ bước nào; mọi bước "verify:prod" bên dưới bỏ qua. Chỉ dùng `yarn verify:dev`.
- Build `prod` rất nặng trên máy phát triển (tối đa 8 GB RAM, chiếm CPU nhiều phút). Chỉ chạy `yarn verify:prod` ở 4 chỗ: cuối Chặng 1 (Task 9), sau MDC (Task 12), sau khi đổi builder (Task 15), nghiệm thu (Task 20). Trước mỗi lần chạy phải báo người phụ trách và chờ họ đồng ý. Các task khác chỉ chạy `yarn verify:dev`.
- Lệnh kiểm tra chuẩn (tạo ở Task 1): `yarn verify:dev` và `yarn verify:prod`. "PASS" nghĩa là exit code 0 và log không có dòng `Error:`.
- Thông báo commit theo kiểu hiện có của repo, ví dụ `upgrade angular 13 to 14`.
- **Cập nhật 2026-11-19 (người phụ trách quyết định):** bỏ cổng so sánh ảnh vì chụp quá lâu. Mọi bước "Cổng giao diện" và "bộ ảnh gốc" bên dưới không còn hiệu lực; giao diện được kiểm bằng các mốc smoke test tay (A–E) do người phụ trách thực hiện. Để giảm rủi ro vỡ giao diện, khi thay thư viện ưu tiên giữ nguyên DOM và class CSS cũ. Công cụ trong `tools/visual/` giữ lại, dùng được khi cần.
- **Cổng giao diện** (công cụ tạo ở Task 1B): chạy `yarn start`, rồi `yarn --cwd tools/visual capture <nhãn>` và `yarn --cwd tools/visual compare <nhãn gốc> <nhãn>`. "PASS" nghĩa là không màn hình nào lệch quá 0,1% số pixel so với bộ ảnh gốc hiện hành. Màn hình lệch phải được sửa, hoặc được người phụ trách duyệt là thay đổi chấp nhận được và ghi vào `tools/visual/approved.md`. Không tự duyệt.
- Bộ ảnh gốc ban đầu có nhãn `ng13`. Chỉ đổi bộ ảnh gốc ở ba chỗ plan cho phép (Task 6, 7, 12), sau khi người phụ trách duyệt.
- Ảnh chụp chứa dữ liệu cá nhân của người có công: thư mục `tools/visual/shots/`, `tools/visual/report/`, `tools/visual/reference/` và file `tools/visual/.env` phải nằm trong `.gitignore`, không commit, không tải lên dịch vụ bên ngoài.
- Dữ liệu backend phải giữ nguyên giữa các lần chụp: dùng cùng một database local, không nhập liệu thêm trong lúc nâng cấp. Ngoại lệ duy nhất: nhóm test e2e `@rw` (Task 1C), và nhóm này chỉ được chạy trên một database bản sao riêng, không bao giờ trên database dùng để chụp ảnh.
- **Cổng e2e** (công cụ tạo ở Task 1C): `yarn --cwd tools/e2e test:ro` (chỉ đọc, chạy ở mọi task) và `yarn --cwd tools/e2e test:rw` (có ghi dữ liệu, chỉ chạy ở các mốc smoke). "PASS" nghĩa là exit code 0. Test bị đánh dấu `test.fixme` phải có lý do và được người phụ trách duyệt trong `tools/e2e/KNOWN_ISSUES.md`. Không được tắt test để cho qua cổng.
- **Rollback:** làm theo mục "Phương án rollback". Không dùng `git reset --hard` hay `push --force` trên nhánh đã push; luôn hoàn tác bằng `git revert`.

## Các quyết định chính

| Cách làm thường gặp | Plan này làm | Lý do |
|---|---|---|
| Đổi Node theo từng bản (16, 18, 20, 22) | Dùng Node 24 suốt, có phương án dự phòng | Baseline 13 đã build được trên Node 24; máy không có nvm |
| Chuyển MDC ở bản 16 | Chuyển MDC ngay ở bản 15 | `ngx-mat-select-search` 7.x (bản cho MDC) hỗ trợ từ 15, tránh một bản chạy lệch |
| Giữ custom-webpack tới khi lên 22 | Gỡ ngay ở Task 2 | Plugin lọc locale moment là thừa: script `postinstall` đã xoá mọi locale trừ `vi` |
| Giữ ng-bootstrap, nâng theo từng bản | Gỡ package ở Task 6, thay bằng mã chép ng-bootstrap 5.3.1 (19 template không đổi) | Bản mới bắt buộc Bootstrap 5 và đã bỏ `ngb-tabset`; theme Metronic dựng trên Bootstrap 4 |
| Nâng RxJS lên 7 ở Angular 16 | Giữ RxJS 6.6.7 tới khi một thư viện bắt buộc RxJS 7 | Angular 16–22 vẫn nhận `rxjs ^6.5.3`; tránh thay đổi không cần thiết |
| Nâng thư viện bên thứ ba ở mọi bản major | Chỉ nâng khi bản đang dùng không chạy được với bản Angular mới | Bản build bằng Angular cũ hơn vẫn chạy được qua linker; ít thay đổi thì ít rủi ro giao diện |
| `toPromise()` → `firstValueFrom` (14 file) | Bỏ | RxJS 7 vẫn còn `toPromise()`, chỉ deprecated |
| `ckeditor4-angular` gộp về TinyMCE | Giữ, chỉ nâng version | Có bản Ivy; gộp là đổi hành vi, không cần cho việc nâng cấp |
| `ngx-perfect-scrollbar` → `ngx-scrollbar` | Directive tự viết cùng selector | 3 chỗ dùng, không phải sửa template |
| Giữ angular-eslint, nâng theo từng bản | Gỡ ở Task 2, cài lại bản 22 ở Task 20 | Bớt một nhóm package phải khớp version ở mỗi bản |
| Build đủ cấu hình sau mỗi bước | Chỉ `dev` mỗi bước; không build `prod` (quyết định người phụ trách 2026-11-19) | Build `prod` quá nặng trên máy phát triển. Lỗi chỉ có ở `prod` sẽ lộ ra lúc build để deploy |
| Kiểm giao diện bằng so ảnh | So file `styles.css` biên dịch ra trước và sau ở các bước chỉ đổi cú pháp (Task 9, 10) | Rẻ và chắc chắn: CSS giống hệt thì giao diện không đổi |

## Review Focus

Năm kiểu lỗi mà build không bắt được, xếp theo khả năng xảy ra:

1. **Giao diện Material lệch sau MDC**: 22 file SCSS có override lên `.mat-*` (nhiều nhất `.mat-table` 30 chỗ, `.mat-icon-button` 17 chỗ), `mat-form-field` ở 252 file. Người dùng mong form, bảng, dialog trông và căn chỉnh như cũ. Kiểm bằng cổng giao diện ở Task 12, đối chiếu với giao diện mẫu do người phụ trách cung cấp.
2. **`import * as moment from 'moment'` rồi gọi `moment()`** (28 file): chạy được với webpack nhưng ném `moment is not a function` lúc chạy khi sang esbuild. Kiểm bằng lệnh grep ở Task 4, và mốc smoke D (Task 15).
3. **Thư viện chỉ hỏng lúc chạy**: reCAPTCHA không tải script, SignalR không kết nối, TinyMCE không tìm thấy `/tinymce/`, in ấn ra trang trắng. Kiểm ở mọi mốc smoke.
4. **Thư mục output đổi cấu trúc khi sang application builder**: builder mới mặc định đặt file vào `<outputPath>/browser/`, làm hỏng quy trình deploy đang trỏ vào `build/ncc_dev`. Kiểm bằng bước xác nhận `index.html` ở Task 15.
5. **File environment lệch field**: `environment-kiengiang.prod.ts`, `environment-sotbvl.prod.ts`, `environment-test.prod.ts`, `environment.prod.ts` chỉ được biên dịch khi build đúng cấu hình của nó. Kiểm bằng bước build đủ 6 cấu hình ở Task 20.

## Phương án rollback

Mục tiêu: ở bất kỳ thời điểm nào cũng quay về được một trạng thái đã chạy đúng trong vài phút, mà không mất các commit đã làm.

### Điểm rollback (tag git)

| Tag | Đặt ở | Ý nghĩa |
|---|---|---|
| `upgrade/ng13-baseline` | commit `489ca4e` (trước Task 2) | Angular 13 nguyên trạng, kèm công cụ kiểm tra |
| `upgrade/ng13-clean` | cuối Task 9, sau mốc smoke A | Angular 13 đã dọn, phát hành được |
| `upgrade/ng<N>` | cuối mỗi Task 10–19, sau khi qua cổng | Angular `N` build được và qua cổng giao diện, cổng e2e `@ro` |
| `upgrade/ng15-mdc` | cuối Task 12, sau mốc smoke B | Material đã sang MDC và được duyệt giao diện |
| `upgrade/ng18-esbuild` | cuối Task 15, sau mốc smoke D | Đã đổi sang application builder |
| `upgrade/ng22` | cuối Task 20, sau mốc smoke E | Nghiệm thu |

Tạo tag: `git tag -a upgrade/ng<N> -m "angular <N>: verify:dev PASS, visual PASS, e2e ro PASS"` rồi `git push origin upgrade/ng<N>`. Chỉ các tag có mốc smoke (`ng13-clean`, `ng15-mdc`, `ng18-esbuild`, `ng22`) được coi là **phát hành được**; các tag `ng<N>` khác chỉ là điểm quay lui trong lúc phát triển.

Lưu kèm mỗi tag phát hành được: bản build `prod` của tag đó trong `build/_release_<tag>/` (không commit; giữ trên máy phát triển và trên server), và ghi phiên bản Node đã dùng vào message của tag.

### Các mức rollback

1. **Đang làm dở một task, chưa commit, muốn bỏ.**
   `git restore --staged --worktree .`, `git clean -fd src`, rồi `yarn install --frozen-lockfile`. Kiểm tra `node -p "require('./node_modules/@angular/core/package.json').version"` khớp với bản của commit hiện tại.
2. **Một task đã commit nhưng gây lỗi phát hiện muộn.**
   `git revert <commit>` (một commit cho mỗi task nên revert gọn), `yarn install --frozen-lockfile`, `yarn verify:dev`, cổng e2e `@ro`. Ghi lỗi và commit bị revert vào mục "Nhật ký vướng mắc" ở cuối plan.
3. **Một bản major không qua được.**
   Chỉ làm khi người phụ trách quyết định rollback: `git revert --no-commit <commit đầu của task>..HEAD`, commit `revert: angular <N-1> to <N> (blocked)`, xác nhận code trùng với tag `upgrade/ng<N-1>` bằng `git diff upgrade/ng<N-1> --stat` (chỉ được khác ở `docs/`). Ghi lại vào "Nhật ký vướng mắc".
4. **Đã deploy lên server rồi phát hiện lỗi.**
   Chỉ deploy từ tag phát hành được. Server giữ thư mục build của bản đang chạy trước đó (tên thư mục build đã có ngày, ví dụ `prod_260428`); deploy bản mới vào thư mục mới rồi đổi đường dẫn site sang thư mục đó. Rollback = trỏ đường dẫn site về thư mục cũ, không cần build lại. Backend và database không đổi trong suốt quá trình nâng cấp nên rollback frontend không cần đụng tới backend. `sw.js` không cache file của app (handler `fetch` chỉ đọc cache, không ghi), nhưng vẫn phải đặt `Cache-Control: no-cache` cho `index.html` trên server để trình duyệt nhận bản rollback ngay.

### Hai bước khó quay lui

Task 12 (MDC) và Task 15 (application builder) đổi nhiều file nhất. Trước khi bắt đầu hai task này phải có tag của bước liền trước, bản build `prod` trong `build/_release_<tag>/` và báo cáo cổng giao diện đã lưu, để khi cần quay lui thì so sánh được ngay.

## Bảng version thư viện theo từng bản Angular

Lấy từ npm ngày 2026-11-14. "=" là giữ nguyên bản trước.

| Thư viện | 13 (Task 8) | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 |
|---|---|---|---|---|---|---|---|---|---|---|
| `@ngx-translate/core` | 14.0.0 | = | = | 17.0.0 | = | 18.1.0 | = | = | = | = |
| `ng2-charts` | 3.1.2 | 4.1.1 | = | 5.0.4 | 6.0.1 | 7.0.0 | 8.0.0 | 9.0.0 | 10.0.0 | 11.0.0 |
| `chart.js` | ^3.9.1 | ^4.4.0 | = | = | = | = | = | = | = | = |
| `ng2-file-upload` | 1.4.0 | 3.0.0 | 4.0.0 | 5.0.0 | 6.0.0 | 7.0.1 | 8.0.0 | 9.0.0 | 10.0.0 | 12.0.0 |
| `@kolkov/angular-editor` | 2.0.0 | 2.1.0 | = | = | = | = | = | 3.4.0 | = | = |
| `@tinymce/tinymce-angular` | 6.0.1 | 7.0.0 | = | 9.1.2 | = | = | = | = | = | = |
| `tinymce` | ^5.10 | = | = | ^6.8 | = | = | = | = | = | = |
| `@ng-idle/core`, `@ng-idle/keepalive` | 14.0.0 | = | = | = | = | 16.0.0 | = | = | = | = |
| `@ngx-loading-bar/core` | 6.0.2 | = | = | 7.0.1 | = | = | = | = | = | = |
| `ngx-mat-select-search` | 4.2.1 | = | 7.0.10 | = | 8.0.6 | = | = | = | = | 9.0.0 |
| `ngx-avatars` | 1.3.0 | 1.4.1 | 1.5.0 | 1.6.1 | 1.7.0 | 1.8.0 | = | 1.10.1 | 1.10.2 | 1.10.3 |
| `ngx-print` | 1.2.1 | = | = | 1.5.1 | = | = | 3.2.0 | ^20 | ^21 | ^22 |
| `ckeditor4-angular` | 3.3.0 | 5.2.1 | = | = | = | = | = | = | = | = |

Nhóm đánh số theo Angular, mỗi bản chạy `yarn add <lib>@^N --ignore-engines`; nếu không có bản major `N` thì giữ bản trước: `ngx-permissions`, `ngx-mask`, `ngx-drag-drop`, `ngx-cookie-service`, `ng-inline-svg-2`.

`tinymce` dừng ở 6.x vì từ 7.0 đổi sang giấy phép GPL và bắt buộc khai báo `licenseKey`.

Version của `ngx-print` trong khoảng 16–19 chưa có peer dependency để đối chiếu; nếu build lỗi ở thư viện này thì thử bản major kế tiếp.

## Quy trình chuẩn cho một bản major (dùng ở Task 10–19)

Với `N` là bản đích:

1. `git status --short` phải rỗng.
2. `node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng update @angular/core@N @angular/cli@N --force`
3. `node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng update @angular/material@N --force`
4. `node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng update @ngrx/store@N --force`
5. Cài thư viện bên thứ ba theo cột `N` của bảng version và nhóm đánh số theo Angular.
6. `yarn install --ignore-engines`
7. `node -p "require('./node_modules/@angular/core/package.json').version"` phải in ra `N.x.x`.
8. `yarn verify:dev`. Phải PASS. Sửa lỗi biên dịch nếu có, ghi lại lỗi nào đã sửa vào thông báo commit.
9. Cổng giao diện với nhãn `ngN` so với bộ ảnh gốc hiện hành. Phải PASS.
10. Cổng e2e: `yarn --cwd tools/e2e test:ro`. Phải PASS.
11. Commit: `upgrade angular <N-1> to <N>`.
12. Tag điểm rollback `upgrade/ng<N>` theo mục "Phương án rollback".

`--force` cần thiết vì thư viện bên thứ ba ở bước 5 chưa được nâng lúc `ng update` kiểm tra peer dependency.

---

## Chặng 0 — Baseline

### Task 1: Công cụ kiểm tra và baseline `prod`

**Files:**
- Modify: `package.json` (scripts), `.gitignore`, `.browserslistrc`
- Create: `.yarnrc`, `docs/plan/angular_22_smoke_checklist.md`

**Interfaces:**
- Produces: script `yarn verify:dev`, `yarn verify:prod`; file checklist smoke test dùng ở các mốc A–E.

- [ ] **Step 1:** Thêm vào `scripts` của `package.json`:

```json
"verify:dev": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration=dev --output-path build/_verify_dev",
"verify:prod": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration=prod --output-path build/_verify_prod"
```

- [ ] **Step 2:** Trong `.gitignore`: xoá dòng `yarn.lock`, thêm dòng `/build/_verify_*`. Xoá file `package-lock.json` trên đĩa.
- [ ] **Step 3:** Tạo `.yarnrc` với đúng một dòng: `--install.ignore-engines true`
- [ ] **Step 4:** Xoá dòng `IE 11` khỏi `.browserslistrc`.
- [ ] **Step 5:** Tạo `docs/plan/angular_22_smoke_checklist.md` gồm các mục, mỗi mục một checkbox: đăng nhập có reCAPTCHA; đăng xuất; hết phiên do ng-idle; một danh sách có phân trang, sắp xếp, lọc; mở và đóng dialog; thêm và sửa hồ sơ NCC kèm validate; ô chọn có tìm kiếm (`ngx-mat-select-search`); chip; datepicker và datetime-picker; upload file; in (`ngx-print`); xuất PDF; biểu đồ trên dashboard và ở Quản lý quỹ; TinyMCE, angular-editor, CKEditor; bình luận (popover, avatar); thông báo trên topbar; đổi ngôn ngữ; menu dropdown trên topbar.
- [ ] **Step 6:** Baseline: `dev` đã PASS ngày 2026-11-11 (457 giây). Baseline `prod` trên Angular 13 không chạy vì quá nặng; lần build `prod` đầu tiên là ở Task 9. Nếu lần đó lỗi, build `prod` tại commit `dd35832` để biết lỗi có sẵn hay mới phát sinh.
- [ ] **Step 7:** Commit `yarn.lock`, `.yarnrc`, `.gitignore`, `.browserslistrc`, `package.json`, checklist: `chore: baseline tooling for angular upgrade`.

### Task 1B: Công cụ so sánh giao diện và bộ ảnh gốc

**Files:**
- Create: `tools/visual/package.json`, `tools/visual/capture.mjs`, `tools/visual/compare.mjs`, `tools/visual/screens.json`, `tools/visual/approved.md`, `tools/visual/.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Produces:
  - `yarn --cwd tools/visual capture <nhãn>`: ghi ảnh vào `tools/visual/shots/<nhãn>/<tên màn hình>.png`.
  - `yarn --cwd tools/visual compare <nhãn gốc> <nhãn mới>`: ghi `tools/visual/report/<nhãn mới>-vs-<nhãn gốc>/index.html` (ảnh gốc, ảnh mới, ảnh khác biệt đặt cạnh nhau, xếp theo mức lệch giảm dần), in danh sách màn hình lệch quá ngưỡng, exit code 1 nếu có màn hình như vậy.
  - `screens.json`: mảng `{ "name": string, "path": string, "steps"?: Array<{ "click"?: string, "fill"?: [string, string], "waitFor"?: string }>, "mask"?: string[] }`.
  - Biến môi trường trong `tools/visual/.env`: `VISUAL_BASE_URL` (mặc định `http://localhost:3105`), `VISUAL_USER`, `VISUAL_PASS`.

Công cụ nằm trong `tools/visual/` với `package.json` riêng (`playwright`, `pixelmatch`, `pngjs`) để không lẫn vào dependencies của app và không bị `ng update` đụng tới.

- [ ] **Step 1:** Thêm vào `.gitignore`: `/tools/visual/shots`, `/tools/visual/report`, `/tools/visual/reference`, `/tools/visual/.env`, `/tools/visual/node_modules`.
- [ ] **Step 2:** Viết `capture.mjs`: mở Chromium ở viewport 1440×900, đăng nhập một lần qua form đăng nhập bằng `VISUAL_USER`/`VISUAL_PASS` (reCAPTCHA chỉ hiện sau nhiều lần đăng nhập sai nên không cản), rồi với mỗi mục trong `screens.json`: mở `path`, chờ hết request mạng và hết `mat-progress-bar`/`mat-spinner`, chạy `steps`, tắt animation và con trỏ nhấp nháy bằng CSS chèn vào trang, che các vùng trong `mask`, chụp toàn trang. Một màn hình lỗi không làm dừng cả lượt; cuối lượt in danh sách màn hình chụp hỏng và exit code 1 nếu có.
- [ ] **Step 3:** Viết `compare.mjs` dùng `pixelmatch` với `threshold: 0.1`; ngưỡng lệch mỗi màn hình là 0,1% số pixel; ảnh khác kích thước tính là lệch 100%; màn hình có ở một nhãn mà thiếu ở nhãn kia tính là lỗi.
- [ ] **Step 4:** Lập `screens.json`. Nguồn: mọi route không có tham số trong 98 file routing (`grep -rhoE "path:\s*'[^']*'" src/app --include=*.ts`), đối chiếu với menu trong `src/app/core/_config/menu.config.ts`. Với mỗi route danh sách, thêm một mục thứ hai có `steps` mở dialog thêm mới, và một mục mở dialog sửa của dòng đầu tiên. Thêm riêng các trạng thái: form hồ sơ NCC đang báo lỗi validate, menu dropdown topbar đang mở, bảng thông báo đang mở, hộp bình luận, select có tìm kiếm đang mở, datepicker đang mở. Vùng thay đổi theo thời gian (đồng hồ, số thông báo, ngày hiện tại) đưa vào `mask`.
- [ ] **Step 5:** `yarn --cwd tools/visual install`, `npx --prefix tools/visual playwright install chromium`.
- [ ] **Step 6:** Chạy `yarn start`, rồi `yarn --cwd tools/visual capture ng13`. Expected: không màn hình nào chụp hỏng.
- [ ] **Step 7: Kiểm tra độ ổn định.** `yarn --cwd tools/visual capture ng13-repeat` rồi `yarn --cwd tools/visual compare ng13 ng13-repeat`. Expected: PASS. Nếu có màn hình lệch dù code không đổi, thêm `mask` hoặc `waitFor` cho màn hình đó rồi chụp lại cả hai, cho tới khi PASS. Bộ ảnh không ổn định thì mọi cổng giao diện về sau đều vô nghĩa.
- [ ] **Step 8: Đối chiếu giao diện mẫu.** Đặt giao diện mẫu do người phụ trách cung cấp vào `tools/visual/reference/`, tên file trùng `name` trong `screens.json`. Chạy `yarn --cwd tools/visual compare reference ng13` (script đọc `reference/` như một nhãn). Màn hình nào có trong mẫu mà chưa có trong `screens.json` thì bổ sung và chụp lại `ng13`. Màn hình nào `ng13` đã khác mẫu thì báo người phụ trách quyết định cái nào là chuẩn, trước khi sang Chặng 1.
- [ ] **Step 9:** Commit `tools/visual/` (không gồm các thư mục đã ignore) và `.gitignore`: `chore: visual regression harness`.

### Task 1C: Bộ test e2e tự động

Cổng giao diện chỉ thấy ảnh tĩnh, không bắt được lỗi lúc chạy (nút bấm không phản hồi, dialog không mở, lỗi JS, request hỏng). Bộ e2e tự động hoá phần lớn checklist smoke để chạy được sau **mỗi** task, thay vì chỉ ở 5 mốc. Bộ e2e Protractor cũ (`e2e/`) đã gỡ ở Task 2 và không dùng lại.

**Files:**
- Create: `tools/e2e/package.json`, `tools/e2e/playwright.config.ts`, `tools/e2e/global-setup.ts`, `tools/e2e/fixtures.ts`, `tools/e2e/known-console-errors.json`, `tools/e2e/KNOWN_ISSUES.md`, `tools/e2e/.env.example`, `tools/e2e/tests/*.spec.ts`
- Modify: `.gitignore`, `docs/plan/angular_22_smoke_checklist.md`

**Interfaces:**
- Produces:
  - `yarn --cwd tools/e2e test:ro`: chạy các test gắn tag `@ro`, chỉ đọc dữ liệu, an toàn trên database dùng để chụp ảnh.
  - `yarn --cwd tools/e2e test:rw`: chạy các test gắn tag `@rw`, có thêm, sửa, xoá dữ liệu; từ chối chạy nếu `E2E_ALLOW_WRITE` khác `1`.
  - `yarn --cwd tools/e2e test:routes`: chỉ chạy test mở mọi route (nhanh, dùng khi đang sửa lỗi biên dịch).
  - Biến môi trường trong `tools/e2e/.env`: `E2E_BASE_URL` (mặc định `http://localhost:3105`), `E2E_USER`, `E2E_PASS`, `E2E_ALLOW_WRITE`, `E2E_RESTORE_CMD` (lệnh khôi phục database bản sao, do người phụ trách backend cung cấp).

Công cụ nằm trong `tools/e2e/` với `package.json` riêng (`@playwright/test`, `dotenv`), giống `tools/visual/`, để `ng update` không đụng tới. Dùng chung Chromium với `tools/visual`.

- [ ] **Step 1:** Thêm vào `.gitignore`: `/tools/e2e/node_modules`, `/tools/e2e/.env`, `/tools/e2e/.auth`, `/tools/e2e/report`, `/tools/e2e/test-results`. Report, ảnh và trace chứa dữ liệu cá nhân của người có công: không commit, không tải lên dịch vụ bên ngoài.
- [ ] **Step 2: Cấu hình.** `playwright.config.ts`: viewport 1440×900, `workers: 1` (backend local và dữ liệu dùng chung), `retries: 1`, `trace: 'off'` (bật `--trace on` khi chạy lại một test lỗi để gỡ), `screenshot: 'only-on-failure'`, reporter `list` và `html` vào `report/`. `global-setup.ts` đăng nhập một lần bằng form đăng nhập (cùng selector với `tools/visual/capture.mjs`: `input[formcontrolname="username"]`, `input[formcontrolname="password"]`, `#kt_login_signin_submit`) rồi lưu `storageState` vào `.auth/user.json`.
- [ ] **Step 3: Fixture bắt lỗi lúc chạy.** `fixtures.ts` mở rộng `test` của Playwright: mỗi test tự fail nếu trong lúc chạy có `pageerror` (exception JS chưa bắt), `console.error` không nằm trong `known-console-errors.json`, response từ API có status `>= 500`, hoặc request tải chunk JS/CSS của app thất bại. Danh sách lỗi console đã biết được chốt trên Angular 13 ở Step 6 và chỉ được thu hẹp, không được mở rộng nếu không có người phụ trách duyệt.
- [ ] **Step 4: Test `@ro` (chỉ đọc).** Mỗi file một nhóm chức năng:
  - `routes.spec.ts`: với mọi mục trong `tools/visual/screens.json` không có `steps`, mở `path`, chờ hết `mat-progress-bar`/`mat-spinner`, kiểm tra không bị đưa về `/auth/login`, có tiêu đề trang hoặc bảng hiển thị, và không có lỗi theo fixture. Đây là test bắt lỗi rộng nhất (module lazy-load hỏng, component thiếu provider).
  - `auth.spec.ts`: đăng nhập, đăng xuất, mở route cần quyền khi chưa đăng nhập thì bị chuyển về đăng nhập. Hết phiên ng-idle: dùng `page.clock.install()` rồi `page.clock.runFor(<thời gian idle + timeout>)`, kiểm tra hiện cảnh báo hết phiên và bị đưa về đăng nhập.
  - `layout.spec.ts`: menu trái mở và thu gọn; dropdown người dùng trên topbar mở và đóng; bảng thông báo mở và chuyển tab; đổi ngôn ngữ thì một nhãn cố định đổi chữ.
  - `list.spec.ts`: trên 3 danh sách đại diện (một danh mục, hồ sơ NCC, một danh sách bảo hiểm y tế): chuyển trang thì dòng đầu đổi; bấm tiêu đề cột thì thứ tự đổi; nhập ô lọc thì số dòng giảm hoặc hiện trạng thái rỗng; mở dialog thêm mới rồi bấm Huỷ thì dialog đóng và không gửi request `POST`/`PUT`/`DELETE` nào.
  - `form.spec.ts`: mở form hồ sơ NCC, bấm Lưu khi để trống thì hiện lỗi validate ở các ô bắt buộc và không gửi request ghi; ô chọn có tìm kiếm lọc được lựa chọn; datepicker mở và chọn được ngày; ô có mask chỉ nhận đúng định dạng. Đóng form không lưu.
  - `widgets.spec.ts`: biểu đồ dashboard và Quản lý quỹ vẽ ra `canvas` có pixel khác màu nền; carousel dashboard tự chuyển slide; TinyMCE tạo iframe editor; CKEditor tạo instance; angular-editor hiện thanh công cụ; avatar trong bình luận hiện ảnh hoặc chữ viết tắt.
  - `print-export.spec.ts`: thay `window.print` bằng hàm giả trước khi bấm In ở Bảo hiểm y tế → Thống kê theo đối tượng, kiểm tra hàm được gọi và vùng in có nội dung; bấm Xuất PDF, chờ sự kiện `download`, kiểm tra file có đuôi `.pdf` và lớn hơn 1 KB.
  - `realtime.spec.ts`: sau đăng nhập có request `negotiate` của SignalR trả 200 và kết nối WebSocket được mở.
- [ ] **Step 5: Test `@rw` (có ghi).** Chỉ chạy khi `E2E_ALLOW_WRITE=1` và backend đang trỏ vào database bản sao (ví dụ `ncc_e2e`). Trước lượt chạy, `global-setup.ts` gọi `E2E_RESTORE_CMD` để khôi phục bản sao về trạng thái chuẩn; nếu biến này trống thì dừng với thông báo lỗi. Mọi bản ghi tạo ra có tiền tố `E2E-` kèm thời gian để dễ nhận ra.
  - `crud-danh-muc.spec.ts`: thêm, sửa, xoá (có hộp xác nhận) một bản ghi ở một danh mục đơn giản; snackbar hiện sau mỗi thao tác; danh sách cập nhật.
  - `ho-so-ncc.spec.ts`: thêm hồ sơ NCC đủ trường bắt buộc, sửa một trường, kiểm tra giá trị sau khi tải lại trang.
  - `upload.spec.ts`: upload một file mẫu nhỏ (file giả, không chứa dữ liệu thật) rồi mở bằng file viewer.
  - `chip.spec.ts`: thêm và xoá chip ở form có chip.
- [ ] **Step 6: Chốt baseline trên Angular 13.** `cd tools/e2e && yarn install`. Chạy `yarn start`, rồi `test:ro` ba lần liên tiếp. Expected: cả ba lần PASS. Test nào lúc đạt lúc không thì sửa cách chờ (`waitFor`, chờ request) cho tới khi ổn định; lỗi console có sẵn trên Angular 13 thì ghi vào `known-console-errors.json`; chức năng hỏng sẵn trên Angular 13 thì đánh dấu `test.fixme` và ghi vào `KNOWN_ISSUES.md` để người phụ trách duyệt. Bộ test không ổn định trên bản gốc thì không dùng làm cổng được.
- [ ] **Step 7:** Có database bản sao thì chạy `test:rw` hai lần liên tiếp (mỗi lần khôi phục lại). Expected: PASS cả hai. Chưa có database bản sao thì ghi vào `KNOWN_ISSUES.md` là nhóm `@rw` chưa chạy, và các mục tương ứng trong checklist vẫn kiểm bằng tay.
- [ ] **Step 8:** Trong `angular_22_smoke_checklist.md`, đánh dấu `(e2e)` sau mỗi mục đã có test tự động. Mục không đánh dấu vẫn phải kiểm tay ở các mốc smoke: reCAPTCHA (cần nhập sai nhiều lần, dễ khoá tài khoản), hiệu ứng ripple/hover/nhãn nổi, in ra máy in thật, thông báo thời gian thực giữa hai người dùng.
- [ ] **Step 9:** Commit `tools/e2e/` (không gồm các thư mục đã ignore), `.gitignore`, checklist: `chore: e2e smoke tests`.
- [ ] **Step 10:** Tag `upgrade/ng13-baseline` vào commit `489ca4e` và push tag (xem mục "Phương án rollback").

---

## Chặng 1 — Dọn dẹp trên Angular 13

### Task 2: Gỡ cấu hình và package không còn dùng

**Files:**
- Modify: `angular.json`, `package.json`, `tsconfig.json`, `src/app/core/reducers/index.ts`, `src/app/app.module.ts:82`
- Delete: `webpack.extra.config.js`, `src/tslint.json`, thư mục `e2e/`

- [ ] **Step 1:** Trong `angular.json`: đổi builder `build` thành `@angular-devkit/build-angular:browser` và `serve` thành `@angular-devkit/build-angular:dev-server`; xoá khối `customWebpackConfig`; xoá target `lint`; xoá project `metronic-e2e`; xoá `defaultProject` và `cli.defaultCollection`.
- [ ] **Step 2:** Trong `tsconfig.json` xoá khối `angularCompilerOptions.enableIvy`.
- [ ] **Step 3:** `yarn remove @angular-builders/custom-webpack @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/schematics @angular-eslint/template-parser @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint @angular/platform-server ngrx-store-freeze`. Giữ file `.eslintrc.json` để dùng lại ở Task 20.
- [ ] **Step 4:** Trong `src/app/core/reducers/index.ts` bỏ import `storeFreeze`, đặt `metaReducers` thành mảng rỗng. Trong `app.module.ts` đổi thành `StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } })`.
- [ ] **Step 5:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 6:** Kiểm tra bundle không kéo locale moment thừa: `ls node_modules/moment/locale` chỉ in `vi.js`.
- [ ] **Step 7:** Commit: `chore: drop custom-webpack, eslint, e2e, store-freeze`.

### Task 3: Xoá `entryComponents`

**Files:**
- Modify: 55 file `*.module.ts` và `*.component.ts` có thuộc tính `entryComponents`

- [ ] **Step 1:** Liệt kê: `grep -rl "entryComponents" src --include=*.ts`. Expected: 55 file.
- [ ] **Step 2:** Xoá thuộc tính `entryComponents: [...]` trong từng decorator. Nếu mảng đó tham chiếu một hằng chỉ dùng cho nó thì xoá luôn hằng; component trong mảng phải vẫn nằm trong `declarations`.
- [ ] **Step 3:** `grep -rl "entryComponents" src --include=*.ts | wc -l`. Expected: `0`.
- [ ] **Step 4:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 5:** Commit: `refactor: remove entryComponents`.

### Task 4: Import mặc định cho moment và jwt-decode

**Files:**
- Modify: 28 file có `import * as moment from 'moment'`; `src/app/core/auth/_services/auth.guard.ts:6,37`; `package.json`

- [ ] **Step 1:** Đổi mọi `import * as moment from 'moment'` thành `import moment from 'moment'`. (`allowSyntheticDefaultImports` đã bật; 52 file khác đã dùng dạng này.)
- [ ] **Step 2:** `yarn add jwt-decode@^4.0.0 --ignore-engines`. Trong `auth.guard.ts` đổi thành `import { jwtDecode } from 'jwt-decode'` và gọi `jwtDecode(token)`.
- [ ] **Step 3:** Tìm các namespace import khác bị gọi như hàm: `grep -rnE "import \* as (\w+) from" src/app --include=*.ts`, với mỗi tên tìm được kiểm tra có chỗ gọi `<tên>(` hay không. Đổi sang import mặc định nếu có.
- [ ] **Step 4:** `grep -rn "import \* as moment" src --include=*.ts | wc -l`. Expected: `0`.
- [ ] **Step 5:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 6:** Commit: `refactor: default imports for moment and jwt-decode`.

### Task 5: Thay các thư viện đã ngừng bảo trì

**Files:**
- Create: `src/app/views/partials/lib/perfect-scrollbar/perfect-scrollbar.directive.ts`, `src/app/views/partials/lib/perfect-scrollbar/perfect-scrollbar.module.ts`, `src/app/views/partials/lib/recaptcha/recaptcha.component.ts`, `src/app/views/partials/lib/recaptcha/recaptcha.module.ts`
- Modify: `src/app/app.module.ts:10,12,55,89`, `src/app/views/pages/dashboard/dashboard.module.ts:9,15`, `src/app/views/pages/dashboard/dashboard.component.html`, `src/app/views/pages/auth/auth.module.ts:25`, `src/app/views/pages/auth/login/login.component.ts:5`, `src/app/views/pages/nguoi-co-cong/components/comment/comment.component.html`, module khai báo `comment.component`, `src/app/views/pages/nguoi-co-cong/services/signalR.service.ts:1`, `package.json`

**Interfaces:**
- Produces:
  - `PerfectScrollbarDirective`, selector `[perfectScrollbar]`, `@Input() perfectScrollbar: PerfectScrollbar.Options | ''`; export từ `PerfectScrollbarModule`.
  - `ReCaptchaComponent`, selector `re-captcha`, `@Input() site_key: string`, `@Input() size: 'normal' | 'compact'`, `@Input() language: string`, `@Output() captchaResponse: EventEmitter<string>`, `reset(): void`; export từ `ReCaptchaModule`.

- [ ] **Step 1: perfect-scrollbar.** Viết `PerfectScrollbarDirective` bọc package `perfect-scrollbar` (đã có trong dependencies): tạo instance ở `ngAfterViewInit`, huỷ ở `ngOnDestroy`. Đổi import trong `dashboard.module.ts` sang module mới; xoá `PERFECT_SCROLLBAR_CONFIG` và hằng cấu hình trong `app.module.ts`. Template không đổi.
- [ ] **Step 2: reCAPTCHA.** Viết `ReCaptchaComponent` tải `https://www.google.com/recaptcha/api.js?render=explicit&hl=<language>` một lần rồi gọi `grecaptcha.render`. Giữ đủ mọi thành viên mà `login.component.ts` gọi trên `this.recaptcha`. Đổi import ở `auth.module.ts` và `login.component.ts`. Template không đổi.
- [ ] **Step 3: avatar.** `yarn add ngx-avatars@1.3.0 --ignore-engines`. Đổi import `AvatarModule` sang `'ngx-avatars'`; đổi thẻ `<ngx-avatar` thành `<ngx-avatars` (và thẻ đóng) trong `dashboard.component.html` và `comment.component.html`.
- [ ] **Step 4: inline SVG.** `yarn add ng-inline-svg-2@14.0.2 --ignore-engines`. Đổi import `InlineSVGModule` trong `app.module.ts` sang `'ng-inline-svg-2'`.
- [ ] **Step 5: SignalR.** `yarn add @microsoft/signalr --ignore-engines`. Đổi import trong `signalR.service.ts` sang `'@microsoft/signalr'`.
- [ ] **Step 6: popover.** Trong `comment.component.html` thay 3 cặp `[popover]` / `<popover-content>` bằng `[matMenuTriggerFor]` / `<mat-menu>`. Với popover mở khi hover (hộp reaction, dòng 197), lấy `MatMenuTrigger` bằng template reference và gọi `openMenu()` ở `(mouseenter)`.
- [ ] **Step 7:** `yarn remove ngx-perfect-scrollbar angular2-recaptcha ngx-avatar ng-inline-svg @aspnet/signalr ngx-smart-popover`
- [ ] **Step 8:** `grep -rnE "ngx-perfect-scrollbar|angular2-recaptcha|'ngx-avatar'|\"ngx-avatar\"|'ng-inline-svg'|@aspnet/signalr|ngx-smart-popover" src package.json | wc -l`. Expected: `0`.
- [ ] **Step 9:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 10:** Cổng giao diện, nhãn `task5` so với `ng13`. Expected: PASS. Hộp bình luận (popover đổi sang `mat-menu`) được phép lệch nếu người phụ trách duyệt.
- [ ] **Step 11:** Commit: `refactor: replace unmaintained libraries`.

### Task 6: Gỡ ng-bootstrap

**Files:**
- Create: `src/app/views/partials/lib/simple-carousel/simple-carousel.component.ts` (+ `.html`, `.scss`), khai báo trong `src/app/views/partials/lib/lib.module.ts`
- Modify: 19 template có directive `ngb*`; 6 module: `dashboard.module.ts`, `canvas-demo.module.ts`, `dps-common.module.ts`, `lib.module.ts`, `partials.module.ts`, `theme.module.ts`; `src/app/views/partials/lib/datetime-picker/datetime-picker.component.{ts,html}`; `package.json`

**Interfaces:**
- Produces: `SimpleCarouselComponent`, selector `kt-simple-carousel`, `@Input() interval: number` (ms), nội dung là các `<ng-template ktSlide>`; directive `SlideDirective` selector `[ktSlide]`.

Bảng thay thế:

| ng-bootstrap | Số chỗ | Thay bằng |
|---|---|---|
| `ngbDropdown`, `ngbDropdownToggle`, `ngbDropdownMenu`, `ngbDropdownItem`, `ngbDropdownAnchor` | 13 | `[matMenuTriggerFor]` + `<mat-menu>`, giữ nguyên nội dung bên trong |
| `ngbTooltip` | 10 | `matTooltip` |
| `<ngb-progressbar type height [value]>` | 10 | `<div class="progress" [style.height]="..."><div class="progress-bar bg-{{type}}" [style.width.%]="value"></div></div>` |
| `<ngb-tabset>` / `<ngb-tab>` | 2 component | `<mat-tab-group>` / `<mat-tab>`; template tiêu đề chuyển sang `<ng-template mat-tab-label>` |
| `<ngb-timepicker>` + `NgbTimeStringAdapter` | 1 | `<input type="time" step="300">` gắn thẳng vào chuỗi mà adapter đang sinh ra |
| `<ngb-carousel>` + `ngbSlide` | 1 | `<kt-simple-carousel>` + `ktSlide` |

- [ ] **Step 1:** Liệt kê phạm vi: `grep -rlE "ngb[A-Z]|<ngb-" src/app --include=*.html`. Expected: 19 file.
- [ ] **Step 2:** Viết `SimpleCarouselComponent`: hiện một slide, tự chuyển sau `interval` ms, có chấm chỉ báo, không có mũi tên (trang dashboard đang đặt `[showNavigationArrows]="false"`).
- [ ] **Step 3:** Thay từng template theo bảng trên. Thêm `MatMenuModule`, `MatTooltipModule`, `MatTabsModule` vào module tương ứng nếu chưa có.
- [ ] **Step 4:** Xoá mọi import `Ngb*Module` khỏi 6 module; xoá `NgbTimeStringAdapter` và provider của nó trong `datetime-picker.component.ts`.
- [ ] **Step 5:** `yarn remove @ng-bootstrap/ng-bootstrap`
- [ ] **Step 6:** `grep -rnE "ng-bootstrap|ngb[A-Z]|<ngb-|Ngb[A-Z]" src package.json | wc -l`. Expected: `0`.
- [ ] **Step 7:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 8:** Cổng giao diện, nhãn `task6` so với `ng13`. Màn hình không chứa thành phần ng-bootstrap phải PASS. Với 19 màn hình có thay thế: chỉnh CSS của `mat-menu`, `mat-tab-group`, `matTooltip`, thanh tiến độ cho sát ảnh gốc và giao diện mẫu, rồi đưa báo cáo cho người phụ trách duyệt từng màn hình.
- [ ] **Step 9:** Sau khi được duyệt, bộ ảnh gốc hiện hành là `task6`.
- [ ] **Step 10:** Commit: `refactor: remove ng-bootstrap`.

### Task 7: Chart.js 2 → 3

**Files:**
- Modify: `src/app/views/pages/dashboard/dashboard.component.{ts,html}`, `dashboard.module.ts`, `src/app/views/pages/nguoi-co-cong/dps-common.module.ts`, `.../quy-den-on-dap-nghia/quan-ly-quy/quan-ly-quy-info/quan-ly-quy-info.component.{ts,html}`, `.../quan-ly-quy-info-canvas/quan-ly-quy-info-canvas.component.html`, `.../quy-den-on-dap-nghia/dv-dong-gop/dv-dong-gop-bc/dv-dong-gop-bc.component.html`, `package.json`

- [ ] **Step 1:** `yarn remove chartjs-plugin-labels` rồi `yarn add chart.js@^3.9.1 ng2-charts@3.1.2 chartjs-plugin-datalabels@^2.2.0 --ignore-engines`
- [ ] **Step 2:** Đổi `ChartsModule` thành `NgChartsModule` trong 2 module.
- [ ] **Step 3:** Chuyển cấu hình biểu đồ sang cú pháp Chart.js 3: `scales.xAxes[]`/`yAxes[]` thành `scales.x`/`scales.y`; `legend`, `tooltips`, `title` chuyển vào `options.plugins` (`tooltips` đổi tên thành `tooltip`); kiểu `ChartOptions`, `ChartDataSets`, `Label`, `Color` thay bằng `ChartConfiguration`, `ChartData`. Trong template: `[datasets]`+`[labels]` gộp thành `[data]`, `[chartType]` thành `[type]`, bỏ `[colors]` (màu đặt trong dataset).
- [ ] **Step 4:** Thay cấu hình `plugins.labels` bằng `plugins.datalabels` và đăng ký plugin qua input `[plugins]`.
- [ ] **Step 5:** `yarn verify:dev`. Expected: PASS.
- [ ] **Step 6:** Cổng giao diện, nhãn `task7` so với `task6`. Màn hình không có biểu đồ phải PASS. Với các màn hình có biểu đồ: chỉnh màu, font, chú thích, nhãn số liệu cho sát ảnh gốc, rồi đưa người phụ trách duyệt.
- [ ] **Step 7:** Sau khi được duyệt, bộ ảnh gốc hiện hành là `task7`.
- [ ] **Step 8:** Commit: `refactor: chart.js 3 and ng2-charts 3`.

### Task 8: Đưa thư viện còn lại lên bản Ivy cho Angular 13

**Files:**
- Modify: `package.json`; các module dùng `ngx-mask`; file nào lỗi biên dịch sau khi nâng

- [ ] **Step 1:** Cài theo cột "13 (Task 8)" của bảng version, cộng nhóm đánh số theo Angular với `N = 13`: `ngx-permissions@^13`, `ngx-mask@^13`, `ngx-drag-drop@^13`, `ngx-cookie-service@^13`.
- [ ] **Step 2:** Sửa lỗi biên dịch do đổi API giữa các bản major của thư viện. Điểm đã biết: `ngx-mask` 11 → 13 vẫn dùng `NgxMaskModule.forRoot()`.
- [ ] **Step 3:** `yarn verify:dev 2>&1 | tee build/_verify_dev.log`. Expected: PASS, và khối `Processing legacy "View Engine" libraries:` trong log chỉ còn `ng2-file-upload` (bản Ivy đầu tiên của nó yêu cầu Angular 14).
- [ ] **Step 3b:** Cổng giao diện, nhãn `task8` so với `task7`. Expected: PASS. Chú ý các màn hình có editor (TinyMCE, angular-editor, CKEditor), ô nhập có mask, select có tìm kiếm.
- [ ] **Step 4:** Commit: `chore: third-party libraries to ivy builds`.

### Task 9: Theme Material sang `@use`

**Files:**
- Modify: `src/styles.scss:3`, `src/assets/sass/style.angular.scss:17,21`, `src/assets/sass/global/integration/frameworks/angular/material/_angular-material.scss`

- [ ] **Step 1:** Chạy schematic có sẵn: `node node_modules/@angular/cli/bin/ng generate @angular/material:themingApi`
- [ ] **Step 2:** Kiểm tra kết quả trong `_angular-material.scss`: `@use '@angular/material' as mat;` ở đầu file, `mat.core()`, `mat.define-palette(...)`, `mat.define-light-theme(...)`, `mat.all-component-themes(...)`.
- [ ] **Step 3:** Bỏ dấu `~` ở 3 dòng import còn lại (`~bootstrap/scss/bootstrap`, `~@angular/material/...`).
- [ ] **Step 4:** `grep -rnE "@import ['\"]~|mat-palette\(|angular-material-theme\(" src --include=*.scss | grep -v "^\s*//" | wc -l`. Expected: `0`.
- [ ] **Step 5:** `yarn verify:dev` và `yarn verify:prod`. Expected: PASS.
- [ ] **Step 5b:** Cổng giao diện, nhãn `task9` so với `task7`. Expected: PASS, không có ngoại lệ (đổi cú pháp SCSS không được làm đổi CSS sinh ra).
- [ ] **Step 6:** Commit: `refactor: material theming to @use api`.
- [ ] **Step 7: Mốc smoke A.** Chạy `yarn start`. Chạy `yarn --cwd tools/e2e test:ro` và `test:rw` (trên database bản sao), cả hai phải PASS, rồi đi tay các mục chưa có `(e2e)` trong checklist. Mọi mục phải đạt trước khi sang Chặng 2. Đây là lần kiểm tra các thay thế ở Task 5–7.
- [ ] **Step 8:** Lưu bản build `prod` của Step 5 vào `build/_release_upgrade-ng13-clean/`, tag `upgrade/ng13-clean`.

---

## Chặng 2 — Nâng từng bản major

### Task 10: Angular 13 → 14

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 14`.
- [ ] **Step 2:** Xác nhận migration Typed Forms đã chạy: `grep -rl "UntypedForm" src --include=*.ts | wc -l` lớn hơn 0. Không gõ type lại.
- [ ] **Step 3:** Log `yarn verify:dev` không còn khối `Processing legacy "View Engine" libraries:`.

### Task 11: Angular 14 → 15 (Material ở chế độ legacy)

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 15`, nhưng ở bước 5 **chưa** nâng `ngx-mat-select-search` (giữ 4.2.1).
- [ ] **Step 2:** Xác nhận `ng update @angular/material@15` đã đổi import sang legacy: `grep -rl "@angular/material/legacy-" src --include=*.ts | wc -l` lớn hơn 0.
- [ ] **Step 3:** Giao diện ở bước này chưa đổi; không cần smoke.

### Task 12: Chuyển Material legacy sang MDC

**Files:**
- Modify: mọi file có import `@angular/material/legacy-*`; 32 template có `mat-chip-list`; 22 file SCSS có override `.mat-*`; `_angular-material.scss`

- [ ] **Step 1:** `node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng generate @angular/material:mdc-migration`, chọn tất cả component, thư mục `src`.
- [ ] **Step 2:** Xử lý mọi chú thích `TODO(mdc-migration)` mà schematic để lại: `grep -rn "TODO(mdc-migration)" src | wc -l` phải về `0`.
- [ ] **Step 3:** Chip: `mat-chip-list` có `matChipInputFor` (1 chỗ) đổi thành `mat-chip-grid` + `mat-chip-row`; các chỗ còn lại đổi thành `mat-chip-listbox` + `mat-chip-option` nếu cho chọn, hoặc `mat-chip-set` + `mat-chip` nếu chỉ hiển thị.
- [ ] **Step 4:** Trong `_angular-material.scss` thêm cấu hình typography vào theme: `typography: mat.define-typography-config()`, và gọi `@include mat.all-component-typographies($config)`.
- [ ] **Step 5:** `yarn add ngx-mat-select-search@7.0.10 --ignore-engines`
- [ ] **Step 6:** `grep -rnE "legacy-|MatLegacy|mat-chip-list|appearance=\"legacy\"" src --include=*.ts --include=*.html | wc -l`. Expected: `0`.
- [ ] **Step 7:** `yarn verify:dev` và `yarn verify:prod`. Expected: PASS.
- [ ] **Step 8: Sửa giao diện theo báo cáo.** `yarn --cwd tools/visual capture task12` rồi `compare task7 task12`. Ở bước này gần như mọi màn hình đều lệch; báo cáo là danh sách việc cần làm. Sửa SCSS override theo tên class MDC mới (`.mat-mdc-*`, `.mdc-*`) ở các file dùng chung trước, theo thứ tự số chỗ override: `.mat-table`, `.mat-icon-button`, `.mat-header-cell`, `.mat-form-field`, nút, checkbox, dialog. Sau mỗi nhóm sửa, chụp và so lại. Mục tiêu: chiều cao dòng, khoảng cách, cỡ chữ, màu, đường viền của form, bảng, dialog khớp ảnh gốc và giao diện mẫu.
- [ ] **Step 9: Duyệt.** Khi không còn giảm được mức lệch, đưa báo cáo cho người phụ trách. Từng màn hình còn lệch phải được duyệt hoặc trả lại để sửa tiếp. Không sang Task 13 khi còn màn hình chưa duyệt.
- [ ] **Step 10: Mốc smoke B.** Chạy `yarn --cwd tools/e2e test:ro` và `test:rw` (trên database bản sao), cả hai phải PASS, rồi đi tay các mục chưa có `(e2e)` trong checklist. Chú ý những thứ ảnh tĩnh không bắt được: hiệu ứng nhãn nổi của ô nhập khi focus, ripple, trạng thái hover và disabled, snackbar, tooltip, cuộn trong dialog dài.
- [ ] **Step 11:** Sau khi được duyệt, bộ ảnh gốc hiện hành là `task12`.
- [ ] **Step 12:** Commit: `refactor: material legacy to mdc`.
- [ ] **Step 13:** Lưu bản build `prod` của Step 7 vào `build/_release_upgrade-ng15-mdc/`, tag `upgrade/ng15-mdc`.

### Task 13: Angular 15 → 16

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 16`. Ở bước 5 cài thêm `rxjs@^7.8.0` và `tinymce@^6.8`.
- [ ] **Step 2:** Sửa lỗi biên dịch do RxJS 7 (kiểu trả về của `toPromise()` thành `T | undefined`) và do `@ngx-translate/core` 17.
- [ ] **Step 3: Mốc smoke C.** Chạy `yarn --cwd tools/e2e test:ro` và `test:rw` (trên database bản sao), cả hai phải PASS, rồi đi tay các mục chưa có `(e2e)` trong checklist. Đây là bản đầu tiên không còn ngcc và dùng RxJS 7, TinyMCE 6.

### Task 14: Angular 16 → 17

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 17`.
- [ ] **Step 2:** `ng2-charts` 6 bỏ `NgChartsModule`: trong 2 module đổi sang import `BaseChartDirective` và thêm `provideCharts(withDefaultRegisterables())` vào `providers` của `AppModule`.
- [ ] **Step 3:** Xác nhận `angular.json` đã đổi `browserTarget` thành `buildTarget`.

### Task 15: Angular 17 → 18 và chuyển sang application builder

**Files:**
- Modify: `angular.json`, `tsconfig.json`, `src/tsconfig.app.json`, `package.json`

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 18`. Commit.
- [ ] **Step 2:** `node node_modules/@angular/cli/bin/ng update @angular/cli --name use-application-builder`
- [ ] **Step 3:** Trong `angular.json`, với mỗi cấu hình, đặt `outputPath` dạng `{ "base": "<đường dẫn cũ>", "browser": "" }` để file vẫn nằm trực tiếp trong thư mục cũ.
- [ ] **Step 4:** `yarn verify:prod`, rồi `ls build/_verify_prod/index.html`. Expected: file tồn tại, không có thư mục con `browser/`.
- [ ] **Step 5:** `ls build/_verify_prod/tinymce/tinymce.min.js` và `ls build/_verify_prod/sw.js`. Expected: cả hai tồn tại.
- [ ] **Step 6:** Xoá `--max_old_space_size=8192` khỏi các script trong `package.json` nếu `yarn verify:prod` vẫn PASS khi không có nó.
- [ ] **Step 6b:** Cổng giao diện, nhãn `ng18-esbuild` so với `task12`. Expected: PASS. Builder mới xử lý thứ tự CSS khác webpack, nên lệch ở đây thường do thứ tự nạp style trong `angular.json`.
- [ ] **Step 7: Mốc smoke D.** Trên `yarn start`: Chạy `yarn --cwd tools/e2e test:ro` và `test:rw` (trên database bản sao), cả hai phải PASS, rồi đi tay các mục chưa có `(e2e)` trong checklist. Chạy thêm `test:ro` một lần với `E2E_BASE_URL` trỏ vào bản build `prod` phục vụ bằng `node tools/visual/serve.mjs build/_verify_prod 3106`, vì builder mới có thể chạy khác giữa dev server và bản build. Chú ý mọi màn hình có ngày giờ (moment), biểu đồ, in ấn.
- [ ] **Step 8:** Commit: `build: switch to application builder`.
- [ ] **Step 9:** Lưu bản build `prod` vào `build/_release_upgrade-ng18-esbuild/`, tag `upgrade/ng18-esbuild`.

### Task 16: Angular 18 → 19

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 19`.
- [ ] **Step 2:** Xác nhận migration đã thêm `standalone: false`: `grep -rl "standalone: false" src --include=*.ts | wc -l` xấp xỉ số component, directive và pipe (khoảng 500).
- [ ] **Step 3:** `ngx-avatars` không có bản cho 19; giữ 1.8.0 và bỏ qua cảnh báo peer dependency.

### Task 17: Angular 19 → 20

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 20`.

### Task 18: Angular 20 → 21

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 21`.
- [ ] **Step 2:** Xác nhận app vẫn dùng zone.js: `polyfills` trong `angular.json` còn `zone.js`, và `AppModule` không có `provideZonelessChangeDetection`.

### Task 19: Angular 21 → 22

- [ ] **Step 1:** `node -v` phải `>= v24.15.0`. Nếu chưa, dừng lại và yêu cầu nâng Node.
- [ ] **Step 2:** Chạy Quy trình chuẩn với `N = 22`.
- [ ] **Step 3:** TypeScript 6: trong `tsconfig.json` đặt `"moduleResolution": "bundler"`; nếu compiler báo `baseUrl` deprecated thì thay bằng `"paths": { "*": ["./src/*"] }`.
- [ ] **Step 4:** `node -p "require('./node_modules/@angular/core/package.json').version"`. Expected: `22.2.x`.

---

## Chặng 3 — Hoàn thiện

### Task 20: Dọn dẹp và nghiệm thu

**Files:**
- Modify: `package.json`, `angular.json`, `README.md`, `docs/plan/2026-11-14-angular-22-implementation-plan.md`
- Create: `eslint.config.js`
- Delete: `.eslintrc.json`, `webpack.config.js` (nếu script `rtl` không còn dùng)

- [ ] **Step 1:** `node node_modules/@angular/cli/bin/ng add angular-eslint`. Chuyển các rule riêng từ `.eslintrc.json` sang `eslint.config.js`, rồi xoá `.eslintrc.json`.
- [ ] **Step 2:** Trong `package.json`: script `build` đổi `--prod` thành `--configuration=production`; đổi `"version"` thành `22.0.0`.
- [ ] **Step 3:** Build đủ 6 cấu hình, mỗi cấu hình phải PASS: `dev`, `production`, `test`, `prod`, `prod_SOTBVL`, `prod_KG`.
- [ ] **Step 4:** `yarn start` lên được ở cổng 3105.
- [ ] **Step 4b:** Cổng giao diện lần cuối, nhãn `ng22-final` so với `task12`, và thêm một lượt so với `reference` (giao diện mẫu). Expected: PASS, hoặc mọi khác biệt đã có trong `tools/visual/approved.md`.
- [ ] **Step 5: Mốc smoke E.** Trên bản build `prod` được phục vụ như môi trường thật (`node tools/visual/serve.mjs <thư mục build> 3106`, `E2E_BASE_URL=http://localhost:3106`): Chạy `yarn --cwd tools/e2e test:ro` và `test:rw` (trên database bản sao), cả hai phải PASS, rồi đi tay các mục chưa có `(e2e)` trong checklist.
- [ ] **Step 6:** Ghi vào đầu file plan này một dòng trạng thái "Hoàn thành ngày ..." và cập nhật `README.md` với yêu cầu Node `>= 24.15`.
- [ ] **Step 7:** Commit: `chore: finalize angular 22 upgrade`.
- [ ] **Step 8:** Lưu bản build `prod` vào `build/_release_upgrade-ng22/`, tag `upgrade/ng22`. Viết vào `README.md` cách chạy `tools/e2e` để dùng tiếp cho các lần sửa sau nâng cấp.

## Quyết định cần người phụ trách xác nhận

Plan đã chọn sẵn phương án mặc định cho từng mục; chỉ cần báo lại nếu muốn khác.

| Mục | Mặc định trong plan | Phương án khác |
|---|---|---|
| ng-bootstrap | **Đã làm:** gỡ package, chép mã ng-bootstrap 5.3.1 giữ nguyên markup Bootstrap 4 (Task 6) | Giữ và nâng theo từng bản; kéo theo nâng theme lên Bootstrap 5 |
| Giao diện sau MDC | Đã chốt 2026-11-14: phải giống giao diện hiện tại. **Cập nhật 2026-11-19:** người phụ trách bỏ cổng so ảnh và smoke test sau MDC; xem giao diện một lần ở cuối. 33 chỗ SCSS dễ lệch nhất có comment `// MDC:` | — |
| Biểu đồ | **Đã làm:** giữ Chart.js 2.9, không đổi giao diện (Task 7) | Nâng Chart.js 4 thành một đợt riêng, chấp nhận biểu đồ đổi giao diện, có bản vá bảo mật |
| Karma và 6 file spec | Giữ nguyên, không dùng làm điều kiện nghiệm thu. `src/test.ts` dùng `require.context` nên `ng test` không chạy được từ Task 15. **Chưa quyết định** (việc số 6 trong "Tiếp tục từ đâu") | Xoá hẳn ở Task 20, hoặc chuyển sang Vitest |
| Test e2e | Playwright trong `tools/e2e/` (Task 1C). **Đã viết** 2026-11-19 trên Angular 22 (83 test); chưa chạy với backend. Baseline là lần chạy ổn định đầu tiên trên 22 | Chỉ smoke test tay ở cuối |
| Database cho nhóm e2e `@rw` | Bản sao riêng, khôi phục trước mỗi lượt bằng `E2E_RESTORE_CMD` do người phụ trách backend cung cấp | Không chạy `@rw`, kiểm tay các thao tác ghi |
| TinyMCE | **Đã làm:** 6.8.6 (giấy phép MIT), 2026-11-19 | Lên 8.x, chấp nhận GPL hoặc mua license |

## Nhật ký vướng mắc

Ghi mỗi lần rollback mức 2 trở lên: ngày, task, commit bị revert, triệu chứng, nguyên nhân (nếu đã biết), hướng xử lý người phụ trách chọn.

| Ngày | Task | Commit | Triệu chứng | Nguyên nhân | Hướng xử lý |
|---|---|---|---|---|---|
