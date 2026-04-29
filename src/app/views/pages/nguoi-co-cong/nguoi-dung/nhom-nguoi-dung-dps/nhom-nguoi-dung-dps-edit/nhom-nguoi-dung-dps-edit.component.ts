import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { NhomNguoiDungDPSService } from '../Services/nhom-nguoi-dung-dps.service';
import { NhomNguoiDungDPSModel } from '../Model/nhom-nguoi-dung-dps.model';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-nhom-nguoi-dung-dps-edit',
	templateUrl: './nhom-nguoi-dung-dps-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NhomNguoiDungDPSEditComponent implements OnInit, OnDestroy {
	// Public properties
	NhomNguoiDungDPS: NhomNguoiDungDPSModel = new NhomNguoiDungDPSModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;

	isZoomSize: boolean = false;
	private componentSubscriptions: Subscription | undefined;
	datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	lstChucVu: any[] = [];
	allowEdit: boolean = true;
	disabledBtn: boolean = false;

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

	constructor(
		public dialogRef: MatDialogRef<NhomNguoiDungDPSEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: NhomNguoiDungDPSService,
		private commonService: CommonService) { }

	ngOnInit() {
		this.viewLoading = true;
		this.NhomNguoiDungDPS = this.data.NhomNguoiDungDPS;
		this.allowEdit = this.data.allowEdit;
		this.getTree();
		this.createForm();
		if (this.data.NhomNguoiDungDPS && this.data.NhomNguoiDungDPS.IdGroup > 0) {
			this.apiService.getById(this.data.NhomNguoiDungDPS.IdGroup).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.NhomNguoiDungDPS = res.data;
					this.loadChucVuByDonVi(this.NhomNguoiDungDPS.DonVi);
					this.createForm();
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			this.loadChucVuByDonVi(this.NhomNguoiDungDPS.DonVi);
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	loadChucVuByDonVi(Donvi: any) {
		this.commonService.ListChucVu(Donvi).subscribe(res => {
			if (res && res.status == 1) {
				this.lstChucVu = res.data;
			}
			else {
				this.lstChucVu = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
	}
	
	getTree() {
		let Locked = this.NhomNguoiDungDPS.IdGroup > 0;
		this.commonService.TreeDonVi(0, 0, Locked).subscribe(res => {
			// this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
				if (this.itemForm && this.NhomNguoiDungDPS.IdGroup == 0 && res.data.length > 0) 
					this.itemForm.controls["donVi"].setValue(res.data[0]["id"]);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
	}

	GetValueNode(item: any) {
		this.loadChucVuByDonVi(item.id);
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			groupName: [this.NhomNguoiDungDPS.GroupName, [Validators.required, Validators.maxLength(250)]],
			ma: [this.NhomNguoiDungDPS.Ma, [Validators.required, Validators.maxLength(250)]],
			ghiChu: [this.NhomNguoiDungDPS.GhiChu, Validators.maxLength(500)],
			displayOrder: [this.NhomNguoiDungDPS.DisplayOrder, Validators.min(1)],
			locked: [this.NhomNguoiDungDPS.Locked],
			isDefault: [this.NhomNguoiDungDPS.IsDefault],
			donVi: [this.NhomNguoiDungDPS.DonVi, Validators.required],
			chucVu: [this.NhomNguoiDungDPS.ChucVu == null ? '0' : this.NhomNguoiDungDPS.ChucVu + '']
		});
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	reset() {
		this.NhomNguoiDungDPS.clear();
		this.createForm();
	}

	getTitle(): string {
		if (!this.allowEdit)
			return 'Chi tiết vai trò';
		if (this.NhomNguoiDungDPS.IdGroup == 0) 
			return 'Thêm mới vai trò';
		return `Chỉnh sửa vai trò - ${this.NhomNguoiDungDPS.GroupName} `;
	}

	onSubmit(type: boolean) {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			let invalid = <FormControl[]>Object.keys(controls).map(key => controls[key]).filter(ctl => ctl.invalid);
			let invalidElem: any = invalid[0];
			invalidElem.nativeElement.focus();
			this.hasFormErrors = true;
			return;
		}

		let edited = this.prepare();
		if (edited) {
			if (this.NhomNguoiDungDPS.IdGroup > 0) {
				this.update(edited)
				return;
			}
			this.add(edited, type);
		}
	}

	prepare(): NhomNguoiDungDPSModel | null {
		if (!this.itemForm) return null;
		const controls = this.itemForm.controls;
		const _item = new NhomNguoiDungDPSModel();
		_item.clear();
		_item.GroupName = controls['groupName'].value;
		_item.Ma = controls['ma'].value;
		_item.DisplayOrder = controls['displayOrder'].value;
		_item.Locked = controls['locked'].value;
		_item.GhiChu = controls['ghiChu'].value;
		_item.DonVi = controls['donVi'].value;
		_item.ChucVu = controls['chucVu'].value;
		_item.IsDefault = controls['isDefault'].value;
		//gán lại giá trị id 
		if (this.NhomNguoiDungDPS.IdGroup > 0) {
			_item.IdGroup = this.NhomNguoiDungDPS.IdGroup;
		}
		return _item;
	}

	add(item: NhomNguoiDungDPSModel, withBack: boolean = false) {
		this.apiService.create(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm mới vai trò thành công`;
				this.layoutUtilsService.showInfo(message);
				//this.itemForm.reset();
				if (withBack)
					this.dialogRef.close(this.isChange);
				this.reset();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	update(item: NhomNguoiDungDPSModel) {
		this.apiService.update(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Cập nhật vai trò thành công`;
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}
}