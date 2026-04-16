import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { DisplayHtmlContentComponent, SettingProcessComponent } from '../../../components';
import { CommonService } from '../../../services/common.service';
import { NhapBaoHiemDuyetDataSource } from '../Model/data-sources/nhap-bao-hiem-duyet.datasource';
import { NhapBaoHiemDuyetService } from '../Services/nhap-bao-hiem-duyet.service';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { NhapBaoHiemDuyetDialogComponent } from '../nhap-bao-hiem-duyet/nhap-bao-hiem-duyet.dialog.component';
import { NhapBaoHiemEditDialogComponent } from '../../nhap-bao-hiem/nhap-bao-hiem-edit/nhap-bao-hiem-edit.dialog.component';

@Component({
	selector: 'm-nhap-bao-hiem-duyet-list',
	templateUrl: './nhap-bao-hiem-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class NhapBaoHiemDuyetListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: NhapBaoHiemDuyetDataSource;
	@Input() donvi: any;
	@Input() nam: number;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	expandedElement: any | null;

	idCommentShowDialog = 0;
	UserInfo: any;
	selectedTab: number = 0;
	lstDot: any[] = [];
	filterprovinces: number;
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	list_button: boolean;

	constructor(public NhapBaoHiemDuyetService: NhapBaoHiemDuyetService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this.nam = moment().get("year");
		this._name = this.translate.instant("NHAP_BHYT.NAME");
		this.route.queryParams.subscribe(params => {
			this.idCommentShowDialog = +params['showcmt'];
		});
	}


	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.route.data.subscribe(data => {
			if (data.IsEnable_Duyet != undefined)
				this.IsEnable_Duyet = data.IsEnable_Duyet;
		})
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterdistrict = '' + res.ID_Goc_Cha;
				this.CommonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['TenDanhSach'] = "";

		this.gridModel.filterGroupDataChecked['IsTre'] = [
		{
			name: 'Trễ hạn', value: 'True', checked: false
		}, {
			name: 'Chưa trễ hạn', value: 'False', checked: false
		}]
		this.gridModel.filterGroupDataChecked['IsTre_Duyet'] = [
		{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		let availableColumns = [
			{
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'TenDanhSach',
				displayName: 'Tên danh sách',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Thang',
				displayName: 'Tháng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'DistrictName',
				displayName: 'Huyện',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'Id_Xa',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'SLTang',
				displayName: 'SL tăng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'SLGiam',
				displayName: 'SL giảm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'TongSo',
				displayName: 'Tổng số',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
				name: 'TongTien',
				displayName: 'Tổng tiền',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 13,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 14,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 15,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)

		this.gridService = new TableService(
			this.layoutUtilsService, 
			this.ref, 
			this.gridModel,
			this.cookieService
		);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

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
		this.dataSource = new NhapBaoHiemDuyetDataSource(this.NhapBaoHiemDuyetService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.NhapBaoHiemDuyetService.lastFilter$.getValue();
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

	loadGetListDistrictByProvinces(idProvince: any) {
		this.CommonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.filterward = '';
		this.loadDataList();
		this.CommonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	sortChange($event) {
		this.sort = $event;
		// If the user changes the sort order, reset back to the first page.
		//this.paginator.pageIndex = 0;
		this.loadDataList();
	}
	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
	}

	changeTab($event) {
		this.selectedTab = $event;
		this.selection.clear();
		this.dataSource.entitySubject.next([]);
		this.loadDataList(false);
	}
	loadDataList(holdCurrentPage: boolean = true) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams, this.selectedTab == 0 ? 3 : this.UserInfo.Capcocau);
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.IsEnable_Duyet = this.IsEnable_Duyet;
		if (this.filterdistrict != '')
			filter.Id_Huyen = this.filterdistrict;
		if (this.filterward != '')
			filter.Id_Xa = this.filterward;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.TenDanhSach = this.gridService.model.filterText['TenDanhSach'];
		}
		if (this.donvi) {
			if (this.donvi.Type == 'H')
				filter.Id_Huyen = this.donvi.ID_Goc;
			if (this.donvi.Type == 'X')
				filter.Id_Xa = this.donvi.ID_Goc;
		}
		return filter; //trả về đúng biến filter
	}

	DuyetDanhSach(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NhapBaoHiemDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.loadDataList();
			}
		});
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}
	detail(_item: any) {
		const dialogRef = this.dialog.open(NhapBaoHiemEditDialogComponent, { data: { _item, allowEdit: false }, disableClose: true });
		dialogRef.afterClosed().subscribe(res => {

		});
	}

	rowClick(element: any) {
		if (element.Id > 0) return;
		this.expandedElement = this.expandedElement === element.DistrictID ? null : element.DistrictID;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		let numRows = this.productsResult.filter(row => !row.IsEnable_Duyet && row.Id != null).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (!row.IsEnable_Duyet && row.Id != null)
					this.selection.select(row)
			});
		}
	}

	showCanDuyet(item: any) {
		let html = `<table style="width:100%" class="table-bordered table-sm" >
		<tr>
			<th class="stt-cell">STT</th>
			<th class="text-center">Xã</th>
			<th class="text-center">SL tăng</th>
			<th class="text-center">SL giảm</th>
			<th class="text-center">Tổng số</th>
			<th class="text-center">Đã gửi</th>
			<th class="text-center">Đã duyệt</th>
		</tr>`;
		let arr: any[] = item.Xa.list;
		arr.forEach(function (x, index) {
			html += `<tr style="` + (x.IsEnable_Duyet ? "color:red" : "") + `">
						<td class="text-center">${index + 1}</td>
						<td>${x.Title}</td>
						<td class="text-center">${x.SLTang}</td>
						<td class="text-center">${x.SLGiam}</td>
						<td class="text-center">${x.TongSo}</td>
						<td>${x.SentDate}</td>
						<td>${x.NgayDuyet}</td>
					</tr>`;
		})
		html += `</table>`;
		let data = { html: html, title: 'Danh sách xã thuộc huyện' }
		const dialogRef = this.dialog.open(DisplayHtmlContentComponent, { data: data });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
			}
		})
	}

	duyets(duyet = true) {
		let lst = this.selection.selected.filter(x => !x.IsEnable_Duyet).map(x => x.Id);
		if (lst.length == 0)
			return;
		var data = {
			ids: lst,
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
			this.NhapBaoHiemDuyetService.duyets(data).subscribe(res => {
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
	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 4 } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}
	TraLai(item: any) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NhapBaoHiemDuyetDialogComponent, { data: { _item, isDuyet: true, isReturn: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.loadDataList();
			}
		});
	}
}
