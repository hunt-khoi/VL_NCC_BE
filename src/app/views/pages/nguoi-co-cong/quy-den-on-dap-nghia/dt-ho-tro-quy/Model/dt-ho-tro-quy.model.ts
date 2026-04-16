import { BaseModel } from '../../../../../../core/_base/crud';

export class dtHoTroModel extends BaseModel {
    Id: number;
    SoHoSo : string;
    HoTen: string;
    DiaChi: string;
    GhiChu: string;
    Locked: boolean;
    Id_Xa: number;
	Id_KhomAp: number;
    Id_DoiTuong: number;
    ProvinceID: number;
	DistrictID: number;
    NgaySinh: string;
	GioiTinh: number;
	NamSinh: number;
    ChiPhiYeuCau: number;

    clear() {
        this.Id = 0;
        this.HoTen = '';
        this.GhiChu = '';
        this.Locked = false;
        this.DiaChi = '';
        this.SoHoSo = '';
        this.Id_Xa = 0;
        this.Id_KhomAp = 0;
        this.ProvinceID = 0;
        this.DistrictID = 0;
        this.NgaySinh = '';
        this.GioiTinh = 0;
        this.NamSinh = null;
        this.ChiPhiYeuCau = 0;
        this.Id_DoiTuong = 0;
    }
}

export class HoTro_DTModel extends BaseModel {
    Id_NoiDung: number;
    NoiDungHoTro: string;
    SoTien: number;
    SoQD: string;
    NgayQD: string;
    Id_DanhSach: number;
    Id_Chi: number;

    clear() {
        this.NoiDungHoTro = '';
        this.SoTien = 0;
        this.Id_NoiDung = 0;
        this.SoQD = '';
        this.NgayQD = '';
        this.Id_DanhSach = 0;
        this.Id_Chi = 0;
    }
}