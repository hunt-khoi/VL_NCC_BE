import { BaseModel } from '../../../../../../core/_base/crud';

export class DienChinhHinhModel extends BaseModel {
	Id: number = 0;
	DienChinhHinh: string = '';
	MoTa: string = '';
	Locked: boolean = false;
	Priority: number = 1;
	CreatedBy: number = 0;
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';

	clear() {
		this.Id = 0;
		this.DienChinhHinh = '';
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
	}
}