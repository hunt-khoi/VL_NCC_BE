import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { NienHanDoiTuongService } from '../Services/nien-han-doi-tuong.service';
import { NienHanDoiTuongDataSource } from '../Model/data-sources/nien-han-dung-cu.datasource';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-nien-han-doi-tuong-list',
	templateUrl: './nien-han-doi-tuong-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NienHanDoiTuongListComponent implements OnInit {
	// Table fields
	dataSource: NienHanDoiTuongDataSource;
	displayedColumns = [];

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
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	nam: number = (new Date()).getFullYear();
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	listward: any[] = [];
	Capcocau: number = 0;

	filterdoituong: number = 0;
	listDoiTuong: any[] = [];

	constructor(
		public CommonService: CommonService,
		private cookieService: CookieService,
		public NienHanDoiTuongService: NienHanDoiTuongService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('Quản lý cấp phương tiện trợ giúp, dụng cụ chỉnh hình');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterdistrict = +res.ID_Goc_Cha;
				this.CommonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})

		this.CommonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});

		this.loadListDoiTuongDC();

		this.list_button = CommonService.list_button();
		if (this.NienHanDoiTuongService !== undefined) {
			this.NienHanDoiTuongService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.SoTheoDoi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.DungCu = '';
		this.gridModel.filterText.DoiTuong = '';

		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'SoHoSo',
				displayName: 'Số hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'SoTheoDoi',
				displayName: 'Số sổ theo dõi',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'DungCu',
				displayName: 'Dụng cụ chỉnh hình',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'DoiTuong',
				displayName: 'Đối tượng trang cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'DistrictName',
				displayName: 'Huyện',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'Title',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'NienHan',
				displayName: 'Niên hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'SoTien',
				displayName: 'Số tiền',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 13,
				name: 'NgayCap',
				displayName: 'Ngày cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 14,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 15,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 16,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 17,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false,
			},
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
		this.gridService.cookieName = 'displayedColumns_nienhandoituong'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nienhandoituong'));

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
		this.dataSource = new NienHanDoiTuongDataSource(this.NienHanDoiTuongService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.NienHanDoiTuongService.lastFilter$.getValue();
			queryParams.filter['Nam'] = this.nam;
			// First load
			this.dataSource.loadListQL(queryParams);
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

	loadListDoiTuongDC(){
		this.CommonService.liteDoiTuongDC().subscribe((res) => {
			this.listDoiTuong = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	loadDataList(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadListQL(queryParams);
	}

	changeNam() {
		this.loadDataList();
	}

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.loadDataList();
	}

	filterWardD(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterDoiTuongID(id: any) {
		this.filterdoituong = id;
		this.loadDataList();
	}

	filterConfiguration(): any {

		const filter: any = {};
		if (this.filterdistrict > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward > 0) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.filterdoituong > 0) {
			filter.Id_DoiTuong = +this.filterdoituong;
		}

		if (this.gridService.model.filterText) {
			filter.SoTheoDoi = this.gridService.model.filterText.SoTheoDoi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.DungCu = this.gridService.model.filterText.DungCu;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
		}
		filter.Nam = this.nam;
		return filter;
	}

	export(loai: number) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
		);
		queryParams.filter.loai = loai;
		this.NienHanDoiTuongService.exportListQL(queryParams).subscribe(response => {
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
}
