import { BaseModel } from '../../../../../core/_base/crud';

export class ChonNhieuNhanVienListModel extends BaseModel {
	ID_NV: number = 0;
	HoTen: string = "";
	TenDonVi: string = "";
	TenPhongBan: string = "";
	TenChucDanh: string = "";
	NgaySinh: Date = new Date();
	Phai: string = "";
	MaNv: string = "";
	Structure: string = "";
	TenChucVu: string = "";
	Email: string = "";
}