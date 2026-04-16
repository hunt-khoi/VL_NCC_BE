import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class DoiTuongNhanQuaModel extends BaseModel {
	Id: number;
	//NgayGui: string;
	SoHoSo: string;
	Id_DoiTuongNCC: number;
	HoTen: string;
	//BiDanh: string;
	NgaySinh: string;
	GioiTinh: number;
	NamSinh: number;
	Id_Xa: number;
	Id_KhomAp: number;
	//Id_DanToc: number;
	//Id_TonGiao: number;
	DiaChi: string;
	//NguyenQuan: string;
	//TruQuan: string;
	//IsThanNhan: boolean;
	//Id_ThanNhan: number;
	NguoiThoCungLietSy: string;
	QuanHeVoiLietSy: number;
	ProvinceID: number;
	DistrictID: number;
	//NgayNhapNgu: string;
	//NgayXuatNgu: string;
	//NoiCongTac: string;
	//CapBac: string;
	//ChucVu: string;
	//Ngay_: string;
	//TruongHop_: string;
	//GiayBaoTu: number;
	//BangTQGC: number;
	//Mo: number;//1: Nghĩa trang, 2: Gia đình quản lý, 3: Không có thông tin
	//GiayChungNhanBiThuong: number;
	//BienBanGiamDinhThuongTat: number;
	//FileDinhKem: any;
	//GiayTos: any[];
	isError: boolean;
	IsForce: boolean;
	clear() {
		this.Id = 0;
		//this.NgayGui = null;
		this.SoHoSo = '';
		this.Id_DoiTuongNCC = null;
		this.NamSinh = null;
		this.Id_Xa = null;
		this.Id_KhomAp = null;
		//this.Id_ThanNhan = null;
		//this.IsThanNhan = false;
		this.NguoiThoCungLietSy = '';
		this.QuanHeVoiLietSy = null;
		this.DistrictID = null;
		this.HoTen = '';
		this.NgaySinh = '';
		this.GioiTinh = null;
		this.DiaChi = '';
		this.ProvinceID = null;
		this.DistrictID = null;
		//this.Mo = 0;
		//this.GiayTos = [];
		this.isError = false;
		this.IsForce = false;
	}
}
