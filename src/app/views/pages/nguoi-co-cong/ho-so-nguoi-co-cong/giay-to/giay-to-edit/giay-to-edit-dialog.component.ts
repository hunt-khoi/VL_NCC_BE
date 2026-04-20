import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { GiayToService } from '../Services/giay-to.service';
import { GiayToModel } from '../Model/giay-to.model';

@Component({
	selector: 'kt-giay-to-edit',
	templateUrl: './giay-to-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GiayToEditDialogComponent implements OnInit {
	item: GiayToModel = new GiayToModel();
	oldItem: GiayToModel = new GiayToModel();
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	listLoaiGiayTo: any[] = [];
	image: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME: string = '';

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

	constructor(public dialogRef: MatDialogRef<GiayToEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: GiayToService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('GIAYTO.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.LoadListLoaiGiayTo();
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.item.NgayCap === null) {
						this.item.NgayCap = '';
					}
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	createForm() {
		const temp: any = {
			Id_LoaiGiayTo: [this.item.Id_LoaiGiayTo, Validators.required],
			So: ['' + this.item.So, Validators.required],
			GiayTo: ['' + this.item.GiayTo, Validators.required],
			NoiCap: ['' + this.item.NoiCap, Validators.required],
			NgayCap: ['' + this.item.NgayCap, Validators.required],
			FileDinhKem: [this.item.FileDinhKem ? [this.item.FileDinhKem] : null],
		};
		this.itemForm = this.fb.group(temp);
		if (this.focusInput) 
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) 
			this.itemForm.disable();
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
	prepare(): GiayToModel | null {
		if (!this.itemForm) return null;
		const controls = this.itemForm.controls;
		const _item = new GiayToModel();
		_item.Id = this.item.Id;
		_item.So = controls.So.value;
		_item.GiayTo = controls.GiayTo.value;
		_item.Id_LoaiGiayTo = controls.Id_LoaiGiayTo.value;
		_item.NoiCap = controls.NoiCap.value;
		_item.NgayCap = controls.NgayCap.value;
		_item.Id_NCC = this.data.id_ncc;
		this.image = controls.FileDinhKem.value;
		if (controls.NgayCap.value !== '') {
			_item.NgayCap = this.commonService.f_convertDate(controls.NgayCap.value);
		} else {
			_item.NgayCap = '01/01/0001';
		}
		if (this.image && this.image.length > 0) {
			_item.FileDinhKem = this.image[0];
		} 
		return _item;
	}

	onSubmit(withBack: boolean = false) {
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
		const Edit = this.prepare();
		if (Edit) {
			if (Edit.Id > 0)
				this.Update(Edit, withBack);
			else
				this.Create(Edit, withBack);
		}
	}

	Update(item: GiayToModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({
						item
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: GiayToModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
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

	LoadListLoaiGiayTo() {
		this.commonService.liteLoaiGiayTo().subscribe(res => {
			this.listLoaiGiayTo = res.data;
		});
	}

	changeLoaiGT(val: any){
		this.listLoaiGiayTo.forEach(x => {
			if (this.itemForm && x.id == val)
				this.itemForm.controls.GiayTo.setValue(x.title)
		})
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

	close() {
		this.dialogRef.close();
	}
}