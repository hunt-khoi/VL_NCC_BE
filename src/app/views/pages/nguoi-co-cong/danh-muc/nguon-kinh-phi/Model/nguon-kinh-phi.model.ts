import { BaseModel } from 'app/core/_base/crud';

export class NguonKinhPhiModel extends BaseModel {
	Id: number = 0;
	NguonKinhPhi: string = '';
	Locked: boolean = false;
	Priority: number = 0;
	CreatedBy: number = 0;
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';

	clear() {
		this.Id = 0;
		this.NguonKinhPhi = '';
		this.Locked = false;
		this.Priority = 0;
	}
}