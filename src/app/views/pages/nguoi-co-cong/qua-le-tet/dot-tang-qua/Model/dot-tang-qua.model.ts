import { BaseModel } from "../../../../../../core/_base/crud";

export class dottangquaModel extends BaseModel {
    Id: number;
    DotTangQua: string;
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
        this.DotTangQua = '';
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

export class dottangqua_NCCModel extends BaseModel {
	selected: boolean;
	Id_DoiTuongNCC: number;
    //Id_MucQua: number;
    Id_DotTangQua: number;

    HoTen: string;
    //MucQua: string;

    Id = 0;
	MucQuas:any[]
}

