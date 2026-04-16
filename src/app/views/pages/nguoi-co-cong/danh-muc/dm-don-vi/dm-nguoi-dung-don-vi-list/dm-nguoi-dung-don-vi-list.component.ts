import { Component, ViewChild, ChangeDetectorRef, OnChanges, Input, ApplicationRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { DM_DonViService } from '../Services/dm-don-vi.service';
import { SubheaderService } from 'app/core/_base/layout';
import { LayoutUtilsService, QueryParamsModel, MessageType } from 'app/core/_base/crud';
//Model
import { DM_DonViModel, DM_User_DonViModel } from '../Model/dm-don-vi.model';
import { DM_NguoiDungDonViDataSource } from '../Model/data-sources/dm-nguoi-dung-don-vi.datasource';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dm-nguoi-dung-don-vi-list',
	templateUrl: './dm-nguoi-dung-don-vi-list.component.html',
})

export class DmNguoiDungDonViListComponent implements OnChanges { //OnInit,
	
	@Input() donvi: string = "";
	//TH1: #filter
	filterGroupDataChecked: any = {};
	//
	filterText: any = {};
	tmpfilterText: any = {};
	filterGroupDataCheckedFake: any = {};
	filterGroupData: any = {};
	filterGroupArray: any = {};

	haveFilter: boolean = false;

	// Table fields
	dataSource: DM_NguoiDungDonViDataSource;
	displayedColumns = [];

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// @ViewChild('searchDonVi', { static: true }) searchDonVi: ElementRef;
	availableColumns = [
		// {
		// 	stt: 1,
		// 	name: 'select',
		// 	displayName: 'Check chọn',
		// 	alwaysChecked: true,
		// 	isShow: true
		// },
		{
			stt: 2,
			name: 'STT',
			displayName: 'STT',
			alwaysChecked: false,
			isShow: true
		},
		{

			stt: 4,
			name: 'Username',
			displayName: 'Tên đăng nhập',
			alwaysChecked: false,
			isShow: true
		},
		{

			stt: 5,
			name: 'FullName',
			displayName: 'Họ và tên',
			alwaysChecked: false,
			isShow: true
		},
		{

			stt: 6,
			name: 'ChucVu',
			displayName: 'Chức vụ',
			alwaysChecked: false,
			isShow: true
		},

		{

			stt: 7,
			name: 'PhoneNumber',
			displayName: 'Số điện thoại',
			alwaysChecked: false,
			isShow: true
		},

		{

			stt: 8,
			name: 'Email',
			displayName: 'Email',
			alwaysChecked: false,
			isShow: true
		},
		{

			stt: 9,
			name: 'Active',
			displayName: 'Trạng thái',
			alwaysChecked: false,
			isShow: true
		},
	];

	// Selection
	selectedColumns = new SelectionModel<any>(true, this.availableColumns);
	selection = new SelectionModel<DM_User_DonViModel>(true, []);
	dm_donvisResult: DM_User_DonViModel[] = [];
	tmpdm_donvisResult: DM_User_DonViModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	previousIndex: number;
	dataTreeDonVi: any[] = [];
	//filter group 
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	rR = {};

	constructor(
		private dm_donvisService: DM_DonViService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private subheaderService: SubheaderService,
		private changeDetect: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private layoutUtilsService: LayoutUtilsService) { }

	/** LOAD DATA */
	ngOnChanges() {
		this.tokenStorage.getUserRolesObject().subscribe(t => {
			this.rR = t;
		});
		//#region ***Filter***
		this.girdModel= new TableModel();
		this.girdModel.clear();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['Username'] = "";
		this.girdModel.filterText['FullName'] = "";
		this.girdModel.filterText['ChucVu'] = "";
		this.girdModel.filterText['Email'] = "";
		this.girdModel.filterText['PhoneNumber'] = "";

		let optionsTinhTrang = [
			{
				name: 'Khóa',
				value: '0',
			},
			{
				name: 'Hoạt động',
				value: '1',
			}
		];
		this.girdModel.filterGroupDataChecked['Active'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		//#endregion ***Filter***
		this.girdModel.availableColumns = this.availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);		
		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.girdModel, this.cookieService);

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

		// // If the DM_DonVi changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDM_DonVisList(true);
				})
			)
			.subscribe();
		// // Set title to page breadCrumbs
		this.subheaderService.setTitle('');
		// Init DataSource
		this.dataSource = new DM_NguoiDungDonViDataSource(this.dm_donvisService);
		let queryParams = new QueryParamsModel({});
		if (this.donvi) {
			this.loadDM_DonVisList();
		}
		else {
			// // Read from URL itemId, for restore previous state
			this.route.queryParams.subscribe(params => {
				if (params.id) {
					queryParams = this.dm_donvisService.lastFilter$.getValue();
				}
				// First load
				this.dataSource.loadDM_User_DonVis(queryParams);
				setTimeout(x => {
					this.loadPage();
				}, 500)
			});
			
		}
		this.dataSource.entitySubject.subscribe(res => {
			this.dm_donvisResult = res
			this.tmpdm_donvisResult = []
			if (this.dm_donvisResult != null) {
				for (let i = 0; i < this.dm_donvisResult.length; i++) {
					let tmpElement = new DM_User_DonViModel();
					tmpElement.copy(this.dm_donvisResult[i])
					this.tmpdm_donvisResult.push(tmpElement);
				}
			}
		});
	}

	loadDM_DonVisList(holdCurrentPage: boolean = false) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadDM_User_DonVis(queryParams);
		setTimeout(x => {
			this.loadPage();
		}, 500)
	}

	loadPage() {
		var arrayData = [];
		this.dataSource.entitySubject.subscribe(res => arrayData = res);
		if (arrayData && arrayData.length == 0) {
			var totalRecord = 0;
			this.dataSource.paginatorTotal$.subscribe(tt => totalRecord = tt)
			if (totalRecord > 0) {
				const queryParams = new QueryParamsModel(
					this.filterConfiguration(),
					this.sort.direction,
					this.sort.active,
					this.paginator.pageIndex = this.paginator.pageIndex - 1,
					this.paginator.pageSize,
					this.gridService.model.filterGroupData

				);
				this.dataSource.loadDM_User_DonVis(queryParams);
			}
			else {
				const queryParams = new QueryParamsModel(
					this.filterConfiguration(),
					this.sort.direction,
					this.sort.active,
					this.paginator.pageIndex = 0,
					this.paginator.pageSize,
					this.gridService.model.filterGroupData

				);
				this.dataSource.loadDM_User_DonVis(queryParams);
			}
		}
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if (this.donvi) {
			filter.IdDV = this.donvi;
		}
		if (this.gridService.model.filterText) {
			filter.Username = this.gridService.model.filterText['Username'];
			filter.FullName = this.gridService.model.filterText['FullName'];
			filter.ChucVu = this.gridService.model.filterText['ChucVu'];
			filter.PhoneNumber = this.gridService.model.filterText['PhoneNumber'];
			filter.Email = this.gridService.model.filterText['Email'];
		}
		// filter.DonVi = this.searchDonVi.nativeElement.value;
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dm_donvisResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.dm_donvisResult.forEach(row => this.selection.select(row));
		}
	}

	menuChange(e: any, type: 0 | 1 = 0) {
		this.layoutUtilsService.menuSelectColumns_On_Off();
	}

	/* UI */
	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Khóa';
			case 1:
				return 'Hoạt động';
		}
		return '';
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'kt-badge--metal';
			case 1:
				return 'kt-badge--success';
		}
		return '';
	}
}
