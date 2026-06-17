import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class MauSoLieuDetailModel extends BaseModel {
	Id: number = 0;
	IdMauSoLieu: number = 0;
	IdSoLieu: number = 0;
	
	clear() {
		this.Id = 0;
		this.IdMauSoLieu = 0;
		this.IdSoLieu = 0;
	}
}