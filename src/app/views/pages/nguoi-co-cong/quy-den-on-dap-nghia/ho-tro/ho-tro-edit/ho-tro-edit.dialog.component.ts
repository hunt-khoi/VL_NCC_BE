import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { HoTroModel } from '../../ho-tro/Model/ho-tro.model';
import { CommonService } from '../../../services/common.service';
import { HoTroService } from '../Services/ho-tro.service';
import * as moment from 'moment';

@Component({
	selector: 'm-ho-tro-edit-dialog',
	templateUrl: './ho-tro-edit.dialog.component.html',
})

export class HoTroEditDialogComponent implements OnInit {
	item: HoTroModel;
	oldItem: HoTroModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';

	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean;

	treeNguoiNhan_Goc: any[] = [];
	treeNguoiNhan: any[] = [];

	_name = "";
	TongSo: number = 0;
	TongTien: number = 0;
	tongDT: any[] = [];
	tongSL: any[] = [];
	Filter: string = "";
	ids: string = "";
	Nam: number = 0;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(public dialogRef: MatDialogRef<HoTroEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public HoTroService: HoTroService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = 'Hỗ trợ';
		this.Nam = moment().get("year");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = new HoTroModel();
		this.item.clear(); 
		this.allowEdit = this.data.allowEdit;
		if (this.data.ids != undefined) {
			this.ids = this.data.ids
		}
		if (this.data._item != undefined) {
			this.item = this.data._item; 
		}
		
		this.createForm();
		this.viewLoading = true;
		this.disabledBtn = true;
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.HoTroService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.treeNguoiNhan_Goc = res.data.DoiTuongs;
					this.treeNguoiNhan = this.treeNguoiNhan_Goc;
					this.tinhTongMuc();
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		else { //thêm
			this.HoTroService.getListHoTro(this.ids).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.treeNguoiNhan_Goc = res.data;
					this.treeNguoiNhan = this.treeNguoiNhan_Goc;
					this.tinhTongMuc();
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}
	clearFilter(evt: MouseEvent,) {
		this.Filter = '';
		this.treeNguoiNhan = this.treeNguoiNhan_Goc;
		evt.stopPropagation();
	}

	filterText() {
		let text = this.Filter.toLowerCase();
		this.treeNguoiNhan = this.treeNguoiNhan_Goc.map(x => {
			return {
				DoiTuong: x.DoiTuong,
				Id_Doituong: x.Id_Doituong,
				NCCs: x.NCCs.filter(y => y.SoHoSo.toLowerCase().includes(text) || y.HoTen.toLowerCase().includes(text) || y.DiaChi.toLowerCase().includes(text))
			}
		});
	}

	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongDT= [];
		this.tongSL = [];
		for (let i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let NCCs = this.treeNguoiNhan_Goc[i].NCCs;
			let s = 0;
			let c = 0;
			for (let c1 of NCCs) {
				s += c1.SoTien;
				c++;
			}
			this.tongDT.push(this.danhMucService.f_currency_V2('' + s));
			this.tongSL.push(c);

			this.TongSo += c;
			this.TongTien += s;
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			TenDanhSach: [this.item.TenDanhSach, Validators.required],
			Nam: [this.item.Id == 0 ? this.Nam : this.item.Nam],
			LyDo: [this.item.LyDo],
		});

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
			
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DS_HOTROQ.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DS_HOTROQ.DETAIL');
			return result;
		}
		result = this.translate.instant('DS_HOTROQ.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): HoTroModel {
		const controls = this.itemForm.controls;
		const _item = new HoTroModel();
		_item.clear();
		_item.Id = this.item.Id;
		_item.TenDanhSach = controls.TenDanhSach.value;
		_item.LyDo = controls.LyDo.value;
		_item.Nam = controls.Nam.value;
		_item.NCCs = [];
		for (var i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let temp = this.treeNguoiNhan_Goc[i]; //đối tượng
			temp.NCCs.forEach(x => {
				_item.NCCs.push(x);
			});	
		}

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
		const EditDot = this.prepareCustomer();
		if (EditDot.Id > 0) {
			this.UpdateDot(EditDot, withBack);
		} else {
			this.CreateDot(EditDot, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateDot(_item: HoTroModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.HoTroService.updateDanhSach(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else { 
					this.ngOnInit(); //khởi tạo lại dialog
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateDot(_item: HoTroModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.HoTroService.createDanhSach(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => {});
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
