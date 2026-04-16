import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { HoSoNhaOService } from '../Services/ho-so-nha-o.service';
import { CommonService } from '../../../services/common.service';
import { HoSoNhaOModel } from '../Model/ho-so-nha-o.model';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from 'app/core/_base/crud';

@Component({
	selector: 'kt-ho-so-nha-o-supports',
	templateUrl: './ho-tro-nha-o-supports-dialog.component.html',
})
export class HoSoNhaOSupportsDialogComponent implements OnInit {

	displayedColumns = ['STT', 'SoHoSo', 'HoTen', 'Xa', 'Huyen', 'HinhThuc', 'ChiPhiYeuCau', 'SoTien', 'Nguon', 'GhiChu' ];
	_name = '';
	item: any[]=[];
	tsSeparator: string;
	disabledBtn = false;
	IsDuyet = false;

	constructor(
		public dialogRef: MatDialogRef<HoSoNhaOSupportsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public objectService: HoSoNhaOService,
		public dialog: MatDialog,
		public commonServices: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		public changeDetector: ChangeDetectorRef) {
			this._name = 'hồ sơ nhà ở';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.tsSeparator = this.commonServices.thousandSeparator;
		if (this.IsDuyet)
			this.displayedColumns = ['STT', 'SoHoSo', 'HoTen', 'Xa', 'Huyen', 'HinhThuc', 'ChiPhiYeuCau', 'TienHoTro', 'SoTien', 'Nguon', 'GhiChu' ];
	}

	getTitle() {
		if (this.IsDuyet)
			return 'Duyệt ' + this._name;
		return 'Hỗ trợ ' + this._name;
	}


	ngAfterViewChecked() {
		//chặn lỗi ExpressionChangedAfterItHasBeenCheckedError
		this.changeDetector.detectChanges();
	}

	loadNguon(value, item) {
		var val = this.item.find(x => x.Id == item.Id);
		if (val != null)
			val.NguonKinhPhi = value;
	}

	updateSL(value, item, str) {
		var val = this.item.find(x => x.Id == item.Id);
		if (val != null)
			val[str] = value;
	}

	hotros() {
		let lst = [];
		for (let i=0; i<this.item.length; i++) {
			let x = this.item[i];
			let sotien = 0;
			if (x.SoTien != undefined) {
				sotien = +x.SoTien.replaceAll('.', '');
			}
			if (sotien <= 0) {
				this.layoutUtilsService.showError('Nhập số tiền cho HS: ' + x.HoTen);
				return;
			}
			if (x.NguonKinhPhi == undefined || x.NguonKinhPhi <= 0) {
				this.layoutUtilsService.showError('Chọn nguồn kinh phí cho HS: ' + x.HoTen);
				return;
			}

			let _item: any = {};
			_item.Id = 0;
			_item.Id_NCC = x.Id;
			_item.SoTien = sotien;
			_item.NguonKinhPhi = x.NguonKinhPhi == undefined ? 0 : x.NguonKinhPhi;
			_item.GhiChu = x.GhiChu == undefined ? "" : x.GhiChu;
			lst.push(_item);
		}

		const _title = this.translate.instant('Xác nhận hỗ trợ');
		const _description = this.translate.instant('Bạn có chắc muốn hỗ trợ những hồ sơ này ?');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res)	return;
			this.disabledBtn = true;
			this.objectService.hoTroNhaOs(lst).subscribe(res => {
				this.disabledBtn = false;
				this.changeDetector.detectChanges();
				if (res && res.status === 1) {
					let data = res.data;
					this.dialogRef.close({
						data
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	duyets() {
		let Sotiens = [], Nguonkinhphis = [], Ghichus = [];
		for (let i=0; i<this.item.length; i++) {
			let x = this.item[i];
			let sotien = 0;
			if (x.SoTien != undefined) {
				sotien = +x.SoTien.replaceAll('.', '');
			}

			Sotiens.push(sotien);
			Nguonkinhphis.push(x.NguonKinhPhi == undefined ? 0 : x.NguonKinhPhi)
			Ghichus.push(x.GhiChu == undefined ? "" : x.GhiChu);
		}

		var data = {
			ids: this.item.filter(x => !x.IsEnable_Duyet).map(x => x.Id),
			value: true,
			Sotiens: Sotiens,
			Nguonkinhphis: Nguonkinhphis,
			Ghichus: Ghichus
		};

		const _title = this.translate.instant('OBJECT.DUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res)	return;
			this.disabledBtn = true;
			this.objectService.Duyets(data).subscribe(res => {
				this.disabledBtn = false;
				if (res && res.status === 1) {
					let data = res.data;
					this.dialogRef.close({
						data
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}

	close() {
		this.dialogRef.close();
	}
	
}
