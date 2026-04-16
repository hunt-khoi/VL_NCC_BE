import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import moment from 'moment';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { DongGopQuyModel } from '../Model/dong-gop-quy.model';

@Component({
	selector: 'm-dong-gop-quy-edit-dialog',
	templateUrl: './dong-gop-quy-edit-dialog.component.html',
})

export class DongGopQuyEditDialogComponent implements OnInit {

	item: DongGopQuyModel;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	listDonVi: any[] = [];
	filterDonVi: number;
	selected: any[] = [];
	datasource: MatTableDataSource<any>;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	Nam: number;
	_name = '';
	UserInfo: any;
	Id_DonVi: number = 0;
	Id_KeHoach: number = 0;
	SoTien: number = 0;
	IsSua: boolean = false;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<DongGopQuyEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public commonService: CommonService,
		public objectService: QuanLyQuyService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = 'Đóng góp quỹ';
		this.Nam = moment().get("year");
	}
	/** LOAD DATA */
	ngOnInit() {
		let item = this.data._item;
		if (item.Id != undefined && !this.IsSua) {
			this.Id_DonVi = item.Id
		}
		if (this.IsSua) {
			this.SoTien = item.SoTien;
		}
		else {
			if (item.TienVanDong != undefined && item.TienDongGop != undefined) {
				this.SoTien = item.TienVanDong - item.TienDongGop;
				this.SoTien = this.SoTien > 0 ? this.SoTien : 0;
			}
			
			if (item.SoTien != undefined && item.TienVanDong != undefined) {
				this.SoTien = item.SoTien - item.TienVanDong;
				this.SoTien = this.SoTien > 0 ? this.SoTien : 0;
				this.Id_DonVi = item.Id_DonVi;
			}
		}
		if (item.Id_KeHoach != undefined) {
			this.Id_KeHoach = item.Id_KeHoach
		}

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
		})
		this.getListDonVi();
		this.createForm();
	}

	getListDonVi() {
		this.commonService.liteDonViDongGop().subscribe(data => {
			this.listDonVi = data.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	createForm() {
		const temp: any = {
			DonVi: ['' + this.Id_DonVi],
			SoTien: ['' + this.SoTien],
		};
		this.itemForm = this.fb.group(temp);
		if(this.Id_DonVi > 0) {
			this.itemForm.controls.DonVi.disable()
		}
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		const _item = new DongGopQuyModel();
		_item.clear();
		_item.Id_DonVi = controls.DonVi.value;
		_item.SoTien = controls.SoTien.value;
		_item.Id_KeHoach = this.Id_KeHoach;
		return _item;
	}

	/** UI */
	getTitle(): string {
		return 'Đóng góp quỹ';
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
		const EditObject = this.prepareData();
		if (this.IsSua) {
			EditObject.Id = this.data._item.Id;
			this.Update(EditObject, withBack);
		} else {
			this.Create(EditObject, withBack);
		}
	}
	Create(_item: DongGopQuyModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.DongGopQuy(_item).subscribe(res => {
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
	Update(_item: DongGopQuyModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateGopQuy(_item).subscribe(res => {
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


	closeForm() {
		this.dialogRef.close();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
