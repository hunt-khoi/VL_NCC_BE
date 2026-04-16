import { BaseModel } from '../../../../../../core/_base/crud';

export class districtModel extends BaseModel {
	Id_row: number;
	ProvinceID: string;
	DistrictName: string;
	ProvinceName: string;
	DateCreated: Date;
	LastModified: Date;
	Note: string;
	clear() {
		this.Id_row = 0;
		this.DistrictName = '';
		this.ProvinceID = '';
		this.Note = '';
	}
}
export class provincesModel extends BaseModel {
	Id_row: number;
	ProvinceName: string;
	clear() {
		this.Id_row = 0;
		this.ProvinceName = '';
	}
}

export class wardModel extends BaseModel {
	RowID: number;
	ProvinceID: string;
	DistrictID: string;
	WardName: string;
	ProvinceName: string;
	CreatedDate: Date;
	LastModified: Date;
	Note: string;
	clear() {
		this.RowID = 0;
		this.WardName = '';
		this.ProvinceID = '';
		this.DistrictID = '';
		this.Note = '';
	}
}
