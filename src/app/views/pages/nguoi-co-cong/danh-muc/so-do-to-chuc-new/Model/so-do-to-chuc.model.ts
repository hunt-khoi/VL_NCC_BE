import { BaseModel } from "../../../../../../core/_base/crud";

export class OrgChartModel extends BaseModel {
	ID_PhongBan: string = '0';
	ID_ChucDanh: string = '0';
	ViTri: number = 0;
	ID: string = '0';
	drop_idfrom: string = '0';
	drop_id_parent: string = '0';
	drop_namefrom: string = '';
	drop_idto: string = '';
	drop_levelto: string = '';
	drop_nameto: string = '';
	drop_childrensto: string = '';
	StructureID: string = '';
	Id_parent: string = '';
	chucdanhParent: string = '';
	IsAbove: boolean = false;

	clear() {
		this.ID_PhongBan = '0';
		this.ID_ChucDanh = '0';
		this.ViTri = 0;
		this.StructureID = '0';
		this.Id_parent = '0';
		this.chucdanhParent = '';
		this.IsAbove = false;
	}
}

export class UpdateThongTinChucVuModel extends BaseModel {
	MaCD: string = '';
	SoNhanVien: string = '';
	ViTri: string = '';
	ID_ChucVu: string = '';
	ID_ChucDanh: string = '';
	TenChucVu: string = '';
	TenTiengAnh: string = '';
	ID_DonVi: string = '';
	ID_PhongBan: string = '';
	ID_Cap: number = 0;
	HienThiDonVi: boolean = false;
	DungChuyenCap: boolean = false;
	HienThiCap: boolean = false;
	HienThiPhongBan: boolean = false;
	ID: number = 0;
	ID_Parent: number = 0;
	StructureID: string = '';
	HienThiID: boolean = false;

	clear() {
		this.MaCD = '';
		this.SoNhanVien = '';
		this.ViTri = '';
		this.ID_ChucVu = '';
		this.ID_ChucDanh = '';
		this.TenChucVu = '';
		this.TenTiengAnh = '';
		this.ID_DonVi = '';
		this.ID_PhongBan = '';
		this.ID_Cap = 0;
		this.HienThiDonVi = false;
		this.DungChuyenCap = false;
		this.HienThiCap = false
		this.HienThiPhongBan = false;
		this.ID = 0;
		this.ID_Parent = 0;
		this.StructureID = '';
		this.HienThiID = false;
	}
}

export class ChartStaffModel {
	id_nv: string = '';
	id_chucdanhmoi: string = '';

}