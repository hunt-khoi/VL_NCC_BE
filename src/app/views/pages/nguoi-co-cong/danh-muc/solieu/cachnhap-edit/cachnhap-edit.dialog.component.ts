import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cachNhapModel } from '../Model/cachnhap.model';
import { TranslateService } from '@ngx-translate/core';
import { cachNhapService } from '../Services/cachnhap.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'm-cachnhap-edit-dialog',
	templateUrl: './cachnhap-edit.dialog.component.html',
})

export class cachnhapEditDialogComponent implements OnInit {
	item: cachNhapModel;
	oldItem: cachNhapModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;

	id: number
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";
	listLoaiSoLieu: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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

	constructor(public dialogRef: MatDialogRef<cachnhapEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public cachNhapService: cachNhapService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CACH_NHAP.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit;
		this.id = this.item.Id;
		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;

			this.cachNhapService.getItem(this.item.Id).subscribe(res => {
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
			CachNhap: [this.item.CachNhap, Validators.required],
		});
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('CACH_NHAP.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('CACH_NHAP.DETAIL') + `- ${this.item.CachNhap}`;
			return result;
		}
		result = this.translate.instant('CACH_NHAP.UPDATE') + `- ${this.item.CachNhap}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): cachNhapModel {
		const controls = this.itemForm.controls;
		const _item = new cachNhapModel();
		_item.Id = this.item.Id;
		_item.CachNhap = controls['CachNhap'].value;
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

		const Editsolieu = this.prepareCustomer();
		if (Editsolieu.Id > 0) {
			this.UpdateNhom(Editsolieu, withBack);
		} else {
			this.CreateNhom(Editsolieu, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateNhom(_item: cachNhapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.cachNhapService.updatesolieu(_item).subscribe(res => {
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

	CreateNhom(_item: cachNhapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.cachNhapService.createsolieu(_item).subscribe(res => {
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
