import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { CommonService } from '../../../services/common.service';
import { dtHoTroServices } from '../Services/dt-ho-tro-quy.service';
import { HoTro_DTModel } from '../Model/dt-ho-tro-quy.model';
import * as moment from 'moment';

@Component({
	selector: 'kt-dt-ho-tro-quy-ho-tro',
	templateUrl: './dt-ho-tro-quy-ho-tro.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DTHoTroHoTroDialogComponent implements OnInit {
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
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<DTHoTroHoTroDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private dtHoTroServices: dtHoTroServices,
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
			Id_NoiDung: ['', Validators.required],
			SoTien: [this.item.ChiPhiYeuCau, Validators.required],
			SoQD: ['', Validators.required],
			NgayQD: [new Date(), Validators.required],
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
		_item.Id_NoiDung = controls.Id_NoiDung.value;
		_item.SoTien = +controls.SoTien.value;
		_item.NoiDungHoTro = controls.NoiDungHoTro.value;
		_item.SoQD = controls.SoQD.value;

		if (controls.NgayQD.value !== '')
			_item.NgayQD = this.commonService.f_convertDate(controls.NgayQD.value);

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
			this.CreateDTHoTro(EditDTHoTro, true);
		});
	}
	
	CreateDTHoTro(_item: HoTro_DTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dtHoTroServices.hoTroDT(this.item.Id, _item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({_item});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	
	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}