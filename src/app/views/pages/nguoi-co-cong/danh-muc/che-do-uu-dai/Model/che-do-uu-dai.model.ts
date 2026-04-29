import { BaseModel } from "../../../../../../core/_base/crud";

export class chedouudaiModel extends BaseModel {
    Id: number = 0;
    CheDoUuDai: string = "";
    MoTa: string = "";
    Locked: boolean = false;
    Priority: number = 0;
    CreatedBy: number = 0;
    CreatedDate: string = "";
    UpdatedBy: number = 0;
    UpdatedDate: string = "";

	clear() {
        this.CheDoUuDai = '';
		this.MoTa = '';
		this.Locked = true;
        this.Priority = 1;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';
        this.Id = 0;
	}
}