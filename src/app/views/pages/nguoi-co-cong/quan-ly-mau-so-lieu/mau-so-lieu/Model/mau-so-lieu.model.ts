import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';
import { DonVi } from './detail-list.model';

export class MauSoLieuModel extends BaseModel {
	Id: number;
	MauSoLieu: string;
	MoTa: string;
	Locked: boolean;
	IsMauTheoPhong: boolean;
	Priority: number;
	IdParent: number;
	Nam: number;
	ListDonVi: DonVi[];
	SLGiao: number;

	clear() {
		this.Id = 0;
		this.MauSoLieu = '';
		this.MoTa = '';
		this.Locked = false;
		this.IdParent = null;
		this.Nam = null;
		this.IsMauTheoPhong = false;
		this.Priority = 1;
		this.ListDonVi = new Array<DonVi>();
		this.SLGiao = 0;
	}
}
