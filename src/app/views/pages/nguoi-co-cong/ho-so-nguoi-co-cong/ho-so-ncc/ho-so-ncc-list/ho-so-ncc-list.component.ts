import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, merge, forkJoin } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { Moment } from 'moment';
import * as moment from 'moment';
// Services
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { ReviewExportComponent } from '../../../components';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../../../../environments/environment';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';
import { HoSoNCCService } from '../Services/ho-so-ncc.service';
import { HoSoNCCDataSource } from '../Model/data-sources/ho-so-ncc.datasource';
import { HoSoNCCImportComponent } from '../ho-so-ncc-import/ho-so-ncc-import.component';
import { QuyetDinhEditDialogComponent } from '../../quyet-dinh/quyet-dinh-edit/quyet-dinh-edit-dialog.component';

@Component({
	selector: 'kt-ho-so-ncc-list',
	templateUrl: './ho-so-ncc-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCListComponent implements OnInit {

	// Table fields
	dataSource: HoSoNCCDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterStatus: number; //filterStatus=2: filter những hồ sơ đã duyệt
	filterType = '';
	listchucdanh: any[] = [];

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	print: boolean = false;
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	listward: any[] = [];
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	thaotac: number = 0;
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	to: Moment;
	from: Moment;

	constructor(
		public objectService: HoSoNCCService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage,
		private cookieService: CookieService,
		private router: Router) {
			this._name = 'Hồ sơ người có công';
			this.print = false;
	}

	/** LOAD DATA */
	ngOnInit() {
		const tmp = moment();
		const y = tmp.get('year');
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));

		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);

		// route.data emits synchronously — filterStatus is set before _initGrid()
		this.route.data.subscribe(data => {
			if (data.Status) {
				this.filterStatus = data.Status;
				this.changeDetectorRefs.detectChanges();
			}
		});

		// Step 1: setup grid synchronously — no network call needed
		this._initGrid();

		// Step 2: fire all lookup HTTP calls in parallel
		forkJoin([
			this.tokenStorage.getUserInfo().pipe(take(1)),
			this.commonService.GetAllProvinces(),
			this.commonService.getStatusNCC()
		]).subscribe(([user, provinces, status]) => {
			if (user) {
				this.filterprovinces = user.IdTinh;
				this.Capcocau = user.Capcocau;
				this.loadGetListDistrictByProvinces(this.filterprovinces);
				if (user.Capcocau == 2) {
					this.filterdistrict = +user.ID_Goc_Cha;
					this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
						if (res && res.status == 1)
							this.listward = res.data;
					});
				}
			}

			if (provinces) this.listprovinces = provinces.data;

			if (status && status.status == 1) {
				this.lstStatus = status.data;
				if (this.filterStatus)
					this.lstStatus = this.lstStatus.filter(x => x.id == +this.filterStatus);
				else
					this.lstStatus = this.lstStatus.filter(x => x.id != 2);
				this.gridService.model.filterGroupDataChecked['Status'] = this.lstStatus.map(x => ({
					name: x.title, value: x.id, checked: false
				}));
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}

			// Step 3: trigger first data load now that Capcocau and filters are ready
			const queryParams = this.objectService.lastFilter$.getValue();
			if (this.filterStatus)
				queryParams.filter.Status = this.filterStatus;
			else
				queryParams.filter.DaDuyet = '0';
			if (this.Capcocau == 1) {
				queryParams.filter.DateKey = 'NgayGui';
				queryParams.filter.TuNgay = this.from.format('DD/MM/YYYY');
				queryParams.filter.DenNgay = this.to.format('DD/MM/YYYY');
			}
			this.dataSource.loadList(queryParams);
		});
	}

	private _initGrid() {
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.LoaiHoSo = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		const availableColumns = [
			{ stt: 0,  name: 'select',              displayName: 'Chọn',                    alwaysChecked: false, isShow: true  },
			{ stt: 1,  name: 'STT',                 displayName: 'STT',                     alwaysChecked: false, isShow: true  },
			{ stt: 2,  name: 'SoHoSo',              displayName: 'Sổ Hồ Sơ',               alwaysChecked: false, isShow: true  },
			{ stt: 3,  name: 'HoTen',               displayName: 'Họ tên',                  alwaysChecked: false, isShow: true  },
			{ stt: 4,  name: 'NgaySinh',            displayName: 'Ngày sinh',               alwaysChecked: false, isShow: false },
			{ stt: 5,  name: 'GioiTinh',            displayName: 'Giới tính',               alwaysChecked: false, isShow: false },
			{ stt: 5,  name: 'DiaChi',              displayName: 'Địa chỉ',                 alwaysChecked: false, isShow: false },
			{ stt: 6,  name: 'KhomAp',              displayName: 'Khóm/ấp ',                alwaysChecked: false, isShow: true  },
			{ stt: 7,  name: 'Title',               displayName: 'Phường/Xã ',              alwaysChecked: false, isShow: true  },
			{ stt: 8,  name: 'DistrictName',        displayName: 'Quận/Huyện',              alwaysChecked: false, isShow: false },
			{ stt: 8,  name: 'DoiTuong',            displayName: 'Đối tượng',               alwaysChecked: false, isShow: true  },
			{ stt: 9,  name: 'LoaiHoSo',            displayName: 'Loại hồ sơ',              alwaysChecked: false, isShow: true  },
			{ stt: 10, name: 'NguoiThoCungLietSy',  displayName: 'Người thờ cúng liệt sỹ', alwaysChecked: false, isShow: false },
			{ stt: 11, name: 'QuanHeVoiLietSy',     displayName: 'Quan hệ với liệt sỹ',    alwaysChecked: false, isShow: false },
			{ stt: 12, name: 'Status',              displayName: 'Tình trạng',              alwaysChecked: false, isShow: true  },
			{ stt: 13, name: 'SoQuyetDinh',         displayName: 'Quyết định',              alwaysChecked: false, isShow: true  },
			{ stt: 94, name: 'NgayGui',             displayName: 'Ngày gửi',                alwaysChecked: false, isShow: false },
			{ stt: 95, name: 'CreatedBy',           displayName: 'Người tạo',               alwaysChecked: false, isShow: false },
			{ stt: 96, name: 'CreatedDate',         displayName: 'Ngày tạo',                alwaysChecked: false, isShow: false },
			{ stt: 97, name: 'UpdatedBy',           displayName: 'Người sửa',               alwaysChecked: false, isShow: false },
			{ stt: 98, name: 'UpdatedDate',         displayName: 'Ngày sửa',                alwaysChecked: false, isShow: false },
			{ stt: 99, name: 'actions',             displayName: 'Tác vụ',                  alwaysChecked: true,  isShow: true  },
		];

		if (this.filterStatus == 2) {
			availableColumns.splice(0, 1);
			const id = availableColumns.findIndex(x => x.name == 'Status');
			if (id > -1) availableColumns.splice(id, 1);
		} else {
			const id = availableColumns.findIndex(x => x.name == 'SoQuyetDinh');
			if (id > -1) availableColumns.splice(id, 1);
		}

		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService, this.ref, this.gridModel, this.cookieService
		);
		const name_cookie = this.filterStatus == 2 ? 'displayedColumnsHoSoNCC' : 'displayedColumnsTiepNhanNCC';
		this.gridService.cookieName = name_cookie;
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check(name_cookie));

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(tap(() => this.loadDataList()))
			.subscribe();

		this.dataSource = new HoSoNCCDataSource(this.objectService);
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				// Pre-compute statusColor per row to avoid method calls in template
				this.productsResult.forEach(item => {
					const s = this.lstStatus.find(x => x.id == item.Status);
					item.statusColor = s ? s.data.color : '';
				});
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadList(queryParams);
	}


	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.loadDataList();
	}

	filterWardD(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus)
			filter.Status = this.filterStatus;
		else
			filter.DaDuyet = "0";

		if (this.filterdistrict > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if ((this.from || this.to) && this.Capcocau == 1) { //lọc ngày cho cấp tỉnh
			filter.DateKey = 'NgayGui';
			if (this.from)
				filter["TuNgay"] = this.from.format("DD/MM/YYYY");
			if (this.to)
				filter["DenNgay"] = this.to.format("DD/MM/YYYY");
		}

		if (this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.LoaiHoSo = this.gridService.model.filterText.LoaiHoSo;
		}

		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/** Delete */
	DeleteWorkplace(_item: HoSoNCCModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	// AddWorkplace() {
	// 	const objectModel = new HoSoNCCModel();
	// 	objectModel.clear(); // Set all defaults fields
	// 	this.Editobject(objectModel);
	// }

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	// Editobject(_item: HoSoNCCModel, allowEdit: boolean = true) {
	// 	_item.ProvinceID = this.filterprovinces;
	// 	let saveMessageTranslateParam = '';
	// 	saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
	// 	const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
	// 	const dialogRef = this.dialog.open(HoSoNCCEditDialogComponent, { data: { _item, allowEdit } });//, width: '80%' 
	// 	dialogRef.afterClosed().subscribe(res => {
	// 		if (!res) {
	// 		} else {
	// 			this.layoutUtilsService.showInfo(_saveMessage);
	// 			this.loadDataList();
	// 		}

	// 	});
	// }

	GuiDuyet(_item: HoSoNCCModel) {
		const _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.GuiDuyet(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	ThuHoi(_item: HoSoNCCModel) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.ThuHoi(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Import() {
		const dialogRef = this.dialog.open(HoSoNCCImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadDataList();
		});
	}

	openChiTiet(id) {
		window.open('/chi-tiet-ho-so/'+id , '_blank')
	}

	Export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'SoQuyetDinh' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols.map(x => {
					if (x == 'NgayGui')
						return 'SentDate';
					else
						return x;
				})
			},
			true
		);
		this.objectService.exportList(queryParams).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất danh sách thất bại")
		});
	}

	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}
	in(object, loai = 1, isThannhan = false) {
		var id = object.Id;
		const filter: any = {};
		filter.loai = loai;
		filter.isThannhan = isThannhan;
		//this.objectService.previewHS(id, filter).subscribe(res => {
		//	if (res && res.status == 1) {
		//		if (res.data == null) {
		//			this.layoutUtilsService.showError("Chưa có mẫu xem trước");
		//		} else {
		//			const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		//			dialogRef.afterClosed().subscribe(res => {
		//				if (!res) {
		//				} else {
		//					this.objectService.exportHS(id, filter).subscribe(response => {
		//						const headers = response.headers;
		//						const filename = headers.get('x-filename');
		//						const type = headers.get('content-type');
		//						const blob = new Blob([response.body], { type });
		//						const fileURL = URL.createObjectURL(blob);
		//						const link = document.createElement('a');
		//						link.href = fileURL;
		//						link.download = filename;
		//						link.click();
		//					});
		//				}
		//			});
		//		}
		//	} else
		//		this.layoutUtilsService.showError(res.error.message);
		//})
		this.objectService.downloadHS(id, filter).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();

			//tắt xem trước
			// let ApiRoot = environment.ApiRoot.slice(0, environment.ApiRoot.length - 3);
			// let path = "viewer/file-dinh-kem/0?path=" + ApiRoot + "dulieu/quyet-dinh/" + filename;
			// window.open(path, "_blank");
		},
			(err) => {
				this.layoutUtilsService.showError("Vui lòng cập nhật biểu mẫu quyết định tương ứng với loại loại trợ cấp");
			});
	}
	
	guiDuyets(gui = true) {
		let data = [];
		if (gui)
			data = this.selection.selected.filter(x => x.visibleGuiDuyet).map(x => x.Id);
		else
			data = this.selection.selected.filter(x => x.visibleThuHoi).map(x => x.Id);
		var title = gui ? 'GUIDUYET' : 'THUHOI';
		const _title = this.translate.instant('OBJECT.' + title + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + title + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + title + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + title + '.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (gui)
				this.objectService.GuiDuyets(data).subscribe(res => {
					if (res && res.status === 1) {
						let str = " " + res.data.success + "/" + res.data.total;
						this.layoutUtilsService.showInfo(_deleteMessage + str);
						this.ngOnInit();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			else
				this.objectService.ThuHois(data).subscribe(res => {
					if (res && res.status === 1) {
						let str = " " + res.data.success + "/" + res.data.total;
						this.layoutUtilsService.showInfo(_deleteMessage + str);
						this.ngOnInit();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
		});
	}
	raQuyetDinh(item) {
		let _item: any = {
			ObjectType: 0,
			ObjectId: item.Id,
			Id_NCC: item.Id
		}
		const dialogRef = this.dialog.open(QuyetDinhEditDialogComponent, { data: { _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo("Tạo quyết định thành công");
				this.ngOnInit();
			}
		});
	}
	inQD(item) {
		this.objectService.previewQD(item.Id, item.Id_QuyetDinh).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
					} else {
						this.objectService.exportQD(item.Id, item.Id_QuyetDinh, res.loai).subscribe(response => {
							const headers = response.headers;
							const filename = headers.get('x-filename');
							const type = headers.get('content-type');
							const blob = new Blob([response.body], { type });
							const fileURL = URL.createObjectURL(blob);
							const link = document.createElement('a');
							link.href = fileURL;
							link.download = filename;
							link.click();
						}, err => {
							this.layoutUtilsService.showError("Xuất quyết định thất bại")
						});
					}
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}
	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		let numRows = this.productsResult.length;
		if (this.thaotac == 1)
			numRows = this.productsResult.filter(row => row.visibleGuiDuyet).length;
		if (this.thaotac == 2)
			numRows = this.productsResult.filter(row => row.visibleThuHoi).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (this.thaotac == 0 || (this.thaotac == 1 && !row.visibleGuiDuyet) || (this.thaotac == 2 && !row.visibleThuHoi)) {

				} else {
					this.selection.select(row)
				}
			});
		}
	}

	Download(object) {
		window.open(object.path, '_blank');
	}

	inhuongdan(QuaTrinhKhongCoNguoiDuyet: any) {
		let id_quatrinh_lichsu: number = 0;
		this.commonService.getIdHuongDan(QuaTrinhKhongCoNguoiDuyet.Id, 2).subscribe(res1 => {
			if (res1 && res1.status == 1) {
				id_quatrinh_lichsu = +res1.data;
				this.commonService.getHuongDan(id_quatrinh_lichsu, 2).subscribe(res => {
					if (res && res.status == 1) {
						const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
						dialogRef.afterClosed().subscribe(res2 => {
							if (!res2) {
							} else {
								this.commonService.exportHuongDan(id_quatrinh_lichsu, 2, res2.loai).subscribe(response => {
									const headers = response.headers;
									const filename = headers.get('x-filename');
									const type = headers.get('content-type');
									const blob = new Blob([response.body], { type });
									const fileURL = URL.createObjectURL(blob);
									const link = document.createElement('a');
									link.href = fileURL;
									link.download = filename;
									link.click();
								}, err => {
									this.layoutUtilsService.showError("Xuất hướng dẫn thất bại")
								});
							}
						});
					} else
						this.layoutUtilsService.showError(res.error.message);
				})
			} else
				this.layoutUtilsService.showError(res1.error.message);
		});
	}

	InBienNhan(object: any) {
		this.commonService.getBienNhan(object.Id).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res2 => {
					if (!res2) {
					} else {
						this.commonService.exportBienNhan(object.Id, res2.loai).subscribe(response => {
							const headers = response.headers;
							const filename = headers.get('x-filename');
							const type = headers.get('content-type');
							const blob = new Blob([response.body], { type });
							const fileURL = URL.createObjectURL(blob);
							const link = document.createElement('a');
							link.href = fileURL;
							link.download = filename;
							link.click();
						}, err => {
							this.layoutUtilsService.showError("Xuất biên nhận thất bại")
						});
					}
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	xuatDSDeNghi() {
		const queryParams = new QueryParamsModel({});
		if (this.from)
			queryParams.filter.TuNgay = this.from.format("DD/MM/YYYY");
		if (this.to)
			queryParams.filter.DenNgay = this.to.format("DD/MM/YYYY");
		
		this.objectService.exportDSDeNghiXetDuyet(queryParams).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			// const blob = new Blob([response.body], { type });
			// const fileURL = URL.createObjectURL(blob);
			// const link = document.createElement('a');
			// link.href = fileURL;
			// link.download = filename;
			// link.click();

			let ApiRoot = environment.ApiRoot.slice(0, environment.ApiRoot.length - 3);
			// let path = "viewer/file-dinh-kem/0?path=" + ApiRoot + "dulieu/ds-xuat/" + filename;
			let path = ApiRoot + "dulieu/ds-xuat/" + filename;
			window.open(path, "_blank");
		},
		(err) => {
			this.layoutUtilsService.showError("Không tìm thấy danh sách");
		}
	);
	}
	
	printTicket(print_template) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();
		let title = 'Tiếp nhận hồ sơ';
		let zoom ='';
		if(this.gridService.IsAllColumnsChecked()){
			zoom = `body {
				zoom: 60%;
			}`;
		}
		let slCol = this.gridService.IsAllColumnsChecked();
		let innerContents = document.getElementById(print_template).innerHTML;
		const popupWinindow = window.open();
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>'+ title +'</title></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print {
			`
			+ zoom +
			`
			th:last-child,
			td:last-child,
			.hiden-print {
				display: none !important;
			}
			td{
				border-bottom: 1px solid #dee2e6;
				padding: 10px;
				font-size: 10pt;
			}
			th{
				padding: 10px;
				font-size: 12pt;
			}
			
		}
		</style>
	  `);
	  	popupWinindow.document.close();
		popupWinindow.onafterprint = window.close;
		  this.print = false;
 	}
}
