import { BaseModel } from 'app/core/_base/crud';

export class MucQuaModel extends BaseModel {
	Id: number;
	MucQua: string;
	MoTa: string;
	SoTien: number;
	Locked: boolean;
	Priority: number;
	CreatedBy: number;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;

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
