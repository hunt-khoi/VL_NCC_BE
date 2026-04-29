import { BaseModel } from "../../../../../../core/_base/crud";

export class solieuModel extends BaseModel {
    Id: number = 0;
    SoLieu: string = '';
    Id_LoaiSoLieu: number = 0;
    Id_Parent: number = 0;
    LoaiSoLieu: string = '';
    MoTa: string = '';
    Locked: boolean = false;
	Id_Filter: number = 0;
    Priority: number = 0;
    CreatedBy: number = 0;
    CreatedDate: string = '';
    UpdatedBy: number = 0;
    UpdatedDate: string = '';
    Detail: number = 0;

	clear() {
        this.SoLieu = '';
        this.Id_LoaiSoLieu = 0;
        this.Id_Parent = 0;
        this.LoaiSoLieu = '';
		this.MoTa = '';
		this.Locked = true;
		this.Id_Filter = 0;
        this.Priority = 1;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';
        this.Id = 0;
	}
}