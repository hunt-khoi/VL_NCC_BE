import { BaseModel } from '../../../../../../core/_base/crud';

export class tongiaoModel extends BaseModel {
	Id_row: number;
	Tentongiao: string;
	Priority: number;
	clear() {
		this.Id_row = 0;
		this.Tentongiao = '';
		this.Priority = 1;
	}
}
