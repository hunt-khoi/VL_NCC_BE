import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, Type } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { BieuMauService } from '../services/bieu-mau.service';

@Component({
	selector: 'kt-bieu-mau-thanh-phan-edit-dialog',
	templateUrl: './bieu-mau-thanh-phan-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BieuMauThanhPhanEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';

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

	constructor(
		public dialogRef: MatDialogRef<BieuMauThanhPhanEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: BieuMauService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._NAME = "Biểu mẫu thành phần";
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		this.viewLoading = true;
		this.objectService.getItemTP(this.item.Id).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.item = res.data;
				this.createForm();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	createForm() {
		const temp: any = {
			ThanhPhan: [this.item.ThanhPhan, Validators.required],
			NoiDung: [this.item.NoiDung, Validators.required],
			NoiDungFail: [this.item.NoiDungFail, Validators.required],
			fileDinhKem: [null, Validators.required],
			fileDinhKemFail: [null],
			isFail: [this.item.IsFail],
			DieuKien: [this.item.DieuKien],
		};

		this.itemForm = this.fb.group(temp);

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();
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

		result = this.translate.instant('COMMON.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		const _item: any = {};

		_item.Id = this.item.Id;
		_item.ThanhPhan = controls.ThanhPhan.value;
		_item.NoiDung = controls.NoiDung.value;
		_item.NoiDungFail = controls.NoiDungFail.value;
		_item.IsFail = controls.isFail.value;
		let f=controls.fileDinhKem.value;
		if(f!=null){
			if(f.length>0)
			_item.FileDinhKem = f[0];
		}
		
		if (_item.IsFail)
		{
			f=controls.fileDinhKemFail.value;
			if(f!=null) {
				if(f.length>0)
				_item.FileDinhKemFail = f[0];
			}	
		}
		return _item;
	}
	onSubmit(withBack: boolean = false) {
		let EditTroCap = this.prepareCustomer();
		this.Update(EditTroCap, withBack);
	}
	Update(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateItemTP(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}
}
