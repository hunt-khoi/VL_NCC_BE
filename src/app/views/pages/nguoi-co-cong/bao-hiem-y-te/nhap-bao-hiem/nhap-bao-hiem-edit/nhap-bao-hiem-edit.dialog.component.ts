import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaoHiemYTModel } from '../../nhap-bao-hiem/Model/nhap-bao-hiem.model';
import { TranslateService } from '@ngx-translate/core';
import { NhapBaoHiemService } from '../Services/nhap-bao-hiem.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DoiTuongBaoHiemEditDialogComponent } from '../../doi-tuong-bao-hiem/doi-tuong-bao-hiem-edit/doi-tuong-bao-hiem-edit-dialog.component';
import { DoiTuongBaoHiemModel } from '../../doi-tuong-bao-hiem/Model/doi-tuong-bao-hiem.model';

@Component({
	selector: 'm-nhap-bao-hiem-edit-dialog',
	templateUrl: './nhap-bao-hiem-edit.dialog.component.html',
})
export class NhapBaoHiemEditDialogComponent implements OnInit {
	item: BaoHiemYTModel;
	oldItem: BaoHiemYTModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean;
	visibleTangGiam: boolean;
	treeNguoiNhan_Goc: any[] = [];
	treeNguoiNhan: any[] = [];
	treeNguoiNhanView: any[] = [];
	_name = "";
	showImport: boolean = false;
	TongSo: number = 0;
	TongTien: number = 0;
	tongMuc: any[] = [];
	tongSL: any[] = [];
	addNhap = false;

	lydos: any[] = []
	Filter: string = "";
	selected_tab: number = 0;

	constructor(public dialogRef: MatDialogRef<NhapBaoHiemEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public NhapBaoHiemService: NhapBaoHiemService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = ' bảo hiểm tháng';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 

		if (this.data.addNhap)
			this.addNhap = this.data.addNhap;

		this.createForm();
		this.danhMucService.liteLyDoGiam(3).subscribe(res => {
			this.lydos = res.data;
		});
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.disabledBtn = true;
			this.NhapBaoHiemService.getItem(this.item.Id, true).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.allowEdit) { //load chi tiết để sửa -> kiểm tra đc phép sửa hay k
						this.allowEdit = res.data.AllowEdit1;
						if (!this.allowEdit)
							this.layoutUtilsService.showError("Không thể sửa danh sách này");
					}
					this.visibleTangGiam = res.Visible;
					this.treeNguoiNhan_Goc = res.data.Details;

					this.treeNguoiNhan = this.treeNguoiNhan_Goc;
					this.tinhTongMuc();
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		if (this.addNhap) // nhập ds mới
			this.changeDot()
	}
	clearFilter(evt: MouseEvent,) {
		this.Filter = '';
		this.treeNguoiNhan = this.treeNguoiNhan_Goc;
		evt.stopPropagation();
	}

	filterText() {
		let text = this.Filter.toLowerCase();
		this.treeNguoiNhan = this.treeNguoiNhan_Goc.map(x => {
			let data = x.DoiTuongs.map(xxx => {
				return {
					DoiTuong: xxx.DoiTuong,
					Id_Doituong: xxx.Id_Doituong,
					NCCs: xxx.NCCs.filter(y => y.SoHoSo.toLowerCase().includes(text) 
					|| y.HoTen.toLowerCase().includes(text) || y.DiaChi.toLowerCase().includes(text))
				}
			})
			return {
				Id_LoaiDoiTuong: x.Id_LoaiDoiTuong,
				LoaiDoiTuong: x.LoaiDoiTuong,
				DoiTuongs: data
			}
		});
	}

	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongMuc = [];
		this.tongSL = [];
		for (let i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let c1 = this.treeNguoiNhan_Goc[i];
			let tongMuc = [];
			let tongSL = [];
			for (let c2 of c1.DoiTuongs) {
				let s = 0;
				let c = 0;
				for (let c3 of c2.NCCs) {
					if (this.allowEdit) {
						if (this.item.Id == 0) { //TH chưa nhập danh sách IsTang chưa có
							if (c3.IsTang && c3.Id_Nhap == this.item.Id)
								c3.IsTang = true;
						}
						if ((c3.Checked && !c3.IsGiam) || c3.IsTang) {
							let tien = this.danhMucService.stringToInt(c3.SoTien);
							s += tien;
							c++;
						}
					} else {
						if ((this.selected_tab == 0 && c3.Checked && !c3.IsGiam)
							|| (this.selected_tab == 1 && c3.IsTang)
							|| (this.selected_tab == 2 && c3.IsGiam)) {
							let tien = this.danhMucService.stringToInt(c3.SoTien);
							s += tien;
							c++;
						}
					}
				}
				tongMuc.push(this.danhMucService.f_currency_V2('' + s));
				tongSL.push(c);
	
				this.TongSo += c;
				this.TongTien += s;
			}
			this.tongMuc.push(tongMuc);
			this.tongSL.push(tongSL);
		}
	}

	changeDot() {
		this.viewLoading = true;
		this.tongMuc = []
		this.NhapBaoHiemService.getNguoiHuongBH().subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.treeNguoiNhan_Goc = res.data;
				this.treeNguoiNhan = this.treeNguoiNhan_Goc;
				this.visibleTangGiam = res.Visible;

				this.tinhTongMuc();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});

	}
	loadImport() {
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		this.NhapBaoHiemService.importFile(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.treeNguoiNhan_Goc = res.data;
				this.treeNguoiNhan = this.treeNguoiNhan_Goc;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});

	}

	createForm() {
		this.itemForm = this.fb.group({
			TenDanhSach: [this.item.TenDanhSach, Validators.required],
			ThangNhap: [this.item.ThangNhap],
			file: []
		});

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();

		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('NHAP_BHYT.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('NHAP_BHYT.DETAIL');
			return result;
		}
		result = this.translate.instant('NHAP_BHYT.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): BaoHiemYTModel {
		const _item = new BaoHiemYTModel();
		_item.Id = this.item.Id;
		_item.TenDanhSach = this.itemForm.controls.TenDanhSach.value;
		_item.NCCs = [];
		_item.DoiTuongGiam = [];
		for (var i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let temp = this.treeNguoiNhan_Goc[i];
			for (var j = 0; j < temp.DoiTuongs.length; j++)
				temp.DoiTuongs[j].NCCs.forEach(x => {
					if (this.visibleTangGiam) {
						if (x.IsTang)
							_item.NCCs.push(x);
						if (x.IsGiam)
							_item.DoiTuongGiam.push(x);
					} else {
						if (x.Checked)
							_item.NCCs.push(x);
					}
				});
		}
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
		const EditDot = this.prepareCustomer();
		if (!this.visibleTangGiam) {
			if (EditDot.Id > 0) {
				this.UpdateDot(EditDot, withBack);
			} else {
				this.CreateDot(EditDot, withBack);
			}
		}
		else {
			this.Clone(EditDot, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	Clone(_item: BaoHiemYTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.NhapBaoHiemService.Clone(_item).subscribe(res => {
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
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	UpdateDot(_item: BaoHiemYTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.NhapBaoHiemService.updateItem(_item).subscribe(res => {
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
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateDot(_item: BaoHiemYTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.NhapBaoHiemService.createItem(_item).subscribe(res => {
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
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	updateLyDo(item){
		if (item.DisabledGiam || this.item.Id == 0 || !item.IsGiam || item.LyDo == undefined) //chưa giảm lần nào
			return;
		let temp = { Id: this.item.Id, IdGiam: item.IdGiam, LyDo: item.LyDo }
		this.viewLoading = true;
		this.disabledBtn = true;
		this.NhapBaoHiemService.UpdateGiam(temp).subscribe(res => {
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.tinhTongMuc();
				this.layoutUtilsService.showInfo("Cập nhật lý do giảm thành công").afterDismissed();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	baoGiam ($event, item, index_loai, index_dt) {
		if (item.DisabledGiam)
			return;
		if (this.item.Id == 0) { //báo giảm khi đang nhập 
			let value = this.danhMucService.stringToInt(item.SoTien);
			if (!item.IsGiam)
				value = value * -1;
			let s = this.danhMucService.stringToInt(this.tongMuc[index_loai][index_dt]) + value;
			this.tongMuc[index_loai][index_dt] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index_loai][index_dt] = this.tongSL[index_loai][index_dt] + (!item.IsGiam ? -1 : 1);
			if(!item.IsGiam)
				this.layoutUtilsService.showInfo("Báo giảm thành công").afterDismissed();
			else 
				this.layoutUtilsService.showInfo("Hủy báo giảm thành công").afterDismissed();
			return;
		}
		$event.preventDefault();
		if (!item.IsGiam) {//báo giảm
			if (item.LyDo == undefined) {
				this.layoutUtilsService.showError("Vui lòng chọn lý do");
				return;
			}
			let temp = { Id: this.item.Id, DoiTuongGiam: [item] }
			this.viewLoading = true;
			this.disabledBtn = true;
			this.NhapBaoHiemService.BaoGiam(temp).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsGiam = true;
					item.IdGiam = res.data[0].IdGiam;
					this.tinhTongMuc();
					this.layoutUtilsService.showInfo("Báo giảm thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else {//hủy báo giảm
			this.viewLoading = true;
			this.disabledBtn = true;
			this.NhapBaoHiemService.HuyBaoGiam(item.IdGiam).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsGiam = false;
					item.IdGiam = null;
					this.tinhTongMuc();
					this.layoutUtilsService.showInfo("Hủy báo giảm thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
	}
	chon (ncc, index_loai, index_dt) {
		let value = this.danhMucService.stringToInt(ncc.SoTien);
		if (!ncc.Checked)
			value = value * -1
		let s = this.danhMucService.stringToInt(this.tongMuc[index_loai][index_dt]) + value;
		this.tongMuc[index_loai][index_dt] = this.danhMucService.f_currency_V2('' + s);
		this.tongSL[index_loai][index_dt] = this.tongSL[index_loai][index_dt] + (!ncc.Checked ? -1 : 1);
	}

	huybaotang (ncc, index_loai, index_dt) {
		if (!ncc.IsTang) {
			let value = this.danhMucService.stringToInt(ncc.SoTien);
			let s = this.danhMucService.stringToInt(this.tongMuc[index_loai][index_dt]) - value;
			this.tongMuc[index_loai][index_dt] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index_loai][index_dt] = this.tongSL[index_loai][index_dt] - 1;
			return;
		}
		this.viewLoading = true;
		this.disabledBtn = true;
		this.NhapBaoHiemService.HuyBaoTang(ncc.Id).subscribe(res => {
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				ncc.IsTang = false;
				ncc.Id = null;
				this.tinhTongMuc();
				this.layoutUtilsService.showInfo("Hủy báo tăng thành công").afterDismissed();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}
	baoTang($event, item, index_loai, index_dt) {
		if (this.item.Id == 0) {
			let value = this.danhMucService.stringToInt(item.SoTien);
			if (!$event.checked)
				value = value * -1;
			let s = this.danhMucService.stringToInt(this.tongMuc[index_loai][index_dt]) + value;
			this.tongMuc[index_loai][index_dt] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index_loai][index_dt] = this.tongSL[index_loai][index_dt] + (!$event.checked ? -1 : 1);
			return;
		}
		this.viewLoading = true;
		this.disabledBtn = true;
		if ($event.checked) { //báo tăng
			let _item = { Id_NCC: item.Id_NCC, Id: this.item.Id, Id_LoaiDoiTuong: item.Id_LoaiDoiTuong }
			this.NhapBaoHiemService.BaoTang(this.item.Id, [_item]).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsTang = true;
					item.Id = res.data[0].Id;
					this.tinhTongMuc();
					this.layoutUtilsService.showInfo("Báo tăng thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else { //hủy báo tăng
			this.NhapBaoHiemService.HuyBaoTang(item.Id).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsTang = false;
					item.Id = null;
					this.tinhTongMuc();
					this.layoutUtilsService.showInfo("Hủy báo tăng thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
	changed_tab($event) {
		this.selected_tab = $event;
		this.tinhTongMuc();
	}
	checkDisplay(ncc) {
		if (this.selected_tab == 0)
			return ncc.Checked && !ncc.IsGiam;
		if (this.selected_tab == 1)
			return ncc.IsTang;
		if (this.selected_tab == 2)
			return ncc.IsGiam;
	}

	addDoiTuong(baoTang: boolean = false) {
		let _item: DoiTuongBaoHiemModel = new DoiTuongBaoHiemModel();
		_item.clear();
		const dialogRef = this.dialog.open(DoiTuongBaoHiemEditDialogComponent, { data: { IsReturn: true, allowEdit: true, _item: _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				for (var j = 0; j < this.treeNguoiNhan.length; j++) {
					let loai = this.treeNguoiNhan[j];
					let find = loai.DoiTuongs.findIndex(x => +res.Id_DoiTuongBHYT == +x.Id_Doituong);
					if (find >= 0) {
						let temp = Object.assign({}, res);
						temp.Id_NCC = res.Id;
						temp.Id = 0;
						temp.Id_Nhap = null;
						temp.TienLuong = this.danhMucService.f_currency_V2('' + res.TienLuong);
						temp.NoiDangKyKCB = res.NoiDangKyKCB;
						temp.MaKCB = res.MaKCB;
						temp.SoTien = this.danhMucService.f_currency_V2('' + res.SoTien);
						temp.TheBaoHiem = res.MaTheBHYT;
						if (baoTang) {
							//gọi api báo tăng
							this.baoTang({ checked: true }, temp, j, find);
						}
						else {
							temp.Checked = true; //tự check ở đợt gốc
						}
						loai.DoiTuongs[find].NCCs.push(temp);
						loai.DoiTuongs[find].NCCs.sort(function (a, b) {
							var nameA = a.HoTen
							var nameB = b.HoTen
							if (nameA < nameB)
								return -1;
							if (nameA > nameB) 
								return 1;
							return 0; // name trùng nhau
						});
						if (!baoTang)
							this.tinhTongMuc();
						break;
					}
				}
			}
		});
	}

	export() {
		this.NhapBaoHiemService.exportExcelBH(this.item.Id).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, error => {
			this.layoutUtilsService.showInfo("Xuất file không thành công");
		})
	}

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13)//phím Enter
		{
			this.item = this.data._item;
			if (this.viewLoading == true) {
				this.onSubmit(true);
			}
			else {
				this.onSubmit(false);
			}
		}
	}
}
