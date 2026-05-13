import { BaseModel } from "../../../../../../core/_base/crud";

export class DeXuatModel extends BaseModel {
	Id: number = 0;
	Id_DotTangQua: number = 0;
	Status: number = 0;
	strStatus: string = '';
	NCCs: any[] = [];
	Details: any[] = [];
	DoiTuongGiam: any[] = [];

	//???
	AllowEdit: boolean = false;
	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;

	clear() {
		this.Id_DotTangQua = 0;
		this.Status = 0;
		this.strStatus = '';
		this.Id = 0;
	}
}

export class DeXuat_NCCModel extends BaseModel {
	Id_NCC: number = 0;
	Id_MucQua: number = 0;
	Id_DotTangQua: number = 0;
	HoTen: string = '';
	MucQua: string = '';
	Id = 0;
}