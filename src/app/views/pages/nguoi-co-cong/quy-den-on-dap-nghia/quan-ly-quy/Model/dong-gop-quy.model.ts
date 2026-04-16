import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class DongGopQuyModel extends BaseModel {
	Id: number;
	Id_DonVi: number;
	Id_KeHoach: number;
	SoTien: number;

	clear() {
		this.Id = 0;
		this.Id_KeHoach = 0;
		this.Id_DonVi = 0;
		this.SoTien = 0;
	}
}
export class     QuyDenOnMoDel extends BaseModel {
	Id: number;
	QuyDenOn: string;
	SoTaiKhoan: string;
	SoTienDau: number;
	TenTaiKhoan: string;
	TenNganHang: string;
	MaQHNganSach: string;
	TongChi: number;
	TongThu: number;
	TongTien: number;
	IsAuto: boolean;
	clear() {
		this.Id = 0;
		this.QuyDenOn = "";
		this.SoTaiKhoan = "";
		this.SoTienDau = 0;
		this.TenTaiKhoan = "";
		this.TenNganHang = "";
		this.MaQHNganSach = "";
		this.TongChi = 0;
		this.TongThu = 0;;
		this.TongTien = 0;
		this.IsAuto = true;
	}
}
export class ChiQuyModel extends BaseModel {
	Id: number;
	Id_Quy: number;
	Id_NoiDung: number;
	SoTien: number;
	GhiChu: string;
	IsTuNguonTren: boolean;
	SoTienDuocHT: number;

	clear() {
		this.Id = 0;
		this.Id_Quy = 0;
		this.Id_NoiDung = 0;
		this.SoTien = 0;
		this.GhiChu ='';
		this.IsTuNguonTren = false;
		this.SoTienDuocHT = 0;
	}
}

export class QDChiModel extends BaseModel {
	Id: number;
    SoQD: string;
    NgayQD: string;

    clear() {
		this.Id = 0;
        this.SoQD = '';
        this.NgayQD = '';
    }
}