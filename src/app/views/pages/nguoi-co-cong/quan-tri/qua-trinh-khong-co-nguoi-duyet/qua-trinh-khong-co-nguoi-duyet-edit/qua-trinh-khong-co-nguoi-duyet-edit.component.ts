import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { QuaTrinhKhongCoNguoiDuyetService } from '../Services/qua-trinh-khong-co-nguoi-duyet.service';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { NhapSoLieuDuyetService } from './../../../quan-ly-mau-so-lieu/nhap-so-lieu-duyet/services/nhap-so-lieu-duyet.service';
import { DeXuatService } from './../../../qua-le-tet/de-xuat/Services/de-xuat.service';
import { HoSoNCCDuyetService } from './../../../ho-so-nguoi-co-cong/ho-so-ncc-duyet/Services/ho-so-ncc-duyet.service';
// import { NhapBaoHiemDuyetService } from '../../../bao-hiem-y-te/nhap-bao-hiem-duyet/Services/nhap-bao-hiem-duyet.service';
// import { HoSoNhaOService } from '../../../ho-tro-nha-o/ho-so-nha-o/Services/ho-so-nha-o.service';
// import { NienHanService } from '../../../nien-han-dung-cu/nien-han/Services/nien-han.service';
// import { HoTroService } from '../../../quy-den-on-dap-nghia/ho-tro/Services/ho-tro.service';

@Component({
	selector: 'kt-qua-trinh-khong-co-nguoi-duyet-edit',
	templateUrl: './qua-trinh-khong-co-nguoi-duyet-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuaTrinhKhongCoNguoiDuyetEditComponent implements OnInit, OnDestroy {
	// Public properties
	item: any;
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;
	listNV: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	disabledBtn: boolean = false;
	iddonvi: number = 0;
	ListNguoiDuyet: any[] = [];
	LoaiPhieu = 0;
	IdPhieu = 0;
	isShowNhacnho = false;
	nguoiduyet: any = [];
	urlTo = "";
	isThaoluan: any = false;
	userId: number = 0;
	private componentSubscriptions: Subscription | undefined;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(
		public dialogRef: MatDialogRef<QuaTrinhKhongCoNguoiDuyetEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private router: Router,
		private objectService: HoSoNCCDuyetService,
		private NhapSoLieuDuyetService: NhapSoLieuDuyetService,
		private DeXuatService: DeXuatService,
		// private BaoHiemService: NhapBaoHiemDuyetService,
		// private HoSoNhaOService: HoSoNhaOService,
		// private NienHanService: NienHanService,
		// private HoTroQuyService: HoTroService,
		private commonService: CommonService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private CommonService: CommonService,
		private service: QuaTrinhKhongCoNguoiDuyetService) {
		this.isShowNhacnho = this.CommonService.IsShowNhacnhoduyet(this.router.url);
	}

	guiduyet = false;
	async ngOnInit() {
		this.viewLoading = true
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.iddonvi = res.IdDonVi;
			this.userId = res.id;
		})
		this.item = this.data.QuaTrinhKhongCoNguoiDuyet;
		this.LoaiPhieu = this.data.loai;
		this.urlTo = this.data.urlTo;
		this.isThaoluan = this.data.isThaoluan;
		this.IdPhieu = this.item.checker.IdPhieu;
		this.GetNguoidangduyet(this.LoaiPhieu);
		this.service.GetListNextChecker(this.item.id_quatrinh, this.item.nguoi_gui).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.listNV.next(res.data);
				this.LoadListNguoiDuyet(res.data);
			}
			else
				this.listNV.next([]);
		});
		this.createForm();
	}

	GetNguoidangduyet(loai: number) {
		// 1: đề xuất tặng quà - 2: hồ sơ ncc - 3: số liệu - 4: bảo hiểm - 5: nhà ở - 6, 7: niên hạn - 8: quỹ
		if (loai == 1) {
			this.DeXuatService.getItem(this.IdPhieu).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
					this.nguoiduyet.Hoten = res.data.CurrentChecker;
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		if (loai == 2) {
			this.objectService.detail(this.IdPhieu).subscribe(res => {
				if (res && res.status == 1) {
					this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
					this.nguoiduyet.Hoten = res.data.CurrentChecker;
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
		if (loai == 3) {
			this.NhapSoLieuDuyetService.detail(this.IdPhieu).subscribe(res => {
				if (res && res.status == 1) {
					this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
					this.nguoiduyet.Hoten = res.data.CurrentChecker;
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
		// if (loai == 4) {
		// 	this.BaoHiemService.getItem(this.IdPhieu).subscribe(res => {
		// 		if (res && res.status == 1) {
		// 			this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
		// 			this.nguoiduyet.Hoten = res.data.CurrentChecker;
		// 		}
		// 		else {
		// 			this.layoutUtilsService.showError(res.error.message);
		// 		}
		// 	})
		// }
		// if (loai == 5) {
		// 	this.HoSoNhaOService.getItem(this.IdPhieu).subscribe(res => {
		// 		if (res && res.status == 1) {
		// 			this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
		// 			this.nguoiduyet.Hoten = res.data.CurrentChecker;
		// 		}
		// 		else {
		// 			this.layoutUtilsService.showError(res.error.message);
		// 		}
		// 	})
		// }
		// if (loai == 6 || loai == 7) {
		// 	this.NienHanService.getItem(this.IdPhieu).subscribe(res => {
		// 		if (res && res.status == 1) {
		// 			this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
		// 			this.nguoiduyet.Hoten = res.data.CurrentChecker;
		// 		}
		// 		else {
		// 			this.layoutUtilsService.showError(res.error.message);
		// 		}
		// 	})
		// }
		// if (loai == 8) {
		// 	this.HoTroQuyService.getItem(this.IdPhieu).subscribe(res => {
		// 		if (res && res.status == 1) {
		// 			this.nguoiduyet.NguoiDuyetDon = res.data.NguoiDuyetDon;
		// 			this.nguoiduyet.Hoten = res.data.CurrentChecker;
		// 		}
		// 		else {
		// 			this.layoutUtilsService.showError(res.error.message);
		// 		}
		// 	})
		// }
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) 
			this.componentSubscriptions.unsubscribe();
	}

	GuiDeXuatDuyet() {
		this.guiduyet = true;
		var dataNoty: any = {};
		if (this.nguoiduyet.NguoiDuyetDon)
			dataNoty.To = this.nguoiduyet.NguoiDuyetDon;
		else
			dataNoty.To = 0;
		if (this.item.checker.Checkers) {
			var x = this.item.checker.Checkers.split(',');
			dataNoty.Users = x;
		}
		var content = "";
		dataNoty.url = this.urlTo;
		if (this.LoaiPhieu == 1) {
			content = " đã nhắc nhở bạn duyệt hồ sơ NCC";
			dataNoty.url += '/de-xuat/'
		}
		if (this.LoaiPhieu == 2) {
			content = " đã nhắc nhở bạn duyệt đề xuất quà tết";
			dataNoty.url += '/ho-so/'
		}
		if (this.LoaiPhieu == 3) {
			content = " đã nhắc nhở bạn duyệt số liệu hằng năm";
			dataNoty.url += '/so-lieu/'
		}
		// if (this.LoaiPhieu == 4) {
		// 	content = " đã nhắc nhở bạn duyệt nhập bảo hiểm y tế";
		// 	dataNoty.url += '/danh-sach/'
		// }
		// var flag = -1;
		// if (this.LoaiPhieu == 5) {
		// 	content = " đã nhắc nhở bạn duyệt hồ sơ hỗ trợ nhà";
		// 	dataNoty.url += '/ho-so-nha/'
		// }	
		// if (this.LoaiPhieu == 6) {
		// 	content = " đã nhắc nhở bạn duyệt nhập niên hạn xã";
		// 	dataNoty.url += '/nien-han/'
		// 	flag = 1;
		// }	
		// if (this.LoaiPhieu == 7) {
		// 	content = " đã nhắc nhở bạn duyệt nhập niên hạn";
		// 	dataNoty.url += '/nien-han/'
		// 	flag = 0;
		// }
		// if (this.LoaiPhieu == 8) {
		// 	content = " đã nhắc nhở bạn duyệt DS hỗ trợ từ quỹ";
		// 	dataNoty.url += '/ho-tro-list/'
		// }
		dataNoty.url += this.IdPhieu;
		// if (flag > -1) {
		// 	dataNoty.url += flag == 1 ? '/true' : '/false';
		// }

		dataNoty.content = content
		this.CommonService.DeXuatDuyet(dataNoty).subscribe(_ => {
			this.layoutUtilsService.showInfo("Nhắc nhở duyệt thành công");
		});
	}

	LoadListNguoiDuyet(LstUsers: any[]) {
		var list: any[] = [];
		var user: any[] = [];
		if (this.item.checker.Checker) {
			list.push(this.item.checker.Checker);
		}
		if (this.item.checker.Checkers) {
			var x = this.item.checker.Checkers.split(',');
			x.forEach((value: any) => list.push(+value));
		}
		list.forEach(lst => {
			var us = LstUsers.find(x => x.UserID == lst);
			if (us) 
				user.push(us);
		})
		this.ListNguoiDuyet = user;
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			nhanVien: ['', Validators.required],
		});
	}

	getTitle(): string {
		if (this.isThaoluan)
			return 'Thảo luận trong ' + this.item.loai;
		return `Thêm người duyệt cho ` + this.item.loai;
	}

	isControlInvalid(controlName: string): boolean {
		if (!this.itemForm) return false;
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onSubmit() {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/** check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		let item = this.prepare();
		item.id_quatrinh = this.item.id_quatrinh;
		this.update(item)
	}

	prepare(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		var item: any = {}
		item.Checkers = controls['nhanVien'].value.join();
		return item;
	}

	update(item: any) {
		this.disabledBtn = true;
		this.service.updateQuaTrinhKhongCoNguoiDuyet(item).subscribe(res => {
			this.disabledBtn = false;
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm người duyệt thành công`;
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}
	
	closeDialog() {
		this.dialogRef.close(this.isChange);
	}
}