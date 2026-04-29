import { BaseModel } from '../../../../../../core/_base/crud';

export class dantocModel extends BaseModel {
	Id_row: number = 0;
	Tendantoc: string = "";
	Priority:number = 1;

	clear() {
		this.Id_row = 0;
		this.Tendantoc = '';
		this.Priority = 1;
	}
}