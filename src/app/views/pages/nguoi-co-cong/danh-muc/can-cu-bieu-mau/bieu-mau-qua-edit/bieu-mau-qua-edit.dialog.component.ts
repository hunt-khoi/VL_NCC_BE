import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from './../../../services/common.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { BieuMauQuaService } from '../services/bieu-mau-qua.service';
import { DomSanitizer } from '@angular/platform-browser';
import { KeyWordListDialogComponent } from '../key-word-list-dialog/key-word-list-dialog.component';

@Component({
	selector: 'kt-bieu-mau-qua-edit',
	templateUrl: './bieu-mau-qua-edit.dialog.component.html',
})
export class BieuMauQuaEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	change: boolean = false;
	arr: string[] = [];
	_name = "";
	strHtml: any;
	keys: any[] = [];

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

	constructor(public dialogRef: MatDialogRef<BieuMauQuaEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		private commonService: CommonService,
		private danhmuckhacService: BieuMauQuaService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService,
		private sanitized: DomSanitizer) {
		this._name = this.translate.instant("BIEUMAU.NAME");
	}
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}
	ngOnInit() {
		this.danhmuckhacService.ListKey().subscribe(res => {
			this.keys = res.data;
		});
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (+this.item.Id > 0) {
			this.danhmuckhacService.getItem(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.strHtml = this.parseHtml(this.item.content);
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}
	parseHtml(str) {
		if (!str)
			return '';
		var html = str;
		var reg1 = /\:[A-Za-z]\w*\:/gm
		var match = html.match(reg1);
		if (match != null) {
			for (var i = 0; i < match.length; i++) {
				var key = match[i] + '';

				// var re = `<span style="color:green">${key}</span>`;
				// 	html = html.replaceAll(key, re);
				let index = this.keys.findIndex(x => (':' + x.key + ':') == key);
				if (index >= 0) {
					var re = `<span style="color:green">${key}</span>`;
					html = html.replaceAll(key, re);
				}
			}
		}
		return this.sanitized.bypassSecurityTrustHtml(html)
	}

	createForm() {
		let temp = {
			BieuMau: [this.item.BieuMau, Validators.required],
			curVersion: [this.item.Version],
			Version: ['', Validators.required]
		};
		if (this.item.content) {
			this.arr = this.item.content.split("$");
			for (let i = 0; i < this.arr.length; i++) {
				temp['content' + i] = this.arr[i]
			}
		}
		this.itemForm = this.fb.group(temp);

		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		if (this.item.Id > 0) {
			if (this.allowEdit)
				return 'Cập nhật biểu mẫu';
			else
				return 'Chi tiết biểu mẫu';
		}
		else
			return 'Thêm mới biểu mẫu';
	}
	/** ACTIONS */
	prepareCustomer(): any {

		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.BieuMau = controls['BieuMau'].value;
		_item.Version = controls['Version'].value;
		let str = '';
		if (this.arr) {
			for (let i = 0; i < this.arr.length; i++) {
				str += str == '' ? "" : "$";
				str += controls['content' + i].value;
			}
		}
		_item.content = str;

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
		const EditDanhmucKhac = this.prepareCustomer();
		this.UpdateDanhmuc(EditDanhmucKhac);
	}
	UpdateDanhmuc(_item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.UpdateItem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	displayKeyword() {
		this.isZoomSize = !this.isZoomSize;
		this.dialogRef.updateSize(this.isZoomSize ? "90%" : "70%");
		return;
	}
	viewKeyword() {
		const dialogRef = this.dialog.open(KeyWordListDialogComponent, { data: { IsQua: true } });
		dialogRef.afterClosed().subscribe(res => {

		});
	}
	reset() {
		this.item = { Id: 0, Version: '1.0.0', content: '$' };
		this.createForm();
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close(this.change);
	}
}
