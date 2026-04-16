import { TranslateService } from '@ngx-translate/core';
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from './../../../services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';

@Component({
	selector: 'kt-update-bieu-mau-dialog',
	templateUrl: './update-bieu-mau-dialog.component.html',
})
export class UpdateBieuMauDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	listBieumau: any[] = [];
	listBieumau_congnhan: any[] = [];
	listBieumau_dichuyen: any[] = [];
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		// if (event.ctrlKey && event.keyCode == 13) { //phím Enter
		// 	this.onSubmit(false);
		// }
	}
	
	constructor(public dialogRef: MatDialogRef<UpdateBieuMauDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private commonService: CommonService,
		private danhmuckhacService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
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
		this.hasFormErrors = false;
		let _item: any = {};
		_item.Id = this.item.Id;
		_item.Id_Template = this.item.Id_Template;
		_item.Id_Template_DiChuyen = this.item.Id_Template_DiChuyen;
		_item.Id_Template_CongNhan = this.item.Id_Template_CongNhan;
		_item.Id_Template_ThanNhan = this.item.Id_Template_ThanNhan;
		this.UpdateDanhmuc(_item, withBack);
	}

	close() {
		this.dialogRef.close();
	}

	UpdateDanhmuc(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.UpdateBieuMau(_item).subscribe(res => {
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
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

}
