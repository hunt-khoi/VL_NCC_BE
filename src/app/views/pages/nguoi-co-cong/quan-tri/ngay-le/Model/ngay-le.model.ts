import { BaseModel } from '../../../../../../core/_base/crud';

export class HolidaysModel extends BaseModel {
	Id_row: number = 0;
	Title: string = "";
	Ngay: string = "";
	GhiChu: string = "";

	clear() {
		this.Id_row = 0;
		this.Title = '';
		this.Ngay = '';
		this.GhiChu = '';
	}
}