import { BaseModel } from "../../../../../../core/_base/crud";

export class dutoankinhphiModel extends BaseModel {
    Id: number;
    DuToan: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    Nam:  number;
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
        this.DuToan = '';
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

export class dutoankinhphi_NCCModel extends BaseModel {
	Id_DungCu: number;
    TenDungCu: String;
    TriGia: string;
    Id : number;
}

export class DuToanModel extends BaseModel {
    Id: number;
    DuToan: string;
    MoTa: string;
    Nam:  number;
    Locked: boolean;
    Priority: number;
    ChiTiets : any[];
    FileDinhKems: any[]
    AllowEdit: boolean;

	clear() {
        this.DuToan = '';
		this.MoTa = '';
		this.Locked = false;
        this.Priority = 1;
        this.Nam = null;
        this.FileDinhKems = [];
        this.Id = 0;
        this.ChiTiets = [];
	}
}

export class DuToan_DungCuModel extends BaseModel{
    Id : number;
    Id_DuToan: number;
    Id_DungCu: number;
    Huyens: DuToan_HuyenModel[];

    empty()
    {
        this.Huyens = [];
        this.Id = 0;
        this.Id_DuToan = 0;
        this.Id_DungCu = 0;
    }
}

export class DuToan_HuyenModel extends BaseModel{
    KinhPhi : number;
    SoDoiTuong: number;
    Id_Huyen: number;
}
