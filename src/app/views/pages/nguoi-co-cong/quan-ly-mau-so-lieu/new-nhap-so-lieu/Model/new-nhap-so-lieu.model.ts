import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class FromBodyModel extends BaseModel {

	NhapSoLieuModel: NhapSoLieuModel;
	ListNhapSoLieuDetail: NhapSoLieuDetail[] = [];
	ListNhapSoLieuChild: NhapSoLieuChild[] = [];
}

export class NhapSoLieuModel extends BaseModel {
	Id: number;
	Id_MauSoLieu_DonVi: number;
	Id_DonVi: number;
	Id_MauSoLieu: number;

	clear() {
		this.Id = 0;
		this.Id_MauSoLieu_DonVi = 0;
		this.Id_DonVi = 0;
		this.Id_MauSoLieu = -1;
	}
}

export class NhapSoLieuDetail extends BaseModel {
	Id: number;
	Id_NhapSoLieu: number;
	Id_Detail: number;
	Value: number;

	clear() {
		this.Id = 0;
		this.Id_NhapSoLieu = 0;
		this.Id_Detail = 0;
		this.Value = -1;
	}
}

export class NhapSoLieuChild extends BaseModel {
	Id: number;
	Id_Detail_Child: number;
	Id_Detail: number;
	Value: number;

	clear() {
		this.Id = 0;
		this.Id_Detail_Child = 0;
		this.Id_Detail = 0;
		this.Value = -1;
	}
}