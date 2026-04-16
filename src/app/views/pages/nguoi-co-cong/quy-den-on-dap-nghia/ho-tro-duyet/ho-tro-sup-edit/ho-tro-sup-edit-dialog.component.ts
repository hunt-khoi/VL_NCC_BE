import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { HoTroDTDuyetService } from './../Services/ho-tro-duyet.service';

@Component({
	selector: 'kt-ho-tro-sup-edit',
	templateUrl: './ho-tro-sup-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoTroSupDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	listND: any[] = [];
	SoTien: number = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<HoTroSupDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: HoTroDTDuyetService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = 'Hỗ trợ đối tượng';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.soTien != undefined)
			this.SoTien = this.data.soTien;
		
		this.commonService.liteNoiDungChi().subscribe(res => {
			this.listND = res.data
			this.changeDetectorRefs.detectChanges();
		})

		this.createForm();
	}

	createForm() {
		const temp: any = {
			SoTien: [this.SoTien, Validators.required],
			Id_NoiDung: [],
			GhiChu: [this.item.GhiChu],
			IsTrucTiep: [true]
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
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = 0;
		_item.Id_DanhSach = this.item.Id;
		_item.SoTien = +controls.SoTien.value;
		_item.Id_NoiDung = +controls.Id_NoiDung.value;
		_item.GhiChu = controls.GhiChu.value;
		_item.IsTrucTiep = controls.IsTrucTiep.value;

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
		this.hoTroNhaO(EditHoSo);
	}

	hoTroNhaO(_item: any) {
		const _title = this.translate.instant('Xác nhận hỗ trợ');
		const _description = this.translate.instant('Bạn có chắc muốn hỗ trợ cho danh sách này ?');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res)	return;

			this.disabledBtn = true;
			this.objectService.hoTroDoiTuong(_item).subscribe(res => {
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

	change() {}

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
