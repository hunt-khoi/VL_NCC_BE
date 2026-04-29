import { BaseModel } from '../../../../../../core/_base/crud';

export class ChucDanhModel extends BaseModel {
	Id_CV: number = 0;
	MaCV: string = "";
	TenCV: string = "";
	Cap: string = "";
	IsManager: boolean = false;
	IsTaiXe: boolean = false;

	clear() {
		this.Id_CV = 0;
		this.MaCV = '';
		this.TenCV = '';
		this.Cap = '';
		this.IsManager = false;
		this.IsTaiXe = false;
	}
}