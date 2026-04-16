import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';

@Component({
	selector: 'kt-dieu-kien-edit',
	templateUrl: './dieu-kien-edit.dialog.component.html',
})

export class DieuKienEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	isZoomSize: boolean = false;
	listDT: any[] = [];
	allowEdit: boolean = true;

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

	constructor(public dialogRef: MatDialogRef<DieuKienEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private _service: NhapQuyTrinhDuyetService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private danhMucChungService: CommonService,
		private router: Router,) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.danhMucChungService.liteConstLoaiHoSo().subscribe(res => {
			if (res && res.status === 1) {
				this.listDT = res.data;
				this.changeDetectorRefs.detectChanges();
			};
		});
		if (this.item.Id > 0) {
			this._service.get_ChiTietDieuKien(this.item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
			this.viewLoading = true;
		}
		else {
			// this.themcot();
			this.viewLoading = false;
		}
		this.createForm();
	}

	createForm() {
		this.itemForm = this.fb.group({
			title: [this.item.DieuKien, Validators.required],
			value: [+this.item.value, Validators.required],
			tgxa: [this.item.TGXuLyXa]
		});
		if (this.item.Id == 0) {
			this._service.findAllCapQuanLy(this.item.Id_QuyTrinh).subscribe(res => {
				if (res && res.status == 1) {
					this.item.CapQL = res.data.map(x => {
						return {
							Id: 0,
							rowid: x.ID_CapQuanLy,
							title: x.TenCapQuanLy,
							priority: x.ViTri,
							SoNgay: 0
						}
					});
					this.changeDetectorRefs.detectChanges();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		let result = "Thêm mới";
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = 'Chi tiết';
			return result;
		}
		result = 'Cập nhật';
		return result;
	}

	/** ACTIONS */
	prepare(): any {
		const controls = this.itemForm.controls;
		const item: any = {};
		item.Id = this.item.Id;
		item.IdQuyTrinh = this.item.Id_QuyTrinh;
		item.CapQL = this.item.CapQL;
		item.DieuKien = controls['title'].value;
		item.value = '' + controls['value'].value;
		item.TGXuLyXa = controls['tgxa'].value
		item.operator = '=';
		return item;
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
		const updatedegree = this.prepare();
		if (updatedegree.Id > 0) {
			this.Update(updatedegree, withBack);
		} else {
			this.Create(updatedegree, withBack);
		}
	}

	Update(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this._service.CreateDieuKien(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: "Quy trình theo đối tượng" });
				this.layoutUtilsService.showInfo(_messageType);
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this._service.CreateDieuKien(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: "Quy trình theo đối tượng" });
				this.layoutUtilsService.showInfo(_messageType);
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.item = {
						Id: 0,
						Id_QuyTrinh: this.item.Id_QuyTrinh
					}
					this.createForm();
				}
			}
			else {
				this.viewLoading = false;
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

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
}
