import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NienHanModel } from '../../nien-han/Model/nien-han.model';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { NienHanService } from '../Services/nien-han.service';
import { CommonService } from '../../../services/common.service';
import { DoiTuongTrangCapModel } from '../../doi-tuong-trang-cap/Model/doi-tuong-trang-cap.model';
import { DoiTuongTrangCapEditDialogComponent } from '../../doi-tuong-trang-cap/doi-tuong-trang-cap-edit/doi-tuong-trang-cap-edit-dialog.component';

@Component({
	selector: 'm-nien-han-edit-dialog',
	templateUrl: './nien-han-edit.dialog.component.html',
})

export class NienHanEditDialogComponent implements OnInit {

	item: NienHanModel;
	oldItem: NienHanModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	listDotNienHan: any[] = [];
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
	tongDT: any[] = [];
	tongSL: any[] = [];
	addDeXuat = false;
	isXa = false;

	lydos: any[] = []
	Filter: string = "";
	LyDo: string = "";
	selected_tab: number = 0;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(public dialogRef: MatDialogRef<NienHanEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public NienHanService: NienHanService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = 'Niên hạn';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 

		if (this.data.addDeXuat)
			this.addDeXuat = this.data.addDeXuat;
		if (this.data.isXa)
			this.isXa = this.data.isXa;

		this.loadNhom();
		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.disabledBtn = true;
			this.NienHanService.getItem(this.item.Id, true, this.isXa).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.allowEdit) //load chi tiết để sửa-> kiểm tra đc phép sửa hay k
					{
						this.allowEdit = res.data.AllowEdit1;
						if (!this.allowEdit)
							this.layoutUtilsService.showError("Không thể sửa đợt này do đợt niên hạn tiếp theo đã được nhập");
					}
					this.visibleTangGiam = res.Visible;
					this.treeNguoiNhan_Goc = res.data.Details;
					this.treeNguoiNhan = this.treeNguoiNhan_Goc;
					this.tinhTongMuc();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}

		if (this.addDeXuat == true && this.item.Id_Dot > 0)
			this.changeDot(this.item.Id_Dot)
	}

	clearFilter(evt: MouseEvent,) {
		this.Filter = '';
		this.treeNguoiNhan = this.treeNguoiNhan_Goc;
		evt.stopPropagation();
	}

	filterText() {
		let text = this.Filter.toLowerCase();
		this.treeNguoiNhan = this.treeNguoiNhan_Goc.map(x => {
			return {
				DoiTuong: x.DoiTuong,
				Id_Doituong: x.Id_Doituong,
				NCCs: x.NCCs.filter(y => y.SoHoSo.toLowerCase().includes(text) || y.SoTheoDoi.toLowerCase().includes(text) ||
				 y.HoTen.toLowerCase().includes(text) || y.DiaChi.toLowerCase().includes(text))
			}
		});
	}

	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongDT= [];
		this.tongSL = [];
		for (let i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let NCCs = this.treeNguoiNhan_Goc[i].NCCs;
			let s = 0;
			let c = 0;
			for (let c1 of NCCs) {
				if (this.allowEdit) { 
					if (this.item.Id == 0) { //TH chưa nhập niên hạn IsTang chưa có
						if (c1.IsTang && c1.Id_TroCap == this.item.Id)
							c1.IsTang = true;
					}
					if ((c1.Checked && !c1.IsGiam) || c1.IsTang) {
						s += c1.SoTien;
						c++;
					}
				} else { //xem chi tiết
					if ((this.selected_tab == 0 && c1.Checked && !c1.IsGiam)
						|| (this.selected_tab == 1 && c1.IsTang)
						|| (this.selected_tab == 2 && c1.IsGiam)) {
						s += c1.SoTien;
						c++;
					}
				}
			}
			this.tongDT.push(this.danhMucService.f_currency_V2('' + s));
			this.tongSL.push(c);

			this.TongSo += c;
			this.TongTien += s;
		}
	}

	loadNhom() {
		this.danhMucService.liteDotNienHan().subscribe(res => {
			this.listDotNienHan = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.danhMucService.liteLyDoGiam(2).subscribe(res => {
			this.lydos = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	changeDot(id) {
		this.viewLoading = true;
		this.tongDT = []
		this.NienHanService.getNguoiNhanByDot(id).subscribe(res => {
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

	createForm() {
		this.itemForm = this.fb.group({
			DotNienHan: [this.item.Id_Dot, Validators.required],
			file: []
		});
		this.LyDo = this.item.LyDo;
		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();

		if (this.data.Id_Dot !== null)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('NIEN_HAN.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('NIEN_HAN.DETAIL');
			return result;
		}
		result = this.translate.instant('NIEN_HAN.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): NienHanModel {
		const controls = this.itemForm.controls;
		const _item = new NienHanModel();
		_item.clear();
		_item.Id = this.item.Id;
		_item.Id_Parent = this.item.Id_Parent != null ? this.item.Id_Parent : 0;
		_item.Id_Dot = controls['DotNienHan'].value;
		_item.LyDo = this.LyDo;
		_item.NCCs = [];
		_item.DoiTuongGiam = [];
		for (var i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let temp = this.treeNguoiNhan_Goc[i]; //đối tượng
			temp.NCCs.forEach(x => {
				if (this.visibleTangGiam) {		
					if (x.IsGiam)
						_item.DoiTuongGiam.push(x);
					else 
						_item.NCCs.push(x); //ko cần IsTang = 1 mói thêm vào
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

	Clone(_item: NienHanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.NienHanService.Clone(_item, this.isXa).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else {
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

	UpdateDot(_item: NienHanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.NienHanService.updateDotNienHan(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else { 
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

	CreateDot(_item: NienHanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.NienHanService.createDotNienHan(_item).subscribe(res => {
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
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => {});
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
		this.NienHanService.UpdateGiam(temp).subscribe(res => {
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

	baoGiam($event, item, index_nguon) {
		if (item.DisabledGiam)
			return;
		if (this.item.Id == 0) { //báo giảm khi đang nhập đx
			let value = this.danhMucService.stringToInt(item.SoTien);
			if (!item.IsGiam)
				value = value * -1;
			let s = this.danhMucService.stringToInt(this.tongDT[index_nguon]) + value;
			this.tongDT[index_nguon] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index_nguon] = this.tongSL[index_nguon] + (!item.IsGiam ? -1 : 1);
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
			this.NienHanService.BaoGiam(temp).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsGiam = true;
					item.IdGiam = res.data[0].IdGiam;
					this.tinhTongMuc();
					//this.ngOnInit(); //khởi tạo lại dialog
					this.layoutUtilsService.showInfo("Báo giảm thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else {//hủy báo giảm
			this.viewLoading = true;
			this.disabledBtn = true;
			this.NienHanService.HuyBaoGiam(item.IdGiam).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					item.IsGiam = false;
					item.IdGiam = null;
					this.tinhTongMuc();
					//this.ngOnInit(); //khởi tạo lại dialog
					this.layoutUtilsService.showInfo("Hủy báo giảm thành công").afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
	}
	chon(ncc, index_nguon) {
		let value = this.danhMucService.stringToInt(ncc.SoTien);
		if (!ncc.Checked)
			value = value * -1
		let s = this.danhMucService.stringToInt(this.tongDT[index_nguon]) + value;
		this.tongDT[index_nguon] = this.danhMucService.f_currency_V2('' + s);
		this.tongSL[index_nguon]= this.tongSL[index_nguon] + (!ncc.Checked ? -1 : 1);
	}

	huybaotang(ncc, index_nguon) {
		if (!ncc.IsTang) {
			let value = this.danhMucService.stringToInt(ncc.SoTien);
			let s = this.danhMucService.stringToInt(this.tongDT[index_nguon]) - value;
			this.tongDT[index_nguon] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index_nguon] = this.tongSL[index_nguon] - 1;
			return;
		}
		this.viewLoading = true;
		this.disabledBtn = true;
		this.NienHanService.HuyBaoTang(ncc.Id).subscribe(res => {
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

	baoTang($event, item, index) {
		if (this.item.Id == 0) {  //khi đang nhập niên hạn
			let value = this.danhMucService.stringToInt(item.SoTien);
			if (!$event.checked)
				value = value * -1;
			let s = this.danhMucService.stringToInt(this.tongDT[index]) + value; //tính lại tổng dt
			this.tongDT[index] = this.danhMucService.f_currency_V2('' + s);
			this.tongSL[index] = this.tongSL[index] + (!$event.checked ? -1 : 1);
			return;
		}
		this.viewLoading = true;
		this.disabledBtn = true;
		if ($event.checked) { //báo tăng
			let _item = { Id_NCC: item.Id_NCC, Id: this.item.Id, Detail: item.Detail }
			this.NienHanService.BaoTang(this.item.Id, [_item]).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo("Báo tăng thành công").afterDismissed();
					this.ngOnInit(); //để load lại chi tiết
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else { //hủy báo tăng
			this.NienHanService.HuyBaoTang(item.Id).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					// item.IsTang = false;
					// item.Id = null;
					// this.tinhTongMuc();
					this.layoutUtilsService.showInfo("Hủy báo tăng thành công").afterDismissed();
					this.ngOnInit(); //để load lại chi tiết
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
		let _item: DoiTuongTrangCapModel = new DoiTuongTrangCapModel();
		_item.clear();
		const dialogRef = this.dialog.open(DoiTuongTrangCapEditDialogComponent, { data: { IsReturn: true, allowEdit: true, _item: _item, nam: this.item.Nam } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				let dt = this.treeNguoiNhan;
				let find = dt.findIndex(x => +res.Id_DoiTuong == +x.Id_DoiTuongNCC);
				if (find >= 0) {
					let temp = Object.assign({}, res);
					temp.Id_NCC = res.Id;
					temp.Id = 0;
					temp.Id_TroCap = null;
					if (baoTang) {
						if (this.item.Id == 0) {//thêm lúc chưa nhập niên hạn 
							temp.IsTang = true;
							temp.DCs = res.ChiTiets;
							this.layoutUtilsService.showInfo("Báo tăng thành công")
						}
						else {
							//gọi api báo tăng
							temp.Detail = res.ChiTiets;
							this.baoTang({ checked: true }, temp, find);
						}
					}
					dt[find].NCCs.push(temp);
					dt[find].NCCs.sort(function (a, b) {
						var nameA = a.HoTen
						var nameB = b.HoTen
						if (nameA < nameB) {
							return -1;
						}
						if (nameA > nameB) {
							return 1;
						}

						// name trùng nhau
						return 0;
					});
				}
			}
		});
	}

	export() {
		this.NienHanService.exportExcelNienHan(this.item.Id, this.isXa).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		})
	}
}
