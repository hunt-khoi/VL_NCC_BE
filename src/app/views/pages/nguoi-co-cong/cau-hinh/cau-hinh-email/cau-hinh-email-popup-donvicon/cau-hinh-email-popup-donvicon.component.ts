import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { CauHinhEmailService } from '../Services/cau-hinh-email.service';
import { CauHinhEmailModel } from '../Model/cau-hinh-email.model';

@Component({
	selector: 'kt-cau-hinh-email-popup-donvicon',
	templateUrl: './cau-hinh-email-popup-donvicon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CauHinhEmailPopupDVCComponent implements OnInit, OnDestroy {
	// Public properties
	ItemData: any;
	FormControls: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	disabledBtn: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isChange: boolean = false;
	isZoomSize: boolean = false;
	ListDonViCon: any[] = [];
	public datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private componentSubscriptions: Subscription | undefined;

	constructor(
		public dialogRef: MatDialogRef<CauHinhEmailPopupDVCComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private FormControlFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: CauHinhEmailService,
		private commonService: CommonService) { }


	async ngOnInit() {
		this.commonService.fixedPoint = 0
		this.viewLoading = true;
		this.ItemData = new CauHinhEmailModel();
		this.ItemData.clear();
		//this.createForm();
		this.commonService.getDonViTheoParent(this.data.InfoDonViCon.Id).subscribe(res => {
			this.viewLoading = false;
			if (res.status == 1 && res.data) {
				// this.ItemData = res.data;
				// this.createForm();
				let LstDVC: any[] = [];
				let data = res.data;
				for (var i = 0; i < data.length; i++) {
					var objdetail: any = {};
					objdetail.check = this.data.InfoDonViCon?.LstDonViCon?.some((x: any) => x.Id == data[i].Id) ?? false;
					objdetail.Id = data[i].Id;
					objdetail.DonVi = data[i].DonVi;
					LstDVC.push(objdetail)
				}
				this.ListDonViCon = LstDVC;
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
		//this.CheckRoles();
	}

	CheckedChange(p: any, e: any) {
		p.check = e;
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.FormControls = this.FormControlFB.group({
			Server: [this.ItemData.Server == null ? '' : this.ItemData.Server, [Validators.required]],
			Port: [this.ItemData.Port == null ? '' : this.ItemData.Port, [Validators.required]],
			UserName: [this.ItemData.UserName == null ? '' : this.ItemData.UserName, [Validators.required]],
			DonVi: [this.ItemData.DonVi == null ? '' : this.ItemData.DonVi, [Validators.required]],
			EnableSSL: [this.ItemData.EnableSSL == null ? false : this.ItemData.EnableSSL, [Validators.required]],
			Password: [this.ItemData.Password == null ? '' : this.ItemData.Password, [Validators.required]],
		});

		if (this.data.CauHinhEmail.View)
			this.FormControls.disable();
	}

	getTitle(): string {
		if (this.ItemData.Id == 0) 
			return 'Thêm mới cấu hình email';
		if (this.data.CauHinhEmail.View)
			return `Xem cấu hình email `;
		return `Chỉnh sửa cấu hình email`;
	}

	onSubmit(type: boolean) {
		let ArrDVC: any[] = [];
		for (var i = 0; i < this.ListDonViCon.length; i++) {
			if (this.ListDonViCon[i].check) { 
				ArrDVC.push(this.ListDonViCon[i]);
			}
		}
		if (type) {
			this.dialogRef.close(ArrDVC);
		}
		else {
			this.dialogRef.close();
		}
	}

	prepareCauHinhEmails(): any {
		const controls = this.FormControls.controls;
		const _item: any = {};
		//_CauHinhEmail.clear();
		_item.Cast_BDNghi = controls['bDNghi'].value.split('T')[0];
		_item.Cast_KTNghi = controls['kTNghi'].value.split('T')[0];
		_item.DotNghiRQ = controls['dotNghi'].value;
		_item.MoTa = controls['moTa'].value;
		//gán lại giá trị id 
		if (this.ItemData.Id > 0) {
			_item.Id = this.ItemData.Id;
		}
		return _item;
	}

	addCauHinhEmail(item: CauHinhEmailModel, withBack: boolean = false) {
		this.apiService.create(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm thành công`;
				this.layoutUtilsService.showInfo(message);
				this.FormControls.reset();
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

	updateCauHinhEmail(item: CauHinhEmailModel) {
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
}