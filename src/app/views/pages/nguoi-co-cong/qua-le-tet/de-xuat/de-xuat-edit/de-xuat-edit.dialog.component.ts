import { Component, OnInit, OnDestroy, Inject, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DeXuatService } from '../Services/de-xuat.service';
import { DeXuatModel } from '../../de-xuat/Model/de-xuat.model';
import { DoiTuongNhanQuaModel } from '../../doi-tuong-nhan-qua/Model/doi-tuong-nhan-qua.model';
import { DeXuatImportDialogComponent } from '../de-xuat-import/de-xuat-import.dialog.component';
import { DoiTuongNhanQuaEditDialogComponent } from '../../doi-tuong-nhan-qua/doi-tuong-nhan-qua-edit/doi-tuong-nhan-qua-edit-dialog.component';

@Component({
	selector: 'm-de-xuat-edit-dialog',
	templateUrl: './de-xuat-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DeXuatEditDialogComponent implements OnInit, OnDestroy {

	item: DeXuatModel = new DeXuatModel();
	oldItem: DeXuatModel = new DeXuatModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listDotTangQua: any[] = [];
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean = false;
	visibleTangGiam: boolean = false;
	treeNguoiNhan_Goc: any[] = [];
	treeNguoiNhan: any[] = [];
	treeNguoiNhanView: any[] = [];
	_name = "";
	showImport: boolean = false;
	TongSo: number = 0;
	TongTien: number = 0;
	tongMuc: any[] = [];
	tongSL: any[] = [];
	tongSLNguon: number[] = [];
	tongTienNguon: number[] = [];
	addDeXuat = false;

	lydos: any[] = []
	Filter: string = "";
	selected_tab: number = 0;
	private filterSubject$ = new Subject<string>();
	private destroy$ = new Subject<void>();
	treeNguoiNhanNhan_TG: any[] = [];
	treeNguoiNhanTang_TG: any[] = [];
	flatRowsNhan: any[] = [];
	flatRowsTang: any[] = [];

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
		public apiService: DeXuatService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = 'Đề xuất';
	}

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
		if (this.addDeXuat && this.item.Id_DotTangQua > 0) { //đang nhập đề xuất mới
			this.getNguoiNhan(this.item.Id_DotTangQua)
		}
		this.filterSubject$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			takeUntil(this.destroy$)
		).subscribe(() => this.filterText());
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getDetail() {
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.getItem(this.item.Id, true).subscribe(res => {
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
				this.buildViewTree();
				this.buildTangGiamTrees();
				this.createForm();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});
	}


	clearFilter(evt: MouseEvent,) {
		this.Filter = '';
		this.treeNguoiNhan = this.treeNguoiNhan_Goc;
		this.buildViewTree();
		this.buildTangGiamTrees();
		this.changeDetectorRefs.detectChanges();
		evt.stopPropagation();
	}

	filterText() {
		let text = this.Filter.toLowerCase();
		this.treeNguoiNhan = this.treeNguoiNhan_Goc.map((x: any) => {
			let data = x.data.map((xx: any) => {
				let dt = xx.DoiTuongs.map((xxx: any) => {
					return {
						DoiTuong: xxx.DoiTuong,
						Id_DoituongNCC: xxx.Id_DoituongNCC,
						NCCs: xxx.NCCs.filter((y: any) => y.SoHoSo.toLowerCase().includes(text) || y.HoTen.toLowerCase().includes(text) 
						|| y.DiaChi.toLowerCase().includes(text) || y.NguoiThoCungLietSy.toLowerCase().includes(text))
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
		this.buildViewTree();
		this.buildTangGiamTrees();
		this.changeDetectorRefs.detectChanges();
	}

	lstNCC: any[]=[]
	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongMuc = [];
		this.tongSL = [];
		this.tongSLNguon = [];
		this.tongTienNguon = [];
		for (const goc of this.treeNguoiNhan_Goc) {
			const tempTongMuc: any[] = [];
			const tempTongSL: number[] = [];
			let nguonSL = 0;
			let nguonTien = 0;
			for (const c1 of goc.data) {
				let s = 0;
				let c = 0;
				for (const c2 of c1.DoiTuongs) {
					for (const c3 of c2.NCCs) {
						// sửa ----------------------
						//chưa nhập đề xuất IsTang chưa có
						if (this.allowEdit && this.item.Id === 0 && c3.IsTang && c3.Id_DeXuat === this.item.Id) {
							c3.IsTang = true;
						}

						//tăng, ko giảm
						const isHopLeKhiSua = this.allowEdit && ((c3.Checked && !c3.IsGiam) || c3.IsTang);

						//xem ----------------------
						const isHopLeKhiXem = !this.allowEdit && (
							(this.selected_tab === 0 && c3.Checked && !c3.IsGiam) ||
							(this.selected_tab === 1 && c3.IsTang) ||
							(this.selected_tab === 2 && c3.IsGiam)
						); //xem đề xuất

						if (!isHopLeKhiSua && !isHopLeKhiXem) continue;
						const tien = this.danhMucService.stringToInt(c3.SoTien);
						s += tien;
						c++;
					}
				}
				tempTongMuc.push(this.danhMucService.f_currency_V2('' + s));
				tempTongSL.push(c);
				this.TongSo += c;
				this.TongTien += s;
				nguonSL += c;
				nguonTien += s;
			}
			this.tongMuc.push(tempTongMuc);
			this.tongSL.push(tempTongSL);
			this.tongSLNguon.push(nguonSL);
			this.tongTienNguon.push(nguonTien);
		}
	}

	loadNhom() {
		this.danhMucService.liteLyDoGiam().subscribe(res => {
			this.lydos = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.danhMucService.liteDotQua(true).subscribe(res => {
			this.listDotTangQua = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	getNguoiNhan(id: number) { //id: Id đợt tặng quà
		this.viewLoading = true;
		this.tongMuc = [];
		this.apiService.getNguoiNhanByDot(id).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.treeNguoiNhan_Goc = res.data;
				this.treeNguoiNhan = this.treeNguoiNhan_Goc;
				this.visibleTangGiam = !res.Visible; //Visible=isgoc=true => visibleTangGiam=false: ko hiện tăng giảm
				this.tinhTongMuc();
				this.buildViewTree();
				this.buildTangGiamTrees();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadImport() {
		if (!this.itemForm) return;
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		data.Id_DotTangQua = this.itemForm.controls["DotTangQua"].value;
		this.apiService.import(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.treeNguoiNhan_Goc = res.data;
				this.treeNguoiNhan = this.treeNguoiNhan_Goc;
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
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

	prepareDeXuat(): DeXuatModel | null {
		if (!this.itemForm) return null;

		const controls = this.itemForm.controls;
		const _item = new DeXuatModel();
		_item.Id = this.item.Id;
		_item.Id_DotTangQua = controls['DotTangQua'].value;
		_item.NCCs = [];
		_item.DoiTuongGiam = [];
		for (const goc of this.treeNguoiNhan_Goc) {
			for (const temp of goc.data) {
				for (const doiTuong of temp.DoiTuongs) {
					for (const ncc of doiTuong.NCCs) {

						// Nếu không visibleTangGiam: Đợt gốc chỉ thêm ncc được check
						if (!this.visibleTangGiam) {
							if (ncc.Checked) _item.NCCs.push(ncc);
							continue;
						}

						// Xử lý khi visibleTangGiam = true
						// Dữ liệu kế thừa + tăng: Rút gọn logic (A || (!A && !B && !C)) thành (A || (!B && !C))
						// x.IsTang || (!x.IsTang && !x.IsGiam && !x.IsNew)
						if (ncc.IsTang || (!ncc.IsGiam && !ncc.IsNew)) {
							_item.NCCs.push(ncc);
						}

						// Dữ liệu giảm
						if (ncc.IsGiam) {
							_item.DoiTuongGiam.push(ncc);
						}
					}
				}
			}
		}
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}

		const EditDot = this.prepareDeXuat();
		if (!EditDot) return;
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
		this.apiService.Clone(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({ _item });
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
		this.apiService.update(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({ _item });
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
		this.apiService.create(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({ _item });
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	//chọn/ko chọn ở đợt gốc
	chon(ncc: any, index_nguon: number, index_muc: number) {
		let value = this.danhMucService.stringToInt(ncc.SoTien);
		if (!ncc.Checked)
			value = value * -1
		let s = this.danhMucService.stringToInt(this.tongMuc[index_nguon][index_muc]) + value;
		this.tongMuc[index_nguon][index_muc] = this.danhMucService.f_currency_V2('' + s);
		this.tongSL[index_nguon][index_muc] = this.tongSL[index_nguon][index_muc] + (!ncc.Checked ? -1 : 1);
	}

	updateLyDo(item: any){
		if (item.DisabledGiam || this.item.Id == 0 || !item.IsGiam || item.LyDo == undefined)
			return;
		let temp = { Id: this.item.Id, IdGiam: item.Id, LyDo: item.LyDo, GhiChuGiam: item.GhiChuGiam }
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.UpdateGiam(temp).subscribe(res => {
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

	baoGiam($event: any, item: any) {
		let mess_giamtc = this.translate.instant('DE_XUAT.baogiamtc');
		let mess_huygiamtc = this.translate.instant('DE_XUAT.huybaogiamtc');
		if (item.DisabledGiam) return;
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
			this.apiService.BaoGiam(temp).subscribe(res => {
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
			this.apiService.HuyBaoGiam(item.Id).subscribe(res => {
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
	baoGiam0(item: any, check: boolean) {
		for (const ng of this.treeNguoiNhan) {
			for (const muc of ng.data) {
				// Bỏ qua nếu mức quà <= 0
				if (+muc.MucQua <= 0) continue;

				const doiTuong = muc.DoiTuongs.find((x: any) => +item.Id_DoiTuongNCC === +x.Id_DoituongNCC);
				if (!doiTuong) continue;

				const ncc = doiTuong.NCCs.find((x: any) => +item.Id_NCC === +x.Id_NCC);
				if (!ncc) continue;

				ncc.IsGiam = check;
				ncc.LyDo = check ? item.LyDo : null;
				ncc.GhiChuGiam = check ? item.GhiChuGiam : null;
			}
		}
		this.tinhTongMuc();
	}

	huybaotang(ncc: any, index_nguon: number, index_muc: number) {
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
		// this.apiService.HuyBaoTang(ncc.Id).subscribe(res => {
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

	baoTang($event: any, item: any) {
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
			this.apiService.BaoTang(this.item.Id, this.lstDTTang).subscribe(res => {
				this.viewLoading = false;
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					// item.IsTang = true;
					// item.Id = res.data[0].Id; //id detail
					res.data.forEach((x: any) => {
						let find = this.lstDTTang.find(y => +y.Id_NCC == +x.Id_NCC && +y.Id_NguonKinhPhi == +x.Id_NguonKinhPhi);
						if (find) {
							find.IsTang = true;
							find.Id = x.Id; //id detail
						}
					})
					this.tinhTongMuc();
					this.buildTangGiamTrees();
					this.layoutUtilsService.showInfo(mess_tangtc).afterDismissed();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			})
		} else {//hủy báo tăng
			var lst = this.findncc(item.Id_DoiTuongNCC, item.Id_NCC);
			var ids: any[] = [];
			lst.forEach(x => ids.push(x.Id));
			this.apiService.HuyBaoTang(ids).subscribe(res => {
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
	baoTang0(item: any, check: boolean) {
		//báo tăng/hủy báo tăng nhiều nguồn
		for (const ng of this.treeNguoiNhan) {
			for (const muc of ng.data) {
				// Bỏ qua nếu mức quà <= 0
				if (+muc.MucQua <= 0) continue;

				const doiTuong = muc.DoiTuongs.find((x: any) => +item.Id_DoiTuongNCC === +x.Id_DoituongNCC);
				if (!doiTuong) continue;

				const ncc = doiTuong.NCCs.find((x: any) => +item.Id_NCC === +x.Id_NCC);
				if (!ncc) continue;

				ncc.IsTang = check;
				ncc.IsNew = true;
			}
		}
		this.tinhTongMuc();
		this.buildTangGiamTrees();
	}

	findncc(Id_DoiTuongNCC: number, Id_NCC: number) {
		const nccs: any[] = [];
		for (const ng of this.treeNguoiNhan) {
			for (const muc of ng.data) {
				// Bỏ qua nếu mức quà <= 0
				if (+muc.MucQua <= 0) continue;

				const doiTuong = muc.DoiTuongs.find((x: any) => +Id_DoiTuongNCC === +x.Id_DoituongNCC);
				if (!doiTuong) continue;

				// Tìm NCC
				const ncc = doiTuong.NCCs.find((x: any) => +Id_NCC === +x.Id_NCC);
				if (ncc) 
					nccs.push(ncc);
			}
		}
		return nccs;
	}

	//#region Import chi tiết đợt tặng quà
	import() {
		if (!this.itemForm) return;
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
		if (!this.itemForm) return;
		let id = this.itemForm.controls["DotTangQua"].value;
		if (!id) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.apiService.downloadTemplate(id).subscribe(res => {
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

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	changed_tab($event: any) {
		this.selected_tab = $event;
		this.tinhTongMuc();
		this.buildViewTree();
	}

	buildViewTree() {
		const filterNCCs = (nccs: any[]) => {
			if (this.selected_tab === 0) return nccs.filter(ncc => ncc.Checked && !ncc.IsGiam);
			if (this.selected_tab === 1) return nccs.filter(ncc => ncc.IsTang);
			if (this.selected_tab === 2) return nccs.filter(ncc => ncc.IsGiam);
			return nccs;
		};
		this.treeNguoiNhanView = this.treeNguoiNhan.map((ng: any) => ({
			...ng,
			data: ng.data.map((muc: any) => ({
				...muc,
				DoiTuongs: muc.DoiTuongs.map((dt: any) => ({
					...dt,
					NCCs: filterNCCs(dt.NCCs)
				}))
			}))
		}));
	}

	buildTangGiamTrees() {
		const buildTree = (filterFn: (nccs: any[]) => any[]) =>
			this.treeNguoiNhan.map((ng: any) => ({
				...ng,
				data: ng.data.map((muc: any) => ({
					...muc,
					DoiTuongs: muc.DoiTuongs.map((dt: any) => ({
						...dt,
						NCCs: filterFn(dt.NCCs)
					}))
				}))
			}));
		this.treeNguoiNhanNhan_TG = buildTree(nccs => nccs.filter((ncc: any) =>
			ncc.Checked && !(ncc.IsTang && ncc.Id_DeXuat === this.item.Id)));
		this.treeNguoiNhanTang_TG = buildTree(nccs => nccs.filter((ncc: any) =>
			!ncc.Checked || (ncc.IsTang && ncc.Id_DeXuat === this.item.Id)));
		this.buildFlatRows();
	}

	buildFlatRows() {
		const flatten = (tree: any[]) => {
			const rows: any[] = [];
			tree.forEach((ng: any, j: number) => {
				rows.push({ type: 'nguon', ng, j });
				ng.data.forEach((muc: any, i: number) => {
					rows.push({ type: 'muc', muc, j, i });
					muc.DoiTuongs.forEach((dt: any) => {
						rows.push({ type: 'dt', dt });
						dt.NCCs.forEach((ncc: any) => rows.push({ type: 'ncc', ncc, j, i }));
					});
				});
			});
			return rows;
		};
		this.flatRowsNhan = flatten(this.treeNguoiNhanNhan_TG);
		this.flatRowsTang = flatten(this.treeNguoiNhanTang_TG);
	}

	trackByFlatRow(index: number, row: any): any {
		if (row.type === 'ncc') return 'ncc_' + (row.ncc.Id_NCC != null ? row.ncc.Id_NCC : index);
		if (row.type === 'nguon') return 'nguon_' + row.j;
		if (row.type === 'muc') return 'muc_' + row.j + '_' + row.i;
		if (row.type === 'dt') return 'dt_' + row.dt.Id;
		return index;
	}

	onFilterInput() {
		this.filterSubject$.next(this.Filter);
	}

	trackByIndex(index: number): number {
		return index;
	}

	trackByNCC(index: number, ncc: any): any {
		return ncc.Id_NCC != null ? ncc.Id_NCC : index;
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

			for (const ng of this.treeNguoiNhan) {
				for (const muc of ng.data) {
					// Bỏ qua nếu mức quà <= 0
					if (+muc.MucQua <= 0) continue;
					const doiTuong = muc.DoiTuongs.find((x: any) => +res.Id_DoiTuongNCC === +x.Id_DoituongNCC);
					if (!doiTuong) continue;

					// Clone object bằng Spread Operator (ngắn gọn hơn Object.assign)
					const temp = {
						...res,
						Id_NCC: res.Id,
						Id: 0,
						Id_DeXuat: 0,
						Id_NguonKinhPhi: ng.Id_NguonKinhPhi,
						SoTien: this.danhMucService.f_currency_V2('' + muc.MucQua)
					};

					if (baoTang) {
						this.lstDTTang.push(temp);
					} else {
						temp.Checked = true; // tự check khi thêm đt ở đợt gốc
					}
					// Thêm temp vào mảng NCCs và sắp xếp lại
					doiTuong.NCCs.push(temp);
					doiTuong.NCCs.sort((a: any, b: any) => {
						if (a.HoTen < b.HoTen) return -1;
						if (a.HoTen > b.HoTen) return 1;
						return 0;
					});
				}
			}
			if (baoTang && this.lstDTTang.length > 0) {
				this.baoTang({ checked: true }, this.lstDTTang[0]);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	export() {
		this.apiService.exportExcelDeXuat(this.item.Id).subscribe(res => {
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