import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-khom-ap-edit-dialog',
	templateUrl: './khom-ap-edit.dialog.component.html',
})

export class KhomApEditDialogComponent implements OnInit {
	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	listprovinces: any[] = [];
	listTinh: any[] = [];
	listHuyen: any[] = [];
	listXa: any[] = [];
	id_provinces: string;
	id_district: string;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name: string = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<KhomApEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private districtService: donvihanhchinhService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = 'Khóm, ấp';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.id_provinces = res.IdTinh;
			this.loadTinhThanhChange(this.id_provinces);
		})
		this.item = this.data._item;
		if (this.data.allowEdit)
			this.allowEdit = this.data.allowEdit;
		this.createForm();
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data;
		});
		if (this.item.RowID > 0) {
			this.viewLoading = true;
			if (this.item.DistrictID)
				this.loadHuyenChange(this.item.DistrictID);
		}
		else {
			this.viewLoading = false;
			this.itemForm.controls["huyen"].setValue("");
		}
		this.focusInput.nativeElement.focus();
	}

	createForm() {
		this.itemForm = this.fb.group({
			wardName: [this.item.Title, Validators.required],
			tinh: ['' + this.id_provinces, Validators.required],
			huyen: ['' + this.item.DistrictID, Validators.required],
			xa: ['' + this.item.WardID, Validators.required],
		});

		if (!this.allowEdit)
			this.itemForm.disable();
	}
	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.RowID) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE') + ` - ${this.item.WardName}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.RowID = this.item.RowID;
		_item.Title = controls['wardName'].value; // lấy tên biến trong formControlName
		_item.WardID = controls['xa'].value; // lấy tên biến trong formControlName
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
		const updatedistrict = this.prepareCustomer();
		if (updatedistrict.RowID > 0) {
			this.Update(updatedistrict, withBack);
		} else {
			this.Create(updatedistrict, withBack);
		}
	}

	Update(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.districtService.UpdateKhomAp(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.districtService.CreateKhomAp(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
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

	loadTinhThanhChange(idtinh: any) {
		this.danhMucService.GetListDistrictByProvinces(idtinh).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadHuyenChange(id_district: any) {
		this.danhMucService.GetListWardByDistrict(id_district).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
}
