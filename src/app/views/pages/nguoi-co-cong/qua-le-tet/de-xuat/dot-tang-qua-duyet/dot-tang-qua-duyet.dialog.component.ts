import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DeXuatModel } from '../Model/de-xuat.model';
import { DeXuatService } from '../Services/de-xuat.service';

@Component({
	selector: 'm-dot-tang-qua-duyet-dialog',
	templateUrl: './dot-tang-qua-duyet.dialog.component.html',
})

export class DeXuatDuyetDialogComponent implements OnInit {
	item: DeXuatModel = new DeXuatModel();
	oldItem: DeXuatModel = new DeXuatModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
    disabledBtn: boolean = false;
	allowEdit: boolean = true; //cho phép sửa
	isZoomSize: boolean = false;
	_name = "";
	
	constructor(public dialogRef: MatDialogRef<DeXuatDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public apiService: DeXuatService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DOT_TANG_QUA.NAME");
	}

	ngOnInit() {
		this.item = this.data._item; 
		this.createForm();
		if (this.item.Id > 0) { 
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id).subscribe(res => {
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
	}

	createForm() {
		this.itemForm = this.fb.group({
			GhiChu: [],
        });
		this.itemForm.controls["GhiChu"].markAsTouched();
		if (!this.allowEdit)
			this.itemForm.disable();
	}
	
	getTitle(): string {
		let result = this.translate.instant('DOT_TANG_QUA.DUYET');
		return result;
	}

	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.note = controls['GhiChu'].value; 
		return _item;
	}

	onSubmit(duyet: boolean) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const DuyetDot = this.prepareCustomer();
		this.DuyetDotTangQua(DuyetDot, duyet)
	}

	closeForm() {
		this.dialogRef.close();
	}

	DuyetDotTangQua(item: any, value: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		let _title = '';
		let _description = '';
		let _waitDesciption = 'Đang xử lý...';
		if (value) {
			_title = 'Duyệt đợt tặng quà';
			_description = 'Bạn có chắc muốn duyệt đợt tặng quà này ?';
		}
		else {
			_title = 'Không duyệt đợt tặng quà';
			_description = 'Bạn có chắc không muốn duyệt đợt tặng quà này ?';
		}
        const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
        dialogRef.afterClosed().subscribe(res => {
            if (!res) return;
            
			this.apiService.duyet(item.Id, value, item.note).subscribe(res => {
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					this.dialogRef.close({ item });
				}
				else {
					this.viewLoading = false;
					this.layoutUtilsService.showError(res.error.message);
				}
			});
        });
	}

	close() {
		this.dialogRef.close();
	}
}