import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ComponentRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'tr[tro-cap-row-edit]',
	templateUrl: './tro-cap-row-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	//gán theo dưới đây làm format các datepicker có trong component
	// providers: [
	// 	{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	// ],
})

export class TroCapRowEditComponent implements OnInit {
	public close$ = new Subject<void>();
	data: any;
	item: any;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	isTruyLinh: boolean = false;
	AllLoaiTroCap: any[] = [];
	listLoaiTroCap: any[] = [];
	Id_LoaiHoSo: number = 0;
	showCat: boolean = false;
	AllowCat: boolean = false;//cho phép cắt khi thêm mới trợ cấp
	maxNS: Moment | undefined;
	cmpRef: ComponentRef<any> | undefined;
	showDel: boolean = false;
	hideMuaBao: boolean = false;
	hideNuoiDuong: boolean = false;
	LoaiTroCap: string = '';
	//form controls
	Id_LoaiTroCap: FormControl | undefined;
	TroCap: FormControl | undefined;
	PhuCap: FormControl | undefined;
	TienMuaBao: FormControl | undefined;
	TroCapNuoiDuong: FormControl | undefined;
	NgayCap: FormControl | undefined;
	TuNam: FormControl | undefined;
	TruyLinh_From: FormControl | undefined;
	TruyLinh_To: FormControl | undefined;
	
	SoThang: FormControl | undefined;
	SoThangTruyLinh: FormControl | undefined;
	ThangThuHoi: FormControl | undefined;
	LyDoKhongGiaiQuyet: FormControl | undefined;
	LyDoKhongMaiTangPhi: FormControl | undefined;
	NgayDinhChi: FormControl | undefined;
	LyDoDinhChi: FormControl | undefined;

	LyDoTamDC: FormControl | undefined;
	ThuHoiDCTu: FormControl | undefined;
	ThuHoiDCDen: FormControl | undefined;
	TuThang: FormControl | undefined;
	TiLeTroCap: FormControl | undefined;
	STTruyLinhCuThe: FormControl | undefined;
	SLTroCap: FormControl | undefined; //số lần trợ cấp
	NDTruyLinh: FormControl | undefined;
	TienDCTruyThu: FormControl | undefined;
	ThangCat: FormControl | undefined;
	ThangDaNhan: FormControl | undefined;

	hiddenTienTC: boolean = false 

	isLyDoKhongGiaiQuyet: boolean = false;
	isLyDoKhongMaiTangPhi: boolean = false;
	isPhuCap: boolean = false; //mặc định 

	showDinhChi: boolean = false;
	showDinhChiLyDo: boolean = false;
	showTamDinhChiLyDo: boolean = false;
	showThuHoiTu: boolean = false
	showThuHoiDen: boolean = false
	showTruyLinhTo: boolean = false
	showTiLeTC: boolean = false
	showTCTuThang: boolean = false
	showTCTuNam: boolean = false
	showTruyLinhCT: boolean = false
	showSLTroCap: boolean = false

	showTruyLinhFrom: boolean = false
	showTruyLinh: boolean = false
	showTCTuNgay: boolean = false
	showSoThangTC: boolean = false
	showNgayCat: boolean = false
	showNamCat: boolean = false
	showThangThuHoi: boolean = false
	showNDTruyLinh: boolean = false
	showThangCat: boolean = false
	showTCDenThang: boolean = false

	isTienDCTruyThu: boolean = false
	title: string = ""
	loaitc: number = 0

	constructor(
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
	}

	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		if(this.data.hiddenTienTC != undefined)
			this.hiddenTienTC = this.data.hiddenTienTC
		if (this.data.isLyDoKhongGiaiQuyet != undefined)
			this.isLyDoKhongGiaiQuyet = this.data.isLyDoKhongGiaiQuyet;
		if (this.data.isLyDoKhongMaiTangPhi != undefined)
			this.isLyDoKhongMaiTangPhi = this.data.isLyDoKhongMaiTangPhi;
		if (this.data.isPhuCap != undefined)
			this.isPhuCap = this.data.isPhuCap;
		if (this.data.showDel != undefined)
			this.showDel = this.data.showDel;
		if (this.data.showCat != undefined)
			this.showCat = this.data.showCat;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.showDinhChi != undefined)
			this.showDinhChi = this.data.showDinhChi;
		if (this.data.showDinhChiLyDo != undefined)
			this.showDinhChiLyDo = this.data.showDinhChiLyDo;
		if (this.data.showTamDinhChiLyDo != undefined)
			this.showTamDinhChiLyDo = this.data.showTamDinhChiLyDo;
		if (this.data.showThuHoiTu != undefined)
			this.showThuHoiTu = this.data.showThuHoiTu;
		if (this.data.showThuHoiDen != undefined)
			this.showThuHoiDen = this.data.showThuHoiDen;
		if (this.data.showTruyLinhTo != undefined)
			this.showTruyLinhTo = this.data.showTruyLinhTo;
		if (this.data.showTiLeTC != undefined)
			this.showTiLeTC = this.data.showTiLeTC;
		if (this.data.showTCTuThang != undefined)
			this.showTCTuThang = this.data.showTCTuThang;
		if (this.data.showTruyLinhCT != undefined)
			this.showTruyLinhCT = this.data.showTruyLinhCT;
		if (this.data.showSLTroCap != undefined)
			this.showSLTroCap = this.data.showSLTroCap;

		if (this.data.showTruyLinhFrom != undefined)
			this.showTruyLinhFrom = this.data.showTruyLinhFrom;
		if (this.data.showTruyLinh != undefined)
			this.showTruyLinh = this.data.showTruyLinh;

		if (this.data.showTCTuNgay != undefined)
			this.showTCTuNgay = this.data.showTCTuNgay;
		
		if (this.data.hideNuoiDuong != undefined)
			this.hideNuoiDuong = this.data.hideNuoiDuong
		if (this.data.showTCTuNam != undefined)
			this.showTCTuNam = this.data.showTCTuNam
		if (this.data.showSoThangTC != undefined)
			this.showSoThangTC = this.data.showSoThangTC
		if (this.data.showNgayCat != undefined)
			this.showNgayCat = this.data.showNgayCat
		if (this.data.showNamCat != undefined)
			this.showNamCat = this.data.showNamCat
		if (this.data.showThangThuHoi != undefined)
			this.showThangThuHoi = this.data.showThangThuHoi
		if (this.data.showNDTruyLinh != undefined)
			this.showNDTruyLinh = this.data.showNDTruyLinh

		if (this.data.isTienDCTruyThu != undefined)
			this.isTienDCTruyThu = this.data.isTienDCTruyThu

		if (this.data.showThangCat != undefined)
			this.showThangCat = this.data.showThangCat
		if (this.data.showTCDenThang != undefined)
			this.showTCDenThang = this.data.showTCDenThang
		
		this.title = this.item.Title
		this.loaitc = this.item.Id_LoaiTC
			
		this.commonService.liteConstLoaiTroCap().subscribe(res => {
			if (res && res.status == 1) {
				this.AllLoaiTroCap = res.data;
				this.LoadListLoaiTroCap(this.item.Id_DoiTuongNCC);
			}
		});
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.data.objectService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.item.TruyLinh_From != null || this.item.TruyLinh_To != null) {
						this.isTruyLinh = true;
					}
					this.createForm();
					this.LoadListLoaiTroCap(this.item.Id_DoiTuongNCC);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	// chosenYearHandler(normalizedYear: Moment) {
	// 	const ctrlValue = ctrlValue.year(normalizedYear.year());
	// 	this.TuThang.setValue(ctrlValue);
	// }
	
	chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		// const ctrlValue = this.TuThang.value;
		// ctrlValue.year(normalizedMonth.year());
		if (!this.TuThang) return;
		this.TuThang.setValue(normalizedMonth);
		datepicker.close();
	}

	chosenMonthHandler1(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		if (!this.TruyLinh_From) return;
		this.TruyLinh_From.setValue(normalizedMonth);
		datepicker.close();
	}

	chosenMonthHandler2(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		if (!this.TruyLinh_To) return;
		this.TruyLinh_To.setValue(normalizedMonth);
		datepicker.close();
	}

	chosenMonthHandler3(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		if (!this.ThangCat) return;
		this.ThangCat.setValue(normalizedMonth);
		datepicker.close();
	}

	chosenMonthHandler4(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		if (!this.ThangDaNhan) return;
		this.ThangDaNhan.setValue(normalizedMonth);
		datepicker.close();
	}

	changeNamCap(isNam = false) {
		if (!this.NgayCap) return;
		if (isNam) {
			this.NgayCap.setValue('');
		}
		else {
			let val = this.NgayCap.value;
			if (val != null && this.TuNam) {
				let y = moment(val).get('year');
				this.TuNam.setValue(y);
			}
		}
	}

	changeNamCat(isNam = false) {
		if (isNam) {
			this.item.NgayCat = '';
		}
		else {
			let val = this.item.NgayCat;
			if (val != null) {
				let y = moment(val).get('year');
				this.item.NamCat = y;
			}
		}
	}

	Tu: any;
	Den: any;
	changeNamThuHoi(isTu = true) {
		if (!this.ThuHoiDCTu || !this.ThuHoiDCDen) return;
		this.Tu = this.ThuHoiDCTu.value
		this.Den = this.ThuHoiDCDen.value
		if(isTu && Number(this.Tu) > Number(this.Den)) {
			this.ThuHoiDCTu.setValue(this.ThuHoiDCDen.value)
		}
		if(!isTu && Number(this.Den) < Number(this.Tu)) {
			this.ThuHoiDCDen.setValue(this.ThuHoiDCTu.value)
		}
	}

	//ncc edit dialog goi ham nay de xoa
	close() {
		this.close$.next();
	}

	createForm() {
		this.Id_LoaiTroCap = new FormControl(this.item.Id_LoaiTroCap, Validators.required);
		this.TroCap = new FormControl(this.item.TroCap, Validators.required);
		this.PhuCap = new FormControl(this.item.PhuCap);
		this.TienMuaBao = new FormControl(this.item.TienMuaBao);
		this.TroCapNuoiDuong = new FormControl(this.item.TroCapNuoiDuong);
		this.NgayCap = new FormControl(this.item.TuNgay);
		this.TuNam = new FormControl(this.item.TuNam);
		this.TruyLinh_From = new FormControl(this.item.TruyLinh_From);
		this.TruyLinh_To = new FormControl(this.item.TruyLinh_To);
		this.SoThang = new FormControl(this.item.SoThang);
		this.SoThangTruyLinh = new FormControl(this.item.SoThangTruyLinh);
		this.ThangThuHoi = new FormControl(this.item.ThangThuHoi);
		this.LyDoKhongGiaiQuyet = new FormControl(this.item.LyDoKhongGiaiQuyet);
		this.LyDoKhongMaiTangPhi = new FormControl(this.item.LyDoKhongMaiTangPhi);
		this.NgayDinhChi = new FormControl(this.item.NgayDinhChi);
		this.LyDoDinhChi = new FormControl(this.item.LyDoDinhChi);

		this.LyDoTamDC = new FormControl(this.item.LyDoTamDC);
		this.ThuHoiDCTu = new FormControl(this.item.ThuHoiDCTu);
		this.ThuHoiDCDen = new FormControl(this.item.ThuHoiDCDen);
		this.TuThang = new FormControl(this.item.TuThang);
		this.TiLeTroCap = new FormControl(this.item.TiLeTroCap);
		this.STTruyLinhCuThe = new FormControl(this.item.STTruyLinhCuThe);
		this.SLTroCap = new FormControl(this.item.SLTroCap);
		this.NDTruyLinh = new FormControl(this.item.NDTruyLinh);
		this.TienDCTruyThu = new FormControl(this.item.TienDCTruyThu);
		this.ThangCat = new FormControl(this.item.ThangCat);
		this.ThangDaNhan = new FormControl(this.item.ThangDaNhan);

		this.TroCap.setValue("0")
		if (this.showSoThangTC == true) {
			this.SoThang.setValue("3")
		}
		this.changeDetectorRefs.detectChanges();
	}

	chonTroCap(value: any) {
		var find = this.listLoaiTroCap.find(x => +x.id == value);
		if (find && find.data) {
			this.LoaiTroCap = find.LoaiTroCap;
			this.PhuCap.setValue(find.data.PhuCap ? find.data.PhuCap : "");
			this.TroCap.setValue(find.data.TienTroCap ? find.data.TienTroCap : "");
			this.TienMuaBao.setValue(find.data.TienMuaBao ? find.data.TienMuaBao : "");
			this.TroCapNuoiDuong.setValue(find.data.TroCapNuoiDuong ? find.data.TroCapNuoiDuong : "");
			this.SoThang.setValue(find.data.SoThangTC ? find.data.SoThangTC : "");
		} else {
			this.LoaiTroCap = "";
			this.PhuCap.setValue("");
			this.TroCap.setValue("");
			this.TienMuaBao.setValue("");
			this.TroCapNuoiDuong.setValue("");
			this.SoThang.setValue("");
		}
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.Id_NCC = this.item.Id_NCC;
		_item.TroCap = +this.TroCap.value;
		//_item.Id_LoaiTroCap = this.Id_LoaiTroCap.value;
		_item.Id_LoaiTroCap = this.loaitc
		_item.PhuCap = this.PhuCap.value;
		if (this.NgayCap.value !== '')
			_item.TuNgay = this.commonService.f_convertDate(this.NgayCap.value);
		_item.TuNam = this.TuNam.value;
		_item.TienMuaBao = this.TienMuaBao.value;
		_item.TroCapNuoiDuong = this.TroCapNuoiDuong.value;
		_item.ThangThuHoi = this.ThangThuHoi.value;
		_item.LyDoKhongMaiTangPhi = this.LyDoKhongMaiTangPhi.value;
		_item.LyDoKhongGiaiQuyet = this.LyDoKhongGiaiQuyet.value;
		if (this.SoThang.value)
			_item.SoThang = +this.SoThang.value;
		if(this.showTruyLinhFrom == true && this.TruyLinh_From.value)
			_item.TruyLinh_From = this.TruyLinh_From.value.format("MM/YYYY");
		if(this.showTruyLinhTo == true && this.TruyLinh_To.value)
			_item.TruyLinh_To = this.commonService.f_convertDate(this.TruyLinh_To.value);
		if (this.SoThangTruyLinh.value) { //if (this.isTruyLinh) {
			// let tn = '' + this.TruyLinh_From.value;
			//_item.TruyLinh_From = moment(tn, "MMYYYY").format("MM/YYYY");
			// let tt = '' + this.TruyLinh_To.value;
			// _item.TruyLinh_To = moment(tt, "MMYYYY").format("MM/YYYY");
			_item.SoThangTruyLinh = +this.SoThangTruyLinh.value;
		} 
		// else {
		// 	_item.TruyLinh_From = null;
		// 	_item.TruyLinh_To = null;
		// 	_item.SoThangTruyLinh = 0;
		// }
		if (this.item.NgayCat || this.item.NamCat) {
			_item.IsCat = true;
			if (this.item.NgayCat !== '')
				_item.NgayCat = this.commonService.f_convertDate(this.item.NgayCat);
			_item.NamCat = this.item.NamCat;
		}
		// if (this.NgayDinhChi.value) {
		// 	_item.NgayDinhChi = this.commonService.f_convertDate(this.NgayDinhChi.value);
		// 	_item.LyDoDinhChi = this.LyDoDinhChi.value;
		// }
		if (this.showThangCat && this.ThangCat.value){
			_item.ThangCat = this.ThangCat.value.format("MM/YYYY");
		}
		_item.LyDoDinhChi = this.LyDoDinhChi.value;
		_item.LyDoTamDC = this.LyDoTamDC.value;
		_item.ThuHoiDCTu = this.ThuHoiDCTu.value;
		_item.ThuHoiDCDen = this.ThuHoiDCDen.value;
		if(this.showTCTuThang == true && this.TuThang.value)
			_item.TuThang = this.TuThang.value.format("MM/YYYY");
		if(this.showTCDenThang == true && this.ThangDaNhan.value)
			_item.ThangDaNhan = this.ThangDaNhan.value.format("MM/YYYY");
		_item.TiLeTroCap = this.TiLeTroCap.value;
		_item.STTruyLinhCuThe = this.STTruyLinhCuThe.value;
		_item.SLTroCap = this.SLTroCap.value;
		_item.NDTruyLinh = this.NDTruyLinh.value;
		_item.TienDinhChiTruyThu =  this.TienDCTruyThu.value
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls: FormControl[] = [
		this.TroCap,
		this.PhuCap,
		this.TienMuaBao,
		this.TroCapNuoiDuong,
		this.NgayCap,
		this.TruyLinh_From,
		this.TruyLinh_To,
		this.SoThang,
		this.SoThangTruyLinh]; //this.Id_LoaiTroCap,
		///* check form */
		let e = 0;
		Object.keys(controls).forEach(controlName => {
			if (controls[controlName].invalid)
				e++;
			controls[controlName].markAsTouched()
		}
		);
		if (e > 0) {
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			return;
		}
		if (this.item.IsCat && !this.item.NgayCat) {
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			this.layoutUtilsService.showError("Vui lòng nhập ngày cắt trợ cấp");
			return;
		}
		this.changeDetectorRefs.detectChanges();
		const EditTroCap = this.prepareCustomer();
		return EditTroCap;
	}

	LoadListLoaiTroCap(id_doituong = 0) {
		if (id_doituong == 0)
			this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.data.Id_LoaiHoSo == null);
		else
			this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.data.Id_LoaiHoSo == null || x.data.Id_LoaiHoSo == id_doituong);
		
		this.changeDetectorRefs.detectChanges();
	}
	
	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
	}
}