import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatDatepicker } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { DSHuongBaoHiemDataSource } from '../Model/data-sources/danh-sach-huong-bh.datasource';
import { DSHuongBaoHiemService } from '../Services/danh-sach-huong-bh.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-danh-sach-huong-bh-list',
	templateUrl: './danh-sach-huong-bh-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DSHuongBaoHiemListComponent implements OnInit {
	// Table fields
	dataSource: DSHuongBaoHiemDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	
	filterStatus = '';
	filterCondition = '';
	_name = "";
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	listward: any[] = [];
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	Loai: number = 1;
	TuThang: any;

	constructor(public dsHuongBHService: DSHuongBaoHiemService,
		public CommonService: CommonService,
		private cookieService: CookieService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = this.translate.instant("Hưởng bảo hiểm");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.TuThang = moment().startOf('month');
		this.list_button = CommonService.list_button();
		if (this.dsHuongBHService !== undefined) {
			this.dsHuongBHService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} //mặc định theo priority
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

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['HoTen'] = "";
		this.gridModel.filterText['DoiTuong'] = "";
		this.gridModel.filterText['DiaChi'] = "";
		this.gridModel.filterText['TheBaoHiem'] = "";

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
	
		let availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'TheBaoHiem',
				displayName: 'Thẻ bảo hiểm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 11,
				name: 'MucDong',
				displayName: 'Mức đóng/tháng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 12,
				name: 'SoTien',
				displayName: 'Số tiền',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 13,
				name: 'GhiChu',
				displayName: 'Ghi chú',
				alwaysChecked: false,
				isShow: true
			},
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_dshuongBH'
		
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dshuongBH'));

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
		this.dataSource = new DSHuongBaoHiemDataSource(this.dsHuongBHService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.dsHuongBHService.lastFilter$.getValue();
			queryParams.filter.Loai = this.Loai;
			queryParams.filter.TuThang = this.TuThang.format('YYYY-MM-DD');
			// First load
			this.dataSource.loadList(queryParams);
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
		this.loadDataList();
	}

	filterWardD(id: any) {
		this.filterward = id;
		this.loadDataList();
	}
	chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		this.TuThang = normalizedMonth;
		datepicker.close();
		this.loadDataList();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.filterdistrict > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward > 0) {
			filter.Id_Xa = +this.filterward;
		}
		filter.TuThang = this.TuThang.format('YYYY-MM-DD');
		filter.Loai = this.Loai;

		if (this.gridService.model.filterText) {
			filter.HoTen = this.gridService.model.filterText['HoTen'];
			filter.DoiTuong = this.gridService.model.filterText['DoiTuong'];
			filter.DiaChi = this.gridService.model.filterText['DiaChi'];
			filter.TheBaoHiem = this.gridService.model.filterText['TheBaoHiem'];
		}

		return filter; //trả về đúng biến filter
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
		this.dsHuongBHService.exportList(queryParams).subscribe(response => {
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
