// Angular
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Service
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ReviewExportComponent } from '../../../components';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { HoSoNhaOModel } from '../Model/ho-so-nha-o.model';
import { HoSoNhaOService } from '../Services/ho-so-nha-o.service';
import { HoSoNhaODataSource } from '../Model/data-sources/ho-so-nha-o.datasource';
import { HoSoNhaOSupportDialogComponent } from '../ho-so-nha-o-support/ho-so-nha-o-support-dialog.component';
import { HoSoNhaOHistoryComponent } from '../ho-so-nha-o-history/ho-so-nha-o-history.component';
import { HoSoNhaOEditDialogComponent } from '../ho-so-nha-o-edit/ho-so-nha-o-edit-dialog.component';
import { HoSoNhaOImportComponent } from '../ho-so-nha-o-import/ho-so-nha-o-import.component';
import { Moment } from 'moment';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { HoSoNhaOSupportsDialogComponent } from '../ho-tro-nha-o-supports/ho-tro-nha-o-supports-dialog.component';

@Component({
	selector: 'kt-ho-so-nha-o-list',
	templateUrl: './ho-so-nha-o-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOListComponent implements OnInit {
	// Table fields
	dataSource: HoSoNhaODataSource;

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
	Capcocau: number = 0;
	thaotac: number = 0;

	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	to: Moment;
	from: Moment;

	constructor(
		public objectService: HoSoNhaOService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private cookieService: CookieService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage,
		private router: Router) {
		this._name = 'đối tượng hỗ trợ';
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterdistrict = +res.ID_Goc_Cha;
				this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.commonService.getStatusHTNO().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				this.gridService.model.filterGroupDataChecked['Status'] = this.lstStatus.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})
		this.commonService.getHinhThucHTNO().subscribe(res => {
			if (res && res.status == 1) {
				var lst = res.data;
				this.gridService.model.filterGroupDataChecked['Id_HinhThuc'] = lst.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: false,
				isShow: this.filterStatus != 2,
			},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'SoHoSo',
				displayName: 'Sổ hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'KhomAp',
				displayName: 'Khóm/ấp ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'Id_HinhThuc',
				displayName: 'Hình thức hỗ trợ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'ChiPhiYeuCau',
				displayName: 'Chi phí yêu cầu',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'NoiDungHoTro',
				displayName: 'Nội dung hỗ trợ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 12,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(
			true,
			this.gridModel.availableColumns
		);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_hotronhao'
		
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hotronhao'));
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new HoSoNhaODataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			if (this.filterStatus)
				queryParams.filter.Status = this.filterStatus;
			else
				queryParams.filter.DaDuyet = "0";
			// First load
			this.dataSource.loadList(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
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
		if (this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
		}

		return filter;
	}

	/* UI */
	getItemStatusString(status: boolean = true): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/** Delete */
	DeleteWorkplace(_item: HoSoNhaOModel) {
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

	AddWorkplace() {
		const objectModel = new HoSoNhaOModel();
		objectModel.clear(); // Set all defaults fields
		this.Editobject(objectModel);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Editobject(_item: HoSoNhaOModel, allowEdit: boolean = true) {
		_item.ProvinceID = this.filterprovinces;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(HoSoNhaOEditDialogComponent, { data: { _item, allowEdit } });//, width: '80%' 
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	HoTro(_item: HoSoNhaOModel, allowEdit: boolean = true) {
		_item.ProvinceID = this.filterprovinces;
		const _saveMessage = 'Hỗ trợ hồ sơ đối tượng thành công';
		const dialogRef = this.dialog.open(HoSoNhaOSupportDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	historyHoTro(item: any) {
		const dialogRef = this.dialog.open(HoSoNhaOHistoryComponent, { data: { item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}

	GuiDuyet(_item: HoSoNhaOModel) {
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

	ThuHoi(_item: HoSoNhaOModel) {
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
		const dialogRef = this.dialog.open(HoSoNhaOImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadDataList();
		});
	}

	Export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
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
				cols: cols
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

	hoTros() {
		var _item = this.selection.selected.filter(x => x.visibleHoTro);
		const dialogRef = this.dialog.open(HoSoNhaOSupportsDialogComponent, { data: { _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {	
				let str = res.data.success + "/" + res.data.total;
				this.layoutUtilsService.showInfo("Hỗ trợ thành công " + str);
				this.ngOnInit();
			}
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

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		let numRows = this.productsResult.length;
		if (this.thaotac == 1)
			numRows = this.productsResult.filter(row => row.visibleGuiDuyet).length;
		if (this.thaotac == 2)
			numRows = this.productsResult.filter(row => row.visibleThuHoi).length;
		if (this.thaotac == 3)
			numRows = this.productsResult.filter(row => row.visibleHoTro).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (this.thaotac == 0 || (this.thaotac == 1 && !row.visibleGuiDuyet) 
				|| (this.thaotac == 2 && !row.visibleThuHoi) || (this.thaotac == 3 && !row.visibleHoTro)) {

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
		this.commonService.getIdHuongDan(QuaTrinhKhongCoNguoiDuyet.Id, 5).subscribe(res1 => {
			if (res1 && res1.status == 1) {
				id_quatrinh_lichsu = +res1.data;
				this.commonService.getHuongDan(id_quatrinh_lichsu, 5).subscribe(res => {
					if (res && res.status == 1) {
						const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
						dialogRef.afterClosed().subscribe(res2 => {
							if (!res2) {
							} else {
								this.commonService.exportHuongDan(id_quatrinh_lichsu, 5, res2.loai).subscribe(response => {
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
}
