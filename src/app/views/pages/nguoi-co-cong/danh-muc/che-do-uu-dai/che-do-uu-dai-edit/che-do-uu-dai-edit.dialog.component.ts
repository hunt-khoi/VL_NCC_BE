import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { chedouudaiModel } from '../../che-do-uu-dai/Model/che-do-uu-dai.model';
import { TranslateService } from '@ngx-translate/core';
import { chedouudaiService } from '../Services/che-do-uu-dai.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-che-do-uu-dai-edit-dialog',
	templateUrl: './che-do-uu-dai-edit.dialog.component.html',
})

export class chedouudaiEditDialogComponent implements OnInit {
	item: chedouudaiModel = new chedouudaiModel();
	oldItem: chedouudaiModel = new chedouudaiModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	change: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
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

	constructor(public dialogRef: MatDialogRef<chedouudaiEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public chedouudaiService: chedouudaiService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("CHE_DO_UU_DAI.NAME");
	}

	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 
		this.createForm();
        if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.chedouudaiService.getItem(this.item.Id).subscribe(res => {
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
			CheDoUuDai: [this.item.CheDoUuDai, Validators.required],
			MoTa: [this.item.MoTa],
            Locked: ['' + this.item.Locked],
            Priority: ['' + this.item.Priority, Validators.min(1)]
        });
		this.itemForm.controls["CheDoUuDai"].markAsTouched();
		if (this.focusInput)
    		this.focusInput.nativeElement.focus();
		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	getTitle(): string {
		let result = this.translate.instant('CHE_DO_UU_DAI.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if(!this.allowEdit) { 
			result = this.translate.instant('CHE_DO_UU_DAI.DETAIL') + ` - ${this.item.CheDoUuDai}`;
			return result;
		}
		result = this.translate.instant('CHE_DO_UU_DAI.UPDATE') + ` - ${this.item.CheDoUuDai}`;
		return result;
	}

	prepare(): chedouudaiModel {
		if (!this.itemForm) return new chedouudaiModel();
		const controls = this.itemForm.controls;
		const _item = new chedouudaiModel();
		_item.Id = this.item.Id;
		_item.CheDoUuDai = controls['CheDoUuDai'].value; 
		_item.MoTa = controls['MoTa'].value;
        _item.Locked = controls['Locked'].value;
		_item.Priority = controls['Priority'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const EditNhomLeTet = this.prepare();
		if (EditNhomLeTet.Id > 0) {
			this.Update(EditNhomLeTet, withBack);
		} else {
			this.Create(EditNhomLeTet, withBack);
		}
	}

	Update(item: chedouudaiModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.chedouudaiService.update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: chedouudaiModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.chedouudaiService.create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					this.change = true;
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	close() {
		this.dialogRef.close(this.change);
	}
}