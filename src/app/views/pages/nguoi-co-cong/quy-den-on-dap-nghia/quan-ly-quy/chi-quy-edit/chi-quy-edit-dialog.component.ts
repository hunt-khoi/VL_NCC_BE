import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import moment from 'moment';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { ChiQuyModel } from '../Model/dong-gop-quy.model';

@Component({
	selector: 'm-chi-quy-edit-dialog',
	templateUrl: './chi-quy-edit-dialog.component.html',
})

export class ChiQuyEditDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	listND: any[] = [];
	listQuyCon: any[] = [];
	selected: any[] = [];
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;

	Nam: number;
	_name = '';
	hasIdParent: boolean = false;
	UserInfo: any;
	allowEdit = false;
	IsTuCapTren = false;
	IsChiHoTro = false;
	Capcocau: number;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<ChiQuyEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public commonService: CommonService,
		public objectService: QuanLyQuyService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = ' chi quỹ';
			this.Nam = moment().get("year");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.IsTuCapTren = this.item.IsTuNguonTren;
		this.IsChiHoTro = this.data.IsHoTro;
		
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
			this.Capcocau = res.Capcocau;
			this.changeDetectorRefs.detectChanges();
		})
		if (this.IsChiHoTro) {
			this.getListQuyCon();
		}
		else {
			this.getListND();
			this.getChiHoTro();
		}
		this.createForm();
	}

	getListND() {
		this.commonService.liteNoiDungChi().subscribe(res => {
			if (res.status == 1) {
				this.listND = res.data;
				this.changeDetectorRefs.detectChanges(); 
			}
		});
	}

	getListQuyCon() {
		this.objectService.getQuyCon().subscribe(res => {
			if (res.status == 1) {
				this.listQuyCon = res.data;
				this.changeDetectorRefs.detectChanges(); 
			}
		});
	}

	sotienht = 0;
	sotienchi = 0;
	getChiHoTro() {
		this.objectService.getChiHoTro().subscribe(res => {
			if (res.status == 1) {
				this.sotienht = res.data.TienDuocHoTro;
				this.sotienchi = res.data.TienChiTuHoTro;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	createForm() {
		let temp: any = {
			Id_NoiDung: ['' + this.item.Id_NoiDung, Validators.required],
			SoTien: ['' + this.item.SoTien, Validators.required],
			GhiChu: [this.item.GhiChu],
		};
		if (this.IsChiHoTro) {
			temp = {
				Id_Quy: ['', Validators.required],
				SoTien: ['0', Validators.required],
			};
		}

		this.itemForm = this.fb.group(temp);
		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		if (!this.IsChiHoTro) {
			const _item = new ChiQuyModel();
			_item.clear();
			_item.Id_NoiDung = controls.Id_NoiDung.value;
			_item.SoTien = +controls.SoTien.value;
			_item.IsTuNguonTren = this.IsTuCapTren;
			_item.GhiChu = controls.GhiChu.value;
			_item.SoTienDuocHT = +this.sotienht;
			_item.Id = this.item.Id;
	
			return _item;
		}
		else {
			let _item: any = {};
			_item.IdQuyCon = controls.Id_Quy.value;
			_item.SoTien = controls.SoTien.value;
	
			return _item;
		}
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id) {
			return result;
		}
		
		result = this.translate.instant('COMMON.UPDATE');
		return result + this._name;
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
		if (+controls.SoTien.value <= 0) {
			this.layoutUtilsService.showError("Vui lòng nhập số tiền chi");
			return;
		}
		if (this.IsTuCapTren && +controls.SoTien.value > this.sotienht) {
			this.layoutUtilsService.showError("Nguồn hỗ trợ từ cấp trên không đủ để chi");
			return;
		}


		const EditObject = this.prepareData();
		if (!this.IsChiHoTro) {
			if (EditObject.Id > 0) {
				this.Update(EditObject, withBack);
			} else {
				this.Create(EditObject, withBack);
			}
		}
		else {
			this.ChiHoTro(EditObject, withBack);
		}

	}

	Create(_item: ChiQuyModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.ChiQuy(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Update(_item: ChiQuyModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.ChiQuy(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	
	ChiHoTro(_item: ChiQuyModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.ChiHoTro(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
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
