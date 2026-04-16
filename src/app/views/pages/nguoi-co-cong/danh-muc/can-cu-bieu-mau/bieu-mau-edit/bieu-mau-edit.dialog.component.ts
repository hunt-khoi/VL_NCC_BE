import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from './../../../services/common.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { BieuMauService } from '../services/bieu-mau.service';
import { DomSanitizer } from '@angular/platform-browser';
import { KeyWordListDialogComponent } from '../key-word-list-dialog/key-word-list-dialog.component';

@Component({
	selector: 'kt-bieu-mau-edit',
	templateUrl: './bieu-mau-edit.dialog.component.html',
})
export class BieuMauEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	lstCanCu: any[];
	change: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	arr: string[] = [];
	_name = "";
	strHtml: any;
	keys: any[] = [];
	lstLoai: any[] = [];
	lstLoaiQD: any[] = [];

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

	constructor(public dialogRef: MatDialogRef<BieuMauEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		private danhmuckhacService: BieuMauService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService,
		private sanitized: DomSanitizer) {
		this._name = this.translate.instant("LOAI_DD.NAME");
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
		this.commonService.liteCanCu().subscribe(res => {
			this.lstCanCu = res.data;
		});
		this.commonService.ListLoaiBieuMau().subscribe(res => {
			if (res && res.status == 1)
				this.lstLoai = res.data;
		});
		this.commonService.liteConstLoaiQuyetDinh().subscribe(res => {
			if (res && res.status == 1)
				this.lstLoaiQD = res.data;
		});
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
		var reg = /\:[A-Za-z](\w*\([0-9]*\))\:/gm //:TienTroCap(22):
		var match1 = html.match(reg);
		if (match1 != null) {
			for (var i = 0; i < match1.length; i++) {
				var key = match1[i] + '';
				var key_c = key.replace(/\([0-9]*\)/gm, "");

				// var re = `<span style="color:green">${key}</span>`;
				// 	html = html.replaceAll(key, re);
				let index = this.keys.findIndex(x => (':' + x.key + ':') == key_c);
				if (index >= 0) {
					var re = `<span style="color:green">${key}</span>`;
					html = html.replaceAll(key, re);
				}
			}
		}

		var reg1 = /\:[A-Za-z]\w*\:/gm  //:TienTroCap:
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
			So: [this.item.So, Validators.required],
			BieuMau: [this.item.BieuMau, Validators.required],
			Id_CanCu: [this.item.Id_CanCu, Validators.required],
			Priority: [this.item.Priority, Validators.min(1)],
			IsUp: [false, Validators.required],
			curVersion: [this.item.Version],
			Loai: [this.item.Loai],
			Id_LoaiQuyetDinh: [this.item.Id_LoaiQuyetDinh, Validators.min(1)],
			Version: [''],
			isTinh: [this.item.isTinh],
			isHuyen: [this.item.isHuyen],
			isXa: [this.item.isXa],
			fileDinhKem: [null]
		};
		if (this.item.content) {
			this.arr = [this.item.content];
			for (let i = 0; i < this.arr.length; i++) {
				temp['content' + i] = this.arr[i]
			}
		}
		this.itemForm = this.fb.group(temp);

		this.focusInput.nativeElement.focus();
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
		_item.So = controls['So'].value;
		_item.BieuMau = controls['BieuMau'].value;
		_item.Id_CanCu = controls['Id_CanCu'].value;
		_item.Priority = controls['Priority'].value;
		_item.Loai = controls['Loai'].value;
		_item.Id_LoaiQuyetDinh = controls['Id_LoaiQuyetDinh'].value;
		_item.IsUp = controls['IsUp'].value;
		_item.Version = controls['Version'].value;
		_item.isTinh = controls['isTinh'].value;
		_item.isHuyen = controls['isHuyen'].value;
		_item.isXa = controls['isXa'].value;
		_item.FileDinhKem = null;
		let f = controls['fileDinhKem'].value;
		if (f && f.length > 0) 
			_item.FileDinhKem = f[0];
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
	fileDinhKem: any;
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
		let f = controls['fileDinhKem'].value;
		if (f && f.length > 0) {
			this.fileDinhKem = f[0];
			if (this.fileDinhKem.extension != "doc" || this.fileDinhKem.extension != "docx") {
				this.layoutUtilsService.showError("File nội dung không đúng định dạng")
				return;
			}
		}
		else {
			this.layoutUtilsService.showError("Hãy chọn file nội dung")
			return;
		}

		const EditDanhmucKhac = this.prepareCustomer();
		if (EditDanhmucKhac.Id > 0) {
			this.UpdateDanhmuc(EditDanhmucKhac);
		} else {
			this.CreateDanhmuc(EditDanhmucKhac, withBack);
		}
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
		this.dialogRef.updateSize(this.isZoomSize ? "90%" : "900px");
		return;
	}
	viewKeyword() {
		const dialogRef = this.dialog.open(KeyWordListDialogComponent, { data: null });
		dialogRef.afterClosed().subscribe(res => {

		});
	}
	CreateDanhmuc(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.CreateItem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
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
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close(this.change);
	}
	download() {
		this.danhmuckhacService.download(this.item.Id).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}
}
