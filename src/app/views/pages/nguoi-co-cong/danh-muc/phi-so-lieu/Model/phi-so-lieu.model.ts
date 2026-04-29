import { BaseModel } from '../../../../../../core/_base/crud';

export class PhiSoLieuModel extends BaseModel {
    Id: number = 0;
    PhiSoLieu: string = "";
    MoTa: string = "";
    Locked: boolean = false;
    Priority: number = 0;
	Id_Filter: number = 0;

    clear (){
        this.Id = 0;
        this.PhiSoLieu = '';
        this.MoTa = '';
        this.Locked = false;
        this.Priority = 0;
		this.Id_Filter = 0;
    }
}