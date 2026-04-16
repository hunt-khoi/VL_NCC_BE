import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { dottangquaService } from '../Services/dot-tang-qua.service';

@Component({
	selector: 'kt-so-to-trinh-edit',
	templateUrl: './so-to-trinh-edit.dialog.component.html'
})
export class SoToTrinhEditDialogComponent implements OnInit {
	item: any;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize: boolean = false;
	lstNhom: any[] = [];
	ready: boolean = false;
	allowEdit: boolean = true;

	constructor(
		public dialogRef: MatDialogRef<SoToTrinhEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private service: dottangquaService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService, ) { }

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.service.list_sott(this.item.Id).toPromise().then(res => {
			if (res && res.status == 1) {
				this.lstNhom = res.data;
				this.ready = true;
				this.changeDetectorRefs.detectChanges();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}
	
	/** UI */
	getTitle(): string {
		if (!this.allowEdit)
			return this.translate.instant('DOT_TANG_QUA.detailtotrinh');
		return this.translate.instant('DOT_TANG_QUA.updatetotrinh');
	}

	onSubmit(item) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		let _item = Object.assign({}, item);
		if (_item.Id == null)
			_item.Id = 0;
		_item.Id_DotTangQua = this.item.Id;
		if (item.NgayTT !== undefined && item.NgayTT !== '')
			_item.NgayTT = this.danhMucService.f_convertDate(item.NgayTT);
		else
			_item.NgayTT = null;
		this.service.update_Sott(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Cập nhật số tờ trình thành công");
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	close() {
		this.dialogRef.close();
	}
}
