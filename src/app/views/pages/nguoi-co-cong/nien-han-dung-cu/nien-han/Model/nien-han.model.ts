import { BaseModel } from "../../../../../../core/_base/crud";

export class NienHanModel extends BaseModel {
	Id: number;
	Id_Dot: number;
	Status: number;
	strStatus: string
	NCCs: any[];
	Details: any[];
	DoiTuongGiam: any[];
	Id_Parent: number;
	LyDo: string;
	Nam: number;
	SLGiao: number;
	SLNhap: number;

	AllowEdit: boolean;
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;

	clear() {
		this.Id_Dot = null;
		this.Status = 0;
		this.strStatus = '';

		this.Id = 0;
		this.Id_Parent = null;
	}
}