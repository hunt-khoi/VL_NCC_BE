import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';
import { DonVi } from './detail-list.model';

export class MauSoLieuModel extends BaseModel {
	Id: number = 0;
	MauSoLieu: string = '';
	MoTa: string = '';
	Locked: boolean = false;
	IsMauTheoPhong: boolean = false;
	Priority: number = 0;
	IdParent: number | null = null;
	Nam: number | null = null;
	ListDonVi: DonVi[] = [];
	SLGiao: number = 0;

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