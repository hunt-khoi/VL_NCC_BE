import { BaseModel } from '../../../../../../core/_base/crud';

export class loaiGiayToModel extends BaseModel {
    Id: number;
    LoaiGiayTo: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    Keys_ID: number;

    clear (){
        this.Id = 0;
        this.LoaiGiayTo = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 1;
        this.Keys_ID = null;
    }
}
