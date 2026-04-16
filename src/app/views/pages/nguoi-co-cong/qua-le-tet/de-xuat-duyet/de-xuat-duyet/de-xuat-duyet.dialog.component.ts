import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DeXuatDuyetService } from '../Services/de-xuat-duyet.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-de-xuat-duyet-dialog',
	templateUrl: './de-xuat-duyet.dialog.component.html',
})

export class DeXuatDuyetDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	isDuyet: boolean = true;
	isReturn: boolean = false;
	filterDonVi: string = '';
	listNhomLeTet: any[] = [];
	listNCC: any[] = [];
	listMucQua: any[] = [];
	guiduyet = false;
	NCC_MQs: any[] = [];
	datasource: MatTableDataSource<any>;

	details: any[] = [];
	displayedColumns = ['STT', 'Id_NCC', 'HoTen', 'DiaChi', 'SoTien', 'DoiTuong', 'MucQua'];
	displayedColumns1 = ['STT', 'NguoiCoCong', 'MucQua', 'action'];

	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowDetail: boolean = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	_name = "";
	isShowNhacnho = false;

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

	constructor(public dialogRef: MatDialogRef<DeXuatDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private router: Router,
		private CommonService: CommonService,
		public DeXuatService: DeXuatDuyetService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private ActivatedRoute: ActivatedRoute,
		private translate: TranslateService) {
		this._name = this.translate.instant("DE_XUAT.NAME");
		this.isShowNhacnho = this.CommonService.IsShowNhacnhoduyet(this.router.url);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		if (this.data.isDuyet != undefined)
			this.isDuyet = this.data.isDuyet;
		if (this.data.isReturn != undefined)
			this.isReturn = this.data.isReturn;
		this.createForm();
		if (!this.isReturn && this.item.Id > 0) {
			this.viewLoading = true;
			this.DeXuatService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	createForm() {
		if (this.isReturn)
			this.itemForm = this.fb.group({
				GhiChu: ['', Validators.required],
				FileDinhKem: [''],
			});
		else
			this.itemForm = this.fb.group({
				GhiChu: [''],
				FileDinhKem: [''],
			});
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
	}

	/** UI */
	getTitle(): string {
		if (this.isReturn)
			return "Trả đề xuất cho xã";
		let result = this.translate.instant('DE_XUAT.DUYET');
		if (!this.isDuyet)
			result = 'Thảo luận';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = this.item.Id;
		_item.note = controls['GhiChu'].value;
		let file = controls.FileDinhKem.value;
		if (file && file.length > 0)
			_item.FileDinhKem = file[0];
		return _item;
	}

	GuiDeXuatDuyet() {
		this.guiduyet = true;
		var dataNoty: any = {};
		dataNoty.To = this.item.NguoiDuyetDon;
		dataNoty.url = 'duyet-ho-so/ho-so/' + this.item.Id;
		this.CommonService.DeXuatDuyet(dataNoty).subscribe(res => {
		});
	}

	onSubmit(duyet: boolean) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;

		const DuyetDot = this.prepareCustomer();
		this.DuyetDotTangQua(DuyetDot, duyet)
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

		const _item = this.prepareCustomer();
		this.DeXuatService.traLai(_item.Id, _item.note).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Trả đề xuất cho xã thành công");
				this.dialogRef.close(true);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeForm() {
		this.dialogRef.close();
	}

	DuyetDotTangQua(_item: any, value: boolean) {
		_item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.DeXuatService.duyetDotTangQua(_item).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				let _messageType = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._name });
				if (!value)
					_messageType = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._name });
				this.layoutUtilsService.showInfo(_messageType);
				this.dialogRef.close(true);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

}
