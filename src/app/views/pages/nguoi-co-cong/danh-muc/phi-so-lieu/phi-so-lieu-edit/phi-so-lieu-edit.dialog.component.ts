import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PhiSoLieuModel } from '../Model/phi-so-lieu.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { PhiSoLieuServices } from '../Services/phi-so-lieu.service';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-phi-so-lieu-edit',
	templateUrl: './phi-so-lieu-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PhiSoLieuDialogComponent implements OnInit {
	item: PhiSoLieuModel;
	oldItem: PhiSoLieuModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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

	constructor(public dialogRef: MatDialogRef<PhiSoLieuDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private loaiGiayToServices: PhiSoLieuServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("PHI_sO_LIEU.NAME");
	}
	
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.danhMucService.liteFilter().subscribe(res => {
			this.listOpt = res.data;
			this.listFilter.next(res.data);
		});
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.loaiGiayToServices.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					if (this.allowEdit)
						this.allowEdit = res.data.AllowEdit;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}


	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listFilter.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listFilter.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	createForm() {
		this.itemForm = this.fb.group({
			PhiSoLieu: ['' + this.item.PhiSoLieu, Validators.required],
			MoTa: [this.item.MoTa == null ? '': '' + this.item.MoTa],
			Id_Filter: [this.item.Id_Filter == null ? 0 : this.item.Id_Filter],
			Priority: [this.item.Priority, Validators.pattern(this.danhMucService.ValidateFormatRegex('prior'))],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			return 'Xem chi tiết phí số liệu';
		}
		result = this.translate.instant('COMMON.UPDATE') + ' phí số liệu';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): PhiSoLieuModel {
		const controls = this.itemForm.controls;
		const _item = new PhiSoLieuModel();
		_item.Id = this.item.Id;
		_item.PhiSoLieu = controls['PhiSoLieu'].value; // lấy tên biến trong formControlName
		_item.MoTa = controls['MoTa'].value;
		_item.Priority = controls['Priority'].value;
		_item.Id_Filter = controls['Id_Filter'].value;
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

		const EditLoaiGiayTo = this.prepareCustomer();
		if (EditLoaiGiayTo.Id > 0) {
			this.UpdateLoaiGiayTo(EditLoaiGiayTo, withBack);
		} else {
			this.CreateLoaiGiayTo(EditLoaiGiayTo, withBack);
		}
	}

	UpdateLoaiGiayTo(_item: PhiSoLieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiGiayToServices.Update(_item).subscribe(res => {
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

	CreateLoaiGiayTo(_item: PhiSoLieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiGiayToServices.Create(_item).subscribe(res => {
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
}
