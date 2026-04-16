import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, Type, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommonService } from '../../services/common.service';
import { QuyetDinhEditComponent } from '../quyet-dinh-edit/quyet-dinh-edit.component';

@Component({
	selector: 'kt-tro-cap-edit',
	templateUrl: './tro-cap-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TroCapEditComponent implements OnInit {
	//quyết định cắt
	ChildComponentInstance: any;
	childComponentType: Type<any> = QuyetDinhEditComponent;
	childComponentData: any = {
		_item: {}
	};
	public close$ = new Subject<void>();
	data: any;
	item: any;
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	allowEditCat = false;
	IsCat = false;
	isTruyLinh: boolean = false;
	AllLoaiTroCap: any[] = [];
	listLoaiTroCap: any[] = [];
	Id_LoaiHoSo: number = 0;
	showCat: boolean = false;
	AllowCat: boolean = false;//cho phép cắt khi thêm mới trợ cấp
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	maxNS: Moment | undefined;
	cmpRef: ComponentRef<any> | undefined;
	showDel: boolean = false;
	hideMuaBao: boolean = false;
	hideNuoiDuong: boolean = false;
	LoaiTroCap: string = '';
	showDinhChi: boolean = true;
	IsDinhchi: boolean = false;
	showTamDinhChi: boolean = true;
	IsTamDinhchi: boolean = false;

	constructor(
		private fb: FormBuilder,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
	}

	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		if (this.data.showDel != undefined)
			this.showDel = this.data.showDel;
		if (this.data.showCat != undefined)
			this.showCat = this.data.showCat;;
		if (this.data.showCat != undefined)
			this.showCat = this.data.showCat;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.showDinhChi != undefined)
			this.showDinhChi = this.data.showDinhChi;
		if (this.data.showTamDinhChi != undefined)
			this.showTamDinhChi = this.data.showTamDinhChi;
		if (this.data.IsCat != undefined)
			this.IsCat = this.data.IsCat;

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
					if (this.item.NgayDinhChi != null) {
						this.IsDinhchi = true;
					}
					this.createForm();
					this.LoadListLoaiTroCap(this.item.Id_DoiTuongNCC);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	getInstance($event: any) {
		this.ChildComponentInstance = $event;
	}

	//ncc edit dialog goi ham nay de xoa
	close() {
		this.close$.next();
	}

	createForm() {
		const temp: any = {
			Id_LoaiTroCap: [this.item.Id_LoaiTroCap, Validators.required],
			TroCap: [this.item.TroCap, Validators.required],
			PhuCap: [this.item.PhuCap],
			TienMuaBao: [this.item.TienMuaBao],
			TroCapNuoiDuong: [this.item.TroCapNuoiDuong],
			NgayCap: [this.item.TuNgay],
			TuNam: [this.item.TuNam],
			TruyLinh_From: [this.item.TruyLinh_From],
			TruyLinh_To: [this.item.TruyLinh_To],
			SoThang: [this.item.SoThang],
			SoThangTruyLinh: [this.item.SoThangTruyLinh],
			LyDoKhongGiaiQuyet: [this.item.LyDoKhongGiaiQuyet],
			LyDoKhongMaiTangPhi: [this.item.LyDoKhongMaiTangPhi],
			NgayDinhChi: [this.item.NgayDinhChi],
			LyDoDinhChi: [this.item.LyDoDinhChi],
			LyDoTamDC: [this.item.LyDoTamDC],
			TiLeTroCap: [this.item.TiLeTroCap],
			SLTroCap: [this.item.SLTroCap],
			STTruyLinhCuThe: [this.item.STTruyLinhCuThe],
			ThuHoiDCTu: [this.item.ThuHoiDCTu],
			ThuHoiDCDen: [this.item.ThuHoiDCDen],
			TuThang: [this.item.TuThang == null ? '' : this.f_convertTuThang(this.item.TuThang)]
		};
		this.itemForm = this.fb.group(temp);
		if (this.focusInput) 
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) // || this.item.IsCat
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	f_convertTuThang(date: string) {
		var componentsDateTime = date.split("/");
		var month = componentsDateTime[0];
		var year = componentsDateTime[1];
		var formatConvert = year + "-" + month + "-01T00:00:00.0000000";
		return new Date(formatConvert);
	}

	chonTroCap(value: any) {
		var find = this.listLoaiTroCap.find(x => +x.id == value);
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (find && find.data) {
			this.LoaiTroCap = find.LoaiTroCap;
			controls.PhuCap.setValue(find.data.PhuCap ? find.data.PhuCap : "");
			controls.TroCap.setValue(find.data.TienTroCap ? find.data.TienTroCap : "");
			controls.TienMuaBao.setValue(find.data.TienMuaBao ? find.data.TienMuaBao : "");
			controls.TroCapNuoiDuong.setValue(find.data.TroCapNuoiDuong ? find.data.TroCapNuoiDuong : "");
			controls.SoThang.setValue(find.data.SoThangTC ? find.data.SoThangTC : "");
		} else {
			this.LoaiTroCap = "";
			controls.PhuCap.setValue("");
			controls.TroCap.setValue("");
			controls.TienMuaBao.setValue("");
			controls.TroCapNuoiDuong.setValue("");
			controls.SoThang.setValue("");
		}
	}
	chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		if (!this.itemForm) return;
		this.itemForm.controls.TuThang.setValue(normalizedMonth);
		let y = moment(normalizedMonth).get('year');
		this.itemForm.controls.TuNam.setValue(y); //gán từ năm
		this.itemForm.controls.NgayCap.setValue(''); //xóa từ ngày
		datepicker.close();
	}

	changeNamCap(isNam = false) {
		if (!this.itemForm) return;
		if (isNam) { //chỉnh năm cấp thì clear từ ngày, từ tháng
			this.itemForm.controls.NgayCap.setValue('');
			this.itemForm.controls.TuThang.setValue('');
		}
		else { //chỉnh từ tháng, từ năm
			let val = this.itemForm.controls.NgayCap.value;
			if (val != null) { //nếu có từ ngày
				let y = moment(val).get('year');
				this.itemForm.controls.TuNam.setValue(y);
				this.itemForm.controls.TuThang.setValue(val);
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
		if (!this.itemForm) return;
		this.Tu = this.itemForm.controls.ThuHoiDCTu.value
		this.Den = this.itemForm.controls.ThuHoiDCDen.value
		if(isTu && Number(this.Tu) > Number(this.Den)) {
			this.itemForm.controls.ThuHoiDCTu.setValue(this.itemForm.controls.ThuHoiDCDen.value)
		}
		if(!isTu && Number(this.Den) < Number(this.Tu)) {
			this.itemForm.controls.ThuHoiDCDen.setValue(this.itemForm.controls.ThuHoiDCTu.value)
		}
	}

	/** ACTIONS */
	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.Id_NCC = this.item.Id_NCC;
		_item.TroCap = controls.TroCap.value;
		_item.Id_LoaiTroCap = controls.Id_LoaiTroCap.value;
		_item.PhuCap = controls.PhuCap.value;
		if (controls.NgayCap.value !== '')
			_item.TuNgay = this.commonService.f_convertDate(controls.NgayCap.value);
		if (controls.TuThang.value !== '')
			_item.TuThang = controls.TuThang.value.format("MM/YYYY");	
		_item.TuNam = controls.TuNam.value;
		_item.TienMuaBao = controls.TienMuaBao.value;
		_item.TroCapNuoiDuong = controls.TroCapNuoiDuong.value;
		_item.LyDoKhongGiaiQuyet = controls.LyDoKhongGiaiQuyet.value;
		_item.LyDoKhongMaiTangPhi = controls.LyDoKhongMaiTangPhi.value;
		if (controls.SoThang.value)
			_item.SoThang = +controls.SoThang.value;
		if (this.isTruyLinh) {
			let tn = '' + controls.TruyLinh_From.value;
			_item.TruyLinh_From = moment(tn, "MMYYYY").format("MM/YYYY");
			_item.TruyLinh_To = this.commonService.f_convertDate(controls.TruyLinh_To.value);
			_item.SoThangTruyLinh = +controls.SoThangTruyLinh.value;
		} else {
			_item.TruyLinh_From = null;
			_item.TruyLinh_To = null;
			_item.SoThangTruyLinh = 0;
		}
		_item.IsCat = this.IsCat || this.AllowCat;
		if (_item.IsCat) {
			if (this.item.NgayCat !== '')
				_item.NgayCat = this.commonService.f_convertDate(this.item.NgayCat);
			_item.NamCat = this.item.NamCat;
			_item.ThangThuHoi = this.item.ThangThuHoi;
			//let qd = this.ChildComponentInstance.onSubmit();
			//if (qd == undefined) {
			//	this.ChildComponentInstance.changeDetectorRefs.detectChanges();
			//	return;
			//} else
			//	_item.QuyetDinh = qd;
		}
		if (this.IsDinhchi) {
			_item.NgayDinhChi = this.commonService.f_convertDate(controls["NgayDinhChi"].value);
			_item.LyDoDinhChi = controls["LyDoDinhChi"].value;
		}

		if (this.IsTamDinhchi) {
			//_item.NgayDinhChi = this.commonService.f_convertDate(controls["NgayDinhChi"].value);
			_item.LyDoTamDC = controls["LyDoTamDC"].value;
		}
		_item.STTruyLinhCuThe = controls.STTruyLinhCuThe.value;
		_item.TiLeTroCap = controls.TiLeTroCap.value;
		_item.SLTroCap = controls.SLTroCap.value;
		_item.ThuHoiDCTu = controls.ThuHoiDCTu.value;
		_item.ThuHoiDCDen = controls.ThuHoiDCDen.value;
		return _item;
	}

	onSubmit() {
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
			this.changeDetectorRefs.detectChanges();
			return;
		}
		if ((this.IsCat || this.AllowCat) && !this.item.NamCat) {
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			this.layoutUtilsService.showError("Vui lòng nhập ngày/năm cắt trợ cấp");
			return;
		}
		if (this.IsDinhchi && !controls["NgayDinhChi"].value) {
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			this.layoutUtilsService.showError("Vui lòng nhập ngày tạm đình chỉ");
			return;
		}
		const EditTroCap = this.prepareCustomer();
		if (EditTroCap == undefined) {
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			return;
		}
		return EditTroCap;
	}

	LoadListLoaiTroCap(id_doituong = 0) {
		// if (id_doituong == 0)
		// 	this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.data.Id_LoaiHoSo == null);
		// else
		// 	this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.data.Id_LoaiHoSo == null || x.data.Id_LoaiHoSo == id_doituong);
		this.listLoaiTroCap = this.AllLoaiTroCap;
		this.changeDetectorRefs.detectChanges();
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
}