import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { NguoiDungDPSService } from '../Services/nguoi-dung-dps.service';
import { NguoiDungDPSModel } from '../Model/nguoi-dung-dps.model';
import { ConfirmPasswordValidator } from '../../../../auth/register/confirm-password.validator';
import { CommonService } from '../../../services/common.service';
import { ChonNhieuDonViComponent } from '../../../components/chon-nhieu-don-vi/chon-nhieu-don-vi.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ChonNhieuDoiTuongListComponent } from '../../../components';
import moment from 'moment';

@Component({
	selector: 'kt-nguoi-dung-dps-edit',
	templateUrl: './nguoi-dung-dps-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NguoiDungDPSEditComponent implements OnInit, OnDestroy {
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
	disabledBtn: boolean = false;
	Capcocau: number = 0;

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
		public dialogRef: MatDialogRef<NguoiDungDPSEditComponent>,
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
		this.getTree();

		this.createForm();
		this.ListIdGroup();
		if (this.data.NguoiDungDPS) {
			this.NguoiDungDPS = this.data.NguoiDungDPS;
		}
		if (this.data.NguoiDungDPS && this.data.NguoiDungDPS.UserID > 0) {
			this.apiService.getNguoiDungDPSById(this.data.NguoiDungDPS.UserID).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.NguoiDungDPS = res.data;
					this.GetValueNode({ id: res.data.IdDonVi, Capcocau: res.data.Capcocau });
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
		this.Capcocau = +item.Capcocau;
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

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		let temp: any = {
			fullname: [this.NguoiDungDPS.FullName, [Validators.required, Validators.maxLength(100)]],
			userName: [this.NguoiDungDPS.UserName, [Validators.required, Validators.maxLength(50)]],
			viettelStudy: [this.NguoiDungDPS.ViettelStudy, Validators.maxLength(100)],
			email: [this.NguoiDungDPS.Email, [Validators.email, Validators.maxLength(100), Validators.required]],
			phoneNumber: [this.NguoiDungDPS.PhoneNumber, [Validators.pattern("[0][0-9]{9}"), Validators.maxLength(20)]],
			simCA: [this.NguoiDungDPS.SimCA, Validators.maxLength(100)],
			loaiChungThu: [this.NguoiDungDPS.LoaiChungThu == null ? '0' : this.NguoiDungDPS.LoaiChungThu + ''],
			serialToken: [this.NguoiDungDPS.SerialToken, Validators.maxLength(100)],
			donVi: [this.NguoiDungDPS.IdDonVi, Validators.required],
			chucVu: [this.NguoiDungDPS.IdChucVu == null ? '0' : this.NguoiDungDPS.IdChucVu + '', Validators.required],
			maNV: [this.NguoiDungDPS.MaNV, Validators.maxLength(50)],
			gioiTinh: [this.NguoiDungDPS.GioiTinh == null ? "0" : this.NguoiDungDPS.GioiTinh + ''],
			nhanLichDonVi: [this.NguoiDungDPS.NhanLichDonVi],
			cmtnd: [this.NguoiDungDPS.CMTND, Validators.maxLength(50)],
			ngaySinh: [this.NguoiDungDPS.NgaySinh]
		};
		if (!this.NguoiDungDPS.UserID) {
			temp.password = ['', Validators.required];
			temp.confirmPassword = ['', Validators.required];
			this.itemForm = this.itemFB.group(temp, {
				validator: ConfirmPasswordValidator.MatchPassword
			});
		} else {
			this.itemForm = this.itemFB.group(temp);
		}
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	reset() {
		if (!this.itemForm) return;
		this.NguoiDungDPS.clear();
		this.createForm();
		this.itemForm.controls['donVi'].setValue(null);
	}

	getTitle(): string {
		if (!this.allowEdit)
			return 'Chi tiết người dùng';
		if (!this.NguoiDungDPS.UserID) {
			return 'Thêm mới người dùng';
		}
		return `Chỉnh sửa người dùng - ${this.NguoiDungDPS.UserName} `;
	}

	onSubmit(type: boolean) {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/** check form */
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
			if (this.NguoiDungDPS.UserID) {
				this.update(edited)
				return;
			}
			this.add(edited, type);
		}
	}

	prepare(): NguoiDungDPSModel | null {
		if (!this.itemForm) return null;
		const controls = this.itemForm.controls;
		const _item = new NguoiDungDPSModel();
		_item.clear();
		_item.FullName = controls['fullname'].value;
		_item.UserName = controls['userName'].value;
		_item.ViettelStudy = controls['viettelStudy'].value;
		_item.Email = controls['email'].value;
		_item.PhoneNumber = controls['phoneNumber'].value;
		_item.SimCA = controls['simCA'].value;
		_item.LoaiChungThu = controls['loaiChungThu'].value;
		_item.SerialToken = controls['serialToken'].value;
		_item.IdDonVi = controls['donVi'].value;
		_item.IdChucVu = controls['chucVu'].value;
		_item.MaNV = controls['maNV'].value;
		_item.GioiTinh = controls['gioiTinh'].value;
		_item.NhanLichDonVi = controls['nhanLichDonVi'].value;
		_item.CMTND = controls['cmtnd'].value;
		if (controls['ngaySinh'].value)
			_item.NgaySinh = this.commonService.f_convertDate(controls['ngaySinh'].value);
		_item.DonViQuanTam = this.NguoiDungDPS.DonViQuanTam;
		_item.DonViLayHanXuLy = this.NguoiDungDPS.DonViLayHanXuLy;
		_item.avatar = this.avatar;
		_item.Sign = this.sign;
		if (!this.NguoiDungDPS.UserID) {
			_item.Password = controls['password'].value;
			_item.RePassword = controls['confirmPassword'].value;
			if (_item.Password != _item.RePassword) {
				this.layoutUtilsService.showError("Xác nhận mật khẩu không đúng");
				return null;
			}
		}
		//gán lại giá trị id 
		if (this.NguoiDungDPS.UserID) {
			_item.UserID = this.NguoiDungDPS.UserID;
		}
		if (this.Capcocau == 1)
			_item.lstDoiTuongNCC = this.NguoiDungDPS.lstDoiTuongNCC;
		else
			_item.lstDoiTuongNCC = [];
		return _item;
	}

	add(item: NguoiDungDPSModel, withBack: boolean = false) {
		this.apiService.createNguoiDungDPS(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm mới người dùng thành công`;
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

	update(item: NguoiDungDPSModel) {
		this.apiService.updateNguoiDungDPS(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Cập nhật người dùng thành công`;
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	getTree() {
		let Locked = this.NguoiDungDPS.UserID > 0;
		this.commonService.TreeDonVi(0, 0, Locked).subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		})
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

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}


	//loai=0: đối tượng NCC
	remove(item: any, loai = 0): void {
		if (loai == 0) {
			const index = this.NguoiDungDPS.lstDoiTuongNCC.indexOf(item);
			if (index >= 0) 
				this.NguoiDungDPS.lstDoiTuongNCC.splice(index, 1);
		}
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

	dv(loai = 0) {
		if (loai == 0) {
			const dialogRef = this.dialog.open(ChonNhieuDoiTuongListComponent, {
				data: {
					selected: this.NguoiDungDPS.lstDoiTuongNCC.map(x => {
						return { Id: x.id, DoiTuong: x.title }
					}) 
				} 
			});
			dialogRef.afterClosed().subscribe(res => {
				if (!res) return;
				if (res.done) {
					this.NguoiDungDPS.lstDoiTuongNCC = res.nhanVienSelected.map((x: any) => {
						return { id: x.Id, title: x.DoiTuong }
					});
					this.changeDetectorRefs.detectChanges();
				}
			});
		} else {
			const dialogRef = this.dialog.open(ChonNhieuDonViComponent, { 
				data: { 
					selected: loai == 1 ? this.NguoiDungDPS.DonViQuanTam : this.NguoiDungDPS.DonViLayHanXuLy 
				} 
			});
			dialogRef.afterClosed().subscribe(res => {
				if (!res) return;
				if (loai == 1)
					this.NguoiDungDPS.DonViQuanTam = res;
				else
					this.NguoiDungDPS.DonViLayHanXuLy = res;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	removeall(loai = 0) {
		if (loai == 0) {
			this.NguoiDungDPS.lstDoiTuongNCC = [];
		}
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