import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { QuanHeGiaDinhService } from './../Services/quan-he-gia-dinh.service';
import { QuanHeGiaDinhModel } from './../Model/quan-he-gia-dinh.model';

@Component({
	selector: 'kt-quan-he-gia-dinh-edit',
	templateUrl: './quan-he-gia-dinh-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuanHeGiaDinhEditDialogComponent implements OnInit {
	item: QuanHeGiaDinhModel;
	oldItem: QuanHeGiaDinhModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
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
		public dialogRef: MatDialogRef<QuanHeGiaDinhEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private objectService: QuanHeGiaDinhService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('QUANHEGIADINH.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
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

	createForm() {
		const temp: any = {
			QHGiaDinh: ['' + this.item.QHGiaDinh, Validators.required],
			Priority: [this.item.Priority > -1 ? this.item.Priority : 0],
			IsChuYeu: [this.item.IsChuYeu],
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);

			this.focusInput.nativeElement.focus();
		} else {

			this.itemForm = this.fb.group(temp);
			this.itemForm.disable();
			this.focusInput.nativeElement.focus();
		}
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
		} else {
			if (this.item && this.item.Id > 0)
				result = this.translate.instant('COMMON.UPDATE');
		}

		return result + (this.item.ByQua ? ' QHGĐ đối tượng nhận quà' : ' QHGĐ đối tượng người có công');
	}

	/** ACTIONS */
	prepareCustomer(): QuanHeGiaDinhModel {
		const controls = this.itemForm.controls;
		const _item = new QuanHeGiaDinhModel();
		_item.Id = this.item.Id;
		_item.ByQua = this.item.ByQua;
		_item.QHGiaDinh = controls.QHGiaDinh.value;
		_item.Priority = controls.Priority.value;
		if (!this.item.ByQua)
			_item.IsChuYeu = controls.IsChuYeu.value;
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
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}
		const EditQuanHeGiaDinh = this.prepareCustomer();
		if (EditQuanHeGiaDinh.Id > 0) {
			this.UpdateQuanHeGiaDinh(EditQuanHeGiaDinh, withBack);
		} else {
			this.CreateQuanHeGiaDinh(EditQuanHeGiaDinh, withBack);
		}
	}

	UpdateQuanHeGiaDinh(_item: QuanHeGiaDinhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateQuanHeGiaDinh(_item).subscribe(res => {
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

	CreateQuanHeGiaDinh(_item: QuanHeGiaDinhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateQuanHeGiaDinh(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
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
}
