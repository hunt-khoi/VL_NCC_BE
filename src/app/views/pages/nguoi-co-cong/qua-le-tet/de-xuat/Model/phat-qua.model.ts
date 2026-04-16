import { BaseModel } from "../../../../../../core/_base/crud";

export class PhatQuaModel extends BaseModel {
	Id_DeXuat: number;
	Id: number;
	Nam: number;
	Id_DeXuatTangQua_Detail: number;
	SoPhieu: string
    NguoiNhan:string;
    ThoiGianNhan:string;
    
	clear() {
		this.Nam = 0;
		this.Id_DeXuatTangQua_Detail = 0;
		this.SoPhieu = '';
		this.SoPhieu = '';
	}
}


// public long Id { get; set; }
//         public long? Nam { get; set; }
//         public long Id_DeXuatTangQua_Detail { get; set; }
//         public string SoPhieu { get; set; }
//         public string NguoiNhan { get; set; }
