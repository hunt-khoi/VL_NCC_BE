import { NhapSoLieuModel } from './new-nhap-so-lieu.model';
import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class FormDonVi {
	ListDonVi: DonVi[] = [];
}
export class DonVi {
	id: number;
	title: string;

	clear() {
		this.id = 0;
		this.title = '';
	}
}

export class FormNhapSoLieuModel extends BaseModel {
	NhapSoLieuModel: NhapSoLieuModel;
	ListFormNhapSoLieuDetailModel: FormNhapSoLieuDetailModel[] = [];

	clear() {
		this.NhapSoLieuModel = new NhapSoLieuModel();
		this.ListFormNhapSoLieuDetailModel = [];
	}

}
export class FormNhapSoLieuDetailModel extends BaseModel {
	Id: number;
	Id_NhapSoLieu: number;
	Id_Detail: number;
	Value: number;
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
	Id: number;
	Id_NhapSoLieu: number;
	Id_Detail: number;
	Value: number;
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
	Id: number;
	Id_Detail: number;
	Id_Detail_child: number;
	Value: number;
	
	clear() {
		this.Id = 0;
		this.Id_Detail = 0;
		this.Id_Detail_child = 0;
		this.Value = 0;
	}
}
