import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import * as moment from 'moment';
import { dtHoTroServices } from '../../dt-ho-tro-quy/Services/dt-ho-tro-quy.service';
import { HoTro_DTModel } from '../../dt-ho-tro-quy/Model/dt-ho-tro-quy.model';

@Component({
	selector: 'kt-ho-tro-phat-edit',
	templateUrl: './ho-tro-phat-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class HoTroPhatEditDialogComponent implements OnInit {
	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	Capcocau: number;
	listND: any[] = [];
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<HoTroPhatEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private dtHoTroService: dtHoTroServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		public commonService: CommonService,
		private translate: TranslateService) {
			this._name = this.translate.instant("DT_HOTRO.HOTRO");
	}
	ngOnInit() {
		this.commonService.liteNoiDungChi().subscribe(res => {
			this.listND = res.data;
			this.changeDetectorRefs.detectChanges();
		})
		
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})
		this.item = this.data._item;
		if (this.item)
			this.createForm();
	}

	createForm() {
		const temp: any = {
			SoTien: [this.item.SoTien, Validators.required],
			NoiDungHoTro: ['']
		};

		this.itemForm = this.fb.group(temp);
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		return this.translate.instant("DT_HOTRO.HOTRO");
	}

	/** ACTIONS */
	prepareCustomer(): HoTro_DTModel {
		const controls = this.itemForm.controls;
		const _item = new HoTro_DTModel();
		_item.Id_NoiDung = this.item.Id_NoiDung;
		_item.SoTien = +controls.SoTien.value;
		_item.NoiDungHoTro = controls.NoiDungHoTro.value;
		_item.Id_Chi = this.item.Id_Chi;
		_item.Id_DanhSach = this.item.Id_DanhSach;

		return _item;
	}
	onSubmit() {
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

		const _title = this.translate.instant('Xác nhận hỗ trợ');
		const _description = this.translate.instant('Bạn có chắc muốn hỗ trợ cho đối tượng');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý ...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const EditDTHoTro = this.prepareCustomer();
			this.CreateDTHoTro(EditDTHoTro);
		});
	}
	CreateDTHoTro(_item: HoTro_DTModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dtHoTroService.hoTroDT(this.item.Id, _item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
				
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	close() {
		this.dialogRef.close();
	}
}