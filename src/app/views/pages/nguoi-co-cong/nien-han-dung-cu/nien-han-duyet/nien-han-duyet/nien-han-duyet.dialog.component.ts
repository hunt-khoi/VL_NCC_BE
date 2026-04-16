import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { NienHanDuyetService } from '../Services/nien-han-duyet.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-nien-han-duyet-dialog',
	templateUrl: './nien-han-duyet.dialog.component.html',
})

export class NienHanDuyetDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	isDuyet: boolean = true;
	isReturn: boolean = false;

	guiduyet = false;
	datasource: MatTableDataSource<any>;
	isxa = false;

	details: any[] = [];
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowDetail: boolean = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;

	_name = "";
	isShowNhacnho = false;
	ghichutra = "Ghi chú trả lại huyện";

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

	constructor(public dialogRef: MatDialogRef<NienHanDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private router: Router,
		private CommonService: CommonService,
		public NienHanService: NienHanDuyetService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("NIEN_HAN.NAME");
			this.isShowNhacnho = this.CommonService.IsShowNhacnhoduyet(this.router.url);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		if(this.data.isxa)
			this.isxa = this.data.isxa
		if(this.isxa) 
			this.ghichutra = "Ghi chú trả lại xã";
		if (this.data.isDuyet != undefined)
			this.isDuyet = this.data.isDuyet;
		if (this.data.isReturn != undefined)
			this.isReturn = this.data.isReturn;
		this.createForm();
		if (!this.isReturn && this.item.Id > 0) {
			this.viewLoading = true;
			this.NienHanService.getItem(this.item.Id, false, this.isxa).subscribe(res => {
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
			return "Trả nhập niên hạn" + (this.isxa ? " cho xã" : " cho huyện");
		let result = this.translate.instant('NIEN_HAN.DUYET');
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
		this.DuyetNienHan(DuyetDot, duyet, this.isxa)
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
		this.NienHanService.traLai(_item.Id, _item.note, this.isxa).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				let mess = this.isxa ? "Trả niên hạn cho xã thành công" : "Trả niên hạn cho huyện thành công";
				this.layoutUtilsService.showInfo(mess);
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

	DuyetNienHan(_item: any, value: boolean, isxa: boolean = false) {
		_item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.NienHanService.duyetNienHan(_item, isxa).subscribe(res => {
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
