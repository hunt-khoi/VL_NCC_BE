# Angular 13 → 22 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa dự án `VL_NCC_BE` từ Angular 13.3.12 lên Angular 22.2.x, app chạy đúng như hiện tại ở cả 6 cấu hình build.

**Architecture:** Ba chặng. (1) Dọn dẹp ngay trên Angular 13: gỡ mọi thứ sẽ chặn đường (thư viện View Engine, `entryComponents`, custom-webpack, ng-bootstrap) trong lúc app còn chạy được. (2) Nâng từng bản major bằng `ng update`, mỗi bản một commit, build `dev` + `prod` sau mỗi bản. (3) Hoàn thiện sau khi tới 22. Vì dự án gần như không có test tự động, "test" của mỗi task là build thành công cộng với 5 mốc smoke test tay.

**Tech Stack:** Angular CLI, Angular Material (MDC), NgRx, RxJS, yarn 1.22, Node 24.

**Spec:** Không có tài liệu spec riêng; plan này là tài liệu duy nhất. Hiện trạng lúc lập plan (2026-11-14): 1006 file TS, 495 component, 159 module, 6 file spec; Material dùng ở 323 file; build `dev` trên Angular 13 thành công trên Node 24.14.0.

## Global Constraints

- Nhánh làm việc: `upgrade-2026`. Không đụng `main`.
- Package manager: `yarn` 1.22 với `--ignore-engines`. Không dùng `npm install`.
- Node: dùng Node 24 cho toàn bộ quá trình (baseline Angular 13 đã build được trên Node 24.14.0). Trước Task 19 phải nâng Node lên `>= 24.15.0`. Nếu một bản CLI trung gian từ chối chạy trên Node 24, cài nvm-windows và dùng Node 18.20 (Angular 14–17) hoặc Node 20.19 (Angular 18–19) cho riêng bản đó.
- Đích: `@angular/core` 22.2.x, TypeScript `>=6.0 <6.1`, zone.js `~0.15.0 || ~0.16.0`, RxJS `^7.4.0`.
- Vẫn dùng NgModule và zone.js. Không chuyển standalone, không chuyển zoneless, không gõ type cho forms, không đổi sang control flow mới.
- Giữ nguyên CSS Bootstrap 4 của theme Metronic. Không nâng Bootstrap.
- Mỗi task kết thúc bằng một commit. Không gộp hai bản major vào một commit.
- Build `prod` rất nặng trên máy phát triển (tối đa 8 GB RAM, chiếm CPU nhiều phút). Chỉ chạy `yarn verify:prod` ở 4 chỗ: cuối Chặng 1 (Task 9), sau MDC (Task 12), sau khi đổi builder (Task 15), nghiệm thu (Task 20). Trước mỗi lần chạy phải báo người phụ trách và chờ họ đồng ý. Các task khác chỉ chạy `yarn verify:dev`.
- Lệnh kiểm tra chuẩn (tạo ở Task 1): `yarn verify:dev` và `yarn verify:prod`. "PASS" nghĩa là exit code 0 và log không có dòng `Error:`.
- Thông báo commit theo kiểu hiện có của repo, ví dụ `upgrade angular 13 to 14`.
- **Cổng giao diện** (công cụ tạo ở Task 1B): chạy `yarn start`, rồi `yarn --cwd tools/visual capture <nhãn>` và `yarn --cwd tools/visual compare <nhãn gốc> <nhãn>`. "PASS" nghĩa là không màn hình nào lệch quá 0,1% số pixel so với bộ ảnh gốc hiện hành. Màn hình lệch phải được sửa, hoặc được người phụ trách duyệt là thay đổi chấp nhận được và ghi vào `tools/visual/approved.md`. Không tự duyệt.
- Bộ ảnh gốc ban đầu có nhãn `ng13`. Chỉ đổi bộ ảnh gốc ở ba chỗ plan cho phép (Task 6, 7, 12), sau khi người phụ trách duyệt.
- Ảnh chụp chứa dữ liệu cá nhân của người có công: thư mục `tools/visual/shots/`, `tools/visual/report/`, `tools/visual/reference/` và file `tools/visual/.env` phải nằm trong `.gitignore`, không commit, không tải lên dịch vụ bên ngoài.
- Dữ liệu backend phải giữ nguyên giữa các lần chụp: dùng cùng một database local, không nhập liệu thêm trong lúc nâng cấp.

## Các quyết định chính

| Cách làm thường gặp | Plan này làm | Lý do |
|---|---|---|
| Đổi Node theo từng bản (16, 18, 20, 22) | Dùng Node 24 suốt, có phương án dự phòng | Baseline 13 đã build được trên Node 24; máy không có nvm |
| Chuyển MDC ở bản 16 | Chuyển MDC ngay ở bản 15 | `ngx-mat-select-search` 7.x (bản cho MDC) hỗ trợ từ 15, tránh một bản chạy lệch |
| Giữ custom-webpack tới khi lên 22 | Gỡ ngay ở Task 2 | Plugin lọc locale moment là thừa: script `postinstall` đã xoá mọi locale trừ `vi` |
| Giữ ng-bootstrap, nâng theo từng bản | Gỡ ở Task 6 (19 template, 6 module) | Bản mới bắt buộc Bootstrap 5 và đã bỏ `ngb-tabset`; theme Metronic dựng trên Bootstrap 4 |
| `toPromise()` → `firstValueFrom` (14 file) | Bỏ | RxJS 7 vẫn còn `toPromise()`, chỉ deprecated |
| `ckeditor4-angular` gộp về TinyMCE | Giữ, chỉ nâng version | Có bản Ivy; gộp là đổi hành vi, không cần cho việc nâng cấp |
| `ngx-perfect-scrollbar` → `ngx-scrollbar` | Directive tự viết cùng selector | 3 chỗ dùng, không phải sửa template |
| Giữ angular-eslint, nâng theo từng bản | Gỡ ở Task 2, cài lại bản 22 ở Task 20 | Bớt một nhóm package phải khớp version ở mỗi bản |
| Build đủ cấu hình sau mỗi bước | `dev` + `prod` mỗi bước, đủ 6 cấu hình ở Task 20 | 4 cấu hình còn lại chỉ khác file environment |

## Review Focus

Năm kiểu lỗi mà build không bắt được, xếp theo khả năng xảy ra:

1. **Giao diện Material lệch sau MDC**: 22 file SCSS có override lên `.mat-*` (nhiều nhất `.mat-table` 30 chỗ, `.mat-icon-button` 17 chỗ), `mat-form-field` ở 252 file. Người dùng mong form, bảng, dialog trông và căn chỉnh như cũ. Kiểm bằng cổng giao diện ở Task 12, đối chiếu với giao diện mẫu do người phụ trách cung cấp.
2. **`import * as moment from 'moment'` rồi gọi `moment()`** (28 file): chạy được với webpack nhưng ném `moment is not a function` lúc chạy khi sang esbuild. Kiểm bằng lệnh grep ở Task 4, và mốc smoke D (Task 15).
3. **Thư viện chỉ hỏng lúc chạy**: reCAPTCHA không tải script, SignalR không kết nối, TinyMCE không tìm thấy `/tinymce/`, in ấn ra trang trắng. Kiểm ở mọi mốc smoke.
4. **Thư mục output đổi cấu trúc khi sang application builder**: builder mới mặc định đặt file vào `<outputPath>/browser/`, làm hỏng quy trình deploy đang trỏ vào `build/ncc_dev`. Kiểm bằng bước xác nhận `index.html` ở Task 15.
5. **File environment lệch field**: `environment-kiengiang.prod.ts`, `environment-sotbvl.prod.ts`, `environment-test.prod.ts`, `environment.prod.ts` chỉ được biên dịch khi build đúng cấu hình của nó. Kiểm bằng bước build đủ 6 cấu hình ở Task 20.

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
10. Commit: `upgrade angular <N-1> to <N>`.

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
- [ ] **Step 7: Mốc smoke A.** Chạy `yarn start`, đi hết `angular_22_smoke_checklist.md`. Mọi mục phải đạt trước khi sang Chặng 2. Đây là lần kiểm tra các thay thế ở Task 5–7.

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
- [ ] **Step 10: Mốc smoke B.** Đi hết checklist tay, chú ý những thứ ảnh tĩnh không bắt được: hiệu ứng nhãn nổi của ô nhập khi focus, ripple, trạng thái hover và disabled, snackbar, tooltip, cuộn trong dialog dài.
- [ ] **Step 11:** Sau khi được duyệt, bộ ảnh gốc hiện hành là `task12`.
- [ ] **Step 12:** Commit: `refactor: material legacy to mdc`.

### Task 13: Angular 15 → 16

- [ ] **Step 1:** Chạy Quy trình chuẩn với `N = 16`. Ở bước 5 cài thêm `rxjs@^7.8.0` và `tinymce@^6.8`.
- [ ] **Step 2:** Sửa lỗi biên dịch do RxJS 7 (kiểu trả về của `toPromise()` thành `T | undefined`) và do `@ngx-translate/core` 17.
- [ ] **Step 3: Mốc smoke C.** Đi hết checklist. Đây là bản đầu tiên không còn ngcc và dùng RxJS 7, TinyMCE 6.

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
- [ ] **Step 7: Mốc smoke D.** Đi hết checklist trên `yarn start`. Chú ý mọi màn hình có ngày giờ (moment), biểu đồ, in ấn.
- [ ] **Step 8:** Commit: `build: switch to application builder`.

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
- [ ] **Step 5: Mốc smoke E.** Đi hết checklist lần cuối trên bản build `prod` được phục vụ như môi trường thật.
- [ ] **Step 6:** Ghi vào đầu file plan này một dòng trạng thái "Hoàn thành ngày ..." và cập nhật `README.md` với yêu cầu Node `>= 24.15`.
- [ ] **Step 7:** Commit: `chore: finalize angular 22 upgrade`.

## Quyết định cần người phụ trách xác nhận

Plan đã chọn sẵn phương án mặc định cho từng mục; chỉ cần báo lại nếu muốn khác.

| Mục | Mặc định trong plan | Phương án khác |
|---|---|---|
| ng-bootstrap | Gỡ, thay bằng Material và markup Bootstrap 4 (Task 6) | Giữ và nâng theo từng bản; kéo theo nâng theme lên Bootstrap 5 |
| Giao diện sau MDC | **Đã chốt 2026-11-14:** phải giống giao diện hiện tại và giao diện mẫu; kiểm bằng cổng giao diện, người phụ trách duyệt từng màn hình còn lệch | — |
| Karma và 6 file spec | Giữ nguyên, không dùng làm điều kiện nghiệm thu | Xoá hẳn ở Task 20, hoặc chuyển sang Vitest |
| TinyMCE | Dừng ở 6.x (giấy phép MIT) | Lên 8.x, chấp nhận GPL hoặc mua license |
