# Kế hoạch nâng cấp Angular 10

Dự án hiện tại đang chạy ổn định ở Angular 9. Mục tiêu tiếp theo là nâng cấp lên Angular 10.
Vì Angular 10 vẫn hỗ trợ cờ `"enableIvy": false`, chúng ta vẫn có thể an toàn nâng cấp mà không sợ làm "vỡ" thư viện `dps-lib`.

> [!WARNING]
> **Yêu cầu sự đồng ý (User Review Required):**
> Kế hoạch này sẽ thay đổi hàng loạt cấu hình trong `package.json` và chạy script tự động sửa đổi mã nguồn. Vui lòng đọc kỹ các bước dưới đây và **chấp thuận (approve)** để mình bắt đầu tiến hành.

## Các thư viện dự kiến nâng cấp (Cập nhật trong package.json)

Để lên Angular 10, chúng ta sẽ cần cập nhật đồng bộ các thư viện sau:
- **Core Angular (`@angular/core`, `cli`, `common`, `router`...):** Cập nhật lên bản `~10.2.5`
- **Angular Material & CDK:** Cập nhật lên bản `~10.2.7`
- **NGRX (`@ngrx/store`, `effects`...):** Cập nhật lên bản `~10.1.2` (Bản dành cho Angular 10)
- **Typescript:** Cập nhật lên bản `~3.9.5` (Angular 10 bắt buộc phải dùng Typescript 3.9)
- **tslib:** Cập nhật lên bản `^2.0.0`

## Quy trình thực thi (Giống với quy trình nâng cấp Angular 9)

### 1. Chuẩn bị môi trường & Cập nhật package
- Dùng `Node.js 12.22.9` (Đã có sẵn và tương thích tốt với Angular 10).
- Cập nhật phiên bản các thư viện kể trên vào file `package.json`.
- Chạy lệnh `yarn install --ignore-engines` để tải và khóa các phiên bản mới.

### 2. Chạy Migration tự động (Chuyển sang Node 24 tạm thời)
Vì lỗi tương tự như lúc nãy (Angular CLI tự bắt ép tải bản v18), chúng ta sẽ áp dụng lại chiến thuật "mượn" Node 24 để chạy kịch bản Migration.
- `nvm use 24.14.0`
- Chạy Migration cho Core: `npx @angular/cli@10 update @angular/core@10 --migrate-only --from 9 --allow-dirty`
- Chạy Migration cho CLI: `npx @angular/cli@10 update @angular/cli@10 --migrate-only --from 9 --allow-dirty`
- Chạy Migration cho Material: `npx @angular/cli@10 update @angular/material@10 --migrate-only --from 9 --allow-dirty`

### 3. Đảm bảo cấu hình tương thích
- Giữ nguyên cờ `"enableIvy": false` trong `tsconfig.json` để bảo vệ `dps-lib`.
- Giữ nguyên phiên bản của `ngx-print` là `1.2.0-beta.4`.

### 4. Build & Verify (Khởi động Server)
- Quay lại Node 12: `nvm use 12.22.9`
- Khởi động app: `yarn start`
- Nếu app báo `Compiled successfully` là thành công.

## Open Questions (Câu hỏi cho bạn)
- Bạn có muốn mình tiến hành luôn quá trình này không? Nếu có, hãy trả lời **"Đồng ý"** để mình bắt đầu!
