import { ActivatedRoute, Router } from '@angular/router';
import { NhapSoLieuDuyetService } from '../services/nhap-so-lieu-duyet.service';
import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';

@Component({
	selector: 'kt-nhap-so-lieu-duyet',
	templateUrl: './nhap-so-lieu-duyet-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NhapSoLieuDuyetDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	isDuyet: boolean = true;
	require = '';
	id = 0;
	idDuyet = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	guiduyet = false;
	isShowNhacnho = false;
	isReturn: boolean = false;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// duyệt
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		// ko duyệt
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<NhapSoLieuDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private objectService: NhapSoLieuDuyetService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private CommonService: CommonService,
		private route: ActivatedRoute,
		private translate: TranslateService) {
			this._NAME = this.translate.instant("MAU_SO_LIEU.nhapsl");
			this.isShowNhacnho = this.CommonService.IsShowNhacnhoduyet(this.router.url);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.isDuyet != undefined)
			this.isDuyet = this.data.isDuyet;
		if (this.data.isReturn != undefined)
			this.isReturn = this.data.isReturn;
		this.id = this.item.Id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		if (!this.isReturn && this.item.Id > 0) {
			this.objectService.detail(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
		this.createForm();
		this.viewLoading = false;
		this.changeDetectorRefs.detectChanges();
	}

	createForm() {
		if (this.isReturn) {
			this.itemForm = this.fb.group({
				note: ['', Validators.required],
				FileDinhKem: [''],
			});
		}
		else {
			this.itemForm = this.fb.group({
				note: [''],
				FileDinhKem: [''],
			});
		}
		if (this.focusInput)
			this.focusInput.nativeElement.focus();

	}

	/** UI */
	getTitle(): string {
		if (this.isReturn)
			return "Trả phiếu nhập số liệu cho xã";
		let result = this._NAME;
		if (!this.isDuyet)
			result = "Thảo luận";
		return result;
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		let Id: number;
		let note: string;
		Id = this.id;
		note = controls.note.value;
		_item = { Id, note };
		let file = controls.FileDinhKem.value;
		if (file && file.length > 0)
			_item.FileDinhKem = file[0];
		return _item;
	}

	onSubmit(value: boolean) {
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
		const _item = this.prepareData();
		if (value === true) {
			const _Message = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message);
		} else {
			const _Message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message);
		}
	}

	Duyet(_item: any, value: boolean, _Message: string) {
		_item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Duyet(_item).subscribe(res => {
			this.loadingAfterSubmit = false;
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_Message);
				this.dialogRef.close({
					_item
				});
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	GuiDeXuatDuyet() {
		this.guiduyet = true;
		var dataNoty: any = {};
		dataNoty.To = this.item.NguoiDuyetDon;
		dataNoty.url = 'duyet-ho-so/ho-so/' + this.item.Id;
		this.CommonService.DeXuatDuyet(dataNoty).subscribe(res => {
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

	traLai() {
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

		const _item = this.prepareData();
		this.objectService.traLai(_item.Id, _item.note).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Trả phiếu nhập số liệu cho xã thành công");
				this.dialogRef.close(true);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
}
