# Hướng dẫn chi tiết nâng cấp dự án từ Angular 8 lên Angular 9

Tài liệu này tổng hợp toàn bộ các bước thực tế đã thực hiện để nâng cấp dự án `VL_NCC_BE` từ Angular 8 lên Angular 9. Quá trình này bao gồm các bước chuẩn bị môi trường, cập nhật package, chạy script sửa code tự động (migration) và xử lý các lỗi phát sinh từ thư viện bên thứ 3.

---

## Bước 1: Chuẩn bị môi trường Node.js

Angular 9 yêu cầu Node.js phiên bản 10 hoặc 12. Nếu sử dụng Node.js quá mới (như bản 18 hoặc 24), quá trình biên dịch các thư viện cũ (như `node-sass`) sẽ bị lỗi.

**Lệnh thực hiện:**
```bash
nvm use 12.22.9
```
*(Chuyển sang môi trường Node.js 12 để đảm bảo tính tương thích khi cài đặt package).*

---

## Bước 2: Nâng cấp danh sách thư viện trong `package.json`

Sửa đổi các phiên bản thư viện cốt lõi trong file `package.json` lên phiên bản của Angular 9. (Bước này có thể làm bằng tay hoặc dùng tool).
- `@angular/core`: `~9.1.13`
- `@angular/cli`: `~9.1.15`
- `@angular/cdk`: `~9.2.4`
- `@angular/material`: `~9.2.4`
- `typescript`: `~3.8.3`

**Cài đặt các thư viện mới:**
```bash
yarn install --ignore-engines
```

> [!TIP]
> **Xử lý lỗi phát sinh ở Bước 2:**
> 1. **Lỗi `ESOCKETTIMEDOUT` (Rớt mạng giữa chừng):**
>    - Nguyên nhân: Mạng chập chờn khi tải file quá lớn.
>    - Khắc phục: Chạy lệnh `yarn install --network-timeout 1000000 --ignore-engines` để tăng thời gian chờ mạng.
> 2. **Lỗi `The engine "node" is incompatible ... node-releases@2.0.46 đòi Node 18`:**
>    - Nguyên nhân: Các thư viện con ẩn bên trong đòi Node mới nhất.
>    - Khắc phục: Luôn nhớ gắn cờ `--ignore-engines` vào cuối lệnh cài đặt để Yarn bỏ qua bước check version Node.

---

## Bước 3: Chạy kịch bản Migration (Sửa code tự động)

> [!WARNING]
> Tính năng `ng update` của Angular 9 có một lỗi thiết kế bảo thủ: Nó luôn cố gắng tải bản Angular CLI mới nhất (hiện tại là v18) về để chạy lệnh. Mà bản v18 lại bắt buộc phải chạy trên **Node 20 trở lên**. Do đó, chúng ta phải "mượn" Node 24 để chạy bước này.

**1. Chuyển sang Node 24:**
```bash
nvm use 24.14.0
```

**2. Đảm bảo môi trường Node 24 có đủ công cụ (Yarn & NPX):**
Do NVM cô lập môi trường hoàn toàn, bản Node 24 mới cài có thể chưa có sẵn `yarn`. Hơn nữa, chúng ta cần dùng lệnh `npx` (công cụ chạy package dùng 1 lần) để mượn tạm Angular CLI.
Nếu bạn gõ `npx` mà máy báo không nhận diện được lệnh, hãy đảm bảo cài đặt lại npm/npx bằng tay. 
Chạy 2 lệnh sau để cài đặt chắc chắn Yarn (và NPX nếu cần thiết) cho môi trường Node 24:
```bash
npm install -g npx
npm install -g yarn
```

**3. Chạy lệnh Migration cho Core (Sửa cú pháp @ViewChild, Injectable, v.v.):**
Sử dụng `npx` để ép hệ thống tải tạm thời Angular CLI phiên bản 9 (nếu gõ `ng update` chay, hệ thống sẽ dùng phiên bản CLI mặc định bị lỗi):
```bash
npx @angular/cli@9 update @angular/core@9 --migrate-only --from 8 --allow-dirty
```
> **Lỗi phát sinh:** `Error: The Angular Compiler requires TypeScript >=3.6.4... but 3.4.5 was found`
> **Khắc phục:** Ép cài đặt lại đúng Typescript 3.8.3 bằng lệnh: 
> `yarn add typescript@~3.8.3 --dev --ignore-engines`
> Sau đó chạy lại lệnh Migration ở trên.

**4. Chạy lệnh Migration cho cấu hình CLI (Sửa angular.json):**
```bash
npx @angular/cli@9 update @angular/cli@9 --migrate-only --from 8 --allow-dirty
```

**5. Chạy lệnh Migration cho Angular Material (Sửa hàng ngàn dòng import):**
```bash
npx @angular/cli@9 update @angular/material@9 --migrate-only --from 8 --allow-dirty
```
*(Kịch bản này sẽ tự động tách các import chung chung thành import chi tiết, ví dụ: `import { MatDialog } from '@angular/material/dialog'`)*

---

## Bước 4: Xử lý lỗi thư viện ngoài và Internal Lib

Sau khi Migration xong, ta quay về lại Node 12 để khởi động server:
```bash
nvm use 12.22.9
yarn start
```

Trong quá trình Compile, bạn sẽ gặp 2 lỗi nghiêm trọng sau:

### Lỗi 1: `ngx-print` bị Module parse failed
- **Nguyên nhân:** Lúc cài thư viện, lệnh `yarn install` vô tình bốc trúng phiên bản mới nhất của `ngx-print` (dùng JS đời mới ES2022) khiến Angular 9 không đọc được.
- **Khắc phục:** Ép cài lại phiên bản cũ tương thích với Angular 9.
  ```bash
  yarn add ngx-print@1.2.0-beta.4 --ignore-engines
  ```

### Lỗi 2: `TS1110: Type expected` trong `node_modules/@types/lodash/...`
- **Nguyên nhân:** Khi chạy `yarn install`, trình quản lý gói đã vô tình tải về bản `@types/lodash` mới nhất (dành cho Typescript 4.x). Tuy nhiên, bộ biên dịch của Angular 9 đang dùng Typescript 3.8.3, dẫn đến việc không hiểu được các cú pháp mới (như Template Literal Types) và văng ra hàng loạt lỗi `Type expected`.
- **Khắc phục:** Ép cài đặt lại bản `@types/lodash` cũ tương thích với Typescript 3.8.3.
  ```bash
  yarn add @types/lodash@4.14.165 --dev --ignore-engines
  ```

### Lỗi 3: `dps-lib` báo lỗi `Value at position ... in the NgModule.imports is not a reference: [object Object]`
- **Nguyên nhân:** Thư viện nội bộ `dps-lib` được build từ Angular 8. Khi Angular 9 dùng công cụ mới (Ivy Engine) để phân tích, Ivy phát hiện cú pháp không hợp lệ trong mảng `imports: [...]` của thư viện này nên từ chối biên dịch.
- **Khắc phục (Tạm thời):** Tắt Ivy Engine để dùng lại ViewEngine cũ của Angular 8. Mở file `tsconfig.json` và thêm cấu hình sau:
  ```json
  "angularCompilerOptions": {
      "enableIvy": false
  }
  ```
> [!IMPORTANT]
> **Giải pháp lâu dài cho dps-lib:**
> Việc tắt Ivy khiến dự án mất đi sức mạnh tối ưu về dung lượng và tốc độ của Angular 9. Team cần mở Source Code của `dps-lib` ra, nâng cấp nó lên Angular 9, build và publish bản mới. Sau đó, vào `tsconfig.json` xóa cờ `"enableIvy": false` đi để tận dụng 100% sức mạnh của Angular 9.

---

## Bước 5: Hoàn tất

Sau khi sửa xong các cấu hình trên, khởi động lại server:
```bash
yarn start
```
Nếu màn hình thông báo **`Compiled successfully`**, dự án đã chính thức nâng cấp thành công và có thể chạy bình thường trên trình duyệt!

---

## Bước 6: Khôi phục và chia sẻ Code cho Team (Tính ổn định)

Một ưu điểm lớn sau quá trình nâng cấp này là chúng ta **hoàn toàn không can thiệp thủ công vào bất kỳ file nào trong `node_modules`**. Tất cả các phiên bản bắt buộc (như `ngx-print`, `typescript`, `@types/lodash`) đều đã được chốt chặt (lock) trong `package.json` và `yarn.lock`.

Do đó, nếu bạn cần chuyển code cho thành viên khác trong team, hoặc chẳng may lỡ tay xóa mất thư mục `node_modules`, bạn chỉ cần chạy lại duy nhất một lệnh cài đặt:

```bash
yarn install --ignore-engines
```

Yarn sẽ tự động tải lại chính xác các phiên bản tương thích mà chúng ta đã cấu hình, đảm bảo môi trường mới sẽ chạy mượt mà 100% giống hệt như máy của bạn hiện tại mà không lặp lại bất kỳ lỗi nào.
