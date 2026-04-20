import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { SettingProcessComponent } from '../../../components';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { HoTroDTDuyetService } from '../Services/ho-tro-duyet.service';
import { HoTroDTDuyetDataSource } from '../Model/data-sources/ho-tro-duyet.datasource';
import { HoTroDTDuyetDialogComponent } from '../ho-tro-duyet/ho-tro-duyet-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-ho-tro-duyet-list',
	templateUrl: './ho-tro-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoTroDuyetListComponent implements OnInit {
	// Table fields
	dataSource: HoTroDTDuyetDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterStatus = '';
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	visibleGuiDuyet: boolean;
	visibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean=true;
	Capcocau: number;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	selectedTab: number = 0;

	constructor(
		public objectService: HoTroDTDuyetService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		public commonService: CommonService,
		private cookieService: CookieService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage,
		private router: Router) {
			this._name = this.translate.instant("Hỗ trợ đối tượng");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.route.data.subscribe(data => {
			if (data.IsEnable_Duyet!=undefined)
				this.IsEnable_Duyet = data.IsEnable_Duyet;
		})
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.Capcocau = res.Capcocau;
				this.filterdistrict = '' + res.ID_Goc_Cha;
				this.commonService.GetListWardByDistrict(+this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'CreatedDate', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterGroupDataChecked['TinhTrang'] = [{
			name: 'Đã duyệt',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa duyệt',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre_Duyet'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'TenDanhSach',
				displayName: 'Tên danh sách',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'Id_DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'TongSo',
				displayName: 'Tổng số',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongTien',
				displayName: 'Tổng tiền yêu cầu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongTienHoTro',
				displayName: 'Tổng tiền hỗ trợ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 12,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 13,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: false,
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
				isShow: true,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
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
		this.gridService.cookieName = 'displayedColumns_hotroduyet'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hotroduyet'));

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new HoTroDTDuyetDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			queryParams.filter.IsEnable_Duyet = this.IsEnable_Duyet;
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
		this.filterward = '';
		this.loadDataList();
		this.commonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}
	filterWardID(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterdistrict) {
			filter.DistrictID = +this.filterdistrict;
		}
		filter.IsEnable_Duyet = this.IsEnable_Duyet;
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
		}

		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Duyet(item: any, isDuyet: boolean = true) {
		//let saveMessageTranslateParam = '';
		//saveMessageTranslateParam += 'OBJECT.DUYET.MESSAGE';
		//const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(HoTroDTDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				//this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	duyets(duyet = true) {
		var data = {
			ids: this.selection.selected.filter(x => !x.IsEnable_Duyet).map(x => x.Id),
			value: duyet
		};
		let tt = duyet ? 'DUYET' : 'KHONGDUYET';
		const _title = this.translate.instant('OBJECT.' + tt + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + tt + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + tt + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + tt + '.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.Duyets(data).subscribe(res => {
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
		const numRows = this.productsResult.filter(row => !row.IsEnable_Duyet).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (!row.IsEnable_Duyet)
					this.selection.select(row)
			});
		}
	}

	Download(object) {
		window.open(object.path, '_blank');
	}
	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 8 } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}

	changeTab($event) {
		this.selectedTab = $event;
		//this.filterConfiguration();
	}
	inhuongdan(QuaTrinhKhongCoNguoiDuyet: any) {
		let id_quatrinh_lichsu: number = 0;
		// this.commonService.getIdHuongDan(QuaTrinhKhongCoNguoiDuyet.Id, 8).subscribe(res1 => {
		// 	if (res1 && res1.status == 1) {
		// 		id_quatrinh_lichsu = +res1.data;
		// 		this.commonService.getHuongDan(id_quatrinh_lichsu, ).subscribe(res => {
		// 			if (res && res.status == 1) {
		// 				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		// 				dialogRef.afterClosed().subscribe(res2 => {
		// 					if (!res2) {
		// 					} else {
		// 						this.commonService.exportHuongDan(id_quatrinh_lichsu, 8, res2.loai).subscribe(response => {
		// 							const headers = response.headers;
		// 							const filename = headers.get('x-filename');
		// 							const type = headers.get('content-type');
		// 							const blob = new Blob([response.body], { type });
		// 							const fileURL = URL.createObjectURL(blob);
		// 							const link = document.createElement('a');
		// 							link.href = fileURL;
		// 							link.download = filename;
		// 							link.click();
		// 						});
		// 					}
		// 				});
		// 			} else
		// 				this.layoutUtilsService.showError(res.error.message);
		// 		})
		// 	} else
		// 		this.layoutUtilsService.showError(res1.error.message);
		// });
	}

	TraLai(item: any) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(HoTroDTDuyetDialogComponent, { data: { _item, isDuyet: true, isReturn: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.loadDataList();
			}
		});
	}
}
