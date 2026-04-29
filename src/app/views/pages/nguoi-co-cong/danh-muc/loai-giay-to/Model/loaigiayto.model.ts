import { BaseModel } from '../../../../../../core/_base/crud';

export class loaiGiayToModel extends BaseModel {
    Id: number = 0;
    LoaiGiayTo: string = '';
    MoTa: string = '';
    Locked: boolean = false;
    Priority: number = 1;
    Keys_ID: number | null = null;

    clear() { 
        this.Id = 0;
        this.LoaiGiayTo = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 1;
        this.Keys_ID = null;
    }
}