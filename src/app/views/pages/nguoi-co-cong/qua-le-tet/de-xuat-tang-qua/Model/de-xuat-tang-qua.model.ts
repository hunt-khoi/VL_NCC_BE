import { BaseModel } from "../../../../../../core/_base/crud";

export class DotTangQuaModel extends BaseModel {
	Id: number = 0;
	Id_NhomLeTet: number = 0;
	Id_DotTangQua: number = 0;
	DotTangQua: string = '';
	NCCs: any[] = [];
	MoTa: string = '';
	Nam: number = 0;

	AllowEdit: boolean = false;
	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;
}

export class DeXuat_NCCModel extends BaseModel {
	Id: number = 0;
	Id_DeXuat: number = 0;
	Id_NCC: number = 0;
}