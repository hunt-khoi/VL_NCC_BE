import { BaseModel } from '../../../../../../core/_base/crud';

export class DoiTuongNguoiCoCongModel extends BaseModel {
	Id: number = 0;
	DoiTuong: string = '';
	MaDoiTuong: string = '';
	MoTa: string = '';
	Locked: boolean = false;
	Id_LoaiQuyetDinh: number | null = null;
	Priority: number = 0;
	CreatedBy: string = '';
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	Loai: number = 0;
	NhomLoaiDoiTuongNCC: string = '';
	UpdatedDate: string = '';
	IsThanNhan: boolean = false;

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
	Id: number = 0;
	DoiTuong: string = '';
	MaDoiTuong: string = '';
	MoTa: string = '';
	Locked: boolean = false;
	Priority: number = 0;
	CreatedBy: string = '';
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';

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
	Id: number = 0;
	DoiTuong: string = '';
	MaDoiTuong: string = '';
	Type: number = 0;
	MoTa: string = '';
	Locked: boolean = false;
	Priority: number = 0;
	CreatedBy: string = '';
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';

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
	Id: number = 0;
	DoiTuong: string = '';
	MaDoiTuong: string = '';
	MoTa: string = '';
	Locked: boolean = false;
	Priority: number = 0;
	CreatedBy: string = '';
	CreatedDate: string = '';
	UpdatedBy: number = 0;
	UpdatedDate: string = '';
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