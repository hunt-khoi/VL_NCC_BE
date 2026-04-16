import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeXuatModel, DeXuat_NCCModel } from '../../de-xuat/Model/de-xuat.model';
import { TranslateService } from '@ngx-translate/core';
import { DeXuatService } from '../Services/de-xuat.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DeXuatImportDialogComponent } from '../de-xuat-import/de-xuat-import.dialog.component';
import { DoiTuongNhanQuaEditDialogComponent } from '../../doi-tuong-nhan-qua/doi-tuong-nhan-qua-edit/doi-tuong-nhan-qua-edit-dialog.component';
import { DoiTuongNhanQuaModel } from '../../doi-tuong-nhan-qua/Model/doi-tuong-nhan-qua.model';

@Component({
	selector: 'm-de-xuat-edit-dialog',
	templateUrl: './de-xuat-edit.dialog.component.html',
})

export class DeXuatEditDialogComponent implements OnInit {

	item: DeXuatModel;
	oldItem: DeXuatModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listDotTangQua: any[] = [];
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
	addDeXuat = false;

	lydos: any[] = []
	Filter: string = "";
	selected_tab: number = 0;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<DeXuatEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public DeXuatService: DeXuatService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = 'Đề xuất';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit; //true: nhập hoặc sửa đề xuất
		if (this.data.addDeXuat)
			this.addDeXuat = this.data.addDeXuat;

		this.createForm();
		this.loadNhom();
		if (this.item.Id > 0) { //đang sửa hoặc xem đề xuất đã nhập
			this.getDetail();
		}

		if (this.addDeXuat && this.item.Id_DotTangQua > 0) //đang nhập đề xuất mới
			this.getNguoiNhan(this.item.Id_DotTangQua)
	}


	getDetail() {
		this.viewLoading = true;
		this.disabledBtn = true;
		this.DeXuatService.getItem(this.item.Id, true).subscribe(res => {
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.item = res.data;
				if (this.allowEdit) { 
					this.allowEdit = res.data.AllowEdit1;
					if (!this.allowEdit)
						this.layoutUtilsService.showError("Không thể sửa đợt này do đợt tặng quà tiếp theo đã được nhập");
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


	clearFilter(evt: MouseEvent,) {
		this.Filter = '';
		this.treeNguoiNhan = this.treeNguoiNhan_Goc;
		evt.stopPropagation();
	}

	filterText() {
		let text = this.Filter.toLowerCase();
		this.treeNguoiNhan = this.treeNguoiNhan_Goc.map(x => {
			let data = x.data.map(xx => {
				let dt = xx.DoiTuongs.map(xxx => {
					return {
						DoiTuong: xxx.DoiTuong,
						Id_DoituongNCC: xxx.Id_DoituongNCC,
						NCCs: xxx.NCCs.filter(y => y.SoHoSo.toLowerCase().includes(text) || y.HoTen.toLowerCase().includes(text) || y.DiaChi.toLowerCase().includes(text) || y.NguoiThoCungLietSy.toLowerCase().includes(text))
					}
				})
				return {
					MucQua: xx.MucQua,
					DoiTuongs: dt
				};
			});

			return {
				Id_NguonKinhPhi: x.Id_NguonKinhPhi,
				NguonKinhPhi: x.NguonKinhPhi,
				data: data
			}
		});
	}

	lstNCC: any[]=[]
	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongMuc = [];
		this.tongSL = [];
		for (let i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			let DanhSach = this.treeNguoiNhan_Goc[i].data;
			let tongMuc = [];
			let tongSL = [];
			for (let c1 of DanhSach) {
				let s = 0;
				let c = 0;
				for (let c2 of c1.DoiTuongs) {
					for (let c3 of c2.NCCs) {
						if (this.allowEdit) {
							if (this.item.Id == 0) { //TH chưa nhập đề xuất IsTang chưa có
								if (c3.IsTang && c3.Id_DeXuat == this.item.Id)
									c3.IsTang = true;
							}
							if ((c3.Checked && !c3.IsGiam) || c3.IsTang) { 
								let tien = this.danhMucService.stringToInt(c3.SoTien);
								s += tien;
								c++;
							}
						} else { //xem đề xuất
							if ((this.selected_tab == 0 && c3.Checked && !c3.IsGiam)
								|| (this.selected_tab == 1 && c3.IsTang)
								|| (this.selected_tab == 2 && c3.IsGiam)) {
								let tien = this.danhMucService.stringToInt(c3.SoTien);
								s += tien;
								c++;
							}
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

	loadNhom() {
		this.danhMucService.liteLyDoGiam().subscribe(res => {
			this.lydos = res.data;
		});
		this.danhMucService.liteDotQua(true).subscribe(res => {
			this.listDotTangQua = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	getNguoiNhan(id) { //id: Id đợt tặng quà
		this.viewLoading = true;
		this.tongMuc = []
		this.DeXuatService.getNguoiNhanByDot(id).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.treeNguoiNhan_Goc = res.data;
				this.treeNguoiNhan = this.treeNguoiNhan_Goc;
				this.visibleTangGiam = !res.Visible; //Visible=isgoc=true => visibleTangGiam=false: ko hiện tăng giảm
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
		data.Id_DotTangQua = this.itemForm.controls["DotTangQua"].value;
		this.DeXuatService.importFile(data).subscribe(res => {
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
			DotTangQua: [this.item.Id_DotTangQua, Validators.required],
			file: []
		});
		if (!this.allowEdit)
			this.itemForm.disable();

		if (this.data.Id_Dot !== null)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DE_XUAT.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DE_XUAT.DETAIL');
			return result;
		}
		result = this.translate.instant('DE_XUAT.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareDeXuat(): DeXuatModel {
		const controls = this.itemForm.controls;
		const _item = new DeXuatModel();
		_item.Id = this.item.Id;
		_item.Id_DotTangQua = controls['DotTangQua'].value;
		_item.NCCs = [];
		_item.DoiTuongGiam = [];
		for (var i = 0; i < this.treeNguoiNhan_Goc.length; i++) {
			for (var k = 0; k < this.treeNguoiNhan_Goc[i].data.length; k++) {
				let temp = this.treeNguoiNhan_Goc[i].data[k];
				for (var j = 0; j < temp.DoiTuongs.length; j++)
					temp.DoiTuongs[j].NCCs.forEach(x => {
						if (this.visibleTangGiam) {
							if (x.IsTang || (!x.IsTang && !x.IsGiam && !x.IsNew)) //dữ liệu kế thừa + tăng
								_item.NCCs.push(x);
							if (x.IsGiam)
								_item.DoiTuongGiam.push(x);
						} else {
							if (x.Checked)
								_item.NCCs.push(x); //đợt gốc chỉ thêm ncc được check
						}
					});
			}
		}
		return _item;
	}

	onSubmit() {
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

		const EditDot = this.prepareDeXuat();
		if (!this.visibleTangGiam) { //thêm, sửa đợt gốc
			if (EditDot.Id > 0) {
				this.UpdateDot(EditDot);
			} else {
				this.CreateDot(EditDot);
			}
		}
		else { //thêm đợt khác gốc: có tăng giảm
			this.Clone(EditDot);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	Clone(_item: DeXuatModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.DeXuatService.Clone(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	UpdateDot(_item: DeXuatModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.DeXuatService.updateDotTangQua(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateDot(_item: DeXuatModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.DeXuatService.createDotTangQua(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	//chọn/ko chọn ở đợt gốc
	chon(ncc, index_nguon, index_muc) {
		let value = this.danhMucService.stringToInt(ncc.SoTien);
		if (!ncc.Checked)
			value = value * -1
		let s = this.danhMucService.stringToInt(this.tongMuc[index_nguon][index_muc]) + value;
		this.tongMuc[index_nguon][index_muc] = this.danhMucService.f_currency_V2('' + s);
		this.tongSL[index_nguon][index_muc] = this.tongSL[index_nguon][index_muc] + (!ncc.Checked ? -1 : 1);
	}

	updateLyDo(item){
		if (item.DisabledGiam || this.item.Id == 0 || !item.IsGiam || item.LyDo == undefined)
			return;
		let temp = { Id: this.item.Id, IdGiam: item.Id, LyDo: item.LyDo, GhiChuGiam: item.GhiChuGiam }
		this.viewLoading = true;
		this.disabledBtn = true;
		this.DeXuatService.UpdateGiam(temp).subscribe(res => {
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.getDetail();
				this.layoutUtilsService.showInfo("Cập nhật thông tin giảm thành công").afterDismissed();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	baoGiam($event, item) {
		let mess_giamtc = this.translate.instant('DE_XUAT.baogiamtc');
		let mess_huygiamtc = this.translate.instant('DE_XUAT.huybaogiamtc');
		if (item.DisabledGiam)
			return;
		if (item.LyDo == undefined || item.LyDo == null) {
			item.LyDo = 0; //gán mặc định
		}
		if (this.item.Id == 0) { //báo giảm khi đang nhập đx
			this.baoGiam0(item, $event.checked);
			if ($event.checked)
				this.layoutUtilsService.showInfo(mess_giamtc).afterDismissed();
			else 
				this.layoutUtilsService.showInfo(mess_huygiamtc).afterDismissed();
			return;
		}
		// $event.preventDefault();
		if ($event.checked) {//báo giảm
			let temp = { Id: this.item.Id, DoiTuongGiam: [item] }
			this.viewLoading = true;
			this.disabledBtn = true;
			this.DeXuatService.BaoGiam(temp).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.getDetail(); //get lại để load 2 đt giảm (TH 2 nguồn)
					this.layoutUtilsService.showInfo(mess_giamtc).afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else {//hủy báo giảm
			this.viewLoading = true;
			this.disabledBtn = true;
			this.DeXuatService.HuyBaoGiam(item.Id).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.getDetail(); //get lại để load 2 đt giảm (TH 2 nguồn)
					this.layoutUtilsService.showInfo(mess_huygiamtc).afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
	}

	//báo giảm/hủy báo giảm khi nhập đề xuất
	baoGiam0(item, check) {
		//báo giảm/hủy báo giảm nhiều nguồn
		for (var j = 0; j < this.treeNguoiNhan.length; j++) {
			let ng = this.treeNguoiNhan[j];
			for (var i = 0; i < ng.data.length; i++) {
				let muc = ng.data[i];
				if (+muc.MucQua > 0) {
					let find = muc.DoiTuongs.findIndex(x => +item.Id_DoiTuongNCC == +x.Id_DoituongNCC);
					if (find >= 0) {
						let ncc = muc.DoiTuongs[find].NCCs.find(x => +item.Id_NCC == x.Id_NCC);
						if (ncc) {
							ncc.IsGiam = check;
							if (check) {
								ncc.LyDo = item.LyDo;
								ncc.GhiChuGiam = item.GhiChuGiam;
							} else {
								ncc.LyDo = null;
								ncc.GhiChuGiam = null;
							}
						}
					}
				}
			}
		}
		this.tinhTongMuc();
	}

	huybaotang(ncc, index_nguon, index_muc) {
		// let mess_huytangtc = this.translate.instant('DE_XUAT.huybaotangtc');
		// if (!ncc.IsTang) {
		// 	let value = this.danhMucService.stringToInt(ncc.SoTien);
		// 	let s = this.danhMucService.stringToInt(this.tongMuc[index_nguon][index_muc]) - value;
		// 	this.tongMuc[index_nguon][index_muc] = this.danhMucService.f_currency_V2('' + s);
		// 	this.tongSL[index_nguon][index_muc] = this.tongSL[index_nguon][index_muc] - 1;
		// 	return;
		// }
		// this.viewLoading = true;
		// this.disabledBtn = true;
		// this.DeXuatService.HuyBaoTang(ncc.Id).subscribe(res => {
		// 	this.viewLoading = false;
		// 	this.disabledBtn = false;
		// 	this.changeDetectorRefs.detectChanges();
		// 	if (res && res.status === 1) {
		// 		ncc.IsTang = false;
		// 		ncc.Id = null;
		// 		this.tinhTongMuc();
		// 		this.layoutUtilsService.showInfo(mess_huytangtc).afterDismissed();
		// 	} else {
		// 		this.layoutUtilsService.showError(res.error.message);
		// 	}
		// })
	}

	baoTang($event, item) {
		let mess_tangtc = this.translate.instant('DE_XUAT.baotangtc');
		let mess_huytangtc = this.translate.instant('DE_XUAT.huybaotangtc');
		if (this.item.Id == 0) { //nhập đề xuất
			this.baoTang0(item, $event.checked);
			if ($event.checked)
				this.layoutUtilsService.showInfo(mess_tangtc).afterDismissed();
			else 
				this.layoutUtilsService.showInfo(mess_huytangtc).afterDismissed();
			return;
		}

		//sửa đề xuất =======================
		this.viewLoading = true;
		this.disabledBtn = true;
		if ($event.checked) { //báo tăng
			// let _item = { Id_NCC: item.Id_NCC, Id: this.item.Id, Id_NguonKinhPhi: item.Id_NguonKinhPhi }
			this.DeXuatService.BaoTang(this.item.Id, this.lstDTTang).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					// item.IsTang = true;
					// item.Id = res.data[0].Id; //id detail
					res.data.forEach(x => {
						let find = this.lstDTTang.find(y => +y.Id_NCC == +x.Id_NCC && +y.Id_NguonKinhPhi == +x.Id_NguonKinhPhi);
						if (find) {
							find.IsTang = true;
							find.Id = x.Id; //id detail
						}
					})
					this.tinhTongMuc();
					this.layoutUtilsService.showInfo(mess_tangtc).afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else {//hủy báo tăng
			var lst = this.findncc(item.Id_DoiTuongNCC, item.Id_NCC);
			var ids: any[] = [];
			lst.forEach(x => ids.push(x.Id));
			this.DeXuatService.HuyBaoTang(ids).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					// item.IsTang = false;
					// item.Id = null;
					this.getDetail(); //get lại để load 2 đt tăng (TH 2 nguồn)
					this.layoutUtilsService.showInfo(mess_huytangtc).afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		}
	}

	//báo tăng/hủy báo tăng khi nhập đề xuất
	baoTang0(item, check) {
		//báo tăng/hủy báo tăng nhiều nguồn
		for (var j = 0; j < this.treeNguoiNhan.length; j++) {
			let ng = this.treeNguoiNhan[j];
			for (var i = 0; i < ng.data.length; i++) {
				let muc = ng.data[i];
				if (+muc.MucQua > 0) {
					let find = muc.DoiTuongs.findIndex(x => +item.Id_DoiTuongNCC == +x.Id_DoituongNCC);
					if (find >= 0) {
						let ncc = muc.DoiTuongs[find].NCCs.find(x => +item.Id_NCC == x.Id_NCC);
						if (ncc) {
							ncc.IsTang = check;
							ncc.IsNew = true;
						}
					}
				}
			}
		}
		this.tinhTongMuc();
	}

	findncc(Id_DoiTuongNCC, Id_NCC) {
		let nccs: any[] = [];
		for (var j = 0; j < this.treeNguoiNhan.length; j++) {
			let ng = this.treeNguoiNhan[j];
			for (var i = 0; i < ng.data.length; i++) {
				let muc = ng.data[i];
				if (+muc.MucQua > 0) {
					let find = muc.DoiTuongs.findIndex(x => +Id_DoiTuongNCC == +x.Id_DoituongNCC);
					if (find > -1) {
						let ncc = muc.DoiTuongs[find].NCCs.find(x => +Id_NCC == x.Id_NCC);
						if (ncc) 
							nccs.push(ncc);
					}
				}
			}
		}
		return nccs;
	}

	//#region Import chi tiết đợt tặng quà
	import() {
		let id = this.itemForm.controls["DotTangQua"].value;
		if (!id) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		const dialogRef = this.dialog.open(DeXuatImportDialogComponent, { data: id });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			} else {
				this.listDotTangQua = res;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	downFile() {
		let id = this.itemForm.controls["DotTangQua"].value;
		if (!id) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.DeXuatService.downloadTemplate(id).subscribe(res => {
			var headers = res.headers;
			let filename = headers.get('x-filename');
			let type = headers.get('content-type')
			let blob = new Blob([res.body], { type: type });
			const fileURL = URL.createObjectURL(blob);
			var link = document.createElement('a')
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}
	//#endregion

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

	checkDisplay(ncc: any) {
		if (this.selected_tab == 0) //dữ liệu hưởng gồm kế thừa & tăng
			return ncc.Checked && !ncc.IsGiam;
		if (this.selected_tab == 1)
			return ncc.IsTang;
		if (this.selected_tab == 2)
			return ncc.IsGiam;
	}

	checkDisplay2(arr: any[]) {
		if (this.selected_tab == 0) //dữ liệu hưởng gồm kế thừa & tăng
			return arr.filter(ncc => ncc.Checked && !ncc.IsGiam);
		if (this.selected_tab == 1)
			return arr.filter(ncc => ncc.IsTang);
		if (this.selected_tab == 2)
			return arr.filter(ncc => ncc.IsGiam);
	}

	lstDTTang: any[] = [];
	addDoiTuong(baoTang: boolean = false) {
		let _item: DoiTuongNhanQuaModel = new DoiTuongNhanQuaModel();
		_item.clear();
		const dialogRef = this.dialog.open(DoiTuongNhanQuaEditDialogComponent, { data: { IsReturn: true, allowEdit: true, _item: _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			for (var j = 0; j < this.treeNguoiNhan.length; j++) {
				let ng = this.treeNguoiNhan[j];
				for (var i = 0; i < ng.data.length; i++) {
					let muc = ng.data[i];
					if (+muc.MucQua > 0) {
						let find = muc.DoiTuongs.findIndex(x => +res.Id_DoiTuongNCC == +x.Id_DoituongNCC);
						if (find >= 0) {
							let temp = Object.assign({}, res);
							temp.Id_NCC = res.Id;
							temp.Id = 0;
							temp.Id_DeXuat = 0;
							temp.Id_NguonKinhPhi = ng.Id_NguonKinhPhi;
							temp.SoTien = this.danhMucService.f_currency_V2('' + muc.MucQua);
							if (baoTang) {
								// this.baoTang({ checked: true }, temp);
								this.lstDTTang.push(temp);
							}
							else {
								temp.Checked = true; //tự check khi thêm đt ở đợt gốc
							}
							muc.DoiTuongs[find].NCCs.push(temp);
							muc.DoiTuongs[find].NCCs.sort(function (a, b) {
								var nameA = a.HoTen
								var nameB = b.HoTen
								if (nameA < nameB) 
									return -1;
								if (nameA > nameB)
									return 1;
								return 0; // name trùng nhau
							});
						}
					}
				}
			}

			if (baoTang && this.lstDTTang.length > 0) {
				this.baoTang({ checked: true }, this.lstDTTang[0]);
			}
		});
	}

	export() {
		this.DeXuatService.exportExcelDeXuat(this.item.Id).subscribe(res => {
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
}
