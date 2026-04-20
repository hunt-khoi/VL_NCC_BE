import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatDialog, MatTabChangeEvent } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapCapQuanLyDuyetModel, PriorityAddData, NhapQuyTrinhDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { NhapCapQuanLyDuyetEditComponent } from '../nhap-cap-quan-ly-duyet-edit/nhap-cap-quan-ly-duyet-edit.component';
import { ChonNhieuNhanVienListComponent, ChonNhieuNhanVienListModel } from '../../../components';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-nhap-quy-trinh-duyet-edit',
	templateUrl: './nhap-quy-trinh-duyet-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NhapQuyTrinhDuyetEditComponent implements OnInit {
	// Table fields
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	//List các danh sách email
	listKhiDuyetDon: any[] = [];
	listKhiKhongDuyetDon: any[] = [];
	listKhiKhongThayNguoiDuyetDon: any[] = [];
	//==========================
	itemForm: FormGroup | undefined;
	loadingControl = new BehaviorSubject<boolean>(false);
	item: NhapQuyTrinhDuyetModel;
	oldItem: NhapQuyTrinhDuyetModel;
	hasFormErrors: boolean = false;
	//==========================
	showButton: boolean = false;
	showvitri: boolean = true;
	showPQ: boolean = true;
	//==========================
	// Selection
	disabledBtn: boolean = false;
	//=================Mới==================
	showTab1: boolean = false;
	showTab2: boolean = true;
	//===================Tab nhập quy trình duyệt=========================
	isSua: boolean = false;
	disabled: boolean = true;
	idqt: string = '';
	tenqt: string = '';
	selectedTab: number = 0;
	//===================Tab cấp quản lý duyệt=========================
	dataSource: NhapQuyTrinhDuyetDataSource | undefined;
	displayedColumns = ['#', 'TieuDe', 'SoNgayXuLy', 'ViTri', 'IdBack'/*, 'CapQuanLy'*/, 'NguoiNhanMail', 'GhiChu', 'actions'];
	@ViewChild('paginator_tab1', { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<NhapCapQuanLyDuyetModel>(true, []);
	productsResult: NhapCapQuanLyDuyetModel[] = [];
	//==========================
	sudungvitri: string = "";
	showViTri: boolean = true;
	showBtViTri: boolean = false;
	listViTri: any[] = [];
	viewLoading: boolean = false;
	listLoaiPhieu: any[] = []
	listProcessMethod: any[] = []

	public datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	ID_Struct: string = '';
	showChucVu: boolean = false;
	showQuyen: boolean = false;
	listChucDanh: any[] = [];
	listChucVu: any[] = [];
	listNhomQuyen: any[] = [];
	listQuyen: any[] = [];
	id_capduyet: string = '';
	id_cd: string = '';
	id_cv: string = '';
	listCapDuyet: any[] = [];
	allowEdit: boolean = true;
	list_button: boolean = false;

	link_img = 'https://img.icons8.com/color/96/000000/plus.png';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.luuvatieptuc(false);
		}
	}

	constructor(
		public nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		private commonService: CommonService,
		private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private itemFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }


	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.viewLoading = true;
		this.loadingSubject.next(true);

		const newProduct = new NhapQuyTrinhDuyetModel();
		newProduct.clear();
		this.item = newProduct;
		this.createForm();
		this.activatedRoute.data.subscribe(res => {
			if (res.allowEdit != undefined)
				this.allowEdit = res.allowEdit;
		})
		//#region cấp ql
		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		this.dataSource = new NhapQuyTrinhDuyetDataSource(this.nhapQuyTrinhDuyetService);
		this.activatedRoute.params.subscribe(params => {
			this.idqt = params.id;
			if (this.dataSource) {
				let queryParams = this.nhapQuyTrinhDuyetService.lastFilter$.getValue();
				queryParams.filter.ID_QuyTrinh = this.idqt;
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.showBtViTri = true;
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
		//#endregion
		this.nhapQuyTrinhDuyetService.GetListLoai().subscribe(res => {
			if (res && res.status == 1)
				this.listLoaiPhieu = res.data;
			else
				this.layoutUtilsService.showError(res.error.message);
		});
		this.nhapQuyTrinhDuyetService.GetListProcessMethod().subscribe(res => {
			if (res && res.status == 1)
				this.listProcessMethod = res.data;
			else
				this.layoutUtilsService.showError(res.error.message);
		});
		if (this.idqt) {
			this.nhapQuyTrinhDuyetService.get_ChiTietQuyTrinhDuyet(+this.idqt).subscribe(res => {
				this.viewLoading = true;
				if (res.ID_QuyTrinh == -2) {
					const message = `Lỗi! ` + res.TenQuyTrinh;
					this.layoutUtilsService.showInfo(message);
					return;
				}
				this.showButton = true;
				this.item = res;
				if (this.item.IdCapquanly) {
					this.id_capduyet = '' + this.item.IdCapquanly;
					this.loadChange(this.id_capduyet);
				}
				this.showTab2 = false;
				this.idqt = '' + this.item.ID_QuyTrinh;
				this.tenqt = this.item.TenQuyTrinh;
				this.oldItem = Object.assign({}, res);
				this.listKhiDuyetDon = this.item.data_NhanMailKhiDuyetDon;
				this.listKhiKhongDuyetDon = this.item.data_NhanMailKhiKhongDuyetDon;
				this.listKhiKhongThayNguoiDuyetDon = this.item.data_NhanMailKhiKhongTimThayNguoiDuyetDon;
				this.init();
				this.nhapQuyTrinhDuyetService.GetListApprovalLevel().subscribe(res => {
					if (res && res.status == 1) {
						this.listCapDuyet = res.data;
						if (res.data.length > 0 && this.item.IdCapquanly == 0) {
							this.item.IdCapquanly = res.data[0].ID_Row;
							this.loadChange(this.item.IdCapquanly);
						}
					} else {
						this.listCapDuyet = [];
						this.layoutUtilsService.showError(res.error.message);
					}
					this.changeDetectorRefs.detectChanges();
				});
				this.commonService.Get_CoCauToChuc().subscribe(res => {
					if (res.data && res.data.length > 0) {
						this.datatree.next(res.data);
						if (this.item.StructureID > 0) {
							this.ID_Struct = '' + this.item.StructureID;
						} else {
							this.ID_Struct = '' + res.data[0].RowID;
						}
						this.itemForm.controls['drp'].setValue(this.ID_Struct);
						this.loadListChucVu();
						this.changeDetectorRefs.detectChanges();
					}
				});
				this.loadPermission();
				this.changeDetectorRefs.detectChanges();
			});
		}
	}


	/** ACTIONS */
	init() {
		this.createForm();
		this.loadListData();
		this.loadingSubject.next(false);
		this.loadingControl.next(true);
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			tenQuyTrinh: [this.item.TenQuyTrinh, [Validators.required, Validators.maxLength(200)]],
			loai: [this.item.Loai + '', Validators.required],
			processMethod: [this.item.ProcessMethod + '', Validators.required],
			moTa: [this.item.MoTa, Validators.maxLength(500)],
			drp: ['']
		});

		//this.itemForm.controls["tenQuyTrinh"].markAsTouched();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	//Xử lý chọn người duyệt cho 3 danh sách==========================================
	addnguoinhankhiduyet() {
		let id = "";
		if (this.listKhiDuyetDon.length > 0) {
			this.listKhiDuyetDon.map((item) => {
				id += "," + item.ID_NV;
			});
		}
		const dialogRef = this.dialog.open(ChonNhieuNhanVienListComponent, {
			data: {
				idnv: id.substring(1),
			},
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.done) {
				if (this.listKhiDuyetDon.length > 0) {
					res.nhanVienSelected.map((item: any) => {
						let ktc = this.listKhiDuyetDon.find(x => x.ID_NV == item.ID_NV);
						if (!ktc) {
							let kdd = new ChonNhieuNhanVienListModel;
							kdd.ID_NV = item.ID_NV;
							kdd.HoTen = item.HoTen;
							this.listKhiDuyetDon.push(kdd);
						}
					});
				}
				else {
					this.listKhiDuyetDon = res.nhanVienSelected;
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}
	removenguoinhankhiduyet(item: any): void {
		const index = this.listKhiDuyetDon.indexOf(item);
		if (index >= 0) {
			this.listKhiDuyetDon.splice(index, 1);
			this.changeDetectorRefs.detectChanges();
		}
	}

	addnguoinhankhikoduyet() {
		let id = "";
		if (this.listKhiKhongDuyetDon.length > 0) {
			this.listKhiKhongDuyetDon.map((item) => {
				id += "," + item.ID_NV;
			});
		}
		const dialogRef = this.dialog.open(ChonNhieuNhanVienListComponent, {
			data: {
				idnv: id.substring(1),
			},
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.done) {
				if (this.listKhiKhongDuyetDon.length > 0) {
					res.nhanVienSelected.map((item: any) => {
						let ktc = this.listKhiKhongDuyetDon.find(x => x.ID_NV == item.ID_NV);
						if (!ktc) {
							let kdd = new ChonNhieuNhanVienListModel;
							kdd.ID_NV = item.ID_NV;
							kdd.HoTen = item.HoTen;
							this.listKhiKhongDuyetDon.push(kdd);
						}
					});
				}
				else {
					this.listKhiKhongDuyetDon = res.nhanVienSelected;
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	removenguoinhankhikoduyet(item: any): void {
		const index = this.listKhiKhongDuyetDon.indexOf(item);
		if (index >= 0) {
			this.listKhiKhongDuyetDon.splice(index, 1);
			this.changeDetectorRefs.detectChanges();
		}
	}

	addnguoinhankhikothaynguoiduyet() {
		let id = "";
		if (this.listKhiKhongThayNguoiDuyetDon.length > 0) {
			this.listKhiKhongThayNguoiDuyetDon.map((item) => {
				id += "," + item.ID_NV;
			});
		}
		const dialogRef = this.dialog.open(ChonNhieuNhanVienListComponent, {
			data: {
				idnv: id.substring(1),
			},
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.done) {
				if (this.listKhiKhongThayNguoiDuyetDon.length > 0) {
					res.nhanVienSelected.map((item: any) => {
						let ktc = this.listKhiKhongThayNguoiDuyetDon.find(x => x.ID_NV == item.ID_NV);
						if (!ktc) {
							let kdd = new ChonNhieuNhanVienListModel;
							kdd.ID_NV = item.ID_NV;
							kdd.HoTen = item.HoTen;
							this.listKhiKhongThayNguoiDuyetDon.push(kdd);
						}
					});
				}
				else {
					this.listKhiKhongThayNguoiDuyetDon = res.nhanVienSelected;
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	removenguoinhankhikothaynguoiduyet(item: any): void {
		const index = this.listKhiKhongThayNguoiDuyetDon.indexOf(item);
		if (index >= 0) {
			this.listKhiKhongThayNguoiDuyetDon.splice(index, 1);
			this.changeDetectorRefs.detectChanges();
		}
	}

	//====================================================================================
	//===Button update trên lưới===========
	Update(row: any) {
		this.showvitri = false;
		this.showButton = true;
		this.item.ID_QuyTrinh = row.ID_Row;
		this.item.TenQuyTrinh = row.TieuDe;
		if (this.itemForm) { 
			this.itemForm.controls['tenQuyTrinh'].setValue(row.TieuDe);
			this.itemForm.controls['moTa'].setValue(row.MoTa);
		}
		if (row.data_NhanMailKhiDuyetDon.length > 0) {
			this.listKhiDuyetDon = row.data_NhanMailKhiDuyetDon;
		}
		else {
			this.listKhiDuyetDon = [];
		}
		if (row.data_NhanMailKhiKhongDuyetDon.length > 0) {
			this.listKhiKhongDuyetDon = row.data_NhanMailKhiKhongDuyetDon;
		} else {
			this.listKhiKhongDuyetDon = [];
		}
		if (row.data_NhanMailKhiKhongTimThayNguoiDuyetDon.length > 0) {
			this.listKhiKhongThayNguoiDuyetDon = row.data_NhanMailKhiKhongTimThayNguoiDuyetDon;
		}
		else {
			this.listKhiKhongThayNguoiDuyetDon = [];
		}
		this.changeDetectorRefs.detectChanges();
	}

	//===Button bỏ qua===========
	boqua() {
		this.showvitri = true;
		this.showButton = false;
		this.item.ID_QuyTrinh = 0;
		this.listKhiDuyetDon = [];
		this.listKhiKhongDuyetDon = [];
		this.listKhiKhongThayNguoiDuyetDon = [];
		if (this.itemForm) { 
			this.itemForm.controls['tenQuyTrinh'].setValue('');
			this.itemForm.controls['moTa'].setValue('');
		}
		this.changeDetectorRefs.detectChanges();
	}
	//===Button lưu và tiếp tục============
	luuvatieptuc(withBack: boolean = false) {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		if (this.id_capduyet == '-3' && !this.item.Code) {
			this.layoutUtilsService.showError("Vui lòng chọn quyền để xác định người nhận output khi phiếu được duyệt");
			return;
		}
		if (this.id_capduyet == '-2' && !this.id_cd) {
			this.layoutUtilsService.showError("Vui lòng chọn chức vụ để xác định người nhận output khi phiếu được duyệt");
			return;
		}
		let edited = this.prepare();
		this.CreateQuyTrinhDuyet(edited, withBack);
	}
	prepare(): NhapQuyTrinhDuyetModel {
		const controls = this.itemForm.controls;
		const _item = new NhapQuyTrinhDuyetModel();
		_item.ID_QuyTrinh = this.item.ID_QuyTrinh;
		_item.TenQuyTrinh = controls['tenQuyTrinh'].value;
		_item.ProcessMethod = controls['processMethod'].value;
		_item.Loai = controls['loai'].value;
		_item.MoTa = controls['moTa'].value;
		if (this.listKhiDuyetDon.length > 0) {
			let list1 = "";
			this.listKhiDuyetDon.map((item) => {
				list1 += item.ID_NV + ',';
			})
			_item.ID_NhanMailKhiDuyetDon = list1.substring(0, list1.length - 1);
		}
		if (this.listKhiKhongDuyetDon.length > 0) {
			let list2 = "";
			this.listKhiKhongDuyetDon.map((item) => {
				list2 += item.ID_NV + ',';
			})
			_item.ID_NhanMailKhiKhongDuyetDon = list2.substring(0, list2.length - 1);
		}
		if (this.listKhiKhongThayNguoiDuyetDon.length > 0) {
			let list3 = "";
			this.listKhiKhongThayNguoiDuyetDon.map((item) => {
				list3 += item.ID_NV + ',';
			})
			_item.ID_NhanMailKhiKhongTimThayNguoiDuyetDon = list3.substring(0, list3.length - 1);
		}
		if (this.id_capduyet) {
			_item.IdCapquanly = +this.id_capduyet;
			if (this.id_capduyet == '-3') {
				_item.Code = this.item.Code;
			}
			if (this.id_capduyet == '-2') {
				_item.IdChucdanh = +this.id_cd;
			}
		}
		return _item;
	}
	CreateQuyTrinhDuyet(item: NhapQuyTrinhDuyetModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.disabledBtn = true;
		this.nhapQuyTrinhDuyetService.CreateQuyTrinhDuyet(item).subscribe(res => {
			this.loadingSubject.next(false);
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) return;
				this.idqt = res.data.ID_QuyTrinh;
				this.tenqt = res.data.TenQuyTrinh;
				this.showTab2 = false;
				this.selectedTab = 1;
				this.loadDataList();
				// if (this.showvitri == true) {
				// 	// const _refreshUrl = `StaffProfile/Systems/ApprovalProcess/chinh-sua/${idqt}/${tenqt}`;
				// 	// this.routesPage.navigateByUrl(_refreshUrl);
				// 	this.loadPopupDanhSach(idqt, tenqt);
				// }
				// else {
				// 	// const _refreshUrl = `StaffProfile/Systems/ApprovalProcess/chinh-sua/${idqt}/${tenqt}`;
				// 	// this.routesPage.navigateByUrl(_refreshUrl);
				// 	this.loadPopupDanhSach(idqt, tenqt);
				// }
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	//=========Button tiếp tục================
	tieptuc() {
		// let idqt = "";
		// let tenqt = "";
		// idqt = '' + this.item.ID_QuyTrinh;
		// tenqt = this.item.TenQuyTrinh;
		this.showTab2 = false;
		this.selectedTab = 1;
		this.loadDataList();
	}
	goBack() {
		window.history.back();
	}
	//===Tiêu đề hiển thị==================================================
	getTieuDe() {
		if (!this.allowEdit)
			return 'Xem chi tiết';
		let result = '';
		if (+this.idqt > 0) {
			result = "Cập nhật quy trình";
		} else {
			result = "Thêm mới quy trình";
		}
		return result;
	}
	//==============================================================================
	//================================================
	onLinkClick(eventTab: MatTabChangeEvent) {
		if (eventTab.index == 0) {
			this.selectedTab = 0;
			this.nhapQuyTrinhDuyetService.get_ChiTietQuyTrinhDuyet(+this.idqt).subscribe(res => {
				if (res.ID_QuyTrinh == -2) {
					const message = `Lỗi! ` + res.TenQuyTrinh;
					this.layoutUtilsService.showError(message);
					return;
				}
				this.showButton = true;
				this.item = res;
				this.showTab2 = false;
				this.idqt = '' + this.item.ID_QuyTrinh;
				this.tenqt = this.item.TenQuyTrinh;
				this.oldItem = Object.assign({}, res);
				this.showPQ = this.item.VisibleQTD;
				this.listKhiDuyetDon = this.item.data_NhanMailKhiDuyetDon;
				this.listKhiKhongDuyetDon = this.item.data_NhanMailKhiKhongDuyetDon;
				this.listKhiKhongThayNguoiDuyetDon = this.item.data_NhanMailKhiKhongTimThayNguoiDuyetDon;
				this.init();
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			if (eventTab.index == 1) {
				this.selectedTab = 1;
				this.loadDataList();
			} else {
				this.selectedTab = 2;
			}
		}
	}
	//============================Tab cấp quản lý duyệt==============================
	//------------Load data-------------------------
	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadListCapQuanLy(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.ID_QuyTrinh = this.idqt;
		return filter;
	}
	//===Tiêu đề hiển thị==================================================
	getComponentTitle() {
		let result = this.tenqt;
		return result;
	}
	//============Goi Popup=================
	AddCapQuanLyDuyet() {
		const quytrinhModel = new NhapCapQuanLyDuyetModel();
		quytrinhModel.clear(); // Set all defaults fields
		this.UpdateCapQuanLyDuyet(quytrinhModel);
	}
	UpdateCapQuanLyDuyet(_item: NhapCapQuanLyDuyetModel, allowEdit: boolean = true) {
		_item.Processmethod = this.item.ProcessMethod;
		_item.ProcessmethodLoai = this.item.ProcessMethodLoai;
		_item.AllowDevChecker = this.item.AllowDevChecker;
		_item.ID_QuyTrinh = this.item.ID_QuyTrinh;
		const dialogRef = this.dialog.open(NhapCapQuanLyDuyetEditComponent, { data: { _item, idqt: this.idqt, tenqt: this.tenqt, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadDataList();
			}
		});
	}

	trolai() {
		this.selectedTab = 0;
		this.nhapQuyTrinhDuyetService.get_ChiTietQuyTrinhDuyet(+this.idqt).subscribe(res => {
			if (res.ID_QuyTrinh == -2) {
				const message = `Lỗi! ` + res.TenQuyTrinh;
				this.layoutUtilsService.showError(message);
				return;
			}
			this.showButton = true;
			this.item = res;
			this.showTab2 = false;
			this.idqt = '' + this.item.ID_QuyTrinh;
			this.tenqt = this.item.TenQuyTrinh;
			this.oldItem = Object.assign({}, res);
			this.showPQ = this.item.VisibleQTD;
			this.listKhiDuyetDon = this.item.data_NhanMailKhiDuyetDon;
			this.listKhiKhongDuyetDon = this.item.data_NhanMailKhiKhongDuyetDon;
			this.listKhiKhongThayNguoiDuyetDon = this.item.data_NhanMailKhiKhongTimThayNguoiDuyetDon;
			this.init();
			this.changeDetectorRefs.detectChanges();
		});
	}
	//====Xử lý lưu vị trí===========================
	changeViTri(val: any, row: any) {
		if (val.target.value != "" && val.target.value > 0) {
			this.productsResult.forEach(item => {
				if (item.ID_CapQuanLy == row.ID_CapQuanLy && row.ViTri != val.target.value) {
					row.ViTri = val.target.value;
					if (this.item.ProcessMethod == '2') {
						this.disabledBtn = true;
						this.nhapQuyTrinhDuyetService.GetListCapBack(this.item.ID_QuyTrinh, row.ID_CapQuanLy, val.target.value).subscribe(res => {
							this.disabledBtn = false;
							if (res && res.status == 1)
								row.listCapDuyetQT = res.data;
							else {
								row.listCapDuyetQT = [];
								this.layoutUtilsService.showError(res.error.message);
							}
							row.ID_Back = '0';
							this.changeDetectorRefs.detectChanges();
						});
					}
				}
			});
		} else {
			row.ViTri = "";
			let message = "Giá trị không hợp lệ";
			this.layoutUtilsService.showError(message);
		}
	}
	changeBack(val: any, row: any) {
		this.productsResult.forEach(item => {
			if (item.ID_CapQuanLy == row.ID_CapQuanLy) {
				row.ID_Back = val.value;
			}
		});
	}
	luuViTri() {
		this.listViTri = [];
		var error = false;
		this.productsResult.forEach(row => {
			if (!row.ViTri) {
				this.layoutUtilsService.showError("Vui lòng nhập vị trí liên tục");
				error = true;
				return;
			}
			const q = new PriorityAddData();
			q.ID_CapQuanLy = +row.ID_CapQuanLy;
			q.ViTri = +row.ViTri;
			if (this.item.ProcessMethod == '2') {
				q.ID_Back = +row.ID_Back;
			}
			this.listViTri.push(q);
		});
		if (error) return;
		if (this.listViTri.length > 0) {
			this.updateViTri(this.listViTri);
		}
	}
	updateViTri(item: any[]) {
		this.loadingSubject.next(true);
		this.disabledBtn = true;
		this.nhapQuyTrinhDuyetService.updateViTri(item).subscribe(res => {
			this.loadingSubject.next(false);
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status == 1) {
				const _messageType = "Cập nhật thành công";
				this.layoutUtilsService.showInfo(_messageType);
				this.loadDataList();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	//===Button xóa trên lưới===========
	deleteItem(row: any) {
		const _title = "Xóa";
		const _description = "Bạn có chắc muốn xóa bước duyệt không";
		const _waitDesciption = "Dữ liệu đang được xóa";
		const _deleteMessage = "Xóa bước duyệt thành công";
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.nhapQuyTrinhDuyetService.deleteCapQuanLy(row.ID_CapQuanLy, this.idqt, row.TenCapDuyet).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}
	//Hàm kiêm tra===================================
	text(e: any, vi: any) {
		if (!((e.keyCode > 95 && e.keyCode < 106)
			|| (e.keyCode > 45 && e.keyCode < 58)
			|| e.keyCode == 8)) {
			e.preventDefault();
		}
	}
	//===============================================================================
	onAlertClose() {
		this.hasFormErrors = false;
	}

	GetValueNode(val: any) {
		this.ID_Struct = val.Id_PB;
		this.loadListChucVu();
	}

	loadListChucVu() {
		this.commonService.GetListPositionbyStructure(this.ID_Struct).subscribe(res => {
			if (res && res.status == 1) {
				this.listChucDanh = res.data;
			} else {
				this.listChucDanh = [];
				this.layoutUtilsService.showError(res.error.message);
			}

			if (this.item.ID_ChucVu == null) {
				if (res.data.length > 0) {
					this.id_cv = '' + res.data[0].ID;
				} else {
					this.id_cv = '';
					this.id_cd = '';
				}
			} else
				this.id_cv = '' + this.item.ID_ChucVu;
			this.commonService.GetListJobtitleByStructure(this.id_cv, this.ID_Struct).subscribe(res => {
				if (res && res.status == 1) {
					this.listChucVu = res.data;
				} else {
					this.listChucVu = [];
					this.layoutUtilsService.showError(res.error.message);
				}
				if (this.item.IdChucdanh == null) {
					if (res.data.length > 0) {
						this.id_cd = '' + res.data[0].ID;
					} else
						this.id_cd = '';
				} else
					this.id_cd = '' + this.item.IdChucdanh;
				this.changeDetectorRefs.detectChanges();
			});
		});
	}

	loadPermission() {
		this.nhapQuyTrinhDuyetService.GetListPermission().subscribe(res => {
			if (res && res.status == 1) {
				this.listNhomQuyen = res.data;
				this.setListQuyen(this.item.Permission_CodeGroup);
				//if (res.data.length > 0) {
				//this.itemForm.controls['nhomQuyen'].setValue('' + res.data[0].Code);
				//this.listQuyen = res.data[0].PqPermission;
				//}
			} else {
				this.listNhomQuyen = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	setListQuyen(val: any) {
		if (!val) return;
		var find = this.listNhomQuyen.find(x => x.Code == val);
		if (find)
			this.listQuyen = find.PqPermission;
		else
			this.listQuyen = [];
		this.changeDetectorRefs.detectChanges();
	}

	loadListData() {
		this.nhapQuyTrinhDuyetService.GetListApprovalLevel().subscribe(res => {
			if (res && res.status == 1) {
				this.listCapDuyet = res.data;
				if (res.data.length > 0 && this.item.IdCapquanly == 0) {
					this.id_capduyet = '' + res.data[0].ID_Row;
					this.loadChange(this.id_capduyet);
				}
			} else {
				this.listCapDuyet = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadChucDanhChange(idcd: any) {
		let id_st = +this.ID_Struct;
		this.commonService.GetListJobtitleByStructure(idcd, id_st).subscribe(res => {
			if (res && res.status == 1) {
				this.listChucVu = res.data;
				if (this.listChucVu.length > 0) {
					this.id_cd = '' + res.data[0].ID;
				}
				else {
					this.id_cd = '';
				}
			} else {
				this.listChucVu = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadChange(val: any) {
		switch (val) {
			case ("-3"): {
				this.showChucVu = false;
				this.showQuyen = true;
				if (this.listNhomQuyen == null || this.listNhomQuyen.length == 0)
					this.loadPermission();
				break;
			};
			case ("-2"): {
				this.showChucVu = true;
				this.showQuyen = false;
				break;
			};
			default: {
				this.showChucVu = false;
				this.showQuyen = false;
				break;
			}
		}
	}
}