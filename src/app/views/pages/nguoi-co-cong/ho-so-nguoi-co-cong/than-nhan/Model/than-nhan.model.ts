import { BaseModel } from './../../../../../../core/_base/crud/models/_base.model';

export class ThanNhanModel extends BaseModel {
	Id: number;
	Id_NCC: number;
	HoTen: string;
	Id_QHGiaDinh: number;
	NgaySinh: string;
	GioiTinh: number;
	IsChet: boolean;
	NgayChet: string;
	SoKhaiTu: string;
	DiaChi: string;
	NguyenQuan: string;
	SDT: string;
	Email: string;

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
