import { BaseModel } from '../../../../../../core/_base/crud';

export class PhiSoLieuModel extends BaseModel {
    Id: number;
    PhiSoLieu: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
	Id_Filter: number;
    clear (){
        this.Id = 0;
        this.PhiSoLieu = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 0;
		this.Id_Filter = 0;
    }
}
