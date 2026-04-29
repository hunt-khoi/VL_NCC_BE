import { BaseModel } from "../../../../../../core/_base/crud";

export class cachNhapModel extends BaseModel {
    Id: number = 0;
    CachNhap: string = '';

	clear() {
        this.CachNhap = '';
        this.Id = 0;
	}
}