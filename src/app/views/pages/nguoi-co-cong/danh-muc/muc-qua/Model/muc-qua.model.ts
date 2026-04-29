import { BaseModel } from 'app/core/_base/crud';

export class MucQuaModel extends BaseModel {
	Id: number = 0;
	MucQua: string = '';
	MoTa: string = '';
	SoTien: number | null = null;
	Locked: boolean = false;
	Priority: number = 1;
	CreatedBy: number = 0;
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';

	clear() {
		this.Id = 0;
		this.MucQua = '';
		this.MoTa = '';
		this.SoTien = null;
		this.Locked = false;
		this.Priority = 1;
		this.CreatedBy = 0;
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.UpdatedDate = '';
	}
}
