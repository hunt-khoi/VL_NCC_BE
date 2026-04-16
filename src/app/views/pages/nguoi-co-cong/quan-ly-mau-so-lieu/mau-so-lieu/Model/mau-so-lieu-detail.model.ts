import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class MauSoLieuDetailModel extends BaseModel {
	Id: number;
	IdMauSoLieu: number;
	IdSoLieu: number;
	
	clear() {
		this.Id = 0;
		this.IdMauSoLieu = 0;
		this.IdSoLieu = 0;
	}
}
