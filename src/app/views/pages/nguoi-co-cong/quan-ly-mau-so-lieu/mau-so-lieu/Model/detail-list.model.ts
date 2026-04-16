import { MauSoLieuModel } from './mau-so-lieu.model';
import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class FormDonVi {
	Id: number;
	Id_MauSoLieu: number;
	ListDonVi: DonVi[] = [];
	ThoiGian: string;

	clear() {
		this.Id = 0;
		this.Id_MauSoLieu = 0;
		this.ListDonVi = new Array<DonVi>();
		this.ThoiGian = '';
	}
}

export class DonVi extends BaseModel {
	id: number;
	title: string;
	Id_DonVi: number;
	IsNhap: boolean;

	clear() {
		this.id = 0;
		this.title = '';
		this.Id_DonVi = 0;
		this.IsNhap = false;
	}
}

export class FromBodyData extends BaseModel {
	MauSoLieu: MauSoLieuModel;
	ListFormMauSoLieuDetailModel: FormMauSoLieuDetailModel[] = [];

}

export class FormMauSoLieuDetailModel extends BaseModel {
	Id_Detail: number;
	IdSoLieu: number;
	LoaiSoLieu: string;
	MoTa: string;
	Priority: number;
	SoLieu: string;
	Detail: FormDetail[] = [];
	SoLieuCon: FormSoLieuConModel[] = [];

	clear() {
		this.Id_Detail = 0;
		this.IdSoLieu = 0;
		this.LoaiSoLieu = '';
		this.MoTa = '';
		this.Priority = 0;
		this.SoLieu = '';
		this.Detail = new Array<FormDetail>();
		this.SoLieuCon = new Array<FormSoLieuConModel>();
	}
}

export class FormSoLieuConModel extends BaseModel {
	IdSoLieu: number;
	SoLieu: string;
	Id_Detail: number;
	LoaiSoLieu: string;
	Priority: number;
	MoTa: string;
	Detail: FormDetail[] = [];

	clear() {
		this.IdSoLieu = 0;
		this.SoLieu = '';
		this.Priority = 0;
		this.LoaiSoLieu = '';
		this.Id_Detail = 0;
		this.MoTa = '';
		this.Detail = new Array<FormDetail>();
	}
}

export class FormDetail extends BaseModel {
	Id_Detail_child: number;
	Id_Detail: number;
	IdPhiSoLieu: number;
	PhiSoLieu: string;
	CachNhap: number;
	MoTa: string;
	clear() {
		this.Id_Detail_child = 0;
		this.Id_Detail = 0;
		this.IdPhiSoLieu = 0;
		this.PhiSoLieu = '';
		this.CachNhap = 0;
	}
}
