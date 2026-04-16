import { BaseModel } from 'app/core/_base/crud';

export class NguonKinhPhiModel extends BaseModel {
	Id: number;
	NguonKinhPhi: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: number;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;

	clear() {
		this.Id = 0;
		this.NguonKinhPhi = '';
		this.Locked = false;
		this.Priority = 0;
	}
}
