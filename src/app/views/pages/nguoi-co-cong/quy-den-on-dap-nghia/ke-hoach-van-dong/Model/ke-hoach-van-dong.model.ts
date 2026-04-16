import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class KeHoachVanDongModel extends BaseModel {
	Id: number;
	KeHoach: string;
	MoTa: string;
	Priority: number;
	IdParent: number;
	Nam: number;
	SoTien: number;
	ConDetails: KeHoachVanDongDetailModel[];
	Details: KeHoachVanDongDetailModel[];

	clear() {
		this.Id = 0;
		this.KeHoach = '';
		this.MoTa = '';
		this.IdParent = null;
		this.Nam = null;
		this.Priority = 1;
		this.SoTien = 0;
		this.ConDetails = [];
		this.Details = [];
	}
}

export class KeHoachVanDongDetailModel extends BaseModel { 
	Id: number;
	Id_KeHoach: number;
	Id_DonVi: number;
	SoTien: number;
	DonVi: string; //tên đơn vị

	clear() { 
		this.Id = 0;
		this.Id_KeHoach = 0;
		this.Id_DonVi = 0;
		this.SoTien = 0;
		this.DonVi = '';
	}
}