// Angular
import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
// Service
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { DonVi, FormDonVi } from '../Model/detail-list.model';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { ChonNhieuDonViComponent } from '../../../components';
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
	selector: 'kt-mau-so-lieu-don-vi-edit-dialog',
	templateUrl: './mau-so-lieu-don-vi-dialog.component.html',
})

export class MauSoLieuDonViDialogComponent implements OnInit {
	item: FormDonVi;
	oldItem: any;
	object: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;

	filterSoLieu: number;
	tempListSoLieu: any[] = [];
	errorChonDonVi: boolean = false;
	idMauSoLieu: number;
	ListDonVi: Array<DonVi> = [];
	max: Moment;
	min: Moment;

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_name = '';
	IdDonVi: number;
	phienban: number = 0;
	lstVer: any[] = [];
	IsMauTheoPhong: boolean = false;
	isZoomSize: boolean;

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

	constructor(public dialogRef: MatDialogRef<MauSoLieuDonViDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private objectService: MauSoLieuService,
		private translate: TranslateService) {
			this._name = 'Đơn vị';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.IdDonVi = this.data.IdDonVi;
		this.item = this.data._item;
		if (this.data.IsMauTheoPhong != undefined)
			this.IsMauTheoPhong = this.data.IsMauTheoPhong;
		this.ListDonVi = this.item.ListDonVi;
		this.createForm();
		this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.item.Id_MauSoLieu).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.lstVer = res.dataExtra;
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	changeVer() {
		if (this.phienban == 0) {
			this.max = null;
			this.min = null;
		} else {
			let f = this.lstVer.find(x => x.id == this.phienban); //chọn phiên bản năm nào thì tg giao chỉ nằm trong năm đó
			this.max = moment(new Date(f.title, 11, 31));
			this.min = moment(new Date(f.title, 0, 1));
		}
	}

	ChonDonVi() {
		const selected = this.ListDonVi.map(x => {
			return { id: x.Id_DonVi, title: x.title }
		});
		const disabled_ids = this.ListDonVi.filter(x => x.IsNhap).map(x => { return x.Id_DonVi; }); //disable các đv đã nhập
		const dialogRef = this.dialog.open(ChonNhieuDonViComponent, { data: { selected: selected, disabled_ids: disabled_ids, 
			id_parent: this.IdDonVi, type: 1, isMulti: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				res = res.filter(x=> !(x.data.length > 0 && x.Capcocau ==2)) //bỏ đv huyện, tp
				this.ListDonVi = res.map(x => {
					return {
						Id_DonVi: x.id,
						title: x.title,
						IsNhap: x.disabled //disabled là đã nhập
					};
				});
			}
		});
	}

	createForm() {
		const temp: any = {
			ThoiGian: [this.item.ThoiGian],
		};
		this.itemForm = this.fb.group(temp);

	}

	/** UI */
	getTitle(): string {
		return 'Chọn đơn vị nhập';
	}

	/** ACTIONS */
	onSubmit(withBack: boolean) {
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
		if (this.ListDonVi.length == 0) {
			this.errorChonDonVi = true;
			return;
		}
		this.Create(withBack);
	}


	Create(withBack: boolean) {
		const item = new FormDonVi();
		item.Id = this.item.Id;
		if (this.phienban == 0)
			item.Id_MauSoLieu = this.item.Id_MauSoLieu;
		else
			item.Id_MauSoLieu = this.phienban;
		item.ListDonVi = this.ListDonVi;
		item.ThoiGian = this.commonService.f_convertDate(this.itemForm.controls.ThoiGian.value);

		let _createMessage = this.translate.instant(item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
		this.objectService.updateGiao(item).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_createMessage);
				if (withBack == true) {
					this.dialogRef.close(true);
				} else {
					this.ngOnInit();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	DeleteWorkplace(index) {
		this.ListDonVi.splice(index, 1);
		this.changeDetectorRefs.detectChanges();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	onAlertCloseDonVi($event) {
		this.errorChonDonVi = false;
	}
}
