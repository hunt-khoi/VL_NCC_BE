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

Dùng superpowers:systematic-debugging cho từng lỗi. File chẩn đoán `tools/e2e/tests/zz-diag.spec.ts` (chưa commit) đang dò lỗi (a). Xoá file đó khi xong.

| | Lỗi | Nơi gặp |
|---|---|---|
| a | Test "đăng nhập rồi đăng xuất": nút Đăng xuất trong dropdown topbar (`kt-user-profile`, `ngbDropdown`) không hiện trong 10 giây | `tools/e2e/tests/auth.spec.ts`, vai trò Administrator |
| b | `/vai-tro`: hết 30 giây trong `open()` khi chờ `user/PermissionUrl` | `tools/e2e/helpers.ts` |
| c | `/xuat-du-lieu`: như (b) | như trên |

**Files:**
- Test: `tools/e2e/tests/auth.spec.ts`, `tools/e2e/tests/routes.spec.ts`
- Modify: tuỳ nguyên nhân (topbar `kt-user-profile`, `src/app/views/partials/lib/ngb/dropdown/`, guard quyền, hoặc `tools/e2e/helpers.ts` nếu lỗi nằm ở test)

- [ ] **Step 1:** Chạy riêng test lỗi (`yarn test:ro -g "<tên test>"`), xác nhận lỗi tái hiện được.
- [ ] **Step 2:** Tìm nguyên nhân gốc. Nếu do API (ví dụ `PermissionUrl` không bao giờ được gọi hoặc trả lỗi), ghi `api-errors.md` và đánh dấu test bỏ qua kèm lý do trong `tools/e2e/KNOWN_ISSUES.md`, sau khi người phụ trách duyệt.
- [ ] **Step 3:** Sửa lỗi, rồi chạy lại test đó. Expected: PASS.
- [ ] **Step 4:** `yarn verify:dev` PASS. Commit mỗi lỗi một commit `fix: ...`.

### Task 3: Smoke test tay (người phụ trách làm)

**Files:**
- Create: `docs/plan/smoke-results-<YYYY-MM-DD>.md` (chép Phụ lục cuối file này, đánh dấu, ghi chú lỗi)

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
- [ ] **Step 3:** Mỗi lỗi giao diện ghi một dòng vào file kết quả, rồi sửa theo quy trình Task 2.
- [ ] **Step 4:** Commit `docs: smoke test results`.

### Task 4: Hai quyết định đang treo (người phụ trách chọn)

| Mục | Phương án | Việc phải làm sau khi chọn |
|---|---|---|
| TinyMCE `language: 'vi'` (lỗi có từ trước: không có `langs/vi.js`, trình duyệt báo `Unexpected token '<'`, editor hiện tiếng Anh) | (A) thêm gói ngôn ngữ (ví dụ `tinymce-i18n`) vào `assets`; (B) bỏ dòng `language` trong `CommonService.tinyConfig` | Sửa, `yarn verify:dev`, mở Biểu mẫu kiểm editor |
| Karma / `ng test` (không chạy với builder esbuild vì `src/test.ts` dùng `require.context`; có 6 file spec) | (A) xoá Karma, `src/test.ts`, 6 spec; (B) `ng update @angular/cli --name migrate-karma-to-vitest` | Sửa, `yarn verify:dev`, commit |

- [ ] **Step 1:** Hỏi người phụ trách, ghi quyết định vào `progress.md`.
- [ ] **Step 2:** Làm theo phương án đã chọn, commit riêng từng mục.

### Task 5: Nhóm e2e `@rw` (đang chặn)

Chặn bởi: cần database bản sao và lệnh khôi phục `E2E_RESTORE_CMD` (người phụ trách backend cung cấp). Test SignalR và ng-idle đang `test.fixme` (người phụ trách: "kệ nó test sau").

- [ ] **Step 1:** Khi có database bản sao: điền `E2E_RESTORE_CMD` vào `tools/e2e/.env`, rồi chạy `yarn test:rw` (luôn chạy một luồng).
- [ ] **Step 2:** Viết nốt các test sửa/xoá đang `test.fixme`, mỗi test chạy 3 lần liên tiếp đều PASS.

### Task 6: Đóng gói phát hành

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
