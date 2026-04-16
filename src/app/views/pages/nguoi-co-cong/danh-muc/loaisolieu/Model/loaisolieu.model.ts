import { BaseModel } from "../../../../../../core/_base/crud";

export class loaisolieuModel extends BaseModel {
    Id: number;
    LoaiSoLieu: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;

    Detail: number;

	clear() {
        this.LoaiSoLieu = '';
		this.MoTa = '';
		this.Locked = true;
        this.Priority = 0;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';

        this.Id = 0;
	}
}