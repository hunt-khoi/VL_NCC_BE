import { TranslateService } from '@ngx-translate/core';
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { DanhMucKhacService } from './../services/danh-muc-khac.service';
import { CommonService } from './../../../services/common.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DanhmuckhacModel } from './../Models/danh-muc-khac.model';
import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { ChonNhieuBieuMauListComponent, ChonNhieuDoiTuongListComponent } from '../../../components';

@Component({
	selector: 'kt-danhmuckhac-detail',
	templateUrl: './danhmuckhac-detail.component.html',
})

export class DanhmuckhacDetailComponent implements OnInit {
	item: DanhmuckhacModel;
	oldItem: DanhmuckhacModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	listLoaiGiayTo: any[] = [];
	listDoiTuong: any[] = [];
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

	constructor(public dialog: MatDialog,
		public dialogRef: MatDialogRef<DanhmuckhacDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private danhmuckhacService: DanhMucKhacService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("LOAIHOSO.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.commonService.liteLoaiGiayTo().subscribe(res => {
			if (res && res.status == 1)
				this.listLoaiGiayTo = res.data;
		});
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			if (res && res.status == 1)
				this.listDoiTuong = res.data;
		});
		if (+this.item.Id > 0) {
			this.danhmuckhacService.getItem(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					if (this.item.Id_LoaiGiayTo)
						this.chonLoaiGT(this.item.Id_LoaiGiayTo);
					if (this.item.Id_LoaiGiayTo_CC)
						this.chonLoaiGT(this.item.Id_LoaiGiayTo_CC, true);
					this.item.GiayTos.forEach(x => {
						let f = this.listLoaiGiayTo.find(loai => +loai.id == +x.id);
						if (f) {
							f.Checked = true;
							f.IsRequired = x.IsRequired;
						}
					})
					this.createForm();
				}
			})
		}
		this.createForm();
	}

	createForm() {
		var arr = this.item.MaLoaiHoSo.split(".");
		this.itemForm = this.fb.group({
			MaLoaiHoSo: [arr[0], Validators.required],
			MaLoaiHoSo1: [arr.length > 1 ? arr[1] : ""],
			LoaiHoSo: ['' + this.item.LoaiHoSo, Validators.required],
			Id_LoaiGiayTo: [this.item.Id_LoaiGiayTo == null ? '' : '' + this.item.Id_LoaiGiayTo],
			Id_LoaiGiayTo_CC: [this.item.Id_LoaiGiayTo_CC == null ? '' : '' + this.item.Id_LoaiGiayTo_CC],
			MoTa: [this.item.MoTa],
			Id_DoiTuongNCC: [this.item.Id_DoiTuongNCC == null ? 0 : this.item.Id_DoiTuongNCC],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (this.item.Id > 0)
			return this.allowEdit ? 'Cập nhật loại hồ sơ' : 'Chi tiết loại hồ sơ';
		else
			return 'Thêm mới loại hồ sơ';
	}
	
	chonLoaiGT(value, isCC = false) {
		this.listLoaiGiayTo.forEach(x => {
			let llll;
			if (isCC)
				llll = this.itemForm.controls['Id_LoaiGiayTo'].value;
			else
				llll = this.itemForm.controls['Id_LoaiGiayTo_CC'].value;
			if (llll == undefined || (llll != undefined && +x.id != +llll))
				x.Disabled = false;
		});
		let f = this.listLoaiGiayTo.find(loai => +loai.id == +value);
		if (f) {
			f.Checked = false;
			f.Disabled = true;
		}
	}

	/** ACTIONS */
	prepareCustomer(): DanhmuckhacModel {
		const controls = this.itemForm.controls;
		const _item = new DanhmuckhacModel();
		_item.Id = this.item.Id;
		_item.MaLoaiHoSo = controls['MaLoaiHoSo'].value;
		if (controls['MaLoaiHoSo1'].value)
			_item.MaLoaiHoSo += "." + controls['MaLoaiHoSo1'].value;
		_item.LoaiHoSo = controls['LoaiHoSo'].value; // lấy tên biến trong formControlName
		_item.MoTa = controls['MoTa'].value;
		_item.Id_DoiTuongNCC = controls['Id_DoiTuongNCC'].value;
		_item.Id_LoaiGiayTo = controls['Id_LoaiGiayTo'].value;
		_item.Id_LoaiGiayTo_CC = controls['Id_LoaiGiayTo_CC'].value;
		_item.Id_Template = this.item.Id_Template;
		_item.Id_Template_CongNhan = this.item.Id_Template_CongNhan;
		_item.Id_Template_ThanNhan = this.item.Id_Template_ThanNhan;
		_item.GiayTos = this.listLoaiGiayTo.filter(x => x.Checked).map(x => { return { Id: x.id, IsRequired: x.IsRequired }; });
		// _item.BieuMaus = this.item.BieuMaus.map(x => x.Id);
		// _item.DoiTuongs = this.item.DoiTuongs.map(x => x.Id);
		_item.DoiTuongs = this.item.DoiTuongs;
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
		const EditDanhmucKhac = this.prepareCustomer();
		if (EditDanhmucKhac.Id > 0) {
			this.UpdateDanhmuc(EditDanhmucKhac, withBack);
		} else {
			this.CreateDanhmuc(EditDanhmucKhac, withBack);
		}
	}

	UpdateDanhmuc(_item: DanhmuckhacModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.UpdateItem(_item).subscribe(res => {
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

	CreateDanhmuc(_item: DanhmuckhacModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.danhmuckhacService.CreateItem(_item).subscribe(res => {
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
	
	change($event, loai) {
		loai.IsRequired = $event.checked;
	}

	chonBM(id_dt) {
		let idx_dt = this.item.DoiTuongs.findIndex(x=> x.Id == id_dt)
		let selected = this.item.DoiTuongs[idx_dt].BieuMaus.map(x => {
			return { Id: x.Id, BieuMau: x.BieuMau };
		});
		const dialogRef = this.dialog.open(ChonNhieuBieuMauListComponent, { data: { selected: selected } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				// this.item.DoiTuongs[idx_dt].BieuMaus = [];
				return
			} else
				this.item.DoiTuongs[idx_dt].BieuMaus = res.Selected;
		});
	}
	xoaBM(index, id_dt) {
		let idx_dt = this.item.DoiTuongs.findIndex(x=> x.Id == id_dt)
		this.item.DoiTuongs[idx_dt].BieuMaus.splice(index, 1);
	}
	chonDT() {
		let selected = this.item.DoiTuongs.map(x => {
			return { Id: x.Id, DoiTuong: x.DoiTuong };
		});
		const dialogRef = this.dialog.open(ChonNhieuDoiTuongListComponent, { data: { selected: selected } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.item.DoiTuongs = [];
			} else
				this.item.DoiTuongs = res.nhanVienSelected;
		});
	}
	xoaDT(index) {
		this.item.DoiTuongs.splice(index, 1);
	}
}
