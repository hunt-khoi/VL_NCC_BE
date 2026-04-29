import { BaseModel } from "../../../../../../core/_base/crud";

export class nhomletetModel extends BaseModel {
    Id: number = 0;
    NhomLeTet: string = "";
    MoTa: string = "";
    NgayKhaiBao: string = "";
    Locked: boolean = true;
	MauQD: number | null = null;
    Priority: number = 1;
    CreatedBy: number = 0;
    CreatedDate: string = "";
    UpdatedBy: number = 0;
    UpdatedDate: string = "";
    Detail: number = 0;

	clear() {
		this.NhomLeTet = '';
        this.MoTa = '';
        this.NgayKhaiBao = '';
		this.Locked = true;
		this.MauQD = null;
        this.Priority = 1;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';
        this.Id = 0;
	}
}