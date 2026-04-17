import { BaseModel } from 'app/core/_base/crud';

export class NhapQuyTrinhDuyetModel extends BaseModel {
	ID_QuyTrinh: number = 0;
	Loai: number | null = null;
	TenQuyTrinh: string = '';
	MoTa: string = '';
	ID_NhanMailKhiDuyetDon: string = '';
	ID_NhanMailKhiKhongDuyetDon: string = '';
	ID_NhanMailKhiKhongTimThayNguoiDuyetDon: string = '';
	data_NhanMailKhiDuyetDon: any[] = [];
	data_NhanMailKhiKhongDuyetDon: any[] = [];
	data_NhanMailKhiKhongTimThayNguoiDuyetDon: any[] = [];
	VisibleQTD: boolean = false;
	ProcessMethod: string = '';
	ProcessMethodLoai: number = 0;
	AllowDevChecker: boolean = false;
	IdCapquanly: number | null = null;
	IdChucdanh: number | null = null;
	Code: string = '';
	StructureID : number | null = null;
	Permission_CodeGroup : string | null = null;
	ID_ChucVu : number | null = null;

	clear() {
		this.ID_QuyTrinh = 0;
		this.Loai = null;
		this.TenQuyTrinh = '';
		this.MoTa = '';
		this.ID_NhanMailKhiDuyetDon = '';
		this.ID_NhanMailKhiKhongDuyetDon = '';
		this.ID_NhanMailKhiKhongTimThayNguoiDuyetDon = '';
		this.ProcessMethod = '';
		this.ProcessMethodLoai = 0;
		this.AllowDevChecker = false;
		this.IdCapquanly = null;
		this.IdChucdanh = null;
		this.Code = '';
		this.StructureID = null;
		this.Permission_CodeGroup = null;
		this.ID_ChucVu = null;
	}
}

export class NhapCapQuanLyDuyetModel extends BaseModel {
	ID_QuyTrinh: number = 0;
	TenQuyTrinh: string = "";
	ID_CapQuanLy: number = 0;
	SoNgayXuLy: number = 0;
	TenCapDuyet: string = "";
	ID_CapDuyet: number = 0;
	StructureID: number = 0;
	ID_ChucDanh: number = 0;
	ID_ChucVu: number = 0;
	Permission_CodeGroup: string = "";
	Permission_Code: string = "";
	Permission_Name: string = "";
	TenChucVu: string = "";
	GhiChu: string = "";
	ID_NguoiNhanMail: string = "";
	ID_CapDuyetLonNhat: number = 0;
	ViTri: number = 0;
	data_NguoiNhanMail: any[] = [];
	VisibleCQL: boolean = false;
	Processmethod: string = "";
	ProcessmethodLoai: number = 0;
	AllowDevChecker: boolean = false;
	ID_Back: number = 0;
	Icon: string = "";
	DuyetSS: boolean = false;

	clear() {
		this.ID_QuyTrinh = 0;
		this.TenQuyTrinh = '';
		this.ID_CapQuanLy = 0;
		this.TenCapDuyet = '';
		this.ID_CapDuyet = 0;
		this.StructureID = 0;
		this.ID_ChucDanh = 0;
		this.ID_ChucVu = 0;
		this.TenChucVu = '';
		this.Permission_CodeGroup = '';
		this.Permission_Code = '';
		this.Permission_Name = '';
		this.GhiChu = '';
		this.ID_NguoiNhanMail = '';
		this.ID_CapDuyetLonNhat = 0;
		this.ViTri = 0;
		this.data_NguoiNhanMail = [];
		this.Processmethod = '';
		this.ProcessmethodLoai = 0;
		this.AllowDevChecker = false;
		this.ID_Back = 0;
		this.Icon = '';
		this.DuyetSS = false;
	}
}
export class PriorityAddData extends BaseModel {
	ID_CapQuanLy: number = 0;
	ViTri: number = 0;
	ID_Back: number = 0;

	clear() {
		this.ID_CapQuanLy = 0;
		this.ViTri = 0;
		this.ID_Back = 0;
	}
}