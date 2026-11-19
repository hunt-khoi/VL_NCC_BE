# ng-bootstrap 5.3.1 (bản chép)

Mã trong thư mục này chép nguyên từ ng-bootstrap 5.3.1 (giấy phép MIT, xem `LICENSE`).

Lý do: từ bản 12, ng-bootstrap bỏ `ngb-tabset`, đổi tooltip và progressbar sang markup Bootstrap 5,
trong khi theme Metronic của dự án dùng CSS Bootstrap 4. Giữ bản 5.3.1 thì HTML sinh ra không đổi,
giao diện giữ nguyên qua các lần nâng Angular.

Chỉ gồm các thành phần dự án đang dùng: dropdown, tooltip, progressbar, tabset, carousel, timepicker.
Import qua `ngb-lite.module.ts`. Không sửa logic trong các file chép; nếu phải sửa để tương thích
Angular mới, ghi chú ngay tại chỗ sửa.
