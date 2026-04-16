import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import moment from 'moment';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { KeHoachVanDongService } from '../Services/ke-hoach-van-dong.service';
import { KeHoachVanDongDetailModel, KeHoachVanDongModel } from '../Model/ke-hoach-van-dong.model';
import { KHVanDongDetailEditDialogComponent } from '../ke-hoach-van-dong-detail-edit/ke-hoach-van-dong-detail-edit-dialog.component';
import { DongGopQuyEditDialogComponent } from '../../quan-ly-quy/dong-gop-quy-edit/dong-gop-quy-edit-dialog.component';

@Component({
	selector: 'kt-ke-hoach-van-dong-edit-dialog',
	templateUrl: './ke-hoach-van-dong-edit-dialog.component.html',
})

export class KHVanDongEditDialogComponent implements OnInit {

	item: KeHoachVanDongModel;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	listDetail: any[] = [];
	IsMauTheoPhong
	listConDetail: any[] = [];
	selected: any[] = [];
	datasource: MatTableDataSource<any>;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false; // cho phép sửa
	allowDetail = false;
	isZoomSize = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	Nam: number;
	_name = '';
	hasIdParent: boolean = false;
	UserInfo: any;

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
		public dialogRef: MatDialogRef<KHVanDongEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public commonService: CommonService,
		public objectService: KeHoachVanDongService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = 'Kế hoạch vận động';
			this.Nam = moment().get("year");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
		})
		this.oldItem = Object.assign({}, this.item);
		this.allowEdit = this.data.allowEdit;
		if(this.item.IdParent != undefined && this.item.IdParent != null) {
			this.hasIdParent = true;
		}
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.loadListDetail();
		} else {
			if (this.data._item.Details != undefined)
				this.listDetail = this.data._item.Details;
			if (this.data._item.ConDetails != undefined)
				this.listConDetail = this.data._item.ConDetails;
		}

		this.createForm();
	}

	isAllGiao: boolean;
	isAllHuyGiao: boolean;
	loadListDetail() {
		this.isAllGiao = false;
		this.isAllHuyGiao = false;
		this.objectService.getDetailByIdKeHoach(this.oldItem.Id).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.listDetail = res.data.Details;
				this.listConDetail= res.data.ConDetails;
				if (this.listConDetail.filter(x => !x.IsGiao).length > 0)
					this.isAllGiao = true;
				if (this.listConDetail.filter(x => x.IsGiao).length > 0)
					this.isAllHuyGiao = true;
				this.createForm();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	xoaDonViSelected(item, pos, isCapDuoi: boolean = false) {
		if (item.Id > 0) {
			const _name1 = 'đơn vị';
			const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
			const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
			const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });

			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
				this.objectService.DeleteDetail(item.Id, isCapDuoi).subscribe(res => {
					if (res && res.status === 1) {
						this.deleteInList(pos, isCapDuoi);
						this.layoutUtilsService.showInfo(_deleteMessage);
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			});
		} else { //chi tiết chưa lưu db
			this.deleteInList(pos, isCapDuoi);
		}
		this.tinhTongTienCT();
	}

	deleteInList(pos, isCapDuoi: boolean) {
		if (isCapDuoi) 
			this.listConDetail.splice(pos, 1);
		else 
			this.listDetail.splice(pos, 1);
	}

	updateDonViSelected(item, isCapDuoi: boolean = false) {
		const _name = 'đơn vị';
		this.objectService.SaveDetail(this.item.Id, isCapDuoi, item).subscribe(res => {
			if (res && res.status === 1) {
				let updateMessage = item.Id == 0 ? "Lưu đơn vị thành công" : this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: _name.toLowerCase() });
				this.layoutUtilsService.showInfo(updateMessage);
				if (isCapDuoi) {
					let idx = this.listConDetail.findIndex(x => x == item);
					if (idx > -1)
						this.listConDetail[idx].Id = res.data.Id; //cập nhật Id để thực hiện dc ngay thao tác Giao
				}
				else {
					let idx = this.listDetail.findIndex(x => x == item);
					if (idx > -1)
						this.listDetail[idx].Id = res.data.Id; //cập nhật Id để thực hiện dc ngay thao tác Giao
				}
				// this.tinhTongTienCT();
				this.ngOnInit();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	giaoDonVi(item, isGiao: number) {
		if (item.Id > 0) {
			const _title = this.translate.instant(isGiao ? 'Giao chỉ tiêu đơn vị' : 'Hủy giao chỉ tiêu đơn vị');
			const _description = this.translate.instant('Bạn có chắc muốn ' + (isGiao ? 'giao chỉ tiêu đơn vị ?' : 'hủy giao chỉ tiêu đơn vị'));
			const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');
	
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
	
				this.objectService.giaoDetails([item.Id], isGiao).subscribe(res => {
					if (res && res.status === 1) {
						let updateMessage = isGiao ? "Giao chỉ tiêu đơn vị thành công" : "Hủy giao chi tiêu đơn vị thành công";
						this.layoutUtilsService.showInfo(updateMessage);
						this.loadListDetail();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			});
		}
		else {
			this.layoutUtilsService.showError("Thao tác không thành công");
		}
	}

	giaoTatCa(isGiao: number) {
		let ids = this.listConDetail.filter(x => (isGiao == 1 ? !x.IsGiao : x.IsGiao) && x.Id > 0).map(x => x.Id);

		if (ids.length == this.listConDetail.length) {
			const _title = this.translate.instant(isGiao ? 'Giao tất cả chỉ tiêu đơn vị' : 'Hủy giao tất cả chỉ tiêu đơn vị');
			const _description = this.translate.instant('Bạn có chắc muốn ' + (isGiao ? 'giao tất cả chỉ tiêu đơn vị ?' : 'hủy giao tất cả chỉ tiêu đơn vị'));
			const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý...');
	
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
	
				this.objectService.giaoDetails(ids, isGiao).subscribe(res => {
					if (res && res.status === 1) {
						let updateMessage = isGiao ? "Giao chỉ tiêu đơn vị thành công" : "Hủy giao chi tiêu đơn vị thành công";
						this.layoutUtilsService.showInfo(updateMessage);
						this.loadListDetail();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			});
		}
		else {
			this.layoutUtilsService.showError("Thao tác không thành công");
		}
	}

	nhacNho() {
		this.objectService.nhacNhos(this.oldItem.Id).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở vận động thành công")
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	createForm() {
		this.item = Object.assign({}, this.oldItem);
		this.itemForm = this.fb.group({
			KeHoach: ['' + this.item.KeHoach, Validators.required],
			Nam: [this.item.Nam != null ? '' + this.item.Nam : this.Nam, Validators.required],
			Priority: [this.item.Priority > -1 ? this.item.Priority : ''],
			SoTien: [this.item.SoTien],
			MoTa: [this.item.MoTa === null ? '' : '' + this.item.MoTa],
			TienCT: [0],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit) { // false thì không cho sửa
			this.itemForm.disable();
		}
		if(this.hasIdParent) {
			this.itemForm.controls.SoTien.disable();
		}
		this.itemForm.controls.TienCT.disable();
		this.tinhTongTienCT()
	}

	xuatDanhSach() {
		this.objectService.exportCTKeHoach(this.item.Id).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất chi tiết kế hoạch thất bại");
		});
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		const _item = new KeHoachVanDongModel();
		_item.clear();
		if (this.item.IdParent)
			_item.IdParent = this.item.IdParent;
		_item.KeHoach = controls.KeHoach.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
		_item.SoTien = controls.SoTien.value;
		_item.MoTa = controls.MoTa.value;
		_item.Nam = +controls.Nam.value;
		_item.Id = this.item.Id > 0 ? this.item.Id : 0;
		return _item;
	}

	tinhTongTienCT() {
		let tong = 0;
		this.listDetail.forEach(x => {
			tong += +x.SoTien
		});
		this.listConDetail.forEach(x => {
			tong += +x.SoTien
		});
		this.itemForm.controls.TienCT.setValue(tong)
	}

	AddDonViNew(isCapDuoi: boolean = false) {
		const objectModel = new KeHoachVanDongDetailModel()
		objectModel.clear()
		this.EditObject(objectModel, isCapDuoi);
	}

	getColorProgressBar(pt: number) {
		if (pt < 30) {
			return 'danger';
		}
		else if (pt >= 30 && pt < 80) {
			return 'warning';
		}
		else {
			return 'success';
		}
	}

	getColor(pt: number) {
		if (pt < 30) {
			return 'red';
		}
		else if (pt >= 30 && pt < 80) {
			return 'orange';
		}
		else {
			return 'green';
		}
	}

	EditObject(_item: any, isCapDuoi: boolean = false, allowEdit: boolean = true) {
		let lstdv = []
		if (isCapDuoi) {
			this.listConDetail.forEach(x => {
				lstdv.push(+x.Id_DonVi)
			});
		}
		else {
			this.listDetail.forEach(x => {
				lstdv.push(+x.Id_DonVi)
			});
		}
		let nam = this.itemForm.controls.Nam.value;

		const dialogRef2 = this.dialog.open(KHVanDongDetailEditDialogComponent, { data: { _item, allowEdit, isCapDuoi, nam, listDonVi: lstdv } });
		dialogRef2.afterClosed().subscribe(res => {
			if (!res) {
				return;
			} else {
				if (isCapDuoi) 
					this.listConDetail.push(res);
				else 
					this.listDetail.push(res);
					
				this.tinhTongTienCT();
			}
		});
	}

	AddDongGop(_item: any) {
		let temp: any = Object.assign({}, _item);
		const dialogRef = this.dialog.open(DongGopQuyEditDialogComponent, { data: { _item: temp } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.ngOnInit();
				this.layoutUtilsService.showInfo("Đóng góp thành công");
			}
		});
	}


	phatThu(item) {
		this.objectService.xuatThuNgo(item.Id).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất thư ngỏ thất bại");
		});
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (this.item.Id < 1) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE')
		return result;
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
		const EditObject = this.prepareData();
		if(this.listDetail.length == 0 && this.listConDetail.length == 0) {
			this.layoutUtilsService.showError("Kế hoạch chưa có chi tiết");
			return;
		}
		if (EditObject.Id > 0) {
			this.Update(EditObject, withBack);
		} else {
			this.Create(EditObject, withBack);
		}
	}


	Update(_item: KeHoachVanDongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		_item.ConDetails = this.listConDetail;
		_item.Details = this.listDetail;
		this.objectService.UpdateData(_item.Id, _item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: KeHoachVanDongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		_item.ConDetails = this.listConDetail;
		_item.Details = this.listDetail;
		this.objectService.CreateData(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeForm() {
		this.dialogRef.close();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
