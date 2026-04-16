import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dungcuchinhhinhModel, TriGiaDungCuModel } from '../../dungcuchinhhinh/Model/dungcuchinhhinh.model';
import { TranslateService } from '@ngx-translate/core';
import { dungcuchinhhinhService } from '../Services/dungcuchinhhinh.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import moment from 'moment';

@Component({
	selector: 'm-dungcuchinhhinh-edit-dialog',
	templateUrl: './dungcuchinhhinh-edit.dialog.component.html',
})

export class dungcuchinhhinhEditDialogComponent implements OnInit {
	item: dungcuchinhhinhModel;
	oldItem: dungcuchinhhinhModel;

	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowUpdateCost: boolean = false;
	listdungcus: any[] = [];
	isPhu: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

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

	constructor(public dialogRef: MatDialogRef<dungcuchinhhinhEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public dungcuchinhhinhService: dungcuchinhhinhService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DUNG_CU_CHINH_HINH.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 
		this.allowUpdateCost = this.data.allowUpdateCost; 

		this.danhMucService.liteDungCuChinhHinh(false, true).subscribe(res => {
			this.listdungcus = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		
		this.createForm();
        if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.dungcuchinhhinhService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
                    this.item = res.data;
					this.isPhu = this.item.IsVatPhamPhu;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	createForm() {
		let temp: any = {}
		if (this.allowUpdateCost) { //cập nhật giá
			temp.Id_DungCu = [''+this.item.Id,Validators.required];
			temp.ThoiGian = [moment(), Validators.required];
			temp.TriGia = ['', Validators.required];
			temp.NienHan = ['', Validators.required];
			temp.MoTa = [''+this.item.MoTa];
			this.itemForm = this.fb.group(temp);
		}
		else {
			temp.MaDungCu = [this.item.MaDungCu, Validators.required];
			temp.DungCu = [''+this.item.DungCu, Validators.required];
			temp.MoTa = [''+this.item.MoTa];
            temp.Locked = ['' + this.item.Locked];
			temp.Priority = ['' + this.item.Priority];
			temp.IsPhu = [this.item.IsVatPhamPhu];
			temp.Id_Child = [this.item.Id_Child == null ? '0' : '' + this.item.Id_Child];
			this.itemForm = this.fb.group(temp);
		}
        
		if (!this.allowEdit) 
			this.itemForm.disable();
	}

	checkPhu($event) {
		if ($event.checked) {
			this.isPhu = true;
			this.itemForm.controls.Id_Child.setValue('0')
		}
		else {
			this.isPhu = false;
		}
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DUNG_CU_CHINH_HINH.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if(this.allowEdit == false) { 
			result = this.translate.instant('DUNG_CU_CHINH_HINH.DETAIL') + ` - ${this.item.DungCu}`;
			return result;
		}
		if(this.allowUpdateCost == true) { 
			result = this.translate.instant('DUNG_CU_CHINH_HINH.UPDATE_COST') + ` - ${this.item.DungCu}`;
			return result;
		} 
		result = this.translate.instant('DUNG_CU_CHINH_HINH.UPDATE') + ` - ${this.item.DungCu}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): dungcuchinhhinhModel {
		const controls = this.itemForm.controls;
		const _item = new dungcuchinhhinhModel();
		_item.Id = this.item.Id;
		_item.MaDungCu = controls['MaDungCu'].value; 
		_item.DungCu = controls['DungCu'].value; 
		_item.MoTa = controls['MoTa'].value;
        _item.Locked = controls['Locked'].value;
		_item.Priority = controls['Priority'].value;
		_item.IsVatPhamPhu = controls['IsPhu'].value;
		_item.Id_Child = controls['Id_Child'].value;
		
		return _item;
	}

	prepareUpdateTriGia(): TriGiaDungCuModel {
		const controls = this.itemForm.controls;
		const _item = new TriGiaDungCuModel();
		_item.Id = 0;
		_item.Id_DungCu = this.item.Id;
		if (controls['ThoiGian'].value)
			_item.ThoiGian = this.danhMucService.f_convertDate(controls['ThoiGian'].value);

		_item.TriGia = controls['TriGia'].value;
		_item.NienHan = controls['NienHan'].value;
		_item.MoTa = controls['MoTa'].value

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
		
		if (this.allowUpdateCost) {
			const UpdateTriGia = this.prepareUpdateTriGia();
			this.UpdateTriGia(UpdateTriGia, withBack);
		}
		else{
			if (controls.Priority.value < 0 || controls.Priority.value === '') {
				this.hasFormErrors = true;
				return;
			}
			const EditDungCu = this.prepareCustomer();
			if (EditDungCu.Id > 0) {
				this.UpdateNhom(EditDungCu, withBack);
			} else {
				this.CreateNhom(EditDungCu, withBack);
			}
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateNhom(_item: dungcuchinhhinhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dungcuchinhhinhService.updateDungCu(_item).subscribe(res => {
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

	UpdateTriGia(_item: TriGiaDungCuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.dungcuchinhhinhService.updateTriGia(_item).subscribe(res => {
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
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

	CreateNhom(_item: dungcuchinhhinhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// this.viewLoading = true;
		this.disabledBtn = true;
		this.dungcuchinhhinhService.createDungCu(_item).subscribe(res => {
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
					// this.focusInput.nativeElement.focus();
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
		this.allowEdit = true;
	    this.allowUpdateCost = false;
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