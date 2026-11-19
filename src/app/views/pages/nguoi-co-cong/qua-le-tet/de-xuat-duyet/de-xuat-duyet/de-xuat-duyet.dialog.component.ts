import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { DeXuatDuyetService } from '../Services/de-xuat-duyet.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'm-de-xuat-duyet-dialog',
	templateUrl: './de-xuat-duyet.dialog.component.html',
})

export class DeXuatDuyetDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: any;
	itemForm: FormGroup = new FormGroup({});
	viewLoading: boolean = false;
	isDuyet: boolean = true;
	isReturn: boolean = false;
	guiduyet = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowDetail: boolean = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_name: string = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.key === 'Enter') { 
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.key === 'Enter') {
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<DeXuatDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private CommonService: CommonService,
		public apiService: DeXuatDuyetService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DE_XUAT.NAME");
	}

	ngOnInit() {
		this.item = this.data._item; 
		if (this.data.isDuyet != undefined)
			this.isDuyet = this.data.isDuyet;
		if (this.data.isReturn != undefined)
			this.isReturn = this.data.isReturn;
		this.createForm();
		if (!this.isReturn && this.item.Id > 0) {
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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

	getTitle(): string {
		if (this.isReturn)
			return "Trả đề xuất cho xã";
		let result = this.translate.instant('DE_XUAT.DUYET');
		if (!this.isDuyet)
			result = 'Thảo luận';
		return result;
	}

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
		this.CommonService.DeXuatDuyet(dataNoty).pipe(takeUntil(this.destroy$)).subscribe(res => { });
	}

	onSubmit(duyet: boolean) {
		const DuyetDot = this.prepareCustomer();
		this.DuyetDotTangQua(DuyetDot, duyet)
	}

	traLai() {
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const _item = this.prepareCustomer();
		this.apiService.traLai(_item.Id, _item.note).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Trả đề xuất cho xã thành công");
				this.dialogRef.close(true);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeForm() {
		this.dialogRef.close();
	}

	DuyetDotTangQua(item: any, value: boolean) {
		item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.apiService.duyetDotTangQua(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				let _messageType = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._name });
				if (!value)
					_messageType = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._name });
				this.layoutUtilsService.showInfo(_messageType);
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