import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { TypesUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { KeHoachVanDongDetailModel } from '../Model/ke-hoach-van-dong.model';
import { KeHoachVanDongService } from '../Services/ke-hoach-van-dong.service';

@Component({
	selector: 'kt-ke-hoach-van-dong-detail-edit-dialog',
	templateUrl: './ke-hoach-van-dong-detail-edit-dialog.component.html',
})

export class KHVanDongDetailEditDialogComponent implements OnInit {
	
	item: KeHoachVanDongDetailModel;
	oldItem: KeHoachVanDongDetailModel;
	object: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize = false;

	listDonVi: any[] = [];
	filterDonVi: number;
	tmpDonVi: any[] = [];

	listDetail: any[] = [];
	isCapDuoi: boolean = false;
	_name = '';
	UserInfo: any;
	Nam: number = 0;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<KHVanDongDetailEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		public objectService: KeHoachVanDongService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = 'Đơn vị';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		if (this.data.isCapDuoi != undefined) {
			this.isCapDuoi = this.data.isCapDuoi
		}
		if (this.data.listDonVi != undefined) {
			this.tmpDonVi = this.data.listDonVi
		}
		if (this.data.nam != undefined) {
			this.Nam = this.data.nam
		}
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
		})
		this.getListDonVi();
		this.createForm();
	}

	createForm() {
		const temp: any = {
			DonVi: ['' + this.item.Id_DonVi],
			SoTien: ['' + this.item.SoTien],
		};
		this.itemForm = this.fb.group(temp);

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
	}

	getListDonVi() {
		if(this.isCapDuoi) { //get đơn vị cấp dưới
			this.objectService.GetDonViGiao().subscribe(res => {
				this.listDonVi = res.data;
				this.listDonVi = this.listDonVi.filter(x => !this.tmpDonVi.includes(x.id))
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			this.commonService.liteDonViDongGop(this.Nam).subscribe(res => {
				this.listDonVi = res.data;
				this.listDonVi = this.listDonVi.filter(x => !this.tmpDonVi.includes(x.id))
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	/** UI */
	getTitle(): string {
		let result = 'Chọn đơn vị';
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		return result;
	}

	/** ACTIONS */
	prepareData(): KeHoachVanDongDetailModel {
		const controls = this.itemForm.controls;
		const _item = new KeHoachVanDongDetailModel();
		_item.clear();
		_item.Id_DonVi = controls.DonVi.value;
		_item.SoTien = controls.SoTien.value;
		_item.DonVi = this.listDonVi.find(x => x.id == _item.Id_DonVi).title;

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

		let data = this.prepareData();
		this.dialogRef.close(data);
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
