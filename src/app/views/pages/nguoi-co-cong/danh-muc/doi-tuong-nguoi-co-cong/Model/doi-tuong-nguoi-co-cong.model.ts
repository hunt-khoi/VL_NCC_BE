import { BaseModel } from '../../../../../../core/_base/crud';

export class DoiTuongNguoiCoCongModel extends BaseModel {
	Id: number;
	DoiTuong: string;
	MaDoiTuong: string;
	MoTa: string;
	Locked: boolean;
	Id_LoaiQuyetDinh: number;
	Priority: number;
	CreatedBy: string;
	CreatedDate: string;
	UpdatedBy: number;
	Loai: number;
	NhomLoaiDoiTuongNCC: string;
	UpdatedDate: string;
	IsThanNhan: boolean;
	clear() {
		this.Id = 0;
		this.DoiTuong = '';
		this.MaDoiTuong = '';
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
		this.Id_LoaiQuyetDinh = null;
		this.CreatedBy = '';
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.Loai = 0;
		this.NhomLoaiDoiTuongNCC = '';
		this.UpdatedDate = '';
		this.IsThanNhan = false;
	}
}


export class DoiTuongNhanQuaModel extends BaseModel {
	Id: number;
	DoiTuong: string;
	MaDoiTuong: string;
	MoTa: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: string;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;
	clear() {
		this.Id = 0;
		this.DoiTuong = '';
		this.MaDoiTuong = '';
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
		this.CreatedBy = '';
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.UpdatedDate = '';
	}
}

export class DoiTuongBHYTModel extends BaseModel {
	Id: number;
	DoiTuong: string;
	MaDoiTuong: string;
	Type: number;
	MoTa: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: string;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;
	clear() {
		this.Id = 0;
		this.DoiTuong = '';
		this.MaDoiTuong = '';
		this.Type = 1;
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
		this.CreatedBy = '';
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.UpdatedDate = '';
	}
}

export class DoiTuongDCCHModel extends BaseModel {
	Id: number;
	DoiTuong: string;
	MaDoiTuong: string;
	MoTa: string;
	Locked: boolean;
	Priority: number;
	CreatedBy: string;
	CreatedDate: string;
	UpdatedBy: number;
	UpdatedDate: string;
	DungCuCHs: any;

	clear() {
		this.Id = 0;
		this.DoiTuong = '';
		this.MaDoiTuong = '';
		this.MoTa = '';
		this.Locked = false;
		this.Priority = 1;
		this.CreatedBy = '';
		this.CreatedDate = '';
		this.UpdatedBy = 0;
		this.UpdatedDate = '';
		this.DungCuCHs = [];
	}
}
