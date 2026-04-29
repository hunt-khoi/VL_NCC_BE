import { BaseModel } from '../../../../../../core/_base/crud';

export class DanhmucTrocapModel extends BaseModel {
    Id: number = 0;
    Id_LoaiHoSo: number = 0;
    MaTroCap: string = "";
    TroCap: number = 0;
    Id_Template: number = 0;
	Id_Template_Cat: number = 0;
    TienTroCap: number | null = null;
    PhuCap: number | null = null;
	TienMuaBao: number | null = null;
    TroCapNuoiDuong: number | null = null;
	Id_Parent: number | null = null;
	SoThang: number | null = null;
	SoThangTC: number | null = null;
    Keys_ID: number | null = null;

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
