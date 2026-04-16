import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongDCCHModel } from '../Model/doi-tuong-nguoi-co-cong.model';
import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { ChonNhieuDungCuListComponent } from '../../../components';

@Component({
  selector: 'kt-doi-tuong-dung-cu-edit',
  templateUrl: './doi-tuong-dung-cu-edit.component.html',
})

export class DoiTuongDungCuEditComponent implements OnInit {

  	item: DoiTuongDCCHModel;
	oldItem: DoiTuongDCCHModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	lstNhomLoaiDoiTuongNCC: any[] = [];
	lstConstLoaiHoSo: any[] = [];
	lstDungCu: any[] = [];

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
		public dialogRef: MatDialogRef<DoiTuongDungCuEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		private doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONGBHYT.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.doiTuongNguoiCoCongService.getItemDCCH(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.lstDungCu = res.DungCuCHs;
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}
	createForm() {
		const temp: any = {
			DoiTuong: ['' + this.item.DoiTuong?this.item.DoiTuong:'', Validators.required],
			MaDoiTuong: ['' + this.item.MaDoiTuong?this.item.MaDoiTuong:'', Validators.required],
			MoTa: ['' + this.item.MoTa?this.item.MoTa:''],
			Priority: [this.item.Priority?this.item.Priority:'']
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);
			this.focusInput.nativeElement.focus();
		} else {
			temp.CreatedBy = ['' + this.item.CreatedBy];
			temp.CreatedDate = ['' + this.item.CreatedDate];
			temp.UpdatedBy = ['' + this.item.UpdatedBy];
			temp.UpdatedDate = ['' + this.item.UpdatedDate];
			this.itemForm = this.fb.group(temp);
			this.itemForm.disable();
			this.focusInput.nativeElement.focus();
		}

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

		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng dụng cụ chỉnh hình`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): DoiTuongDCCHModel {

		const controls = this.itemForm.controls;
		const _item = new DoiTuongDCCHModel();
		_item.Id = this.item.Id;
		_item.DoiTuong = controls.DoiTuong.value;
		_item.MaDoiTuong = controls.MaDoiTuong.value;
		_item.MoTa = controls.MoTa.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
		_item.DungCuCHs = this.item.DungCuCHs;
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
		const EditDoiTuongDCCH = this.prepareCustomer();
		if (EditDoiTuongDCCH.Id > 0) {
			this.UpdateDoiTuongDCCH(EditDoiTuongDCCH, withBack);
		} else {
			this.CreateDoiTuongDCCH(EditDoiTuongDCCH, withBack);
		}
	}
	UpdateDoiTuongDCCH(_item: DoiTuongDCCHModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.UpdateDoiTuongDCCH(_item).subscribe(res => {
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
	CreateDoiTuongDCCH(_item: DoiTuongDCCHModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.CreateDoiTuongDCCH(_item).subscribe(res => {
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

	chonDT() {
		let selected = this.item.DungCuCHs.map(x => {
			return { Id: x.Id, DungCu: x.DungCu };
		});
		const dialogRef = this.dialog.open(ChonNhieuDungCuListComponent, { data: { selected: selected } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.item.DungCuCHs = [];
			} else
				this.item.DungCuCHs = res.itemSelected;
		});
	}
	xoaDT(index) {
		this.item.DungCuCHs.splice(index, 1);
	}
}
