import { BaseModel } from '../../../../../../core/_base/crud';

export class DienChinhHinhModel extends BaseModel {
	Id: number;
	DienChinhHinh: string;
	MoTa: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: number;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;

	clear() {
		this.Id = 0;
		this.DienChinhHinh = '';
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
	}
}
