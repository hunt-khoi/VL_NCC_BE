import { GiayToModel } from './../../giay-to/Model/giay-to.model';
import { List } from 'lodash';
import { BaseModel } from '../../../../../../core/_base/crud';

export class DinhChinhModel extends BaseModel {
    ListColumn: List<ListInfoChangelModel>;
    Id: number;
    ID_NCC: number;
	IsDuyet: boolean;
	GhiChu: string;
    IsThanNhan: boolean
	GiayTo: Array<GiayToModel> = [];
    clear() {
        this.Id = 0;
		this.ID_NCC = 0;
		this.GiayTo = [];
		this.GhiChu = "";
        this.IsThanNhan = false;
    }
}
export class FileUploadModel extends BaseModel {
    IdRow: number;
    strBase64: string;
    filename: string;
    src: string;
    Type: number;
    size: number;
    clear() {
        this.IdRow = 0;
        this.strBase64 = '';
        this.filename = '';
        this.src = '';
        this.size = 0;
    }
}
export class ListInfoChangelModel extends BaseModel {
    Id: number;
    Id_DinhChinh: number;
    ColumnName: string;
    GiaTriCu: string;
    GiaTriMoi: any;
    Type: number;
    clear() {
        this.Id = 0;
        this.Id_DinhChinh = 0;
        this.ColumnName = '';
        this.GiaTriCu = '';
        this.GiaTriMoi = '';
    }
}

