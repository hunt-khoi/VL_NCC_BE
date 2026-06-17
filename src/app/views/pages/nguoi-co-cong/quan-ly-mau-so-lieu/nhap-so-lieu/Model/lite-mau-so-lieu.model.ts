import { BaseModel } from 'app/core/_base/crud';

export class LiteMauSoLieuModel extends BaseModel {
	id: number = 0;
	title: string = '';
	disabled: boolean = false;
	data: any = {
		Id_DonVi: 0,
		DonVi: ''
	}
}