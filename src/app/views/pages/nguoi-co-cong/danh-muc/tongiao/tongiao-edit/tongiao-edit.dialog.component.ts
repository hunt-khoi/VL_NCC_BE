import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { tongiaoModel } from '../Model/tongiao.model';
import { tongiaoService } from '../Services/tongiao.service';

@Component({
	selector: 'm-tongiao-edit-dialog',
	templateUrl: './tongiao-edit.dialog.component.html',
})

export class tongiaoEditDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: tongiaoModel = new tongiaoModel();
	oldItem: tongiaoModel = new tongiaoModel();
	itemForm: FormGroup = new FormGroup({});
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	_NAME: string = '';

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.item = this.data._item;
			if (this.viewLoading == true) {
				this.onSubmit(true);
			}
			else {
				this.onSubmit(false);
			}
		}
	}

	constructor(public dialogRef: MatDialogRef<tongiaoEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private apiService: tongiaoService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('TONGIAO.NAME');
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.item.Id_row > 0) {
			this.viewLoading = true;
		}
		else {
			this.viewLoading = false;
		}
		this.createForm();
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		this.itemForm = this.fb.group({
			Tentongiao: ['' + this.item.Tentongiao, Validators.required],
			Priority: ['' + this.item.Priority]
		});
		if (!this.allowEdit)
			this.itemForm.disable()
	}

	getTitle(): string {
		if (!this.allowEdit) return 'Xem chi tiết';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` - Tên tôn giáo: ${this.item.Tentongiao}`;
		return result;
	}

	prepare(): tongiaoModel{
		const controls = this.itemForm.controls;
		const _item = new tongiaoModel();
		_item.Id_row = this.item.Id_row;
		_item.Tentongiao = controls['Tentongiao'].value; // lấy tên biến trong formControlName
		_item.Priority = controls['Priority'].value;
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
		const update = this.prepare();
		if (update.Id_row > 0) {
			this.Update(update, withBack);
		} else {
			this.Create(update, withBack);
		}
	}

	Update(item: tongiaoModel, withBack: boolean) {
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
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
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

	Create(item: tongiaoModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.apiService.Create(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
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

	close() {
		this.dialogRef.close();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
}