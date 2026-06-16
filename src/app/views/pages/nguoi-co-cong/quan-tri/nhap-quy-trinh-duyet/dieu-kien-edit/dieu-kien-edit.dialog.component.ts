import { Component, OnInit, Inject, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';

@Component({
	selector: 'kt-dieu-kien-edit',
	templateUrl: './dieu-kien-edit.dialog.component.html',
})

export class DieuKienEditDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: any;
	itemForm: FormGroup = new FormGroup({});
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
		if (event.altKey && event.key === 'Enter') { 
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.key === 'Enter') {
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
		private danhMucChungService: CommonService) {
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.danhMucChungService.liteConstLoaiHoSo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status === 1) {
				this.listDT = res.data;
				this.changeDetectorRefs.detectChanges();
			};
		});
		if (this.item.Id > 0) {
			this._service.get_ChiTietDieuKien(this.item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		this.itemForm = this.fb.group({
			title: [this.item.DieuKien, Validators.required],
			value: [+this.item.value, Validators.required],
			tgxa: [this.item.TGXuLyXa]
		});
		if (this.item.Id == 0) {
			this._service.findAllCapQuanLy(this.item.Id_QuyTrinh).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status == 1) {
					this.item.CapQL = res.data.map((x: any) => {
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
		if (!this.item || !this.item.Id) 
			return 'Thếm mới';
		if (!this.allowEdit)
			return 'Chi tiết';
		return 'Cập nhật';
	}

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
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		const updated = this.prepare();
		if (updated.Id > 0) 
			this.Update(updated);
		else 
			this.Create(updated, withBack);
	}

	Update(item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this._service.CreateDieuKien(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: "Quy trình theo đối tượng" });
				this.layoutUtilsService.showInfo(_messageType);
				this.dialogRef.close({ item });
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this._service.CreateDieuKien(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: "Quy trình theo đối tượng" });
				this.layoutUtilsService.showInfo(_messageType);
				if (withBack == true) {
					this.dialogRef.close({ item });
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