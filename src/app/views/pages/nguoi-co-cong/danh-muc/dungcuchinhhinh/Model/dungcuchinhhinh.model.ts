import { DatetimePickerComponent } from 'dps-lib';
import { stringify } from 'querystring';
import { BaseModel } from "../../../../../../core/_base/crud";

export class dungcuchinhhinhModel extends BaseModel {
    Id: number;
    DungCu: string;
    MaDungCu: string;
    MoTa: string;
    Locked: boolean;
    Priority: number;
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;
    IsVatPhamPhu: boolean;
    Id_Child: number;

	clear() {
        this.DungCu = '';
        this.MaDungCu = '';
		this.MoTa = '';
		this.Locked = true;
        this.Priority = 1;
        this.CreatedBy = 0;
        this.CreatedDate = '';
        this.UpdatedBy = 0;
        this.UpdatedDate = '';

        this.IsVatPhamPhu = false;
        this.Id_Child = 0;

        this.Id = 0;
	}
}

export class TriGiaDungCuModel extends BaseModel { 
    Id: number
    Id_DungCu: number;
    ThoiGian: string;
    TriGia: number;
    NienHan: number;
    MoTa: string;

    clear() {
        this.ThoiGian = '';
        this.TriGia = 0;
        this.NienHan = 0;

        this.Id = 0;
        this.Id_DungCu = 0;
        this.MoTa = '';
    }

}
