import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loaisolieuModel } from '../../loaisolieu/Model/loaisolieu.model';
import { TranslateService } from '@ngx-translate/core';
import { loaisolieuService } from '../Services/loaisolieu.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-loaisolieu-edit-dialog',
	templateUrl: './loaisolieu-edit.dialog.component.html',
})

export class loaisolieuEditDialogComponent implements OnInit {
	item: loaisolieuModel;
	oldItem: loaisolieuModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
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

	constructor(public dialogRef: MatDialogRef<loaisolieuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public loaisolieuService: loaisolieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("LOAI_SO_LIEU.NAME");

	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 

		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			
			this.loaisolieuService.getItem(this.item.Id).subscribe(res => {
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
		this.itemForm = this.fb.group({
			LoaiSoLieu: [this.item.LoaiSoLieu, Validators.required],
			MoTa: [this.item.MoTa],
            Locked: ['' + this.item.Locked],
            Priority: ['' + this.item.Priority]
        });
        
		this.itemForm.controls["LoaiSoLieu"];
        this.itemForm.controls["MoTa"];
        this.itemForm.controls["Locked"];
        this.itemForm.controls["Priority"];
        this.focusInput.nativeElement.focus();
        
		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('LOAI_SO_LIEU.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if(this.allowEdit == false) { 
			result = this.translate.instant('LOAI_SO_LIEU.DETAIL') + `- ${this.item.LoaiSoLieu}`;
			return result;
		}
		result = this.translate.instant('LOAI_SO_LIEU.UPDATE') + `- ${this.item.LoaiSoLieu}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): loaisolieuModel {
		const controls = this.itemForm.controls;
		const _item = new loaisolieuModel();
		_item.Id = this.item.Id;
		_item.LoaiSoLieu = controls['LoaiSoLieu'].value; 
		_item.MoTa = controls['MoTa'].value;
        _item.Locked = controls['Locked'].value;
        _item.Priority = controls['Priority'].value;
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
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}

		const Editloaisolieu = this.prepareCustomer();
		if (Editloaisolieu.Id > 0) {
			this.UpdateNhom(Editloaisolieu, withBack);
		} else {
			this.CreateNhom(Editloaisolieu, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateNhom(_item: loaisolieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaisolieuService.updateloaisolieu(_item).subscribe(res => {
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

	CreateNhom(_item: loaisolieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaisolieuService.createloaisolieu(_item).subscribe(res => {
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
