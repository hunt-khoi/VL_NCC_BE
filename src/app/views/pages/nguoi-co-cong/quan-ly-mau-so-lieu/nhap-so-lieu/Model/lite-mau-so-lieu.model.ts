import { BaseModel } from 'app/core/_base/crud';
export class LiteMauSoLieuModel extends BaseModel {
	id: number;
	title: string;
	disabled: boolean;
	data: {
		Id_DonVi: number,
		DonVi: string;
	}

}
