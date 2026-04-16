import { BaseModel } from "../../../../../../core/_base/crud";

export class nhomletetModel extends BaseModel {
    Id: number;
    NhomLeTet: string;
    MoTa: string;
    NgayKhaiBao: string;
    Locked: boolean;
	MauQD: number;
    Priority: number;
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;

    Detail: number;

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
