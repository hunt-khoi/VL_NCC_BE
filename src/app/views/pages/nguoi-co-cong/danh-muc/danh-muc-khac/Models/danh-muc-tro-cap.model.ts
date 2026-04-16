import { BaseModel } from '../../../../../../core/_base/crud';

export class DanhmucTrocapModel extends BaseModel {
    Id: number;
    Id_LoaiHoSo: number;
    MaTroCap: string;
    TroCap: number;
    Id_Template: number;
	Id_Template_Cat: number;
    TienTroCap: number;
    PhuCap: number;
	TienMuaBao: number;
    TroCapNuoiDuong: number;
	Id_Parent: number;
	SoThang: number;
	SoThangTC: number;
    Keys_ID: number;

    clear() {
        this.Id = 0;
        this.Id_LoaiHoSo = 0;
        this.MaTroCap = '';
		this.Id_Template = 0;
		this.Id_Template_Cat = 0;
		this.TienTroCap = null;
        this.PhuCap = null;
		this.TienMuaBao = null;
		this.TroCapNuoiDuong = null;
		this.Id_Parent = null;
		this.SoThang = 1;
		this.SoThangTC = null;
        this.Keys_ID = null
    }
}
