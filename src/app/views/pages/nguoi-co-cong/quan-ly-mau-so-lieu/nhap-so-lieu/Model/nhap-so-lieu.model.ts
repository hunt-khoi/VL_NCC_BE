import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class FromBodyModel extends BaseModel {
	NhapSoLieuModel: NhapSoLieuModel = new NhapSoLieuModel();
	ListNhapSoLieuDetail: NhapSoLieuDetail[] = [];
	ListNhapSoLieuChild: NhapSoLieuChild[] = [];
}

export class NhapSoLieuModel extends BaseModel {
	Id: number = 0;
	Id_MauSoLieu_DonVi: number = 0;
	Id_DonVi: number = 0;
	Id_MauSoLieu: number = -1;

	clear() {
		this.Id = 0;
		this.Id_MauSoLieu_DonVi = 0;
		this.Id_DonVi = 0;
		this.Id_MauSoLieu = -1;
	}
}

export class NhapSoLieuDetail extends BaseModel {
	Id: number = 0;
	Id_NhapSoLieu: number = 0;
	Id_Detail: number = 0;
	Value: number = -1;
	Note: string = "";

	clear() {
		this.Id = 0;
		this.Id_NhapSoLieu = 0;
		this.Id_Detail = 0;
		this.Value = -1;
		this.Note = "";
	}
}

export class NhapSoLieuChild extends BaseModel {
	Id: number = 0;
	Id_Detail_Child: number = 0;
	Id_Detail: number = 0;
	Value: number = -1;
	Note: string = "";

	clear() {
		this.Id = 0;
		this.Id_Detail_Child = 0;
		this.Id_Detail = 0;
		this.Value = -1;
		this.Note = "";
	}
}