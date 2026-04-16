import { BaseModel } from '../../../../../../core/_base/crud';

export class dvDongGopModel extends BaseModel {
    Id: number;
    HoTen: string;
    DiaChi: string;
    GhiChu: string;
    isError: boolean;
    massage: string;
    clear (){
        this.Id = 0;
        this.HoTen = '';
        this.GhiChu = '';
        // this.isError = false;
        this.DiaChi = '';
        // this.massage = '';
    }
}
