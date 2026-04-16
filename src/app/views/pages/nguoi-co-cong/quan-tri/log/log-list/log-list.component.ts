import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { LogDataSource } from '../Model/data-sources/log.datasource';
//Service
import { LogService } from '../Services/log.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
//Model
import { LogModel } from '../Model/log.model';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-log-list',
	templateUrl: './log-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class LogListComponent implements OnInit, OnDestroy {

	// Table fields
	dataSource: LogDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Filter fields
	// Selection
	selection = new SelectionModel<LogModel>(true, []);
	LogsResult: LogModel[] = [];
	tmpLogsResult: LogModel[] = [];

	haveFilter: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	tungay: any;
	denngay: any;

	ListLoaiDoiTuong: any[] = [];
	ListLoaiHanhDong: any[] = [];
	LoaiDoiTuong: string = '0';
	LoaiHanhDong: string = '0';
	IdDoiTuong: number = 0;

	gridService: TableService | undefined;
	girdModel: TableModel = new TableModel();
	displayedColumns1 = ['STT', 'Name', 'actions'];
	listFile: any[] = [];
	list_button: boolean = false;

	constructor(
		private apiService: LogService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.route.paramMap.subscribe(params => {
			this.LoaiDoiTuong = params.get('loai') || '0';
			const id = params.get('id');
			this.IdDoiTuong = id ? +id : 0;
		});
		
		if (this.IdDoiTuong == 0) {
			// let now = moment();
			// let from = now.set("date", 1)
			this.tungay = moment().subtract(1, 'days');
			this.denngay = moment();
		}

		//#region ***Filter***
		this.GetAllLoaiDoiTuong();
		this.GetAllLoaiHanhDong();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['Username'] = "";
		this.girdModel.filterText['Fullname'] = "";
		this.girdModel.filterText['IP'] = "";
		this.girdModel.filterText['HanhDong'] = "";
		this.girdModel.filterText['NoiDung'] = "";
		this.girdModel.disableButtonFilter['Locked'] = true;
		//TH1: #filter
		this.girdModel.filterGroupDataChecked = {
			"Locked": [
				{
					name: "Hoạt động",
					value: false,
					checked: false
				},
				{
					name: "Khóa",
					value: true,
					checked: false
				},
			],
		};
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			{
				stt: 1,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 2,
				name: 'Id',
				displayName: 'ID',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Username',
				displayName: 'Tên đăng nhập',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 3,
				name: 'Fullname',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'IP',
				displayName: 'IP',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'HanhDong',
				displayName: 'Hành động',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'LoaiLog',
				displayName: 'Loại đối tượng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'NoiDung',
				displayName: 'Nội dung',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'CreatedDate',
				displayName: 'Thời gian',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			}
		];

		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);
		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_log'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_log'));
		//#endregion

		this.commonService.fixedPoint = 0;

		if (this.sort && this.paginator) { 
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadLogsList(true);
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new LogDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(() => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				queryParams.filter.LoaiLog = this.LoaiDoiTuong;
				if (this.IdDoiTuong > 0)
					queryParams.filter.IdDoiTuong = this.IdDoiTuong;
				else {
					queryParams.filter.TuNgay = moment(this.tungay).format("DD/MM/YYYY");
					queryParams.filter.DenNgay = moment(this.denngay).format("DD/MM/YYYY");
				}
				this.dataSource.loadLogs(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.LogsResult = res;
			this.tmpLogsResult = [];
			if (this.LogsResult != null && this.paginator) {
				if (this.LogsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadLogsList();
				} else {
					for (let i = 0; i < this.LogsResult.length; i++) {
						let tmpElement = new LogModel();
						tmpElement.copy(this.LogsResult[i])
						this.tmpLogsResult.push(tmpElement);
					}
				}
			}
		});
		this.apiService.getFileLogs(new QueryParamsModel({})).subscribe(res => {
			this.listFile = res.data;
		})
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	GetAllLoaiDoiTuong() {
		this.commonService.Log_LoaiLog().subscribe(res => {
			this.ListLoaiDoiTuong = res.data;
		})
	}
	GetAllLoaiHanhDong() {
		this.commonService.Log_HanhDong().subscribe(res => {
			this.ListLoaiHanhDong = res.data;
		})
	}

	loadLogsList(holdCurrentPage: boolean = false) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadLogs(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.Username = this.gridService.model.filterText['Username'];
			filter.Fullname = this.gridService.model.filterText['Fullname'];
			filter.HanhDong = this.gridService.model.filterText['HanhDong'];
			filter.NoiDung = this.gridService.model.filterText['NoiDung'];
			filter.IP = this.gridService.model.filterText['IP'];
		}
		filter.LoaiLog = this.LoaiDoiTuong;
		if (this.IdDoiTuong > 0)
			filter.IdDoiTuong = this.IdDoiTuong;
		if (+this.LoaiHanhDong > 0)
			filter.LoaiHanhDong = this.LoaiHanhDong;

		if (this.tungay != undefined) {
			filter.TuNgay = moment(this.tungay).format("DD/MM/YYYY");
		}
		if (this.denngay != undefined) {
			filter.DenNgay = moment(this.denngay).format("DD/MM/YYYY");
		}
		return filter;
	}

	delete(item: any) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn có chắc muốn xóa lịch sử?';
		const _waitDesciption: string = 'Log đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.IdRow).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadLogsList(true);
			});
		});
	}

	deleteLogs() {
		const _title: string = 'Xóa lịch sử';
		const _description: string = 'Bạn có chắc muốn xóa những lịch sử này không?';
		const _waitDesciption: string = 'Lịch sử đang được xóa...';
		const _deleteMessage = `Lịch sử đã được xóa`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].Id);
			}
			this.apiService.deletes(idsForDeletion).subscribe(() => {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.loadLogsList(true);
				this.selection.clear();
			});
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.LogsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.LogsResult.forEach(row => this.selection.select(row));
		}
	}
}