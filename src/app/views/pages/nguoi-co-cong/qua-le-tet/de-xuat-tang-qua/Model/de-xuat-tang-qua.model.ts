import { BaseModel } from "../../../../../../core/_base/crud";

export class DotTangQuaModel extends BaseModel {
	Id: number;
	Id_NhomLeTet: number;
	Id_DotTangQua: number;
	DotTangQua: string;
	NCCs: any[];
	MoTa: string;
	Nam: number;

	AllowEdit: boolean;
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
}

export class DeXuat_NCCModel extends BaseModel {
	Id: number;

	Id_DeXuat: number
	Id_NCC: number
}

