import { BaseModel } from './../../../../../../core/_base/crud/models/_base.model';

export class ThanNhanModel extends BaseModel {
	Id: number = 0;
	Id_NCC: number = 0;
	HoTen: string = "";
	Id_QHGiaDinh: number | null = null;
	NgaySinh: string = "";
	GioiTinh: number | null = null;
	IsChet: boolean = false;
	NgayChet: string | null = null;
	SoKhaiTu: string = "";
	DiaChi: string = "";
	NguyenQuan: string = "";
	SDT: string = "";
	Email: string = "";

	clear() {
		this.Id = 0;
		this.Id_NCC = 0;
		this.HoTen = '';
		this.Id_QHGiaDinh = null;
		this.NgaySinh = '';
		this.GioiTinh = null;
		this.IsChet = false;
		this.NgayChet = null;
		this.SoKhaiTu = '';
		this.DiaChi = '';
		this.NguyenQuan = '';
		this.SDT = '';
		this.Email = '';
	}
}