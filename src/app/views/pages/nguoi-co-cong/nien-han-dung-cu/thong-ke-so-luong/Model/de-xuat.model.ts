import { BaseModel } from "../../../../../../core/_base/crud";

export class bcTongHopModel extends BaseModel {
	Id: number;
	TenDonVi: string;
	data: data[];
	TongTien: number;
	SoNguoi: number;
	clear() {
		this.Id = 0;
		this.TenDonVi = null;
		this.data = [];
		this.TongTien = 0;
		this.SoNguoi = 0;
	}
}
export class data extends BaseModel {
	Id_NCC: number;
	HoTen: string;
	SoTien: number;
	
	clear() {
		this.Id_NCC = 0;
		this.HoTen = '';
		this.SoTien = 0;
		
	}
}


