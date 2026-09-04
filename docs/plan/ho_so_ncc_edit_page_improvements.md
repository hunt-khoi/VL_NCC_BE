# Kế hoạch Cải tiến Component HoSoNCCEditPage

Dựa trên việc phân tích thư mục `ho-so-nguoi-co-cong\ho-so-ncc\ho-so-ncc-edit-page`, dưới đây là danh sách các vấn đề hiện tại và kế hoạch cải tiến cấu trúc cũng như chất lượng mã nguồn:

## 1. Khắc phục Bug trong luồng tải/reload danh sách loại hồ sơ
**Vấn đề:**
Trong `ho-so-ncc-edit-page.component.ts`, mảng `lstLoaiTemp` được khởi tạo bằng `[]` nhưng chưa bao giờ được gán dữ liệu trả về từ API. Khi hàm `reloadListLoai()` được gọi (để khôi phục lại danh sách các Expansion Panel), nó sử dụng `this.lstLoaiTemp.forEach(y => this.lstLoai.push(y));`. Vì `lstLoaiTemp` trống, danh sách `lstLoai` trên UI sẽ bị mất hoàn toàn.
**Giải pháp:**
- Cập nhật hàm `loadListLoaiHS_Dt()` để gán dữ liệu cho biến backup:
  `this.lstLoaiTemp = [...res.data];`

## 2. Loại bỏ khối Switch-Case khổng lồ (Open/Closed Principle)
**Vấn đề:**
Hàm `changeTab()` đang sử dụng một khối lệnh `switch/case` dài khoảng 200 dòng chỉ để trả về một Component tương ứng với `Id_LoaiHoSo` và `Id_DoiTuongNCC`. Việc này khiến Component cha bị phình to, import quá nhiều Component con, và mỗi lần thêm loại form mới đều phải sửa file này.
**Giải pháp:**
- Áp dụng Map/Dictionary Pattern. Tạo một `COMPONENT_MAPPING` tĩnh trong file cấu hình hoặc ở ngoài class Component.
- Khóa (Key) của Map có thể là chuỗi kết hợp của `[Id_LoaiHoSo]_[Id_DoiTuongNCC]` (VD: `'1_1'` cho Cắt trợ cấp - Bà mẹ VNAH).
- Hàm `changeTab()` chỉ việc lookup Component từ Map:
  `this.childComponentType = COMPONENT_MAPPING[key] || COMPONENT_MAPPING[fallbackKey];`

## 3. Tách biệt hoàn toàn HTML và CSS
**Vấn đề:**
File template `ho-so-ncc-edit-page.component.html` đang chứa một thẻ `<style>` nội tuyến ở dòng trên cùng dài hơn 130 dòng. Việc nhúng CSS trong HTML đi ngược lại các nguyên tắc phân tách code của Angular, làm file trở nên rất dài, khó đọc và không tận dụng được SCSS.
**Giải pháp:**
- Chuyển toàn bộ đoạn code trong thẻ `<style>` của HTML sang file `ho-so-ncc-edit-page.component.scss`.

## 4. Bổ sung Type Checking (Hạn chế sử dụng `any`)
**Vấn đề:**
Cả `ho-so-ncc-edit-page` và `form-base` đều sử dụng kiểu `any` quá nhiều (VD: `lstLoai: any[]`, `ChildComponentInstance: any`, biến tạm,...). Kiểu `any` làm mất khả năng tự động check lỗi (type-checking) lúc biên dịch của TypeScript.
**Giải pháp:**
- Định nghĩa các interface `ILoaiHoSo`, `IDoiTuongNCC`.
- Tạo một interface quy định các phương thức chung cho child components (vd: `IChildFormNCC { onSubmit(): HoSoNCCModel; ngOnInit(): void; }`).
- Áp dụng các interface này để định kiểu cho các biến thay thế cho `any`.

## 5. Tối ưu hóa Change Detection
**Vấn đề:**
Mặc dù component được config với `ChangeDetectionStrategy.OnPush` rất chuẩn để tối ưu hiệu năng, nhưng logic code hiện tại lại thường xuyên gọi thủ công `this.changeDetectorRefs.detectChanges()` ở khắp nơi (trong các hàm load, reload, drop...).
**Giải pháp:**
- Cấu trúc lại theo hướng Reactive Programming (sử dụng `Observable` và Async Pipe `| async` trong HTML template) cho các luồng dữ liệu như `lstLoai$`. Angular sẽ tự động xử lý change detection một cách an toàn và gọn gàng hơn.

## 6. Refactor `form-base.component.ts`
**Vấn đề:**
Hàm `prepareCustomer()` trong `form-base` dài tới gần 150 dòng, chứa vô số các lệnh đọc `.value` và các nhánh logic `if/else` lồng nhau. Một "God function" như thế rất khó bảo trì và dễ sinh lỗi.
**Giải pháp:**
- Chia nhỏ hàm `prepareCustomer()` thành nhiều helper methods nhỏ hơn theo từng khu vực dữ liệu (ví dụ: `buildThongTinCoBan()`, `buildThongTinThanNhan()`, `buildThongTinGiayTo()`).

## 7. Rà soát và Tối ưu hóa 26 Child Components (form-*)
**Vấn đề:**
Sau khi rà soát hàng loạt các component con (như `form-tang-moi`, `form-dinh-chinh`,...), phát hiện tình trạng lặp code (Code Duplication) cực kỳ nghiêm trọng. Các hàm tiện ích như `changeNS`, `changeDC`, `fillNguyenTruQuan` bị copy-paste vào 26 file. Tương tự, hàm `createForm()` khởi tạo 50 trường giống hệt nhau cũng lặp lại 26 lần. Ngoài ra còn lạm dụng kiểu `any` và các lệnh ép render `detectChanges()` rác.
**Giải pháp:**
- **Kế thừa triệt để (DRY):** Đưa toàn bộ các hàm tiện ích (`changeNS`, `changeDC`, `onAlertClose`...) và hàm khởi tạo form (`buildBaseForm`) vào class cha `FormBaseComponent`.
- Xóa bỏ hàng nghìn dòng code lặp lại ở 26 file con. 
- Loại bỏ `any` và `detectChanges()` thừa thãi bằng Script Regex.

---
**Tổng kết:**
Việc thực thi kế hoạch refactor này sẽ giúp `HoSoNCCEditPageComponent` và toàn bộ các component con giảm thiểu tối đa kích thước, loại bỏ tình trạng code rác, tăng tính mở rộng khi có yêu cầu thêm mới hồ sơ và bảo vệ source code khỏi các lỗi logic/runtime ngoài ý muốn.

---
## 🎯 TIẾN ĐỘ THỰC HIỆN (Trạng thái)
- [x] **Mục 1:** Khắc phục Bug trong luồng tải/reload (Đã xử lý backup `lstLoaiTemp`).
- [x] **Mục 2:** Loại bỏ khối Switch-Case khổng lồ (Đã tách Config ra file `ho-so-ncc.mapping.ts`).
- [x] **Mục 3:** Tách biệt hoàn toàn HTML và CSS (Đã dọn dẹp inline `<style>` sang file `.scss`).
- [ ] **Mục 4:** Bổ sung Type Checking (Hạn chế sử dụng `any` - *Đang chờ xử lý*).
- [x] **Mục 5:** Tối ưu hóa Change Detection (Đã áp dụng `BehaviorSubject` & `async` pipe).
- [x] **Mục 6:** Refactor `form-base.component.ts` (Đã bóc tách `prepareCustomer` thành các helper methods).
- [x] **Mục 7:** Rà soát và Tối ưu hóa 26 Child Components. Cụ thể đã hoàn thiện:
  - Loại bỏ triệt để 100% các hàm lặp lại (`changeTinh`, `loadLoaiTC`, `loadListThanNhan`...) ở các component cá biệt.
  - Xóa bỏ biến hardcode `_NAME` và **9 biến trạng thái trùng lặp** (như `disabledBtn`, `viewLoading`, `item`, `data`...) khỏi 26 file con, tập trung khai báo tại `FormBaseComponent`.
  - Tối ưu hóa thành công hàng ngàn dòng code thừa. Các component con hiện tại đã được tinh gọn và đảm bảo cấu trúc kế thừa chuẩn xác.

---

## 8. Đề xuất Tối ưu hóa Giai đoạn 2

Dù cấu trúc Kế thừa (OOP) hiện tại đã đạt độ tối ưu rất cao, nhưng nếu muốn nâng cấp hiệu năng và giảm dung lượng file hơn nữa, chúng ta có thể cân nhắc 3 hướng sau:

1. **"Chẻ nhỏ" HTML bằng Shared Presentational Components:**
   - **Vấn đề:** 26 file `.html` của 26 form con đang nặng từ 15KB đến 35KB mỗi file, chứa đầy các cụm giao diện giống hệt nhau (Thông tin cơ bản, Địa chỉ...).
   - **Giải pháp:** Tách các khối giao diện lặp lại này thành các Component UI dùng chung (Dumb Components) như `<kt-thong-tin-co-ban-form>`.
   - **Hiệu quả:** Xóa sổ hàng nghìn dòng HTML, thu gọn kích thước file `.html` xuống còn vài dòng, giúp việc chỉnh sửa giao diện đồng bộ trở nên dễ dàng hơn bao giờ hết.

2. **Caching cho các API Danh mục với RxJS `shareReplay`:**
   - **Vấn đề:** Mỗi lần chuyển form là một lần gọi lại các API danh mục (Tỉnh, Dân tộc, Tôn giáo...).
   - **Giải pháp:** Dùng `shareReplay(1)` hoặc Service Caching ở Backend Service để lưu đệm dữ liệu API vào RAM.
   - **Hiệu quả:** Giảm thiểu số lượng HTTP Request trùng lặp, tăng tốc độ render UI lên mức tối đa.

3. **Tách nhỏ FormBuilder (`FormGroup`) khổng lồ:**
   - **Vấn đề:** Hàm `buildBaseForm()` khởi tạo tới gần 50 trường (controls) và ép cả 26 form con phải gánh dù nhiều trường không được sử dụng.
   - **Giải pháp:** Lớp cha chỉ tạo các trường cốt lõi. Form con nào cần thêm phần nào (Địa chỉ, Giấy tờ...) mới gọi hàm `addControl()` để đính kèm.
   - **Hiệu quả:** Giảm tải bộ nhớ RAM, tối ưu hóa quá trình validation của Angular.
