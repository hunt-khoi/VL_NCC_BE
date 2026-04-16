import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class DoiTuongBaoHiemModel extends BaseModel {
	Id: number;
	SoHoSo: string;
	Id_DoiTuongBHYT: number;
	HoTen: string;
	MaTheBHYT: string;
	MaTheBHXH: string;
	MaKCB: string;
	NoiDangKyKCB: string;  
	TienLuong: number;
	SoThangSuDung: number;
	SoTien: number; //NNNN đóng

	NgaySinh: string;
	GioiTinh: number;
	NamSinh: number;
	Id_Xa: number;
	Id_KhomAp: number;
	DiaChi: string;
	ProvinceID: number;
	DistrictID: number;
	NguyenQuan: string;
	TruQuan: string;
	NgheNghiep: string;
	NoiCongTac: string;
	ThanNhan: string;
	Id_QHGiaDinh: number;
	GhiChu: string;
    FileDinhKems: any[]

	isError: boolean;
	IsForce: boolean;
	IsUpdateMa: boolean;

	clear() {
		this.Id = 0;
		this.SoHoSo = '';
		this.Id_DoiTuongBHYT = 0;
		this.NamSinh = null;
		this.Id_Xa = null;
		this.Id_KhomAp = null;
		this.MaTheBHYT = '';
		this.MaTheBHXH = '';
		this.MaKCB = '';
		this.NoiDangKyKCB = '';
		this.TienLuong = 0;
		this.SoThangSuDung = 1;
		this.SoTien = 0;
		
		this.DistrictID = null;
		this.HoTen = '';
		this.NgaySinh = '';
		this.GioiTinh = null;
		this.DiaChi = '';
		this.ProvinceID = null;
		this.DistrictID = null;
		this.NguyenQuan = '';
		this.TruQuan = '';
		this.NgheNghiep = '';
		this.NoiCongTac = '';
		this.ThanNhan = '';
		this.Id_QHGiaDinh = 0;
		this.GhiChu = '';
		this.FileDinhKems = [];

		this.isError = false;
		this.IsForce = false;
		this.IsUpdateMa = false;
	}
}
