import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { CauHinhSMSService } from '../Services/cau-hinh-sms.service';
import { CommonService } from '../../../services/common.service';
import { CauHinhSMSModel } from '../Model/cau-hinh-sms.model';
import { CauHinhSMSPopupDVCComponent } from '../cau-hinh-sms-popup-donvicon/cau-hinh-sms-popup-donvicon.component';

@Component({
	selector: 'kt-cau-hinh-sms-edit',
	templateUrl: './cau-hinh-sms-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CauHinhSMSEditComponent implements OnInit, OnDestroy {
	// Public properties
	ItemData: any;
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	disabledBtn: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isChange: boolean = false;
	isZoomSize: boolean = false;
	ListDonViCon: any[] = [];
	datasource:any;
	public datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private componentSubscriptions: Subscription | undefined;

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
		public dialogRef: MatDialogRef<CauHinhSMSEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: CauHinhSMSService,
		private commonService: CommonService) { }


	async ngOnInit() {
		this.commonService.fixedPoint = 0;
		this.viewLoading = true;
		this.ItemData = new CauHinhSMSModel();
		//this.ItemData.clear();
		this.ItemData.Id = 0;

		this.createForm();
		// await this.getTreeDonVi().then(res => {
		// 	if (res && res.status == 1)
		// 		this.datatreeDonVi.next(res.data);
		// 	else
		// 		this.datatreeDonVi.next([]);
		// });
		this.getTreeDonVi();
		setTimeout(() => {
			if (this.data.CauHinhSMS && this.data.CauHinhSMS.Id > 0) {
				this.apiService.getById(this.data.CauHinhSMS.Id).subscribe(res => {
					this.viewLoading = false;
					if (res.status == 1 && res.data) {
						this.ItemData = res.data;
						this.createForm();
					}
					else {
						this.layoutUtilsService.showError(res.error.message);
					}
					this.changeDetectorRefs.detectChanges();
				});
			} else {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
			}
		}, 200);
	}

	GetValueNode() {
		this.ListDonViCon = [];
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			URL: [this.ItemData.URL == null ? '' : this.ItemData.URL, [Validators.required]],
			Brandname: [this.ItemData.Brandname == null ? '' : this.ItemData.Brandname, [Validators.required]],
			UserName: [this.ItemData.UserName == null ? '' : this.ItemData.UserName, [Validators.required]],
			DonVi: [this.ItemData.DonVi == null ? '' : this.ItemData.DonVi],
			DauSo: [this.ItemData.DauSo == null ? '' : this.ItemData.DauSo, [Validators.required]],
			ServiceId: [this.ItemData.ServiceId == null ? '' : this.ItemData.ServiceId, [Validators.required]],
			Password: [this.ItemData.Password == null ? '' : this.ItemData.Password, [Validators.required]],
			IsDungChung: [this.ItemData.DonVi == 0]
		});

		this.ListDonViCon = this.ItemData.DonViCon;
		this.datasource=new MatTableDataSource(this.ListDonViCon);

		if (this.data.CauHinhSMS.View)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (this.ItemData.Id == 0) 
			return 'Thêm mới cấu hình sms';
		if (this.data.CauHinhSMS.View)
			return `Xem cấu hình sms `;

		return `Chỉnh sửa cấu hình sms`;
	}

	onSubmit(type: boolean) {
		this.hasFormErrors = false;
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
		if (!controls["IsDungChung"].value && !controls["DonVi"].value) {
			this.hasFormErrors = true;
			this.layoutUtilsService.showError("Vui lòng chọn đơn vị");
			return;
		}
		this.disabledBtn = true;
		// eslint-disable-next-line prefer-const
		let editedCauHinhSMS = this.prepare();

		if (this.ItemData.Id > 0) {
			this.updateCauHinhSMS(editedCauHinhSMS)
			return;
		}

		this.addCauHinhSMS(editedCauHinhSMS, type);
	}

	prepare(): any {
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.URL = controls['URL'].value;
		_item.Brandname = controls['Brandname'].value;
		_item.UserName = controls['UserName'].value;
		_item.DauSo = controls['DauSo'].value;
		_item.ServiceId = controls['ServiceId'].value;
		_item.Password = controls['Password'].value;
		if (!controls["IsDungChung"].value) {
			_item.DonVi = controls['DonVi'].value;
			let ArrDVC: any[] = [];
			if (this.ListDonViCon && this.ListDonViCon.length > 0) {
				for (var i = 0; i < this.ListDonViCon.length; i++) {
					ArrDVC.push(+this.ListDonViCon[i].Id);
				}
			}
			//gán lại giá trị id 
			_item.DonViCon = ArrDVC;
		}
		else {
			_item.DonVi = 0;
			_item.DonViCon = [];
		}
		if (this.ItemData.Id > 0) {
			_item.Id = this.ItemData.Id;
		}

		return _item;
	}

	addCauHinhSMS(item: CauHinhSMSModel, withBack: boolean = false) {
		this.apiService.create(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm thành công`;
				this.layoutUtilsService.showInfo(message);
				this.itemForm.reset();
				this.ListDonViCon=[];
				this.datasource=new MatTableDataSource(this.ListDonViCon);
				if (withBack)
					this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	updateCauHinhSMS(item: CauHinhSMSModel) {
		this.apiService.update(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Cập nhật thành công`;
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	getTreeDonVi() {
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatreeDonVi.next(res.data);
			}
			else {
				this.datatreeDonVi.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	ChonDonViConPop() {
		if (this.itemForm.controls['DonVi'].value == '') {
			this.layoutUtilsService.showInfo('Chưa chọn đơn vị');
			return;
		}
		let InfoDonViCon = { Id: this.itemForm.controls['DonVi'].value, LstDonViCon: this.data.CauHinhSMS && this.data.CauHinhSMS.Id > 0 ? this.ItemData.DonViCon : [] };
		const dialogRef = this.dialog.open(CauHinhSMSPopupDVCComponent, { data: { InfoDonViCon } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.ListDonViCon = this.ItemData.DonViCon = res;
			this.datasource=new MatTableDataSource(this.ListDonViCon);
			this.changeDetectorRefs.detectChanges();
		});
	}

	DeleteDonViCon(ind: any) {
		// const _title: string = 'Xóa đơn vị con';
		// const _description: string = 'Bạn có chắc muốn xóa đơn vị con này không?';
		// const _waitDesciption: string = 'Đơn vị con đang được xóa...';
		// const _deleteMessage = `Xóa thành công`;
		// const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		// dialogRef.afterClosed().subscribe(res => {
		// 	if (!res) {
		// 		return;
		// 	}
		// 	this.ListDonViCon.splice(ind);
		// });
		this.ListDonViCon.splice(ind);
		this.datasource=new MatTableDataSource(this.ListDonViCon);
	}
}