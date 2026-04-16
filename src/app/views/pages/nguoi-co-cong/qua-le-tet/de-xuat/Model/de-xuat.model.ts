import { BaseModel } from "../../../../../../core/_base/crud";

export class DeXuatModel extends BaseModel {
	Id: number;
	Id_DotTangQua: number;
	Status: number;
	strStatus: string
	NCCs: any[];
	Details: any[];
	DoiTuongGiam: any[];

	//???
	AllowEdit: boolean;
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;

	clear() {
		this.Id_DotTangQua = null;
		this.Status = 0;
		this.strStatus = '';

		this.Id = 0;
	}
}

export class DeXuat_NCCModel extends BaseModel {
	Id_NCC: number;
	Id_MucQua: number;
	Id_DotTangQua: number;

	HoTen: string;
	MucQua: string;

	Id = 0;

}

