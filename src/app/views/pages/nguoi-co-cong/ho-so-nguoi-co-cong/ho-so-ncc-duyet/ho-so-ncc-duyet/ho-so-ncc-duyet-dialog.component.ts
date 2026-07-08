import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';
import { HuongDanHuongThienDialogComponent } from '../huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';

@Component({
	selector: 'kt-ho-so-ncc-duyet',
	templateUrl: './ho-so-ncc-duyet-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCDuyetDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup = new FormGroup({});
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	isDuyet: boolean = true;//k duyệt thì chỉ hiển thị comment
	require: string = '';
	id: number = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME: string = '';
	userId: number = 0;
	guiduyet: boolean = false;
	isShowNhacnho: boolean = false;
	isReturn: boolean = false;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// duyệt
		if (event.altKey && event.key === 'Enter') { 
			this.onSubmit(true);
		}
		// ko duyệt
		if (event.ctrlKey && event.key === 'Enter') {
			this.onSubmit(false);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<HoSoNCCDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private objectService: HoSoNCCDuyetService,
		private router: Router,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		public dialog: MatDialog,
		private translate: TranslateService) {
			this._NAME = 'Hồ sơ người có công';
			// load id user
			const userInfo = localStorage.getItem('UserInfo');
			this.userId = userInfo ? (JSON.parse(userInfo)).Id : 0;
			this.isShowNhacnho = this.commonService.IsShowNhacnhoduyet(this.router.url);
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.isDuyet != undefined)
			this.isDuyet = this.data.isDuyet;
		if (this.data.isReturn != undefined)
			this.isReturn = this.data.isReturn;
		this.id = this.item.Id;
		this.createForm();
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		if (!this.isReturn && this.item.Id > 0) {
			this.objectService.detail(this.id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
		this.viewLoading = false;
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
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		if (this.isReturn)
			return "Trả hồ sơ cho xã";
		let result = 'Duyệt ' + this._NAME;
		if (!this.isDuyet)
			result = "Thảo luận trong " + this._NAME;
		return result;
	}

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
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		const item = this.prepareData();
		if (value) {
			const message = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._NAME });
			this.Duyet(item, value, message);
		} else {
			const message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			this.commonService.getIdHuongDan(this.item.Id, 2).subscribe(res => {
				if (res && res.status == 1) {
					let itemHD = res.dataExtra;
					const dialogRef = this.dialog.open(HuongDanHuongThienDialogComponent, { data: { item: { id_quytrinh_lichsu: 0, itemHD } } });
					dialogRef.afterClosed().subscribe(res1 => {
						if (res1) {
							item.HuongDan = res1._item;
							this.Duyet(item, value, message);
						}
					});
				} else
			 		this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	Duyet(item: any, value: boolean, message: string) {
		item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Duyet(item).subscribe(res => {
			this.loadingAfterSubmit = false;
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close({ item });
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
		this.commonService.DeXuatDuyet(dataNoty).subscribe(res => { });
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		this.dialogRef.close();
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
		const item = this.prepareData();
		this.objectService.traLai(item.Id, item.note).subscribe(res => {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Trả hồ sơ cho xã thành công");
				this.dialogRef.close(true);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
}