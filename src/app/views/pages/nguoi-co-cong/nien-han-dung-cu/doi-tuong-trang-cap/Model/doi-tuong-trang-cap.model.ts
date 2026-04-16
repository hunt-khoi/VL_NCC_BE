import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class DoiTuongTrangCapModel extends BaseModel {
	Id: number;
	SoHoSo: string;
	SoTheoDoi: string;

	Id_DoiTuong: number;
	HoTen: string;
	NgaySinh: string;
	GioiTinh: number;
	NamSinh: number;
	Id_Xa: number;
	Id_KhomAp: number;

	DiaChi: string;
	GhiChu: string;
	HoTenThanNhan: string;
	Id_QHGiaDinh: number;
	ChiTiets: DTChinhHinh_DetailModel[];
	ProvinceID: number;
	DistrictID: number;
	NamCap: number;
	DungCuChinhHinh: number;

	isError: boolean;
	IsForce: boolean;

	clear() {
		this.Id = 0;
		//this.NgayGui = null;
		this.SoHoSo = '';
		this.SoTheoDoi = '';
		this.Id_DoiTuong = null;
		this.HoTen = '';
		this.NgaySinh = '';
		this.GioiTinh = null;
		// this.NamSinh = null;
		this.Id_Xa = null;
		this.Id_KhomAp = null;
		this.DistrictID = null;
		this.DiaChi = '';
		this.GhiChu = '';
		this.HoTenThanNhan = '';
		this.Id_QHGiaDinh = 0;
		this.ChiTiets = [];
		this.NamCap = (new Date()).getFullYear();
		this.DungCuChinhHinh = null;
		this.ProvinceID = null;
		this.DistrictID = null;

		this.isError = false;
		this.IsForce = false;
	}
}

export class DTChinhHinh_DetailDTO extends BaseModel{
	Id: number;
	Id_NCC: number;
	id: number;
	id_doituong: number;
	NamCap: number;
	title: string;
}

export class DTChinhHinh_DetailModel extends BaseModel{
	Id: number;
	Id_NCC: number;
	Id_DungCu: number;
	NamCap: number;
}