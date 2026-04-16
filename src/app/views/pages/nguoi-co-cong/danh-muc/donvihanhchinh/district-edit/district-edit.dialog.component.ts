import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { districtModel } from '../Model/donvihanhchinh.model';

@Component({
	selector: 'm-district-edit-dialog',
	templateUrl: './district-edit.dialog.component.html',
})

export class districtEditDialogComponent implements OnInit {
	item: districtModel;
	oldItem: districtModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	provincesFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	listprovinces: any[] = [];
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	IdTinh: number;
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

	constructor(public dialogRef: MatDialogRef<districtEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		private changeDetectorRefs: ChangeDetectorRef,
		private danhMucService: CommonService,
		private districtService: donvihanhchinhService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant("DISTRICT.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.IdTinh = res.IdTinh;
		})
		this.item = this.data._item;
		if (this.data.allowEdit)
			this.allowEdit = this.data.allowEdit;
		if (this.item.Id_row > 0) {
			this.viewLoading = true;
		}
		else {
			this.viewLoading = false;
		}
		this.createForm();
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
	}

	createForm() {
		this.itemForm = this.fb.group({
			DistrictName: [this.item.DistrictName, Validators.required],
			provinces: [''+this.IdTinh, Validators.required],
			Note: [this.item.Note],
		});

		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE') + ` - ${this.item.DistrictName}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): districtModel {
		const controls = this.itemForm.controls;
		const _item = new districtModel();
		_item.Id_row = this.item.Id_row;
		_item.DistrictName = controls['DistrictName'].value; 
		_item.Note = controls['Note'].value; 
		_item.ProvinceID = controls['provinces'].value; 

		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;

		if (controls['provinces'].value == 0) {
			controls.provinces.markAsTouched();
			this.provincesFormErrors = true;
			if (!this.itemForm.invalid) {
				return;
			}
		}
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}

		const updatedistrict = this.prepareCustomer();
		if (updatedistrict.Id_row > 0) {
			this.Update(updatedistrict, withBack);
		} else {
			this.Create(updatedistrict, withBack);
		}
	}

	Update(_item: districtModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.districtService.UpdateDistrict(_item).subscribe(res => {
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
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	
	Create(_item: districtModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.districtService.CreateDistrict(_item).subscribe(res => {
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
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE');
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
		this.provincesFormErrors = false;
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
