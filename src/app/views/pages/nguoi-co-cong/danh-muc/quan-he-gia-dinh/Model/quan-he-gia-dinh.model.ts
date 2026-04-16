import { BaseModel } from 'app/core/_base/crud';

export class QuanHeGiaDinhModel extends BaseModel {
	Id: number;
	QHGiaDinh: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: number;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;
	ByQua: boolean;
	IsChuYeu: boolean;

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
