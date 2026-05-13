import { BaseModel } from "../../../../../../core/_base/crud";

export class PhatQuaModel extends BaseModel {
	Id_DeXuat: number = 0;
	Id: number = 0;
	Nam: number = 0;
	Id_DeXuatTangQua_Detail: number = 0;
	SoPhieu: string = '';
    NguoiNhan: string = '';
    ThoiGianNhan: string = '';
    
	clear() {
		this.Nam = 0;
		this.Id_DeXuatTangQua_Detail = 0;
		this.SoPhieu = '';
		this.NguoiNhan = '';
		this.ThoiGianNhan = '';
	}
}