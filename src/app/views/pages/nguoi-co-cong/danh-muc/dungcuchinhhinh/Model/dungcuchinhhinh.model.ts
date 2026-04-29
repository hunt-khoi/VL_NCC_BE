import { BaseModel } from "../../../../../../core/_base/crud";

export class dungcuchinhhinhModel extends BaseModel {
    Id: number = 0;
    DungCu: string = '';
    MaDungCu: string = '';
    MoTa: string = '';
    Locked: boolean = true;
    Priority: number = 1;
    CreatedBy: number = 0;
    CreatedDate: string = '';
    UpdatedBy: number = 0;
    UpdatedDate: string = '';
    IsVatPhamPhu: boolean = false;
    Id_Child: number = 0;

	clear() {
        this.DungCu = '';
        this.MaDungCu = '';
		this.MoTa = '';
		this.Locked = true;
        this.Priority = 1;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';
        this.IsVatPhamPhu = false;
        this.Id_Child = 0;
        this.Id = 0;
	}
}

export class TriGiaDungCuModel extends BaseModel { 
    Id: number = 0;
    Id_DungCu: number = 0;
    ThoiGian: string = '';
    TriGia: number = 0;
    NienHan: number = 0;
    MoTa: string = '';

    clear() {
        this.ThoiGian = '';
        this.TriGia = 0;
        this.NienHan = 0;
        this.Id = 0;
        this.Id_DungCu = 0;
        this.MoTa = '';
    }
}