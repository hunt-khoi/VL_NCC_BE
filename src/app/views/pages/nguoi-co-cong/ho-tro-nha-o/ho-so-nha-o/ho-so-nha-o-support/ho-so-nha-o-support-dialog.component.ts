import { HoSoNhaOService } from './../Services/ho-so-nha-o.service';
import { HoSoNhaOModel } from '../../ho-so-nha-o/Model/ho-so-nha-o.model';
import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-ho-so-nha-o-support',
	templateUrl: './ho-so-nha-o-support-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOSupportDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	tien_hotro: number = 0;
	IsSua: boolean = false;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<HoSoNhaOSupportDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: HoSoNhaOService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._NAME = 'Hồ sơ hỗ trợ nhà ở';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		if (this.IsSua)
			this.tien_hotro = this.item.SoTien;
		else {
			this.tien_hotro = (this.item.TienHoTro != undefined) ? this.item.ChiPhiYeuCau - this.item.TienHoTro : this.item.ChiPhiYeuCau
			this.tien_hotro = this.tien_hotro >= 0 ? this.tien_hotro : 0;
		}

		this.createForm();
	}

	createForm() {
		const temp: any = {
			SoTien: [this.tien_hotro == null ? "0" : this.tien_hotro, Validators.required],
			NguonKinhPhi: [this.IsSua ? this.item.Id_NguonKP : 1, Validators.required],
			GhiChu: [this.item.GhiChu]
		};

		this.itemForm = this.fb.group(temp);
		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		return this._NAME;
	}

	/** ACTIONS */
	prepareCustomer(): HoSoNhaOModel {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = 0;
		_item.Id_NCC = this.item.Id;
		_item.SoTien = +controls.SoTien.value;
		_item.NguonKinhPhi = +controls.NguonKinhPhi.value;
		_item.GhiChu = controls.GhiChu.value;

		if (this.IsSua) {
			_item.Id = this.item.Id;
			_item.Id_NCC = this.item.Id_NCC
		}

		return _item;
	}

	onSubmit() {
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
		let EditHoSo: any = this.prepareCustomer();
		if (EditHoSo == null)	return;
		if (this.IsSua) {
			this.suaHoTroNhaO(EditHoSo);
		}
		else {
			this.hoTroNhaO(EditHoSo);
		}
	}

	hoTroNhaO(_item: any) {
		const _title = this.translate.instant('Xác nhận hỗ trợ');
		const _description = this.translate.instant('Bạn có chắc muốn hỗ trợ hồ sơ này ?');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res)	return;

			this.disabledBtn = true;
			this.objectService.hoTroNhaO(_item).subscribe(res => {
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	suaHoTroNhaO(_item: any) {
		const _title = this.translate.instant('Xác nhận chỉnh sửa');
		const _description = this.translate.instant('Bạn có chắc muốn chỉnh sửa thông tin hỗ trợ này ?');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res)	return;

			this.disabledBtn = true;
			this.objectService.UpdateHoTro(_item).subscribe(res => {
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
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

	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('90%', 'auto');
			this.isZoomSize = true;
		}
		else if (this.isZoomSize) {
			this.dialogRef.updateSize('70%', 'auto');
			this.isZoomSize = false;
		}
	}
}
