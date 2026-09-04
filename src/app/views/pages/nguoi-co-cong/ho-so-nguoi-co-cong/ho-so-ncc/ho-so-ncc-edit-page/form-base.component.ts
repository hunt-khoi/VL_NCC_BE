import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';
import moment from 'moment';

@Component({
	selector: 'kt-form-base',
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBaseComponent {
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	filterKhom: string = '';

	lstTC: any[] = [];
	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listAllLoaiHS: any = [];
	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listLoaiHS: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	listquanhevoilietsy: any[] = [];
	listthannhan: any[] = [];
	filterthannhan = '';
	listKhomAp: any[] = [];
	listDanToc: any[] = [];
	listTonGiao: any[] = [];
	GiayTos: any[] = [];
	thannhanName = '';
	quanhe: number = 0;
	thannhanName2 = '';
	quanhe2: number = 0;
	require = '';
	require2 = '';
	objectThanNhan: any;
	IsThanNhan: boolean = false;
	Capcocau: number = 0;

	//di chuyển
	listTinh: any[] = [];
	listHuyen: any[] = [];
	listXa: any[] = [];
	isChuyenDi: boolean = false;
	selectedTab: number = 0;

	AllLoaiTroCap: any[] = [];
	listLoaiTroCap: any[] = [];

	Id_LoaiHoSo: number = 0;
	isBangTQ: boolean = false;
	_NAME = 'Hồ sơ người có công';

	disabledBtn = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	allowEdit: boolean = true;
	nhapTC: boolean = true;
	item: HoSoNCCModel = new HoSoNCCModel();
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	data: any;

	constructor(public commonService: CommonService,
		public layoutUtilsService: LayoutUtilsService,
		public changeDetectorRefs: ChangeDetectorRef) { }

	createForm() { }

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	buildBaseForm(item: HoSoNCCModel): any {
		let ng = item.Id > 0 ? moment(item.NgayGui) : new Date();
		return {
			NgayGui: [ng, Validators.required],
			SoHoSo: [item.SoHoSo],
			HoTen: [item.HoTen, Validators.required],
			DiaChi: [item.DiaChi],
			SDT: [item.SDT, [Validators.pattern(this.commonService.ValidateFormatRegex('phone')), Validators.maxLength(11)]],
			Email: [item.Email, [Validators.email]],
			NgaySinh: [item.NgaySinh],
			NamSinh: [item.NamSinh],
			GioiTinh: [item.GioiTinh, Validators.required],
			Province: [item.ProvinceID, Validators.required],
			District: [item.DistrictID, Validators.required],
			Id_Xa: [item.Id_Xa, Validators.required],
			Id_KhomAp: [item.Id_KhomAp, Validators.required],
			DanToc: [item.Id_DanToc == null ? 0 : item.Id_DanToc],
			TonGiao: [item.Id_TonGiao == null ? 0 : item.Id_TonGiao],
			IdThanNhan: [item.Id_ThanNhan],
			Id_DoiTuongNCC: [item.Id_DoiTuongNCC, Validators.required],
			Id_LoaiHoSo: [item.Id_LoaiHoSo, Validators.required],
			//#region thông tin thân nhân
			NguoiThoCungLietSy: [item.NguoiThoCungLietSy],
			QuanHeVoiLietSy: [item.QuanHeVoiLietSy],
			NguyenQuan1: [item.NguyenQuan1],
			TruQuan1: [item.TruQuan1],
			NgaySinh1: [item.NgaySinh1],
			NamSinh1: [item.NamSinh1],
			GioiTinh1: [item.GioiTinh1],
			IsChet1: [item.IsChet1],
			NgayChet1: [item.NgayChet1],
			SoKhaiTu1: [item.SoKhaiTu1],
			NgayKhaiTu1: [item.NgayKhaiTu1],
			NoiKhaiTu1: [item.NoiKhaiTu1],
			SoHoSo1: [],
			//#endregion
			BiDanh: [item.BiDanh],
			NguyenQuan: [item.NguyenQuan],
			TruQuan: [item.TruQuan],
			NgayNhapNgu: [item.NgayNhapNgu],
			NgayXuatNgu: [item.NgayXuatNgu],
			NoiCongTac: [item.NoiCongTac],
			CapBac: [item.CapBac],
			ChucVu: [item.ChucVu],
			Ngay_: [item.Ngay_],
			TruongHop_: [item.TruongHop_],
			Noi_: [item.Noi_],
			Mo: [item.Mo == null ? 0 : item.Mo],
			TiLe: [item.TiLe],
			fileDinhKem: [item.FileDinhKem ? [item.FileDinhKem] : null],
			IsChet: [true],
			NgayChet: [item.NgayChet],
			NgayKhaiTu: [item.NgayKhaiTu],
			//#region 9. bằng tổ quốc ghi công
			GiayTo9: [],
			So9: [],
			NgayCap9: [],
			NoiCap9: [],
			//#endregion
			//#region 1. giấy báo tử
			GiayTo1: [],
			So1: [],
			NgayCap1: [],
			NoiCap1: [],
			//#endregion
		};
	}

	changeNS(isNam = false) {
		if (isNam) {
			this.itemForm.controls.NgaySinh.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh.value;
			if (val) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh.setValue(y);
			}
		}
	}

	changeNS1(isNam = false) {
		if (isNam) {
			this.itemForm.controls.NgaySinh1.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh1.value;
			if (val) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh1.setValue(y);
			}
		}
	}

	changeDC(name: string) {
		let _name = name;
		if (name == 'TruQuan') _name = 'DiaChi';
		let dc = this.itemForm.controls[name].value;
		if (_name == 'NguyenQuan')
			this.itemForm.controls["NguyenQuan1"].setValue(dc);
		if (_name == 'DiaChi')
			this.itemForm.controls["TruQuan1"].setValue(dc);
	}

	fillNguyenTruQuan(cap: number) {
		let val = this.findNguyenTruQuan(cap, this.filterKhom);
		this.itemForm.controls["NguyenQuan"].setValue(val);
		this.itemForm.controls["TruQuan"].setValue(val);
		this.itemForm.controls["NguyenQuan1"].setValue(val);
		this.itemForm.controls["TruQuan1"].setValue(val);
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	getInstanceNew($event: any, index: number) {
		this.lstTC[index] = $event;
	}

	changeDoiTuongNCC(value: any) {
		var f = this.listOpt.find(x => x.id == value);
		if (f) {
			this.IsThanNhan = f.data.IsThanNhan;
			this.changeDetectorRefs.detectChanges();
		}
		for (var i = 0; i < this.lstTC.length; i++) {
			if (this.lstTC[i].cmpRef && !this.lstTC[i].cmpRef.hostView.destroyed) {
				this.lstTC[i].LoadListLoaiTroCap(value);
			}
		}
	}

	changeLoaiHS(value: any) {
		let xa = "";
		const form = this.itemForm;
		if (form.controls["Id_Xa"] && form.controls["Id_Xa"].value) {
			let fx = this.listward.find(x => x.ID_Row == form.controls["Id_Xa"].value);
			if (fx)
				xa = this.firstLowerCase(fx.Ward);
		}
		this.Id_LoaiHoSo = +value;
		var f = this.listOpt1.find(x => x.id == value);
		if (f) {
			this.GiayTos = f.data.GiayTos.map((x: any) => { return { Id_LoaiGiayTo: x.id, GiayTo: x.title, IsRequired: x.IsRequired, NoiCap: xa } });
			var k = this.GiayTos.find(x => x.Id_LoaiGiayTo == 9) //bằng tổ quốc ghi công
			if (k) this.isBangTQ = true;
			this.GiayTos = this.GiayTos.filter(x => x.Id_LoaiGiayTo != 9)
			this.changeDetectorRefs.detectChanges();
		}
	}

	firstLowerCase(str: string) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	prepareCustomer(itemForm: any, id: number, id_ncc: number): HoSoNCCModel | null {
		const controls = itemForm.controls;
		const item = new HoSoNCCModel();
		item.Id = +id;
		this.extractCoBan(item, controls);
		if (id == 0) {
			if (!this.extractThanNhan(item, controls, id_ncc)) return null;
			if (!this.extractThanNhanDaMat(item, itemForm, controls, id_ncc)) return null;
		}
		this.extractMoRong(item, itemForm, controls);
		if (!this.extractGiayTo(item, controls)) return null;
		return item;
	}

	private extractCoBan(item: HoSoNCCModel, controls: any): void {
		item.NgayGui = moment(controls.NgayGui.value).format("YYYY-MM-DDTHH:mm:ss.0000000");
		item.HoTen = controls.HoTen.value;
		item.BiDanh = controls.BiDanh.value;
		item.SoHoSo = controls.SoHoSo.value;
		item.GioiTinh = +controls.GioiTinh.value;
		item.DiaChi = controls.DiaChi.value;
		item.SDT = controls.SDT.value;
		item.Email = controls.Email.value;
		item.Id_Xa = +controls.Id_Xa.value;
		item.Id_KhomAp = +controls.Id_KhomAp.value;
		item.Id_DoiTuongNCC = +controls.Id_DoiTuongNCC.value;
		item.Id_LoaiHoSo = +controls.Id_LoaiHoSo.value;
		item.QuanHeVoiLietSy = 0;
		item.NamSinh = +controls.NamSinh.value;
		item.NguyenQuan = controls.NguyenQuan.value;
		item.TruQuan = controls.TruQuan.value;
		if (controls.DanToc.value > 0) item.Id_DanToc = controls.DanToc.value;
		if (controls.TonGiao.value > 0) item.Id_TonGiao = controls.TonGiao.value;
		item.NoiCongTac = controls.NoiCongTac.value;
		item.CapBac = controls.CapBac.value;
		item.ChucVu = controls.ChucVu.value;
		item.TruongHop_ = controls.TruongHop_.value;
		item.Noi_ = controls.Noi_.value;
		if (controls.fileDinhKem && controls.fileDinhKem.value && controls.fileDinhKem.value.length > 0)
			item.FileDinhKem = controls.fileDinhKem.value[0];
		item.Mo = controls.Mo.value;
		item.TiLe = controls.TiLe.value;
	}
	private extractThanNhan(item: HoSoNCCModel, controls: any, id_ncc: number): boolean {
		item.Id_ThanNhan = 0;
		if (controls.NguoiThoCungLietSy && controls.NguoiThoCungLietSy.value) {
			if (controls.QuanHeVoiLietSy && controls.QuanHeVoiLietSy.value) {
				item.ThanNhanModel = this.prepareThanNhan(controls, id_ncc);
			} else {
				this.layoutUtilsService.showInfo("Vui lòng chọn quan hệ với đối tượng");
				return false;
			}
		}
		return true;
	}
	private extractThanNhanDaMat(item: HoSoNCCModel, itemForm: any, controls: any, id_ncc: number): boolean {
		if (this.checkForm(itemForm, 'HoTenTN') && this.checkForm(itemForm, 'QuanHeVoiLietSy2')) {
			item.Id_ThanNhan = 0;
			if (controls.HoTenTN.value) {
				if (controls.QuanHeVoiLietSy2.value) {
					item.ThanNhanDaMat = this.prepareThanNhanDM(controls, id_ncc);
				} else {
					this.layoutUtilsService.showInfo("Vui lòng chọn quan hệ với đối tượng");
					return false;
				}
			}
		}
		return true;
	}
	private extractMoRong(item: HoSoNCCModel, itemForm: any, controls: any): void {
		if (controls.NgaySinh && controls.NgaySinh.value !== '')
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		if (controls.NgayNhapNgu && controls.NgayNhapNgu.value)
			item.NgayNhapNgu = this.commonService.f_convertDate(controls.NgayNhapNgu.value);
		if (controls.NgayXuatNgu && controls.NgayXuatNgu.value)
			item.NgayXuatNgu = this.commonService.f_convertDate(controls.NgayXuatNgu.value);
		if (controls.Ngay_ && controls.Ngay_.value)
			item.Ngay_ = this.commonService.f_convertDate(controls.Ngay_.value);

		if (this.checkForm(itemForm, 'NgayHS'))
			item.NgayHS = this.commonService.f_convertDate(controls.NgayHS.value);
		if (this.checkForm(itemForm, 'NoiHS'))
			item.NoiHS = controls.NoiHS.value;
		if (this.checkForm(itemForm, 'TinhTrangHT'))
			item.TinhTrangHT = controls.TinhTrangHT.value;
		if (this.checkForm(itemForm, 'GhiChuTruyTang'))
			item.GhiChuTruyTang = controls.GhiChuTruyTang.value;
		if (this.checkForm(itemForm, 'NgayHop'))
			item.NgayHop = this.commonService.f_convertDate(controls.NgayHop.value);
		if (this.checkForm(itemForm, 'GioHop'))
			item.GioHop = controls.GioHop.value;
		if (this.checkForm(itemForm, 'ThanhPhanHop'))
			item.ThanhPhanHop = controls.ThanhPhanHop.value;
		if (this.checkForm(itemForm, 'NoiDungHop'))
			item.NoiDungHop = controls.NoiDungHop.value;
		if (this.checkForm(itemForm, 'CanCuLS'))
			item.CanCuLietSy = controls.CanCuLS.value;
		if (this.checkForm(itemForm, 'LyDoGTYKhoa'))
			item.LyDoGTYKhoa = controls.LyDoYKhoa.value;
		if (this.checkForm(itemForm, 'LyDoTangTuat'))
			item.LyDoTangTuat = controls.LyDoTangTuat.value;
		if (this.checkForm(itemForm, 'XetToTrinh'))
			item.XetToTrinh = controls.XetToTrinh.value;
		if (this.checkForm(itemForm, 'ThoiGianKC'))
			item.TGThamGiaKC = controls.ThoiGianKC.value;
		if (this.checkForm(itemForm, 'BangKhen'))
			item.BangKhenCacCap = controls.BangKhen.value;
		if (this.checkForm(itemForm, 'NoiDungHC'))
			item.ND_HuanChuong = controls.NoiDungHC.value;
		if (this.checkForm(itemForm, 'LyDoTC'))
			item.LyDoThoCung = controls.LyDoTC.value;
		if (this.checkForm(itemForm, 'LyDoDinhChi'))
			item.LyDoDinhChi = controls.LyDoDinhChi.value;
		if (this.checkForm(itemForm, 'LyDoTamDC'))
			item.LyDoTamDC = controls.LyDoTamDC.value;
	}
	private extractGiayTo(item: HoSoNCCModel, controls: any): boolean {
		item.GiayTos = [];
		if (controls.GiayTo9 && controls.GiayTo9.value) {
			if (controls.So9.value && controls.NgayCap9.value)
				item.GiayTos.push(this.prepareGT(controls, 9));
			else {
				this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của bằng tổ quốc ghi công");
				return false;
			}
		}

		item.IsChet = controls.IsChet && controls.IsChet.value;
		if (item.IsChet) {
			if (controls.GiayTo1 && controls.GiayTo1.value) {
				if (controls.So1.value && controls.NgayCap1.value && controls.NoiCap1.value)
					item.GiayTos.push(this.prepareGT(controls, 1));
				else {
					this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy báo tử");
					return false;
				}
			}
			item.HoatDongModel = this.prepareHD(controls);
		}

		for (var i = 0; i < this.GiayTos.length; i++) {
			let gt = this.GiayTos[i];
			if (gt.IsRequired) {
				if (!gt.So || !gt.NgayCap || !gt.NoiCap) {
					this.layoutUtilsService.showInfo("Giấy tờ '" + gt.GiayTo + "' là bắt buộc nhập");
					return false;
				}
				let copy = Object.assign({}, gt);
				if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) {
					copy.FileDinhKem = gt.FileDinhKem[0];
				}
				copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
				item.GiayTos.push(copy);
			} else {
				if ((gt.So && !gt.NgayCap) || (!gt.So && gt.NgayCap)
					|| (gt.NoiCap && (!gt.So || !gt.NgayCap))) {
					this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy tờ");
					return false;
				}
				if (gt.So && gt.NgayCap) {
					let copy = Object.assign({}, gt);
					if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0)
						copy.FileDinhKem = gt.FileDinhKem[0];
					copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
					item.GiayTos.push(copy);
				}
			}
		}
		return true;
	}

	checkForm(itemForm: any, name: string) {
		if (itemForm.contains(name))
			return itemForm.controls[name].value ? true : false;
		return false;
	}

	prepareThanNhan(controls: any, id_ncc: number = 0) {
		let item: any = {};
		item.HoTen = controls.NguoiThoCungLietSy.value;
		item.DiaChi = controls.TruQuan1.value;
		item.SoHoSo = controls.SoHoSo1.value;
		item.NguyenQuan = controls.NguyenQuan1.value;
		item.GioiTinh = controls.GioiTinh1.value;
		item.Id_QHGiaDinh = controls.QuanHeVoiLietSy.value;
		item.IsChet = controls.IsChet1.value == true;
		if (item.IsChet) {
			item.NgayChet = this.commonService.f_convertDate(controls.NgayChet1.value);
			item.SoKhaiTu = controls.SoKhaiTu1.value;
			item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu1.value);
			item.NoiKhaiTu = controls.NoiKhaiTu1.value;
		}
		item.Id_NCC = id_ncc;

		if (controls.NgaySinh1.value !== '') {
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh1.value);
		} else {
			item.NgaySinh = '01/01/0001';
		}
		item.NamSinh = +controls.NamSinh1.value;
		return item;
	}

	prepareThanNhanDM(controls: any, id_ncc: number = 0) {
		let item: any = {};
		item.HoTen = controls.HoTenTN.value;
		item.DiaChi = controls.TruQuan2.value;
		item.SoHoSo = controls.SoHoSo2.value;
		item.NguyenQuan = controls.NguyenQuan2.value;
		item.GioiTinh = controls.GioiTinh2.value;
		item.Id_QHGiaDinh = controls.QuanHeVoiLietSy2.value;
		item.IsChet = controls.IsChet2.value == true;
		if (item.IsChet) {
			item.NgayChet = this.commonService.f_convertDate(controls.NgayChet2.value);
			item.SoKhaiTu = controls.SoKhaiTu2.value;
			item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu2.value);
			item.NoiKhaiTu = controls.NoiKhaiTu2.value;
		}
		item.Id_NCC = id_ncc;

		if (controls.NgaySinh2.value !== '') {
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh2.value);
		} else {
			item.NgaySinh = '01/01/0001';
		}
		item.NamSinh = +controls.NamSinh2.value;
		return item;
	}

	prepareHD(controls: any) {
		const item: any = {};
		if (controls.NgayChet.value)
			item.TuNgay = this.commonService.f_convertDate(controls.NgayChet.value); //ko bị trừ ngày khi save db
		if (controls.NgayKhaiTu.value)
			item.DenNgay = this.commonService.f_convertDate(controls.NgayKhaiTu.value);
		else
			item.DenNgay = null;
		item.IsNghiHuu = false
		item.IsChet = true
		return item;
	}

	prepareDC(controls: any): any {
		const item: any = {};
		item.Id_Tinh = controls.tinhdc.value;
		item.Id_Huyen = controls.huyendc.value;
		item.Id_Xa = controls.xadc.value;
		item.DiaChi = controls.diaChidc.value;
		item.DaGiaiQuyet = controls.DaGiaiQuyet.value;
		item.ChuaGiaiQuyet = controls.ChuaGiaiQuyet.value;
		item.NgayChuyen = controls.NgayChuyen.value;
		item.ThucHien = controls.ThucHien.value;
		item.GiayTo = controls.GiayTo.value;
		item.IsBanChinh = controls.IsBanChinh.value == 1;
		return item;
	}

	prepareGT(controls: any, id: number) {
		const item: any = {};
		item.Id_LoaiGiayTo = id;
		item.So = controls["So" + id].value;
		item.GiayTo = controls["GiayTo" + id].value;
		item.NoiCap = controls["NoiCap" + id].value;
		if (controls["NgayCap" + id].value)
			item.NgayCap = this.commonService.f_convertDate(controls["NgayCap" + id].value);
		else
			item.NgayCap = null;
		return item;
	}

	prepareDinhChinh(controls: any) {
		const item: any = {};
		item.GhiChu = controls.GhiChu_new.value;
		item.ListColumn = [];
		if (controls.HoTen_new.value)
			item.ListColumn.push({
				ColumName: 'hoten',
				GiaTriCu: controls.HoTen.value,
				GiaTriMoi: controls.HoTen_new.value,
				Type: 1
			});
		if (controls.NamSinh_new.value)
			item.ListColumn.push({
				ColumName: 'NamSinh',
				GiaTriCu: controls.NamSinh.value,
				GiaTriMoi: controls.NamSinh_new.value,
				Type: 1
			});
		return item;
	}

	changeThanNhan(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName = this.objectThanNhan.HoTen;
		this.quanhe = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;
	}

	changeThanNhan2(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName2 = this.objectThanNhan.HoTen;
		this.quanhe2 = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;
	}

	changeQuanHeLietSy() {
		if (this.itemForm && this.itemForm.controls && this.itemForm.controls.NguoiThoCungLietSy)
			this.require = '';
		else
			this.require = 'require';
	}

	changeQuanHeLietSy2() {
		if (this.itemForm && this.itemForm.controls && this.itemForm.controls.NguoiThoCungLietSy)
			this.require2 = '';
		else
			this.require2 = 'require';
	}

	//#region di chuyển
	changeTinh(val: any) {
		this.commonService.GetListDistrictByProvinces(val).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeHuyen(val: any) {
		this.commonService.GetListWardByDistrict(val).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	listAp: any[] = [];
	changeXa(val: any) {
		this.commonService.GetListKhomApByWard(val).subscribe(res => {
			this.listAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	//#endregion

	loadProvinces() {
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.listTinh = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadGetListWardByDistrict(idDistrict: any) {
		this.commonService.GetListWardByDistrict(idDistrict).subscribe(res => {
			this.listward = res.data;
			this.listXa = res.data;
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadKhomAp() {
		this.commonService.GetListKhomApByWard(this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadListDanToc() {
		this.commonService.ListDanToc().subscribe(res => {
			this.listDanToc = res.data;
		});
	}

	loadListTonGiao() {
		this.commonService.ListTonGiao().subscribe(res => {
			this.listTonGiao = res.data;
		});
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listquanhevoilietsy = res.data;
		});

	}

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNCC(false, this.Id_LoaiHoSo).subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
		this.commonService.liteConstLoaiHoSo(true).subscribe(res => {
			this.listAllLoaiHS = res.data;
			this.listLoaiHS.next(res.data);
			this.listOpt1 = res.data;
			if (this.item && this.item.Id_LoaiHoSo) {
				this.changeLoaiHS(this.item.Id_LoaiHoSo);
			}
		});
	}

	loadLoaiTC(idsToFilter?: number[]) {
		this.commonService.liteConstLoaiTroCap().subscribe(res => {
			if (res && res.status == 1) {
				this.AllLoaiTroCap = res.data;
				if (idsToFilter && idsToFilter.length > 0) {
					this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => idsToFilter.includes(x.id));
				} else {
					this.listLoaiTroCap = this.AllLoaiTroCap;
				}
			}
			if (typeof (this as any).addTC === 'function') {
				(this as any).addTC();
			}
		});
	}

	loadListThanNhan(thannhanService: any) {
		if (this.item && this.item.Id) {
			const queryParams = new QueryParamsModel({});
			queryParams.filter.Id_NCC = this.item.Id;
			thannhanService.findData(queryParams).subscribe((res: any) => {
				this.listthannhan = res.data;
			});
		}
	}

	loadCommonData() {
		this.loadListGioiTinh();
		this.loadListDoiTuongNCC();
		this.loadListQuanHeVoiLietSy();
	}

	findNguyenTruQuan(cap: any, filterKhom: any): string {
		let val = "";
		var khom: any, xa: any, huyen: any, tinh: any;
		khom = this.listKhomAp.find(x => x.id == +filterKhom) //title
		xa = this.listXa.find(x => x.ID_Row == +this.filterward) //Ward
		huyen = this.listHuyen.find(x => x.ID_Row == +this.filterdistrict) //District
		tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) //Province
		switch (cap) {
			case 1: {
				val = this.firstLowerCase(tinh.Province)
				break;
			}
			case 2: {
				val = this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 3: {
				val = this.firstLowerCase(xa.Ward) + ", " + this.firstLowerCase(huyen.District)
					+ ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 4: {
				val = this.firstLowerCase(khom.title) + ", " + this.firstLowerCase(xa.Ward)
					+ ", " + this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
		}
		return val;
	}

	tieptuc() { this.selectedTab++; }
}