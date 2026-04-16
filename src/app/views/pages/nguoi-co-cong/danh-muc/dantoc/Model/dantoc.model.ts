import { BaseModel } from '../../../../../../core/_base/crud';

export class dantocModel extends BaseModel {
	Id_row: number;
	Tendantoc: string;
	Priority:number;
	clear() {
		this.Id_row = 0;
		this.Tendantoc = '';
		this.Priority = 1;
	}
}
