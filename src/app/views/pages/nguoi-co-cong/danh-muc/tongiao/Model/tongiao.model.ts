import { BaseModel } from '../../../../../../core/_base/crud';

export class tongiaoModel extends BaseModel {
	Id_row: number = 0;
	Tentongiao: string = "";
	Priority: number = 1;

	clear() {
		this.Id_row = 0;
		this.Tentongiao = '';
		this.Priority = 1;
	}
}