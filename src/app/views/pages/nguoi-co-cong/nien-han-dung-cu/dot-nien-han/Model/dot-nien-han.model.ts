import { BaseModel } from "../../../../../../core/_base/crud";

export class dotnienhanModel extends BaseModel {
    Id: number;
    DotNienHan: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    Nam:  number;
    //Id_NguonKinhPhi: number;
    Id_NhomLeTet: number;
    DoiTuongs: any[];
    Details: any[];
    FileDinhKems: any[]
    AllowEdit: boolean;
    SoQD: string;
    NgayQD: string;
    SoCV: string;
    NgayCV: string;
    SoTT: string;
    NgayTT: string;

	clear() {
        this.DotNienHan = '';
		this.MoTa = '';
		this.Locked = false;
        this.Priority = 1;
        this.Nam = null;
        this.DoiTuongs = [];
        this.FileDinhKems = [];
        this.Id = 0;
		this.SoQD = '';
		this.NgayQD = '';
		this.SoCV = '';
		this.NgayCV = '';
		this.SoTT = '';
		this.NgayTT = '';
	}
}

export class dotnienhan_NCCModel extends BaseModel {
	selected: boolean;
	Id_DoiTuongNCC: number;
    Id_DotTangQua: number;
    HoTen: string;

    Id = 0;
	MucQuas: any[]
}
