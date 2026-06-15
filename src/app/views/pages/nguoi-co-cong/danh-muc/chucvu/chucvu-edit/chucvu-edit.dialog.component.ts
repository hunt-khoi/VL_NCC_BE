import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { chucvuModel } from '../../chucvu/Model/chucvu.model';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { chucvuService } from '../Services/chucvu.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-chucvu-edit-dialog',
	templateUrl: './chucvu-edit.dialog.component.html',
})

export class chucvuEditDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: chucvuModel = new chucvuModel();
	oldItem: chucvuModel = new chucvuModel();
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	listchucdanh: any[] = [];
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	_name: string = "";

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

	constructor(public dialogRef: MatDialogRef<chucvuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public apiService: chucvuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CHUC_VU.NAME");
	}

	ngOnInit() {
		this.reset();
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id_row > 0) {
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id_row).pipe(takeUntil(this.destroy$)).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		//Load unit list
		this.danhMucService.getAllChucdanh().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listchucdanh = res.data;
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		this.itemForm = this.fb.group({
			Tenchucdanh: [this.item.Tenchucdanh, Validators.required],
			chucdanh: ['' + this.item.Id_CV, Validators.required],
			Tentienganh: [this.item.Tentienganh],
		});
		this.itemForm.controls["Tenchucdanh"].markAsTouched();
		this.itemForm.controls["chucdanh"].markAsTouched();
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (!this.allowEdit) return 'Xem chi tiết';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + `- ${this.item.Tenchucdanh}`;
		return result;
	}

	prepare(): chucvuModel {
		const controls = this.itemForm.controls;
		const _item = new chucvuModel();
		_item.Id_row = this.item.Id_row;
		_item.Tenchucdanh = controls['Tenchucdanh'].value; // lấy tên biến trong formControlName
		_item.Id_CV = controls['chucdanh'].value;
		_item.Tentienganh = controls['Tentienganh'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const EditChucVu = this.prepare();
		if (EditChucVu.Id_row > 0) {
			this.Update(EditChucVu, withBack);
		} else {
			this.Create(EditChucVu, withBack);
		}
	}

	Update(item: chucvuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Update(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: chucvuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.apiService.Create(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
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

	close() {
		this.dialogRef.close();
	}
}