import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';

@Component({
	selector: 'kt-huong-dan-hoan-thien',
	templateUrl: './huong-dan-hoan-thien-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HuongDanHuongThienDialogComponent implements OnInit {
	item: any;

	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';

	constructor(
		public dialogRef: MatDialogRef<HuongDanHuongThienDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private objectService: HoSoNCCDuyetService,
		public CommonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data.item;
		if (this.item.itemHD != undefined) {
			this.item.NoiDung = this.item.itemHD.NoiDung;
			this.item.MoTa = this.item.itemHD.MoTa;
		}
		if (this.item.id_quytrinh_lichsu > 0) {
			this.objectService.getDetailHuongDan(this.item.id_quytrinh_lichsu).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
		this.createForm();
	}

	createForm() {
		const temp: any = {
			NoiDung: [this.item.NoiDung, Validators.required],
			MoTa: [this.item.MoTa],
		};

		this.itemForm = this.fb.group(temp);
		this.focusInput.nativeElement.focus();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = 'Hướng dẫn hoàn thiện hồ sơ';
		if (this.item.id_quytrinh_lichsu > 0)
			return 'Cập nhật hướng dẫn';
		return result;
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		let _item: any = { id_quytrinh_lichsu: this.item.id_quytrinh_lichsu };
		_item.NoiDung = controls.NoiDung.value;
		_item.MoTa = controls.MoTa.value;
		return _item;
	}

	onSubmit(value: boolean) {

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
		const _item = this.prepareData();
		if (this.item.id_quytrinh_lichsu > 0) {
			this.objectService.updateHuongDan(_item).subscribe(res => {
				if (res && res.status == 1) {
					this.layoutUtilsService.showInfo("Cập nhật hướng dẫn thành công");
					this.dialogRef.close({
						_item
					});
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		} else {
			this.dialogRef.close({
				_item
			});
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}
}
