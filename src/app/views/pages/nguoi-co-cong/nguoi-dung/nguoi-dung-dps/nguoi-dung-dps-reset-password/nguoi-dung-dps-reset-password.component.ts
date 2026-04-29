import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { NguoiDungDPSService } from '../Services/nguoi-dung-dps.service';
import { NguoiDungDPSModel } from '../Model/nguoi-dung-dps.model';
import { ConfirmPasswordValidator } from '../../../../auth/register/confirm-password.validator';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-nguoi-dung-dps-reset-password',
	templateUrl: './nguoi-dung-dps-reset-password.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NguoiDungDPSResetPasswordComponent implements OnInit, OnDestroy {
	// Public properties
	NguoiDungDPS: NguoiDungDPSModel = new NguoiDungDPSModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;
	isZoomSize: boolean = false;

	private componentSubscriptions: Subscription | undefined;

	allowEdit: boolean = true;
	Strong_Pass: string = '';
	disabledBtn: boolean = false;

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(
		public dialogRef: MatDialogRef<NguoiDungDPSResetPasswordComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: NguoiDungDPSService,
		private commonService: CommonService) { }

	ngOnInit() {
		this.viewLoading = true;
		this.NguoiDungDPS = this.data.NguoiDungDPS;
		this.allowEdit = this.data.allowEdit;
		this.GetConfig();
		this.createForm();
		if (this.data.NguoiDungDPS) {
			this.NguoiDungDPS = this.data.NguoiDungDPS;
		}
		if (this.data.NguoiDungDPS && this.data.NguoiDungDPS.UserID > 0) {
			this.apiService.getNguoiDungDPSById(this.data.NguoiDungDPS.UserID).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.NguoiDungDPS = res.data;
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
	}

	GetConfig() {
		this.commonService.getConfig(['STRONG_PASS']).subscribe(res => {
			this.Strong_Pass = res.data.STRONG_PASS;
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		let temp: any = {};
		if (this.Strong_Pass == '1') 
			temp.password = ['', [Validators.required, Validators.pattern(this.commonService.ValidateFormatRegex('password'))]];
		else 
			temp.password = ['', Validators.required];
		temp.confirmPassword = ['', Validators.required];
		this.itemForm = this.itemFB.group(temp, {
			validator: ConfirmPasswordValidator.MatchPassword
		});
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		return `Đặt lại mật khẩu người dùng - ${this.NguoiDungDPS.UserName} `;
	}

	onSubmit() {
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
		this.reset(edited)
	}


	prepare(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.NewPassword = controls['password'].value;
		_item.RePassword = controls['confirmPassword'].value;
		if (_item.NewPassword != _item.RePassword) {
			this.layoutUtilsService.showError("Xác nhận mật khẩu không đúng");
			return null;
		}
		if (this.NguoiDungDPS.UserID) 
			_item.Id = this.NguoiDungDPS.UserID;
		return _item;
	}

	reset(item: any) {
		this.apiService.ResetPassNguoiDungDPS(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Đặt lại mật khẩu người dùng thành công`;
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