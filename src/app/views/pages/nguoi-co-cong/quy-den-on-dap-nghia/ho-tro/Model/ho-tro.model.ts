import { BaseModel } from "../../../../../../core/_base/crud";

export class HoTroModel extends BaseModel {
	Id: number;
	Status: number;
	TenDanhSach: string
	strStatus: string
	NCCs: any[];
	LyDo: string
	Nam: number

	AllowEdit: boolean;
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;

	clear() {
		this.Id = 0;
		this.Status = 0;
		this.strStatus = '';
		this.TenDanhSach = '';
	}
}