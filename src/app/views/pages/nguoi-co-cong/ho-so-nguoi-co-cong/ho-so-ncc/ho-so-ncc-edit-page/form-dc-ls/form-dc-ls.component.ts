import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../../core/auth/_services/token-storage.service';
import { CommonService } from '../../../../services/common.service';
import { ThanNhanService } from './../../../than-nhan/Services/than-nhan.service';
import { HoSoNCCService } from './../../Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../../../ho-so-ncc/Model/ho-so-ncc.model';
import { TroCapRowEditComponent } from '../../../../components';
import moment from 'moment';

@Component({
	selector: 'kt-form-dc-ls',
	templateUrl: './form-dc-ls.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormDC_LSComponent implements OnInit {
	data: any;
	//#region nhúng mảng form trợ cấp
	lstTC: any[] = [];
	childComponentType = TroCapRowEditComponent;
	@ViewChild("libInsertion", { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef | undefined;
	//#endregion

	item: HoSoNCCModel = new HoSoNCCModel();
	oldItem: HoSoNCCModel = new HoSoNCCModel();
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit: boolean = true;
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listAllLoaiHS: any = [];
	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listLoaiHS: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listquanhevoilietsy: any[] = [];
	listthannhan: any[] = [];
	filterthannhan = '';
	listKhomAp: any[] = [];
	listDanToc: any[] = [];
	listTonGiao: any[] = [];
	GiayTos: any[] = [];
	thannhanName = '';
	quanhe: number = 0;
	require = '';
	objectThanNhan: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	IsThanNhan: boolean = false;
	Capcocau: number = 0;
	Id_LoaiHoSo: number = 0;
	//
	nhapTC: boolean = true;
	//di chuyển
	listTinh: any[] = [];
	listHuyen: any[] = [];
	listXa: any[] = [];
	isChuyenDi: boolean = false;
	selectedTab: number = 0;

	constructor(private componentFactoryResolver: ComponentFactoryResolver,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: HoSoNCCService,
		private thannhanService: ThanNhanService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.selectedTab = 0;
		this.item = this.data._item;
		this.Id_LoaiHoSo = this.item.Id_LoaiHoSo;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.listTinh = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 2) { //cấp huyện
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict			
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
				}
			}
			if (res.Capcocau == 3) { //cấp xã
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
		})

		this.commonService.ListDanToc().subscribe(res => {
			this.listDanToc = res.data;
		});
		this.commonService.ListTonGiao().subscribe(res => {
			this.listTonGiao = res.data;
		});
		this.loadListGioiTinh();
		this.loadListDoiTuongNCC();
		this.loadListQuanHeVoiLietSy();
		this.loadLoaiTC();
		this.createForm();
	}

	AllLoaiTroCap: any[] = [];
	listLoaiTroCap: any[] = [];
	loadLoaiTC() {
		this.commonService.liteConstLoaiTroCap().subscribe(res => {
			if (res && res.status == 1) {
				this.AllLoaiTroCap = res.data;
				this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.id == 23);
			}
			this.addTC();
		})
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
		//lọc loại hồ sơ theo đối tượng ncc
		//let temp = this.listAllLoaiHS.filter(x => x.data.Id_DoiTuongNCC == value);
		//this.listLoaiHS.next(temp);
		//this.listOpt1 = temp;
	}

	isBangTQ: boolean = false;
	changeLoaiHS(value: any) {
		let xa = "";
		const form = this.itemForm;
		if (!form) return;
		if (form.controls["Id_Xa"].value) {
			let fx = this.listward.find(x => x.ID_Row == form.controls["Id_Xa"].value);
			if (fx)
				xa = this.firstLowerCase(fx.Ward);
		}
		this.Id_LoaiHoSo = +value;
		var f = this.listOpt1.find(x => x.id == value);
		if (f) {
			this.GiayTos = f.data.GiayTos.map((x: any) => { return { Id_LoaiGiayTo: x.id, GiayTo: x.title, IsRequired: x.IsRequired, NoiCap: xa } });
			var k = this.GiayTos.find(x => x.Id_LoaiGiayTo == 9) //bằng tổ quốc ghi công
			if(k)	this.isBangTQ = true;
			this.GiayTos = this.GiayTos.filter(x => x.Id_LoaiGiayTo != 9)
			this.changeDetectorRefs.detectChanges(); //lệnh này làm khi chọn xã mới, nơi cấp sẽ tự cập nhật là xã này
		}
	}

	firstLowerCase(str: string) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	createForm() {
		let ng = this.item.Id > 0 ? moment(this.item.NgayGui) : new Date();
		const temp: any = {
			NgayGui: [ng, Validators.required],
			SoHoSo: [this.item.SoHoSo],
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			SDT: [this.item.SDT, [Validators.pattern(this.commonService.ValidateFormatRegex('phone')), Validators.maxLength(11)]],
			Email: [this.item.Email, [Validators.email]],
			NgaySinh: [this.item.NgaySinh],
			NamSinh: [this.item.NamSinh],
			GioiTinh: [1, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			District: [this.item.DistrictID, Validators.required],
			Id_Xa: [this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp, Validators.required],
			DanToc: [this.item.Id_DanToc == null ? 0 : this.item.Id_DanToc],
			TonGiao: [this.item.Id_TonGiao == null ? 0 : this.item.Id_TonGiao],
			IdThanNhan: [this.item.Id_ThanNhan],
			Id_DoiTuongNCC: [this.item.Id_DoiTuongNCC, Validators.required],
			Id_LoaiHoSo: [this.item.Id_LoaiHoSo, Validators.required],
			//#region thông tin thân nhân
			NguoiThoCungLietSy: [''],
			QuanHeVoiLietSy: [0],
			NguyenQuan1: [''],
			TruQuan1: [''],
			NgaySinh1: [''],
			NamSinh1: [''],
			GioiTinh1: [1],
			IsChet1: [0],
			NgayChet1: [],
			SoKhaiTu1: [''],
			NgayKhaiTu1: [],
			NoiKhaiTu1: [''],
			SoHoSo1: [],
			//#endregion
			BiDanh: [''],
			NguyenQuan: [''],
			TruQuan: [''],
			NgayNhapNgu: [],
			NgayXuatNgu: [],
			NoiCongTac: [''],
			CapBac: [''],
			ChucVu: [''],
			Ngay_: [],
			TruongHop_: [''],
			Noi_: [''],
			Mo: [0],
			TiLe: [''],
			fileDinhKem: [null],
			IsChet: [0],
			NgayChet: [],
			NgayKhaiTu: [],
			//#region di chuyển
			tinhdc: [],
			huyendc: [],
			xadc: [],
			khomapdc: [],
			diaChidc: [''],
			DaGiaiQuyet: [''],
			ChuaGiaiQuyet: [''],
			ThucHien: [''],
			GiayTo: [''],
			IsBanChinh: [1],
			NgayChuyen: [],
			GhiChu: [''],
			//#endregion
			//#region 9. bằng tổ quốc ghi công
			GiayTo9: [''],
			So9: [''],
			NgayCap9: [],
			NoiCap9: [''],
			//#endregion
			//#region 1. giấy báo tử
			GiayTo1: [''],
			So1: [''],
			NgayCap1: [],
			NoiCap1: [''],
			//#endregion
			//#region đính chính
			HoTen_new: [''],
			NamSinh_new: [''],
			GhiChu_new: [''],
			//#endregion
		};
		this.itemForm = this.fb.group(temp);

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		if (this.item.Id > 0) {
			this.itemForm.controls.NguoiThoCungLietSy.disable();
			this.itemForm.controls.QuanHeVoiLietSy.disable();
		}
		this.changeDetectorRefs.detectChanges();
		Object.keys(this.itemForm.controls).forEach(controlName => {
			if (this.itemForm) 
				this.itemForm.controls[controlName].markAsUntouched();
		});
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` hồ sơ người có công`;
		return result;
	}

	changeNS(isNam = false) {
		if (!this.itemForm) return;
		if (isNam) {
			this.itemForm.controls.NgaySinh.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh.value;
			if (val != null) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh.setValue(y);
			}
		}
	}

	changeNS1(isNam = false) {
		if (!this.itemForm) return;
		if (isNam) {
			this.itemForm.controls.NgaySinh1.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh1.value;
			if (val != null) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh1.setValue(y);
			}
		}
	}

	/** ACTIONS */
	prepareCustomer(): HoSoNCCModel | null {
		if (!this.itemForm) return null;
		const controls = this.itemForm.controls;
		const _item = new HoSoNCCModel();
		_item.Id = +this.item.Id;
		_item.NgayGui = moment(controls.NgayGui.value).format("YYYY-MM-DDTHH:mm:ss.0000000");
		_item.HoTen = controls.HoTen.value;
		_item.BiDanh = controls.BiDanh.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.SDT = controls.SDT.value;
		_item.Email = controls.Email.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_DoiTuongNCC = +controls.Id_DoiTuongNCC.value;
		_item.Id_LoaiHoSo = +controls.Id_LoaiHoSo.value;
		_item.QuanHeVoiLietSy = 0;
		if (this.item.Id == 0) {
			_item.Id_ThanNhan = 0;
			if (controls.NguoiThoCungLietSy.value) {
				_item.ThanNhanModel = this.prepareThanNhan(controls);
			} else
				_item.ThanNhanModel = null;
		} else {
			if (controls.IdThanNhan.value != null)
				_item.Id_ThanNhan = +controls.IdThanNhan.value;
			else
				_item.Id_ThanNhan = 0;
		}

		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		_item.NamSinh = +controls.NamSinh.value;
		_item.NguyenQuan = controls.NguyenQuan.value;
		_item.TruQuan = controls.TruQuan.value;
		if (controls.DanToc.value > 0)
			_item.Id_DanToc = controls.DanToc.value;
		if (controls.TonGiao.value > 0)
			_item.Id_TonGiao = controls.TonGiao.value;
		if (controls.NgayNhapNgu.value)
			_item.NgayNhapNgu = this.commonService.f_convertDate(controls.NgayNhapNgu.value);
		if (controls.NgayXuatNgu.value)
			_item.NgayXuatNgu = this.commonService.f_convertDate(controls.NgayXuatNgu.value);
		_item.NoiCongTac = controls.NoiCongTac.value;
		_item.CapBac = controls.CapBac.value;
		_item.ChucVu = controls.ChucVu.value;
		if (controls.Ngay_.value)
			_item.Ngay_ = this.commonService.f_convertDate(controls.Ngay_.value);
		_item.TruongHop_ = controls.TruongHop_.value;
		_item.Noi_ = controls.Noi_.value;
		if (controls.fileDinhKem.value && controls.fileDinhKem.value.length > 0)
			_item.FileDinhKem = controls.fileDinhKem.value[0];
		//_item.GiayBaoTu = controls.GiayBaoTu.value;
		//_item.BangTQGC = controls.BangTQGC.value;
		_item.Mo = controls.Mo.value;
		_item.TiLe = controls.TiLe.value;
		_item.GiayTos = [];
		if (controls.GiayTo9.value) {
			if (controls.So9.value && controls.NgayCap9.value)
				_item.GiayTos.push(this.prepareGT(controls, 9));
			else {
				this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của bằng tổ quốc ghi công");
				return null;
			}
		}
		_item.IsChet = controls.IsChet.value;
		if (_item.IsChet) {
			//thêm giấy báo tử
			if (controls.GiayTo1.value) {
				if (controls.So1.value && controls.NgayCap1.value && controls.NoiCap1.value)
					_item.GiayTos.push(this.prepareGT(controls, 1));
				else {
					this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy báo tử");
					return null;
				}
			}
			//thêm quá trình hoạt động - đã mất
			_item.HoatDongModel = this.prepareHD(controls);
		}
		for (var i = 0; i < this.GiayTos.length; i++) {
            let gt = this.GiayTos[i];
            if (gt.IsRequired) { //giấy tờ là bắt buộc
                if (!gt.So || !gt.NgayCap) {
                    this.layoutUtilsService.showInfo("Giấy tờ '" + gt.GiayTo + "' là bắt buộc nhập");
                    return null;
                }
                let copy = Object.assign({}, gt);
                if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) { //có chọn thêm file
					copy.FileDinhKem = gt.FileDinhKem[0];
				}
                copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
                _item.GiayTos.push(copy);
            } else {
                if ((gt.So && !gt.NgayCap) || (!gt.So && gt.NgayCap) //chỉ nhập 1 trong 2 trường
					|| (gt.NoiCap && (!gt.So || !gt.NgayCap)) ) { //nhập trường nơi cấp mà trường So hoặc NgayCap ko nhập
                    this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy tờ");
                    return null;
                }
                if (gt.So && gt.NgayCap) { //đã nhập đủ 2 trường
                    let copy = Object.assign({}, gt);
                    if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) { //có chọn thêm file
                        copy.FileDinhKem = gt.FileDinhKem[0];
                    }
                    copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
                    _item.GiayTos.push(copy);
                }
            }
        }
		//_item.DinhChinhModel = this.prepareDinhChinh(controls);
		_item.DiChuyenModel = this.prepareDC(controls);
		return _item;
	}

	prepareThanNhan(controls: any) {
		let _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = 0;
		_item.HoTen = controls.NguoiThoCungLietSy.value;
		_item.DiaChi = controls.TruQuan1.value;
		_item.SoHoSo = controls.SoHoSo1.value;
		//_item.SDT = controls.SDT.value;
		//_item.Email = controls.Email.value;
		_item.NguyenQuan = controls.NguyenQuan1.value;
		_item.GioiTinh = controls.GioiTinh1.value;
		_item.Id_QHGiaDinh = controls.QuanHeVoiLietSy.value;
		_item.IsChet = controls.IsChet1.value == true;
		if (_item.IsChet) {
			_item.NgayChet = this.commonService.f_convertDate(controls.NgayChet1.value);
			_item.SoKhaiTu = controls.SoKhaiTu1.value;
			_item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu1.value);
			_item.NoiKhaiTu = controls.NoiKhaiTu1.value;
		}
		if (controls.NgaySinh1.value !== '') {
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh1.value);
		} else {
			_item.NgaySinh = '01/01/0001';
		}
		_item.NamSinh = +controls.NamSinh1.value;
		return _item;
	}

	prepareHD(controls: any) {
		const _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = 0;
		if (controls.NgayChet.value)
			_item.TuNgay = this.commonService.f_convertDate(controls.NgayChet.value); //ko bị trừ ngày khi save db
		if (controls.NgayKhaiTu.value)
			_item.DenNgay = this.commonService.f_convertDate(controls.NgayKhaiTu.value);
		else
			_item.DenNgay = null;
		_item.IsNghiHuu = false
		_item.IsChet = true
		return _item;
	}

	prepareDC(controls: any) {
		const _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = 0;
		_item.DaGiaiQuyet = controls.DaGiaiQuyet.value;
		_item.ChuaGiaiQuyet = controls.ChuaGiaiQuyet.value;
		_item.NgayChuyen = controls.NgayChuyen.value;
		_item.ThucHien = controls.ThucHien.value;
		_item.GiayTo = controls.GiayTo.value;
		_item.IsBanChinh = controls.IsBanChinh.value == 1;
		_item.GhiChu = controls.GhiChu.value;
		if (!this.isChuyenDi) {//từ nơi khác chuyển đến 
			_item.IsDuyet = true;
			_item.Id_Xa_Old = controls.xadc.value;
			_item.DiaChi_Old = controls.diaChidc.value;
			if (+controls.tinhdc.value == this.filterprovinces) //chuyển đến từ trong tỉnh
				_item.Id_KhomAp_Old = controls.khomapdc.value;
			// từ tab hồ sơ
			_item.Id_Tinh = +controls.Province.value;
			_item.Id_Huyen = +controls.District.value;	
			_item.Id_Xa = controls.Id_Xa.value;
			_item.Id_KhomAp = controls.Id_KhomAp.value;
			_item.DiaChi = controls.DiaChi.value;
		}
		else { //chuyển đi nơi khác
			_item.Id_Tinh = controls.tinhdc.value;
			_item.Id_Huyen = controls.huyendc.value;
			_item.Id_Xa = controls.xadc.value;
			if (+controls.tinhdc.value == this.filterprovinces) //chuyến đi trong tỉnh
				_item.Id_KhomAp = controls.khomapdc.value;
			_item.DiaChi = controls.diaChidc.value;
		}
		return _item;
	}

	prepareGT(controls: any, id: number) {
		const _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = 0;
		_item.Id_LoaiGiayTo = id;
		_item.So = controls["So" + id].value;
		_item.GiayTo = controls["GiayTo" + id].value;
		_item.NoiCap = controls["NoiCap" + id].value;
		if (controls["NgayCap" + id].value)
			_item.NgayCap = this.commonService.f_convertDate(controls["NgayCap" + id].value);
		else
			_item.NgayCap = null;
		return _item;
	}

	prepareDinhChinh(controls: any) {
		const _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = 0;
		_item.GhiChu = controls.GhiChu_new.value;
		_item.ListColumn = [];
		if (controls.HoTen_new.value)
			_item.ListColumn.push({ ColumName: 'hoten', GiaTriCu: controls.HoTen.value, GiaTriMoi: controls.HoTen_new.value, Type: 1, });
		if (controls.NamSinh_new.value)
			_item.ListColumn.push({ ColumName: 'NamSinh', GiaTriCu: controls.NamSinh.value, GiaTriMoi: controls.NamSinh_new.value, Type: 1, });
		return _item;
	}

	onSubmit(callapi: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		//let ng = controls["NguoiThoCungLietSy"].value;
		//let qh = controls["QuanHeVoiLietSy"].value;
		//if (ng && !qh) {
		//	this.layoutUtilsService.showError("Vui lòng chọn mối quan hệ gia đình");
		//	return;
		//}
		let EditHoSoNCC: any = this.prepareCustomer();
		if (!EditHoSoNCC) return;
		if (this.nhapTC) {
			EditHoSoNCC.TroCapModel = [];
			for (var i = 0; i < this.lstTC.length; i++) {
				if (this.lstTC[i].cmpRef && !this.lstTC[i].cmpRef.hostView.destroyed) {
					let EditTroCap = this.lstTC[i].onSubmit();
					if (!EditTroCap) {
						this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin trợ cấp");
						return;
					}
					EditHoSoNCC.TroCapModel.push(EditTroCap);
				}
			}
		}
		if (!callapi)
			return EditHoSoNCC;

		this.disabledBtn = true;
		this.objectService.Create(EditHoSoNCC).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
				this.layoutUtilsService.showInfo(_messageType);
				this.ngOnInit();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	changeQuanHeLietSy() {
		if (!this.itemForm) return;
		if (this.itemForm.controls.NguoiThoCungLietSy) {
			this.require = '';
		} else {
			this.require = 'require';
		}
	}

	changeThanNhan(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName = this.objectThanNhan.HoTen;
		this.quanhe = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;

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
	listAp: any[] = [] 
	changeXa(val: any) {
		this.commonService.GetListKhomApByWard(val).subscribe(res => {
			this.listAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	//#endregion
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

	filterKhom = '';
	fillNguyenTruQuan(cap: number) {
		if (!this.itemForm) return;
		let val = "";
		var khom: any, xa: any, huyen: any, tinh:any;
		switch(cap){
			case 1: {
				tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) 
				val = this.firstLowerCase(tinh.Province)
				break;
			}
			case 2: {
				huyen = this.listHuyen.find(x => x.ID_Row == +this.filterdistrict) 
				tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) 
				val = this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 3: {
				xa = this.listXa.find(x => x.ID_Row == +this.filterward) 
				huyen = this.listHuyen.find(x => x.ID_Row == +this.filterdistrict) 
				tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) 
				val = this.firstLowerCase(xa.Ward) + ", " + this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 4: {
				khom = this.listKhomAp.find(x => x.id == +this.filterKhom) //title
				xa = this.listXa.find(x => x.ID_Row == +this.filterward) //Ward
				huyen = this.listHuyen.find(x => x.ID_Row == +this.filterdistrict) //Ward
				tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) //Province
				val = this.firstLowerCase(khom.title) + ", " + this.firstLowerCase(xa.Ward) 
					+ ", " + this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
		}
		this.itemForm.controls["NguyenQuan"].setValue(val);
		this.itemForm.controls["TruQuan"].setValue(val);
		this.itemForm.controls["NguyenQuan1"].setValue(val);
		this.itemForm.controls["TruQuan1"].setValue(val);
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
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
			this.changeLoaiHS(this.item.Id_LoaiHoSo);
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listquanhevoilietsy = res.data;
		});

	}
	// lay danh sach than nhan
	loadListThanNhan() {
		const queryParams = new QueryParamsModel({});
		queryParams.filter.Id_NCC = this.item.Id;
		this.thannhanService.findData(queryParams).subscribe(res => {
			this.listthannhan = res.data;
		});
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	changeDC(name: string) {
		if (!this.itemForm) return;
		let _name = name;
		if (name == 'TruQuan') _name = 'DiaChi';
		let dc = this.itemForm.controls[name].value;
		if (_name == 'NguyenQuan')
			this.itemForm.controls["NguyenQuan1"].setValue(dc);
		if (_name == 'DiaChi')
			this.itemForm.controls["TruQuan1"].setValue(dc);
	}

	addTC() {
		if (!this.insertionPoint) return;
		if (this.lstTC.length > 0) {
			this.lstTC = [];
			this.insertionPoint.clear()
		}
		for (var i=0; i<this.listLoaiTroCap.length; i++) {
			var item =  this.listLoaiTroCap[i]
			let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.childComponentType);
			let componentRef = this.insertionPoint.createComponent(componentFactory);
			let instance = componentRef.instance;
			instance.cmpRef = componentRef;
			if (item.id == 23) { //hàng tháng
				instance.data = {
					_item: { Id_LoaiTC: item.id, Title: item.title },
					allowEdit: true,
					showDel: true,
					showCat: true,
					isPhuCap: true,
					showTCDenThang: true,
					showTCTuThang: true,
				};
			}
			instance.close$.subscribe(() => {
				if (instance.cmpRef)
					instance.cmpRef.destroy();
			});
			this.lstTC.push(instance);
		}
	}

	tieptuc() { this.selectedTab++; }
}