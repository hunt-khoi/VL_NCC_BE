import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { MucQuaService } from './../Services/muc-qua.service';
import { MucQuaModel } from './../Model/muc-qua.model';

@Component({
	selector: 'kt-muc-qua-edit',
	templateUrl: './muc-qua-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MucQuaEditDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: MucQuaModel = new MucQuaModel();
	oldItem: MucQuaModel = new MucQuaModel();
	itemForm: FormGroup = new FormGroup({});
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.key === 'Enter') { 
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.key === 'Enter') {
			this.onSubmit(false);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<MucQuaEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		private apiService: MucQuaService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('MUCQUA.NAME');
	}

	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		const temp: any = {
			MucQua: ['' + this.item.MucQua, Validators.required],
			SoTien: [this.item.SoTien, Validators.required],
			MoTa: ['' + this.item.MoTa],
			Priority: [this.item.Priority],
		};
		this.itemForm = this.fb.group(temp);

		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) 
			this.itemForm.disable();
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` mức quà`;
		return result;
	}

	prepare(): MucQuaModel {
		const controls = this.itemForm.controls;
		const _item = new MucQuaModel();
		_item.Id = this.item.Id;
		_item.SoTien = controls.SoTien.value;
		_item.MucQua = controls.MucQua.value;
		_item.MoTa = controls.MoTa.value;
		_item.Priority = controls.Priority.value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const Edit = this.prepare();
		if (Edit.Id > 0) {
			this.Update(Edit, withBack);
		} else {
			this.Create(Edit, withBack);
		}
	}

	Update(item: MucQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Update(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({ item });
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: MucQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Create(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({ item });
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		this.dialogRef.close();
	}
}