import { Component, OnInit, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from './../../../services/common.service';
import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';

@Component({
	selector: 'kt-update-bieu-mau-dialog',
	templateUrl: './update-bieu-mau-dialog.component.html',
})
export class UpdateBieuMauDialogComponent implements OnInit {

	item: any;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	listBieumau: any[] = [];
	listBieumau_congnhan: any[] = [];
	listBieumau_dichuyen: any[] = [];
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}
	
	constructor(public dialogRef: MatDialogRef<UpdateBieuMauDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private commonService: CommonService,
		private apiService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._name = "Cập nhật biểu mẫu";
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.item.Id_Template == null)
			this.item.Id_Temlpate = 0;
		if (this.item.Id_Template_DiChuyen == null)
			this.item.Id_Template_DiChuyen = 0;
		if (this.item.Id_Template_CongNhan == null)
			this.item.Id_Template_CongNhan = 0;
		if (this.item.Id_Template_ThanNhan == null)
			this.item.Id_Template_ThanNhan = 0;

		//list biểu mẫu
		this.commonService.liteBieuMau(1).subscribe(res => {
			this.listBieumau = res.data;
			this.listBieumau.unshift({
				id: 0,
				title: '-- Chọn biểu mẫu --'
			})
		});
		// biểu mẫu công nhận
		this.commonService.liteBieuMau(2).subscribe(res => {
			this.listBieumau_congnhan = res.data;
			this.listBieumau_congnhan.unshift({
				id: 0,
				title: '-- Chọn biểu mẫu --'
			})
		});
		// biểu mẫu di chuyển
		this.commonService.liteBieuMau(4).subscribe(res => {
			this.listBieumau_dichuyen = res.data;
			this.listBieumau_dichuyen.unshift({
				id: 0,
				title: '-- Chọn biểu mẫu --'
			})
		});
	}

	onSubmit(withBack: boolean = false) {
		let item: any = {};
		item.Id = this.item.Id;
		item.Id_Template = this.item.Id_Template;
		item.Id_Template_DiChuyen = this.item.Id_Template_DiChuyen;
		item.Id_Template_CongNhan = this.item.Id_Template_CongNhan;
		item.Id_Template_ThanNhan = this.item.Id_Template_ThanNhan;
		this.Update(item, withBack);
	}

	close() {
		this.dialogRef.close();
	}

	Update(item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.UpdateBieuMau(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
}