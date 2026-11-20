# Test e2e (Playwright)

Bộ test tự động cho các mục trong checklist kiểm tay ở cuối `docs/plan/2026-11-20-angular-22-acceptance-plan.md` (mục có ghi `(e2e)`). Có `package.json` riêng để `ng update` không đụng tới.

## Cài đặt (một lần)

```bash
cd tools/e2e
yarn install
npx playwright install chromium
cp .env.example .env   # rồi điền E2E_USER, E2E_PASS
```

Dùng tài khoản test có quyền xem đủ menu (danh sách màn hình ở `tools/e2e/screens.json`, lấy từ menu của tài khoản test; sửa tay khi menu đổi). Mỗi lượt chạy chỉ đăng nhập **một lần**; đăng nhập sai nhiều lần sẽ bật reCAPTCHA hoặc khoá tài khoản.

## Chạy

Mở app trước (`yarn start` ở thư mục gốc, cổng 3105), hoặc phục vụ một bản build: `node tools/e2e/serve.mjs build/<thư mục>/ 3106` và đặt `E2E_BASE_URL=http://localhost:3106`.

| Lệnh | Nội dung |
|---|---|
| `yarn test:ro` | Mọi test chỉ đọc (`@ro`): an toàn trên mọi database |
| `yarn test:routes` | Chỉ mở lần lượt mọi màn hình (nhanh nhất, dùng khi sửa lỗi build) |
| `yarn test:rw` | Test có ghi dữ liệu (`@rw`). Chỉ chạy khi `E2E_ALLOW_WRITE=1` và backend trỏ vào database bản sao; trước lượt chạy sẽ gọi `E2E_RESTORE_CMD` |
| `yarn test:nologin` | Chỉ các test không cần đăng nhập |
| `yarn report` | Mở báo cáo HTML của lượt chạy gần nhất |

Mỗi test tự fail khi trong lúc chạy có: lỗi JS chưa bắt, `console.error` không nằm trong `known-console-errors.json`, API trả `>= 500`, hoặc file JS/CSS của app tải hỏng.

Test lỗi: chạy lại riêng test đó kèm trace, ví dụ `npx playwright test tests/layout.spec.ts --trace on`.

**Dữ liệu cá nhân:** `report/`, `test-results/` và `.auth/` chứa ảnh chụp, dữ liệu người có công và phiên đăng nhập. Đã có trong `.gitignore`; không commit, không gửi lên dịch vụ bên ngoài.

## Biến môi trường (`.env`)

| Biến | Ý nghĩa |
|---|---|
| `E2E_BASE_URL` | Địa chỉ app, mặc định `http://localhost:3105` |
| `E2E_USER`, `E2E_PASS` | Tài khoản test |
| `E2E_VAITRO` | Tên vai trò (cột "Vai trò" trong hộp thoại Đổi vai trò, ví dụ `Chuyên viên sở`) sẽ đổi sang sau khi đăng nhập. Màn nào vai trò này không có quyền (trang 403) thì test bị **bỏ qua** kèm lý do; chạy thêm một lượt với vai trò khác để phủ các màn đó |
| `E2E_ALLOW_WRITE` | `1` mới cho chạy nhóm `@rw` |
| `E2E_RESTORE_CMD` | Lệnh khôi phục database bản sao, chạy trước mỗi lượt `@rw` |
| `E2E_API_FROM`, `E2E_API_TO` | Chuyển hướng API khi bản build gọi địa chỉ khác backend đang chạy |
| `E2E_OFFLINE` | `1` khi không có backend: bỏ qua lỗi do không gọi được API (chỉ dùng với `test:nologin`) |
