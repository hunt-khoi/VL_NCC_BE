import { BaseModel } from 'app/core/_base/crud';

export class QuanHeGiaDinhModel extends BaseModel {
	Id: number = 0;
	QHGiaDinh: string = '';
	Locked: boolean = false;
	Priority: number = 1;
	CreatedBy: number = 0;
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';
	ByQua: boolean = false;
	IsChuYeu: boolean = false;

	clear() {
		this.Id = 0;
		this.QHGiaDinh = '';
		this.Locked = false;
		this.Priority = 1;
		this.CreatedBy = 0;
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.UpdatedDate = '';
		this.IsChuYeu = false;
	}
}