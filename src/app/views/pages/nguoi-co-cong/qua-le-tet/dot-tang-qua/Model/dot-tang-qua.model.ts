import { BaseModel } from "../../../../../../core/_base/crud";

export class dottangquaModel extends BaseModel {
    Id: number = 0;
    DotTangQua: string = "";
    MoTa: string = "";
    Locked: boolean = false;
    Priority: number = 1;
    Nam:  number | null = null;
    //Id_NguonKinhPhi: number;
    Id_NhomLeTet: number | null = null;
    DoiTuongs: any[] = [];
    Details: any[] = [];
    FileDinhKems: any[] = [];
    AllowEdit: boolean = false;
    SoQD: string = "";
    NgayQD: string = "";
    SoCV: string = "";
    NgayCV: string = "";
    SoTT: string = "";
    NgayTT: string = "";

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
	selected: boolean = false;
	Id_DoiTuongNCC: number = 0;
    //Id_MucQua: number;
    Id_DotTangQua: number = 0;
    HoTen: string = "";
    //MucQua: string;
    Id = 0;
	MucQuas: any[] = [];
}