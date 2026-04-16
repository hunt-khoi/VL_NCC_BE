import { NumberValueAccessor } from '@angular/forms';
import { BaseModel } from './../../../../../../core/_base/crud/models/_base.model';

export class TongHopModel extends BaseModel {
	Id_DonVi: number;
	TenDonVi: string;
	ChuaHoTro: CTHoTro;
	DangHoTro: CTHoTro;
	DaHoTro: CTHoTro;
	clear() {
		this.Id_DonVi= 0;
		this.TenDonVi = "";
		this.ChuaHoTro = new CTHoTro().empty();
		this.DangHoTro = new CTHoTro().empty();
		this.DaHoTro = new CTHoTro().empty();
	}
}

export class CTHoTro extends BaseModel {
	SoLuong: number;
	SoTienYC: number;
	SoTienDaHoTro: number;

	clear() {
		this.SoLuong = 0;
		this.SoTienDaHoTro = 0;
		this.SoTienYC = 0;
	}

	empty(): CTHoTro{
		let t = new CTHoTro();
		t.SoLuong = 0;
		t.SoTienDaHoTro = 0;
		t.SoTienYC = 0;
		return t;
	}
}
export class dataChiTiet extends BaseModel {
	Id: number;
	DoiTuong: string;
	SoLuong: number;

	clear() {
		this.Id = 0;
		this.DoiTuong = '';
		this.SoLuong = 0;
	}

}
