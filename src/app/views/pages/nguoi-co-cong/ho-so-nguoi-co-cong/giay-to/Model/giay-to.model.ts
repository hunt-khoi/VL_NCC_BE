import { BaseModel } from "../../../../../../core/_base/crud";

export class GiayToModel extends BaseModel {
	Id: number = 0;
	Id_NCC: number = 0;
	Id_LoaiGiayTo: number | null = null;
	So: string = "";
	GiayTo: string = "";
	NoiCap: string = "";
	NgayCap: string = "";
	FileDinhKem: any;
	src: string = "";

	clear() {
		this.Id = 0;
		this.Id_NCC = 0;
		this.Id_LoaiGiayTo = null;
		this.So = '';
		this.GiayTo = '';
		this.NoiCap = '';
		this.NgayCap = '';
		this.src = '';
	}
}