import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { nhomletetModel } from '../../nhomletet/Model/nhomletet.model';
import { TranslateService } from '@ngx-translate/core';
import { nhomletetService } from '../Services/nhomletet.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-nhomletet-edit-dialog',
	templateUrl: './nhomletet-edit.dialog.component.html',
})

export class nhomletetEditDialogComponent implements OnInit {
	item: nhomletetModel;
	oldItem: nhomletetModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	listQD: any[] = [];
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;

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

	constructor(public dialogRef: MatDialogRef<nhomletetEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public nhomletetService: nhomletetService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("NHOM_LE_TET.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 

		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			
			this.nhomletetService.getItem(this.item.Id).subscribe(res => {
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
		this.danhMucService.liteMauQDTangQua().subscribe(res => {
			this.listQD = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	createForm() {
		this.itemForm = this.fb.group({
			NhomLeTet: [this.item.NhomLeTet, Validators.required],
			MoTa: [this.item.MoTa],
			NgayKhaiBao: [''+this.item.NgayKhaiBao, [Validators.pattern("^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))"), Validators.maxLength(5), Validators.required]],
            Locked: ['' + this.item.Locked],
            Priority: ['' + this.item.Priority],
            MauQD: [this.item.MauQD, Validators.required]
        });

		if (!this.allowEdit) 
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('NHOM_LE_TET.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if(!this.allowEdit) { 
			result = this.translate.instant('NHOM_LE_TET.DETAIL') + `- ${this.item.NhomLeTet}`;
			return result;
		}
		result = this.translate.instant('NHOM_LE_TET.UPDATE') + `- ${this.item.NhomLeTet}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): nhomletetModel {
		const controls = this.itemForm.controls;
		const _item = new nhomletetModel();
		_item.Id = this.item.Id;
		_item.NhomLeTet = controls['NhomLeTet'].value; 
		_item.MoTa = controls['MoTa'].value;
		_item.NgayKhaiBao = controls['NgayKhaiBao'].value;
        _item.Locked = controls['Locked'].value;
        _item.Priority = controls['Priority'].value;
		_item.MauQD = controls['MauQD'].value;
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

			let invalid = <FormControl[]>Object.keys(this.itemForm.controls).map(key => this.itemForm.controls[key]).filter(ctl => ctl.invalid);
			let invalidElem: any = invalid[0];
			invalidElem.nativeElement.focus();
			this.hasFormErrors = true;
			return;
		}
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}

		const EditNhomLeTet = this.prepareCustomer();
		if (EditNhomLeTet.Id > 0) {
			this.UpdateNhom(EditNhomLeTet, withBack);
		} else {
			this.CreateNhom(EditNhomLeTet, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateNhom(_item: nhomletetModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.nhomletetService.updateNhomLeTet(_item).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else { //lưu và thêm mới, withBack = false
					this.ngOnInit(); //khởi tạo lại dialog
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

	CreateNhom(_item: nhomletetModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.nhomletetService.createNhomLeTet(_item).subscribe(res => {
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

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
