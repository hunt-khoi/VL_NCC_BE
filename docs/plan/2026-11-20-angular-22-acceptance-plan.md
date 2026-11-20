# Angular 22 — Kế hoạch nghiệm thu (việc còn lại)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nghiệm thu bản Angular 22 trên nhánh `upgrade-angular-22`: app chạy đúng với backend .NET 10, được người phụ trách kiểm tay, sẵn sàng deploy.

**Architecture:** Phần nâng cấp (Task 1–20b) đã xong, xem [`progress.md`](progress.md). Kế hoạch này chỉ còn kiểm tra và sửa lỗi lúc chạy. "Test" của mỗi task là bộ e2e Playwright (`tools/e2e/`) và checklist kiểm tay.

**Tech Stack:** Angular 22.3, Material/CDK 22.3, NgRx 22, RxJS 7.8, TypeScript 6.0, Playwright 1.63, yarn 1.22, Node 24.15.

**Spec:** Không có spec riêng. Trạng thái và lịch sử: [`progress.md`](progress.md). Lỗi API: [`api-errors.md`](api-errors.md). Checklist kiểm tay: [Phụ lục](#phụ-lục-checklist-kiểm-tay) cuối file này.

## Global Constraints

- **Chỉ sửa frontend.** Không sửa, không đề xuất sửa API (`D:\NCC_API`). Lỗi do API → thêm một dòng vào `api-errors.md` rồi làm tiếp.
- Frontend theo route của backend .NET 10 (`D:\NCC_API`, `https://localhost:7243`), không theo `VL_NCC_API` cũ.
- Không tự đặt thời gian chờ/ngưỡng mới cho bộ e2e khi chưa hỏi người phụ trách (hiện tại: thao tác 10 giây, test 30 giây, không retry).
- Kiểm tra build nhanh: `yarn verify:dev` (PASS = exit 0, không có dòng `Error:`). Chỉ build `prod` hoặc đủ 6 cấu hình khi người phụ trách đồng ý.
- Dùng `yarn` với `--ignore-engines`, không dùng `npm install`. Khi cài/build lâu, đặt `TEMP`/`TMP` sang ổ D:.
- Commit nhỏ, theo kiểu `fix: ...`, `e2e: ...`, `docs: ...`. Sau mỗi task, cập nhật `progress.md`.
- Mỗi lượt e2e chạy cho cả hai vai trò của `admin`: vai trò trong `.env` (Chuyên viên sở) và `E2E_VAITRO=Administrator`.
- **Không xoá file nào ngoài phạm vi task khi chưa hỏi.** Không bao giờ xoá `.claude/`: phiên cloud cần `skills/`, `settings.json`, `hooks/cloud-sync.sh`.

### Cổng test bắt buộc cho mọi thay đổi code

Chỉ commit khi qua đủ các bước, theo thứ tự:

1. **Test trước:** viết test tái hiện lỗi, xác nhận nó FAIL. Dùng e2e (`tools/e2e/`), hoặc test đơn vị khi Task 4 đã có Vitest. Lỗi chỉ kiểm được bằng tay thì ghi các bước kiểm vào commit message.
2. `yarn verify:dev`: PASS.
3. `yarn lint`: số lỗi không vượt mức hiện có (409).
4. Test ở bước 1: PASS.
5. `test:ro` cho **cả hai vai trò**: không có lỗi mới so với lượt trước. Mọi lỗi còn lại phải khớp một mục trong `api-errors.md` hoặc `tools/e2e/KNOWN_ISSUES.md`.
6. Khi đổi gói: `yarn audit --groups dependencies` không thêm lỗ hổng high/critical.

Nghiệm thu (Task 7) cần `test:ro` cả hai vai trò đạt bước 5 trong **3 lượt liên tiếp**.

## Review Focus

1. **Ô chọn phụ thuộc gửi tham số trống** (tỉnh/huyện/xã, chức vụ/chức danh): backend trả `400` (`api-errors.md` #5). Khi kiểm tay ở Task 3, mỗi form có ô chọn phụ thuộc phải mở được và lưu được, hoặc lỗi được ghi log.
2. **Ngày dạng chuỗi `dd/MM/yyyy`** ở màn chưa dùng `viDate`: pipe `date` sẽ đảo ngày/tháng khi ngày <= 12. Task 3 kiểm cột ngày ở các danh mục.
3. **Ô có mask `separator,3`** ở form trợ cấp (`ngx-mask` 22): giá trị lưu xuống phải là số. Task 3.
4. **Dropdown/tooltip `NgbLiteModule`** (mã ng-bootstrap chép, bỏ `ComponentFactoryResolver`): menu không hiện. Đã gặp ở nút Đăng xuất (Task 2).
5. **Màn chỉ có ở một vai trò**: test chạy bằng vai trò không đủ quyền sẽ bị bỏ qua. Phải đọc lý do bỏ qua của cả hai lượt.

---

### Task 1: Chạy lại `test:ro` vai trò Administrator

Lần chạy cuối là trước commit `e737599` (sửa cây `cdk-tree`, `user-manager`). Kết quả lúc đó: 48 qua / 24 bỏ qua / 8 lỗi.

**Files:**
- Modify: `docs/plan/progress.md` (bảng "Hiện trạng", dòng E2E)

- [ ] **Step 1:** Người phụ trách bật backend ở 7243 và `yarn start` ở cổng 3105.
- [ ] **Step 2:** `cd tools/e2e && E2E_VAITRO=Administrator PLAYWRIGHT_JSON_OUTPUT_NAME=report/admin.json yarn test:ro --reporter=line,json`. Expected: tối đa 3 lỗi frontend (Task 2), mọi lỗi còn lại khớp một mục trong `api-errors.md`.
- [ ] **Step 3:** Lỗi mới không khớp `api-errors.md`: lỗi do API thì ghi log; lỗi frontend thì thêm vào Task 2.
- [ ] **Step 4:** Ghi số qua/bỏ qua/lỗi vào `progress.md`, commit `docs: e2e administrator after cdk-tree fix`.

### Task 2: Sửa 3 lỗi frontend còn mở

Dùng superpowers:systematic-debugging cho từng lỗi. Danh sách lỗi cập nhật theo lượt e2e mới nhất trong `progress.md`.

| | Lỗi | Nơi gặp |
|---|---|---|
| a | Test "đăng nhập rồi đăng xuất": nút Đăng xuất trong dropdown topbar (`kt-user-profile`, `ngbDropdown`) không hiện trong 10 giây | `tools/e2e/tests/auth.spec.ts`, vai trò Administrator |
| b | `/vai-tro`: hết 30 giây trong `open()` khi chờ `user/PermissionUrl` | `tools/e2e/helpers.ts` |
| c | `/xuat-du-lieu`: như (b) | như trên |

**Cập nhật 2026-11-20:** (b), (c) không còn lỗi ở lượt mới nhất. Lỗi mới: `beforeEach` của `tools/e2e/tests/layout.spec.ts` hết 30 giây ở vai trò Chuyên viên sở, lúc có lúc không; dựng phiên `storageState` hết giờ khi dev server vừa build lại. Chi tiết trong `progress.md`.

**Files:**
- Test: `tools/e2e/tests/auth.spec.ts`, `tools/e2e/tests/routes.spec.ts`
- Modify: tuỳ nguyên nhân (topbar `kt-user-profile`, `src/app/views/partials/lib/ngb/dropdown/`, guard quyền, hoặc `tools/e2e/helpers.ts` nếu lỗi nằm ở test)

- [ ] **Step 1:** Chạy riêng test lỗi (`yarn test:ro -g "<tên test>"`), xác nhận lỗi tái hiện được.
- [ ] **Step 2:** Tìm nguyên nhân gốc. Nếu do API (ví dụ `PermissionUrl` không bao giờ được gọi hoặc trả lỗi), ghi `api-errors.md` và đánh dấu test bỏ qua kèm lý do trong `tools/e2e/KNOWN_ISSUES.md`, sau khi người phụ trách duyệt.
- [ ] **Step 3:** Sửa lỗi, rồi chạy lại test đó. Expected: PASS.
- [ ] **Step 4:** `yarn verify:dev` PASS. Commit mỗi lỗi một commit `fix: ...`.

### Task 3: Smoke test tay (người phụ trách làm)

**Files:**
- Modify: Phụ lục cuối file này (đánh dấu), `docs/plan/progress.md` (lỗi tìm được, ngày kiểm)

- [ ] **Step 1:** Đi hết checklist; mục không có `(e2e)` bắt buộc làm tay.
- [ ] **Step 2:** Kiểm kỹ các chỗ build không bắt được:
  - 33 quy tắc SCSS có comment `// MDC:` (bảng, form, dialog sau MDC)
  - Dialog chọn nhiều: `chon-nhieu-nhan-vien-list`, `chon-nhieu-bieu-mau-list`
  - Các nút In (đổi sang `this.in(...)`)
  - Tooltip/tab/dropdown của `NgbLiteModule`
  - Icon SVG (`ng-inline-svg-2` 20)
  - Template còn cú pháp cũ: `config-edit`, `comment`
  - Thư viện vừa nâng: 26 template có `mask=`, TinyMCE 6 (Căn cứ biểu mẫu → Biểu mẫu), upload `ng2-file-upload`, `ngx-mat-select-search`, kéo thả ở Sơ đồ tổ chức, ẩn/hiện theo quyền
  - Bảng gói và rủi ro từng gói: `git show 8f30f46:docs/plan/archive/2026-11-14-angular-22-implementation-plan.md` (mục "Thư viện bên thứ ba đã nâng")
- [ ] **Step 3:** Mỗi lỗi giao diện ghi một dòng vào `progress.md`, rồi sửa theo quy trình Task 2.
- [ ] **Step 4:** Commit `docs: smoke test results`.

### Task 4: Hai quyết định đang treo (người phụ trách chọn)

| Mục | Phương án | Việc phải làm sau khi chọn |
|---|---|---|
| TinyMCE `language: 'vi'` (lỗi có từ trước: không có `langs/vi.js`, trình duyệt báo `Unexpected token '<'`, editor hiện tiếng Anh) | (A) thêm gói ngôn ngữ (ví dụ `tinymce-i18n`) vào `assets`; (B) bỏ dòng `language` trong `CommonService.tinyConfig` | Sửa, `yarn verify:dev`, mở Biểu mẫu kiểm editor |
| Karma / `ng test` (không chạy với builder esbuild vì `src/test.ts` dùng `require.context`; có 6 file spec) | **(B) khuyến nghị:** `ng update @angular/cli --name migrate-karma-to-vitest`, vì Task 6 cần test đơn vị cho chỗ chống XSS. (A) xoá Karma, `src/test.ts`, 6 spec | Sửa, `yarn verify:dev`, `ng test` chạy được, commit |
| TinyMCE 6.8.6: 5 lỗ hổng XSS (high), bản vá chỉ có từ 7.9.3 | (A) lên 7.9.3+ hoặc 8.x với `license_key: 'gpl'` (giấy phép GPL); (B) giữ bản 6, tắt plugin `media`, lọc HTML đầu ra bằng DOMPurify | Theo Task 6 S4 |
| CKEditor 4.21.0 tải từ CDN: hết hỗ trợ, có lỗ hổng XSS (bản vá 4.24+ là bản thương mại), không có SRI. Chỉ dùng ở Biểu mẫu quà | (A) thay bằng TinyMCE đã có trong app; (B) giữ, chấp nhận rủi ro | Theo Task 6 S5 |

- [ ] **Step 1:** Hỏi người phụ trách, ghi quyết định vào `progress.md`.
- [ ] **Step 2:** Làm theo phương án đã chọn, commit riêng từng mục.

### Task 5: Nhóm e2e `@rw` (đang chặn)

Chặn bởi: cần database bản sao và lệnh khôi phục `E2E_RESTORE_CMD` (người phụ trách backend cung cấp). Test SignalR và ng-idle đang `test.fixme` (người phụ trách: "kệ nó test sau").

- [ ] **Step 1:** Khi có database bản sao: điền `E2E_RESTORE_CMD` vào `tools/e2e/.env`, rồi chạy `yarn test:rw` (luôn chạy một luồng).
- [ ] **Step 2:** Viết nốt các test sửa/xoá đang `test.fixme`, mỗi test chạy 3 lần liên tiếp đều PASS.

### Task 6: Bảo mật

Kiểm ngày 2026-11-20 bằng `yarn audit --groups dependencies` và đọc mã nguồn. Gói chạy trong app: 2 critical, 12 high, 18 moderate, 6 low. Tính cả công cụ build (854 gói): 4 critical, 79 high, 44 moderate, 16 low. Mỗi mục sửa theo "Cổng test bắt buộc", mỗi mục một commit.

| # | Mức | Vấn đề | Hướng sửa (chỉ frontend) | Test chứng minh |
|---|---|---|---|---|
| S1 | **Cao** | **Stored XSS ở bình luận.** `CommentComponent.parseHtml()` (`components/comment/comment.component.ts:440`) chèn nguyên văn chữ người dùng vào HTML rồi gọi `bypassSecurityTrustHtml`, render bằng `[innerHtml]` (html dòng 134, 249). Bình luận chứa `<img src=x onerror=...>` sẽ chạy JS trên máy mọi người xem, lấy được token trong `localStorage`. Xác nhận bằng đọc code, chưa thử bằng cách đăng bình luận thật | Escape `& < > " '` của chuỗi đầu vào **trước** khi chèn thẻ `@nhắc tên` và emoji | Vitest: `parseHtml('<img src=x onerror=alert(1)>')` không chứa `<img src=x`; `parseHtml('@admin :smile:')` vẫn sinh `span.inline-tag` và `img` emoji |
| S2 | Cao | Các chỗ `bypassSecurityTrustHtml` khác: `display-html-content.component.ts`, `tinh-hinh-mua-bao-hiem.component.ts`, pipe `safe` (`core/_base/layout/pipes/safe.pipe.ts`) | Xác định nguồn HTML của từng chỗ. Nội dung người dùng nhập thì lọc bằng DOMPurify trước khi bypass | Vitest cho từng chỗ có lọc |
| S3 | Critical | `jspdf` 2.5.2 (13 lỗ hổng: path traversal, PDF/HTML injection) kéo theo `dompurify` 2.5.9 (17 lỗ hổng XSS) | Nâng `jspdf` lên `^4.2.1`. Dùng ở 2 chỗ: `draw-chart-list.component.ts`, `nguoi-dung-dps-list.component.ts` | Xuất PDF ở 2 màn đó đúng nội dung (kiểm tay, ghi vào `progress.md`); `yarn audit` hết mục `jspdf`/`dompurify` |
| S4 | Cao | `tinymce` 6.8.6: 5 lỗ hổng XSS | Theo quyết định ở Task 4 | Biểu mẫu mở, sửa, lưu được; `yarn audit` |
| S5 | Cao | CKEditor 4.21.0 từ CDN (xem Task 4). Thư mục `src/assets/plugins/ckeditor` (bản 4.13.1, không được tải) đã xoá ngày 2026-11-20 | Theo quyết định ở Task 4 | Biểu mẫu quà mở và lưu được |
| S6 | Trung bình | `moment` 2.30.1: path traversal qua tên locale | Nâng lên `^2.31.0` | `yarn verify:dev`; e2e `test:ro` |
| S7 | Trung bình | `src/.htaccess` không có Content-Security-Policy hay header bảo mật | Thêm `X-Content-Type-Options`, `frame-ancestors`, `Referrer-Policy`; CSP chạy `Report-Only` trước (app dùng script inline và CDN). **Hỏi người phụ trách trước**, vì đây là cấu hình server | `curl -I` trên bản build có đủ header; e2e không có lỗi CSP mới trong console |
| S8 | Trung bình | Token JWT lưu trong `localStorage` (`token-storage.service.ts:77`) | Chuyển sang cookie `HttpOnly` cần đổi backend, nên **ngoài phạm vi**. Giảm rủi ro bằng S1, S2, S7 | — |
| S9 | Trung bình | `environment-test.prod.ts`, `environment-sotbvl.prod.ts` gọi API qua `http://`, token đi không mã hoá | Báo người phụ trách: cần server hỗ trợ HTTPS | — |
| S10 | Thấp | `certificates/localhost.key` (private key) đang commit trong repo | Người phụ trách quyết. Có thể đang dùng ngoài repo nên **không tự xoá** | — |
| S11 | Thấp | Chart.js 2.9.4 không còn bản vá | Giữ có chủ đích, ghi nhận rủi ro | — |

Đã đạt: `sourceMap: false` ở mọi cấu hình build; không có `eval`/`new Function`; không có secret trong file đã commit; `tools/e2e/.env` nằm trong `.gitignore`.

- [ ] **Step 1:** S1 (cần Vitest từ Task 4).
- [ ] **Step 2:** S3, S6 (nâng gói); chạy lại `yarn audit --groups dependencies`, ghi số mới vào `progress.md`.
- [ ] **Step 3:** S2, rồi S4/S5 theo quyết định ở Task 4.
- [ ] **Step 4:** S7, sau khi người phụ trách đồng ý.

### Task 7: Đóng gói phát hành

- [ ] **Step 1:** Người phụ trách đồng ý build đủ 6 cấu hình: `dev`, `production`, `test`, `prod`, `prod_SOTBVL`, `prod_KG`. Expected: 0 lỗi; cảnh báo chỉ gồm các loại đã biết (Sass `@import`, 5 thư viện CommonJS, 3 dòng `Unable to locate stylesheet`).
- [ ] **Step 2:** Sửa dòng "Chưa nghiệm thu" trong phần "Lịch sử nâng cấp" của `README.md` gốc thành "Đã nghiệm thu ngày ...".
- [ ] **Step 3:** Tag nghiệm thu `upgrade/ng22-accepted` (tag `upgrade/ng22` đang trỏ `35b31b3`, trước các bản sửa lúc chạy). Người phụ trách tự push.

### Ngoài phạm vi (tuỳ chọn, không chặn phát hành)

409 lỗi lint có từ trước (361 là `template/eqeqeq`); chuyển 2 template `config-edit`, `comment` sang control flow; Sass `@import` → `@use` cho theme Metronic; bỏ `baseUrl` (TypeScript 7 không hỗ trợ).

## Phụ lục: Checklist kiểm tay

Chạy `yarn start` (cổng 3105), đăng nhập, rồi đi hết các mục. Mục có `(e2e)` đã có test tự động trong `tools/e2e/` (xem `tools/e2e/README.md`); vẫn kiểm tay cho tới khi bộ e2e chạy ổn định với backend (`tools/e2e/KNOWN_ISSUES.md`). Mục không đánh dấu luôn phải kiểm tay.

### Đăng nhập và phiên

- [ ] Đăng nhập thành công (e2e)
- [ ] Đăng nhập sai nhiều lần thì hiện reCAPTCHA, tích xong đăng nhập được
- [ ] Đăng xuất (e2e)
- [ ] Hết phiên do không thao tác (ng-idle) thì bị đưa về màn đăng nhập (e2e)

### Khung giao diện

- [ ] Menu bên trái mở, thu gọn, chuyển trang (e2e)
- [ ] Menu dropdown trên topbar (người dùng, thao tác nhanh) (e2e: dropdown người dùng)
- [ ] Bảng thông báo trên topbar, các tab bên trong (e2e)
- [ ] Đổi ngôn ngữ (e2e: chỉ kiểm không còn khoá dịch; giao diện không có bộ chọn ngôn ngữ)

### Danh sách và dialog

- [ ] Một danh sách: phân trang, sắp xếp cột, lọc (e2e: phân trang, sắp xếp; lọc kiểm tay)
- [ ] Mở và đóng dialog thêm mới (e2e)
- [ ] Mở dialog sửa, lưu, danh sách cập nhật
- [ ] Xoá có hộp xác nhận
- [ ] Snackbar thông báo sau khi lưu (e2e, nhóm @rw)

### Form

- [ ] Thêm và sửa hồ sơ NCC, thông báo lỗi validate hiện đúng chỗ (e2e: chỉ validate ở dialog Loại giấy tờ; hồ sơ NCC kiểm tay)
- [ ] Ô chọn có tìm kiếm (ngx-mat-select-search)
- [ ] Chip: thêm, xoá
- [ ] Datepicker và datetime-picker (chọn giờ) (e2e: datepicker; datetime-picker kiểm tay)
- [ ] Ô nhập có mask (số, ngày)
- [ ] Checkbox, radio, tab trong form

### Tệp và in ấn

- [ ] Upload file
- [ ] Xem file (file viewer)
- [ ] In (ngx-print) ở Bảo hiểm y tế → Thống kê theo đối tượng
- [ ] Xuất PDF

### Thành phần đặc biệt

- [ ] Biểu đồ trên dashboard (e2e)
- [ ] Biểu đồ ở Quỹ đền ơn đáp nghĩa → Quản lý quỹ
- [ ] Carousel thống kê trên dashboard (e2e)
- [ ] TinyMCE
- [ ] angular-editor
- [ ] CKEditor ở Danh mục → Căn cứ biểu mẫu → Biểu mẫu quà
- [ ] Bình luận: popover, avatar, reaction
- [ ] Thanh tiến độ ở Mẫu số liệu → Giao và ở Kế hoạch vận động
- [ ] Thông báo thời gian thực (SignalR) (e2e: kết nối; thông báo giữa hai người dùng kiểm tay)
