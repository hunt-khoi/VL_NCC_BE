
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonService } from '../../nguoi-co-cong/services/common.service';
import { LayoutUtilsService } from 'app/core/_base/crud/utils/layout-utils.service';
import { hdsdService } from '../Services/hdsd.service';

@Component({
	selector: 'kt-hdsd-edit',
	templateUrl: './hdsd-edit.dialog.component.html',
})
export class HDSDEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	change: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	arr: string[] = [];
	_name: string = "";
	keys: any[] = [];
	Id: number = 0;

	constructor(public dialogRef: MatDialogRef<HDSDEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		private hdsdService1: hdsdService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._name = this.translate.instant("HDSD.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (+this.item.Id > 0) {
			this.hdsdService1.getItem(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.Id = this.item.Id;
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		let temp = {
			TenHuongDan: [this.item.HDSD, Validators.required],
			IsUp: [this.item.Id == 0 ? true : false],
			fileDinhKem: [null]
		};
		this.itemForm = this.fb.group(temp);
		if (this.focusInput) 
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		if (this.item.Id > 0) {
			if (this.allowEdit)
				return 'Cập nhật hướng dẫn';
			else
				return 'Chi tiết hướng dẫn';
		}
		else
			return 'Thêm mới hướng dẫn';
	}

	/** ACTIONS */
	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.IsUp = controls['IsUp'].value;
		_item.TenHuongDan = controls['TenHuongDan'].value;
		_item.FileDinhKem = null;
		let f = controls['fileDinhKem'].value;
		if (f && f.length > 0)
			_item.FileDinhKem = f[0];
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
		const data = this.prepareCustomer();
		if (data.Id > 0) 
			this.Update(data);
		else 
			this.Create(data, withBack);
	}

	Update(item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.hdsdService1.UpdateItem(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.hdsdService1.CreateItem(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				}
				else {
					this.change = true;
					this.reset();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	reset() {
		this.item = { Id: 0, Version: '1.0.0', content: '$' };
		this.createForm();
	}

	close() {
		this.dialogRef.close(this.change);
	}
}