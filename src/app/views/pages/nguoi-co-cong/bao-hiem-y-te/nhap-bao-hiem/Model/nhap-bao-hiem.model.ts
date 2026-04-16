import { BaseModel } from "../../../../../../core/_base/crud";

export class BaoHiemYTModel extends BaseModel {
	Id: number;
	Status: number;
	strStatus: string
	NCCs: any[];
	Details: any[];
	DoiTuongGiam: any[];
	TenDanhSach: string;
	ThangNhap: string; //dùng cho xem chi tiêt

	AllowEdit: boolean;
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;

	clear() {
		this.Status = 0;
		this.strStatus = '';
		this.Id = 0;
		this.TenDanhSach = '';
	}
}