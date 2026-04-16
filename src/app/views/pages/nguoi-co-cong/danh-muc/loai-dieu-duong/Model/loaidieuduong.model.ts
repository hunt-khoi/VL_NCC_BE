import { BaseModel } from '../../../../../../core/_base/crud';

export class loaiDieuDuongModel extends BaseModel {
    Id: number;
    LoaiDieuDuong: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    clear (){
        this.Id = 0;
        this.LoaiDieuDuong = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 1;
    }
}
