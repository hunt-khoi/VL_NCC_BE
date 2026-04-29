import { BaseModel } from '../../../../../../core/_base/crud';

export class DanhmuckhacModel extends BaseModel {
    Id: number = 0;
	MaLoaiHoSo: string = "";
    LoaiHoSo: string = "";
    LoaiGiayTo: string = "";
    Id_LoaiGiayTo: string = "";
    LoaiGiayToCC: string = "";
    Id_LoaiGiayTo_CC: string = "";
    Id_Template: number = 0;
    Id_Template_CongNhan: number = 0;
	Id_Template_ThanNhan: number = 0;
	MoTa: string = "";
	Id_DoiTuongNCC: number = 0;
	GiayTos: any[] = [];
	BieuMaus: any[] = [];
	DoiTuongs: any = {};

    clear() {
        this.Id = 0;
        this.LoaiHoSo = '';
		this.MaLoaiHoSo = '';
        this.LoaiGiayTo = '';
        this.LoaiGiayToCC = '';
        this.Id_LoaiGiayTo = '';
        this.Id_LoaiGiayTo_CC = '';
        this.Id_Template = 0;
        this.Id_Template_CongNhan = 0;
		this.Id_Template_ThanNhan = 0;
		this.MoTa = '';
		this.Id_DoiTuongNCC = 0;
		this.GiayTos = [];
		this.BieuMaus = [];
		this.DoiTuongs = {};
    }
}

export class NoiDungChiModel extends BaseModel {
    Id: number = 0;
	NoiDung: string = "";
    GhiChu: string = "";

    clear() {
        this.Id = 0;
        this.NoiDung = '';
		this.GhiChu = '';
    }
}