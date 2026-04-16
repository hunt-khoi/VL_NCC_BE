import { BaseModel } from "../../../../../../core/_base/crud";

export class solieuModel extends BaseModel {
    Id: number;
    SoLieu: string;
    Id_LoaiSoLieu: number;
    Id_Parent: number;
    LoaiSoLieu: string;
    MoTa: string;
    Locked: boolean;
	Id_Filter: number;
    Priority: number;
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;

    Detail: number;

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
