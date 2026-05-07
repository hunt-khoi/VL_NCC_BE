import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectorRef, OnChanges, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { DM_DonViService } from '../Services/dm-don-vi.service';
import { DM_User_DonViModel } from '../Model/dm-don-vi.model';
import { DM_NguoiDungDonViDataSource } from '../Model/data-sources/dm-nguoi-dung-don-vi.datasource';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dm-nguoi-dung-don-vi-list',
	templateUrl: './dm-nguoi-dung-don-vi-list.component.html',
})

export class DmNguoiDungDonViListComponent implements OnChanges {
	@Input() donvi: string = "";
	// Table fields
	dataSource: DM_NguoiDungDonViDataSource | undefined;
	displayedColumns = [];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

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
	haveFilter: boolean = false;

	previousIndex: number = 0;
	dataTreeDonVi: any[] = [];
	//filter group 
    gridService: TableService | undefined;
    gridModel: TableModel | undefined;

	constructor(
		private dm_donvisService: DM_DonViService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private changeDetect: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnChanges() {
		//#region ***Filter***
		this.gridModel= new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['Username'] = "";
		this.gridModel.filterText['FullName'] = "";
		this.gridModel.filterText['ChucVu'] = "";
		this.gridModel.filterText['Email'] = "";
		this.gridModel.filterText['PhoneNumber'] = "";

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
		this.gridModel.filterGroupDataChecked['Active'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		//#endregion ***Filter***
		this.gridModel.availableColumns = this.availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);	

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

        if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new DM_NguoiDungDonViDataSource(this.dm_donvisService);
		let queryParams = new QueryParamsModel({});
		if (this.donvi) {
			this.loadList();
		}
		else {
			// // Read from URL itemId, for restore previous state
			this.route.queryParams.subscribe(_ => {
				if (this.dataSource) {
					queryParams = this.dm_donvisService.lastFilter$.getValue();
					this.dataSource.loadDM_User_DonVis(queryParams);
				}
			});
			
		}
		this.dataSource.entitySubject.subscribe(res => {
			this.dm_donvisResult = res;
			this.tmpdm_donvisResult = [];
			if (this.dm_donvisResult != null) {
				for (let i = 0; i < this.dm_donvisResult.length; i++) {
					let tmpElement = new DM_User_DonViModel();
					tmpElement.copy(this.dm_donvisResult[i])
					this.tmpdm_donvisResult.push(tmpElement);
				}
			}
		});
	}

	loadList(holdCurrentPage: boolean = false) {
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
		this.dataSource.loadDM_User_DonVis(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.donvi) {
			filter.IdDV = this.donvi;
		}
		if (this.gridService && this.gridService.model.filterText) {
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