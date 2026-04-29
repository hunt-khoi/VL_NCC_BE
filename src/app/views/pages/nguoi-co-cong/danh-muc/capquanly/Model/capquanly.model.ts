import { BaseModel } from '../../../../../../core/_base/crud';

export class capquanlyModel extends BaseModel {
	RowID: number = 0;
	Title: string = "";
	Summary: string = "";
	Range: string = "";

	clear() {
		this.RowID = 0;
		this.Title = '';
		this.Summary = '';
		this.Range = '';
	}
}