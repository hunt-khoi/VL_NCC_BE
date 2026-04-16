import { DanhmucTrocapModel } from './../Models/danh-muc-tro-cap.model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { DanhMucKhacService } from './../services/danh-muc-khac.service';
import { CommonService } from './../../../services/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DanhmuckhacModel } from './../Models/danh-muc-khac.model';
import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-tro-cap-detail',
	templateUrl: './tro-cap-detail.component.html',
})
export class TroCapDetailComponent implements OnInit {
	item: DanhmucTrocapModel;
	oldItem: DanhmuckhacModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	listLoaiHoSo: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listBieumau: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listBieumauCat: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listLoaiTroCapCha: any[] = [];
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<TroCapDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public commonService: CommonService,
		private danhmuckhacService: DanhMucKhacService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("LOAI_DD.NAME");
	}
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		//list biểu mẫu
		this.commonService.liteBieuMau(3).subscribe(res => {
			this.listBieumau.next(res.data);
			this.listOpt = res.data;
		});
		this.commonService.liteBieuMau(5).subscribe(res => {
			this.listBieumauCat.next(res.data);
			this.listOpt1 = res.data;
		});
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			this.listLoaiHoSo = res.data;
		})
		this.createForm();
		if (this.item.Id > 0) {
			this.danhmuckhacService.getDetailTC(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.loadDM(this.item.Id_LoaiHoSo);
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			MaTroCap: [this.item.MaTroCap, Validators.required],
			TroCap: [this.item.TroCap, Validators.required],
			Id_LoaiHoSo: [this.item.Id_LoaiHoSo == null ? 0 : this.item.Id_LoaiHoSo],
			TienTroCap: [this.item.TienTroCap],
			PhuCap: [this.item.PhuCap],
			TienMuaBao: [this.item.TienMuaBao],
			TroCapNuoiDuong: [this.item.TroCapNuoiDuong],
			Id_Template: [this.item.Id_Template == null ? 0 : this.item.Id_Template],
			Id_Template_Cat: [this.item.Id_Template_Cat == null ? 0 : this.item.Id_Template_Cat],
			Id_Parent: [this.item.Id_Parent == null ? 0 : this.item.Id_Parent],
			SoThang: [this.item.SoThang],
			SoThangTC: [this.item.SoThangTC],
			Keys_ID: [this.item.Keys_ID]
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		if (this.item.Id > 0)
			return this.allowEdit ? 'Cập nhật loại trợ cấp' : 'Chi tiết loại trợ cấp';
		return 'Thêm mới loại trợ cấp';
	}
	
	loadDM(Id_LoaiHoSo) {
		this.itemForm.controls['Id_Parent'].setValue(0)
		this.commonService.liteConstLoaiTroCapCha(Id_LoaiHoSo).subscribe(res => {
			this.listLoaiTroCapCha = res.data;
			if (this.item.Id_Parent > 0)
				this.chooseParent(this.item.Id_Parent, true);
		})
	}
	chooseParent(value, isThang = false) {
		var find = this.listLoaiTroCapCha.find(x => +x.id == +value);
		if (find) {
			if (!isThang) {
				var sothang = 3;
				this.itemForm.controls['SoThang'].setValue(sothang);
			}
			let temp = find.data.TienTroCap ? this.itemForm.controls['SoThang'].value * find.data.TienTroCap : "";
			this.itemForm.controls['TienTroCap'].setValue(temp);
		}
	}
	/** ACTIONS */
	prepareCustomer(): DanhmucTrocapModel {

		const controls = this.itemForm.controls;
		const _item = new DanhmucTrocapModel();
		_item.Id_LoaiHoSo = controls['Id_LoaiHoSo'].value;
		_item.MaTroCap = controls['MaTroCap'].value;
		_item.TroCap = controls['TroCap'].value;
		_item.PhuCap = controls['PhuCap'].value;
		_item.Keys_ID = controls['Keys_ID'].value;
		_item.TienMuaBao = controls['TienMuaBao'].value;
		_item.TroCapNuoiDuong = controls['TroCapNuoiDuong'].value;
		_item.Id_Template = controls['Id_Template'].value;
		_item.Id_Template_Cat = controls['Id_Template_Cat'].value;
		_item.SoThangTC = controls['SoThangTC'].value;
		_item.Id_Parent = controls['Id_Parent'].value;
		if (_item.Id_Parent > 0)
			_item.SoThang = controls['SoThang'].value
		else {
			_item.TienTroCap = controls['TienTroCap'].value;
			_item.SoThang = 0;
		}
		return _item;
	}
	onSubmit(withBack: boolean = false) {

		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const EditTroCap = this.prepareCustomer();
		if (this.item.Id > 0) {
			EditTroCap.Id = this.item.Id;
			this.UpdateDanhmuc(EditTroCap, withBack);
		} else {
			this.CreateDanhmuc(EditTroCap, withBack);
		}
	}
	UpdateDanhmuc(_item: DanhmucTrocapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.UpdateItemTC(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateDanhmuc(_item: DanhmucTrocapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.CreateTC(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}

	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listBieumau.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listBieumau.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter1() {
		if (!this.listOpt1) {
			return;
		}
		let search = this.FilterCtrl1;
		if (!search) {
			this.listBieumauCat.next(this.listOpt1.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listBieumauCat.next(
			this.listOpt1.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}
}
