import { BaseModel } from '../../../../../../core/_base/crud';

export class loaiDieuDuongModel extends BaseModel {
    Id: number = 0;
    LoaiDieuDuong: string = '';
    MoTa: string = '';
    Locked: boolean = false;
    Priority: number = 1;

    clear (){
        this.Id = 0;
        this.LoaiDieuDuong = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 1;
    }
}