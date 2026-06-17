import { NhapSoLieuModel } from './new-nhap-so-lieu.model';
import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class FormDonVi {
	ListDonVi: DonVi[] = [];
}
export class DonVi {
	id: number = 0;
	title: string = '';

	clear() {
		this.id = 0;
		this.title = '';
	}
}

export class FormNhapSoLieuModel extends BaseModel {
	NhapSoLieuModel: NhapSoLieuModel = new NhapSoLieuModel();
	ListFormNhapSoLieuDetailModel: FormNhapSoLieuDetailModel[] = [];

	clear() {
		this.NhapSoLieuModel = new NhapSoLieuModel();
		this.ListFormNhapSoLieuDetailModel = [];
	}
}

export class FormNhapSoLieuDetailModel extends BaseModel {
	Id: number = 0;
	Id_NhapSoLieu: number = 0;
	Id_Detail: number = 0;
	Value: number = 0;
	SoLieuCon: FormNhapSoLieuConModel[] = [];

	clear() {
		this.Id = 0;
		this.Id_NhapSoLieu = 0;
		this.Id_Detail = 0;
		this.Value = 0
		this.Id_Detail = 0;
		this.SoLieuCon = new Array<FormNhapSoLieuConModel>();
	}
}

export class FormNhapSoLieuConModel extends BaseModel {
	Id: number = 0;
	Id_NhapSoLieu: number = 0;
	Id_Detail: number = 0;
	Value: number = 0;
	Detail: FormDetailModel[] = [];

	clear() {
		this.Id = 0;
		this.Id_NhapSoLieu = 0;
		this.Id_Detail = 0;
		this.Value = 0
		this.Id_Detail = 0;
		this.Detail = new Array<FormDetailModel>();
	}
}

export class FormDetailModel extends BaseModel {
	Id: number = 0;
	Id_Detail: number = 0;
	Id_Detail_child: number = 0;
	Value: number = 0;
	
	clear() {
		this.Id = 0;
		this.Id_Detail = 0;
		this.Id_Detail_child = 0;
		this.Value = 0;
	}
}