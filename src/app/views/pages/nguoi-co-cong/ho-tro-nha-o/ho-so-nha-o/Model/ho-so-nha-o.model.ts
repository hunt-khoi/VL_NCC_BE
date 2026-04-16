import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class HoSoNhaOModel extends BaseModel {
	Id: number;
	SoHoSo: string;
	HoTen: string;
	NgaySinh: string;
	NamSinh: number;
	GioiTinh: number;
	Id_Xa: number;
	Id_KhomAp: number;
	DiaChi: string;
	Id_HinhThuc: number;
	ChiPhiYeuCau: number;
	NoiDungHoTro: string;
	GhiChu: string;
	HinhAnhs: any[];
	Id_DoiTuong: number;

	ProvinceID: number;
	DistrictID: number;
	AllowEdit: boolean;

	clear() {
		this.Id = 0;
		this.SoHoSo = '';
		this.NamSinh = null;
		this.GioiTinh = null;
		this.Id_Xa = null;
		this.Id_KhomAp = null;
		this.DistrictID = null;
		this.HoTen = '';
		this.NgaySinh = '';
		this.DiaChi = '';
		this.Id_HinhThuc = null;
		this.ChiPhiYeuCau = null;
		this.NoiDungHoTro = null;
		this.GhiChu = null;
		this.ProvinceID = null;
		this.DistrictID = null;
		this.AllowEdit = true;
		this.Id_DoiTuong = null;
		this.HinhAnhs = []
	}
}
