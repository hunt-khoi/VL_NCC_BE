import { BaseModel } from "../../../../../../core/_base/crud";

export class loaisolieuModel extends BaseModel {
    Id: number = 0;
    LoaiSoLieu: string = "";
    MoTa: string = "";
    Locked: boolean = false;
    Priority: number = 0;
    CreatedBy: number = 0;
    CreatedDate: string = "";
    UpdatedBy: number = 0;
    UpdatedDate: string = "";
    Detail: number = 0;

	clear() {
        this.LoaiSoLieu = '';
		this.MoTa = '';
		this.Locked = false;
        this.Priority = 0;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';
        this.Id = 0;
	}
}