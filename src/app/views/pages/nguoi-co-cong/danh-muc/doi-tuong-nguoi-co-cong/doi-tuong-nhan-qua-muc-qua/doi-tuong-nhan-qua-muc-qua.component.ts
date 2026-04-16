import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { DoiTuongNguoiCoCongService } from './../Services/doi-tuong-nguoi-co-cong.service';

@Component({
	selector: 'kt-doi-tuong-nhan-qua-muc-qua',
	templateUrl: './doi-tuong-nhan-qua-muc-qua.component.html'
})

export class DoiTuongNhanQuaMucQuaComponent implements OnInit {
	item: any;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	lstNhom: any[] = [];
	lstNguon: any[] = [];
	ready: boolean = false;
	allowEdit: boolean = true;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(
		public dialogRef: MatDialogRef<DoiTuongNhanQuaMucQuaComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private danhMucService: CommonService,
		private doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	async ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.item.Details = [];
		await this.danhMucService.liteNguonKinhPhi(true).toPromise().then(res => {
			if (res && res.status == 1) {
				this.lstNguon = res.data;
			}
		})
		await this.danhMucService.liteNhomLeTet(true).toPromise().then(res => {
			if (res && res.status == 1)
				this.lstNhom = res.data;
		})

		if (this.data._item.Id > 0) {
			this.viewLoading = true;
			this.doiTuongNguoiCoCongService.getItemNhanQua(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.ready = true;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}
	getValue(id_nhom, id_nguon) {
		let find = this.item.Details.filter(x => x.Id_NhomLeTet == id_nhom && x.Id_NguonKinhPhi == id_nguon);
		if (find != null && find.length > 0)
			return this.danhMucService.f_currency_V2(find[0].SoTien);
		return '';
	}
	changeMuc($event, id_nhom, id_nguon) {
		let v = 0;
		if ($event.target.value !== "") { //bị lỗi NaN và api ko bắt
			v = this.danhMucService.stringToInt($event.target.value);
		}
		let find = this.item.Details.find(x => x.Id_NhomLeTet == id_nhom && x.Id_NguonKinhPhi == id_nguon);
		if (find != null)
			find.SoTien = v;
		else
			this.item.Details.push({ Id_DoiTuongNhanQua: this.item.Id, Id_NhomLeTet: id_nhom, Id_NguonKinhPhi: id_nguon, SoTien: v });
	}
	/** UI */
	getTitle(): string {
		if (!this.allowEdit)
			return 'Chi tiết mức quà cho đối tượng';
		return 'Cập nhật mức quà cho đối tượng';
	}

	onSubmit() {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.UpdateMucQua(this.item.Id, this.item.Details).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close(true);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	
	close() {
		this.dialogRef.close();
	}
}
