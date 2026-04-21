import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { NguoiDungDPSService } from '../Services/nguoi-dung-dps.service';
import { NguoiDungDPSModel } from '../Model/nguoi-dung-dps.model';
import { ConfirmPasswordValidator } from '../../../../auth/register/confirm-password.validator';
import { CommonService } from '../../../services/common.service';
import { ChonNhieuDonViComponent } from '../../../components/chon-nhieu-don-vi/chon-nhieu-don-vi.component';
import moment from 'moment';

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
	listIdGroup: any[] = [];
	listNV: any[] = [];
	selectIdGroup: string = '0';
	private componentSubscriptions: Subscription | undefined;

	datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	lstChucVu: any[] = [];
	lstLoaiChungThu: any[] = [];
	lstGioiTinh: any[] = [];
	maxNS = moment(new Date()).add(-16, 'year').toDate();

	selectable: boolean = true;
	removable: boolean = true;
	allowEdit: boolean = true;

	avatar: any = { strBase64: '', filename: '' };
	sign: any = { strBase64: '', filename: '' };
	Strong_Pass: string = '';
	disabledBtn: boolean = false;

	/* Keyboard Shortcut Keys */
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

	async ngOnInit() {
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
					// this.GetValueNode({ id: res.data.IdDonvi });
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

	GetValueNode(item: any) {
		this.commonService.ListChucVu(item.id).subscribe(res => {
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
		if (this.Strong_Pass == '1') {
			temp.password = ['', [Validators.required, Validators.pattern(this.commonService.ValidateFormatRegex('password'))]];
		}
		else { 
			temp.password = ['', Validators.required];
		}
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
		if (this.NguoiDungDPS.UserID) {
			_item.Id = this.NguoiDungDPS.UserID;
		}
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

	ListIdGroup() {
		this.commonService.getListNhomNguoiDung().subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status === 1) {
				this.listIdGroup = res.data;
				this.selectIdGroup = '' + this.listIdGroup[0].IdGroup;
				this.changeDetectorRefs.detectChanges();
			};
		});
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		})
		this.commonService.ListLoaiChungThu().subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoaiChungThu = res.data;
			}
			else {
				this.lstLoaiChungThu = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
		this.commonService.ListGioiTinh().subscribe(res => {
			if (res && res.status == 1) {
				this.lstGioiTinh = res.data;
			}
			else {
				this.lstGioiTinh = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	remove(item: any, loai: number): void {
		if (loai == 1) {
			const index = this.NguoiDungDPS.DonViQuanTam.indexOf(item);
			if (index >= 0) 
				this.NguoiDungDPS.DonViQuanTam.splice(index, 1);
		} else {
			const index = this.NguoiDungDPS.DonViLayHanXuLy.indexOf(item);
			if (index >= 0) 
				this.NguoiDungDPS.DonViLayHanXuLy.splice(index, 1);
		}
		this.changeDetectorRefs.detectChanges();
	}
	
	dv(loai: number) {
		const dialogRef = this.dialog.open(ChonNhieuDonViComponent, { data: { selected: loai == 1 ? this.NguoiDungDPS.DonViQuanTam : this.NguoiDungDPS.DonViLayHanXuLy } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			if (loai == 1)
				this.NguoiDungDPS.DonViQuanTam = res;
			else
				this.NguoiDungDPS.DonViLayHanXuLy = res;
			this.changeDetectorRefs.detectChanges();
		});
	}

	removeall(loai: number) {
		if (loai == 1)
			this.NguoiDungDPS.DonViQuanTam = [];
		else
			this.NguoiDungDPS.DonViLayHanXuLy = [];
		this.changeDetectorRefs.detectChanges();
	}

	FileSelectedPrivate(evt: any, ind: any) {
		if (evt.target.files && evt.target.files.length) {//Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let size = file.size;
			let filename = file.name;
			// if (size >= 9999999) {
			// 	const message = `Không thể upload hình dung lượng quá cao.`;
			// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
			// 	return;
			// }
			let reader = new FileReader();
			reader.readAsDataURL(evt.target.files[0]);
			let base64Str: any;
			reader.onload = function () {
				base64Str = reader.result as String;
				var metaIdx = base64Str.indexOf(';base64,');
				base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
				//item.Image = "";
				let f = document.getElementById("imgIcondd" + ind);
				if (f)
					f.setAttribute("src", "data:image/png;base64," + base64Str);
			};
			setTimeout(_ => {
				if (ind == 1) {
					this.avatar.strBase64 = base64Str;
					this.avatar.filename = filename;
					this.changeDetectorRefs.detectChanges();
				}
				else if (ind == 2) {
					this.sign.strBase64 = base64Str;
					this.sign.filename = filename;
					this.changeDetectorRefs.detectChanges();
				}
			}, 1000);
		}
	}

	selectFile(ind: any) {
		let f = document.getElementById("imgInpdd" + ind);
		if (f) {
			const inputElement = f as HTMLInputElement;
			inputElement.type = "text";
			inputElement.type = "file";
			inputElement.click();
		}
	}
}