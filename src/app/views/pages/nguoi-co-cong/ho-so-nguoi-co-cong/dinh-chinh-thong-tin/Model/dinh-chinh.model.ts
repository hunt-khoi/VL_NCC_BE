import { List } from 'lodash';
import { BaseModel } from '../../../../../../core/_base/crud';
import { GiayToModel } from '../../giay-to/Model/giay-to.model';

export class DinhChinhModel extends BaseModel {
    Id: number = 0;
    ID_NCC: number = 0;
	IsDuyet: boolean = false;
	GhiChu: string = "";
    IsThanNhan: boolean = false;
    ListColumn: List<ListInfoChangelModel> = [];
	GiayTo: List<GiayToModel> | null = [];

    clear() {
        this.Id = 0;
		this.ID_NCC = 0;
		this.GiayTo = [];
		this.GhiChu = "";
        this.IsThanNhan = false;
    }
}

export class FileUploadModel extends BaseModel {
    IdRow: number = 0;
    strBase64: string = "";
    filename: string = "";
    src: string = "";
    Type: number = 0;
    size: number = 0;

    clear() {
        this.IdRow = 0;
        this.strBase64 = '';
        this.filename = '';
        this.src = '';
        this.size = 0;
    }
}
export class ListInfoChangelModel extends BaseModel {
    Id: number = 0;
    Id_DinhChinh: number = 0;
    ColumnName: string = "";
    GiaTriCu: string = "";
    GiaTriMoi: any = "";
    Type: number = 0;

    clear() {
        this.Id = 0;
        this.Id_DinhChinh = 0;
        this.ColumnName = '';
        this.GiaTriCu = '';
        this.GiaTriMoi = '';
    }
}