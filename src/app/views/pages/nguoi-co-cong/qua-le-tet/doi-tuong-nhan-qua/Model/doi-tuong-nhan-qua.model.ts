import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class DoiTuongNhanQuaModel extends BaseModel {
	Id: number = 0;
	SoHoSo: string = "";
	Id_DoiTuongNCC: number | null = null;
	HoTen: string = "";
	NgaySinh: string = "";
	GioiTinh: number | null = null;
	NamSinh: number | null = null;
	Id_Xa: number | null = null;
	Id_KhomAp: number | null = null;
	DiaChi: string = "";
	NguoiThoCungLietSy: string = "";
	QuanHeVoiLietSy: number | null = null;
	ProvinceID: number | null = null;

	isError: boolean = false;
	IsForce: boolean = false;

	clear() {
		this.Id = 0;
		this.SoHoSo = '';
		this.Id_DoiTuongNCC = null;
		this.NamSinh = null;
		this.Id_Xa = null;
		this.Id_KhomAp = null;
		this.NguoiThoCungLietSy = '';
		this.QuanHeVoiLietSy = null;
		this.HoTen = '';
		this.NgaySinh = '';
		this.GioiTinh = null;
		this.DiaChi = '';
		this.ProvinceID = null;
		this.isError = false;
		this.IsForce = false;
	}
}