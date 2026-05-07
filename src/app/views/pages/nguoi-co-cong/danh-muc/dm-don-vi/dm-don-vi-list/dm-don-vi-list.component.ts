import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectionStrategy, Input, OnChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { DM_DonViModel } from '../Model/dm-don-vi.model';
import { DM_DonViService } from '../Services/dm-don-vi.service';
import { DM_DonViDataSource } from '../Model/data-sources/dm-don-vi.datasource';
import { DM_DonViEditComponent } from '../dm-don-vi-edit/dm-don-vi-edit.component';
import { DM_DonViImportComponent } from '../dm-don-vi-import/dm-don-vi-import.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-dm-don-vi-list',
	templateUrl: './dm-don-vi-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class DM_DonViListComponent implements OnChanges {
	@Input() donvi: string = "";
	@Output() ChangeTreDonVi: EventEmitter<any> = new EventEmitter<any>();
	@Output() ChangeListUser: EventEmitter<any> = new EventEmitter<any>();

	// Table fields
	dataSourceDV: DM_DonViDataSource | undefined;
	displayedColumns = [];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<DM_DonViModel>(true, []);
	dm_donvisResult: DM_DonViModel[] = [];
	tmpdm_donvisResult: DM_DonViModel[] = [];
	haveFilter: boolean = false;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	previousIndex: number = 0;
    gridService: TableService | undefined;
    gridModel: TableModel | undefined;
	dataTreeDonVi: any[] = [];

	constructor(
		private apiService: DM_DonViService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetect: ChangeDetectorRef,
		private cookieService: CookieService,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService) { }


	/** LOAD DATA */
	ngOnChanges() {
		//#region ***Filter***
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DonVi'] = "";
		this.gridModel.filterText['MaDonvi'] = "";

		let optionsTinhTrang = [
			{
				name: 'Khóa',
				value: '1',
			},
			{
				name: 'Hoạt động',
				value: '0',
			}
		];
		this.gridModel.filterGroupDataChecked['Locked'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		//#endregion ***Filter***
		
		let availableColumns = [
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'DonVi',
				displayName: 'Tên đơn vị',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'MaDonvi',
				displayName: 'Mã đơn vị',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 11,
				name: 'Locked',
				displayName: 'Trạng thái',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 12,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 15,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
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
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
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
		this.dataSourceDV = new DM_DonViDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		if (this.donvi) {
			this.loadList();
		} else {
			this.route.queryParams.subscribe(_ => {
				if (this.dataSourceDV) {
					queryParams = this.apiService.lastFilter$.getValue();
					this.dataSourceDV.loadDM_DonVis(queryParams);
				}
			});
		}
		this.dataSourceDV.entitySubject.subscribe(res => {
			this.dm_donvisResult = res;
			this.tmpdm_donvisResult = [];
			if (this.dm_donvisResult != null) {
				for (let i = 0; i < this.dm_donvisResult.length; i++) {
					let tmpElement = new DM_DonViModel();
					tmpElement.copy(this.dm_donvisResult[i])
					this.tmpdm_donvisResult.push(tmpElement);
				}
			}
		});
	}

	getListUser(event: any){
		this.ChangeListUser.emit(event)
	}

	loadList(holdCurrentPage: boolean = false) {
		if (!this.paginator || !this.sort || !this.dataSourceDV || !this.gridService) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSourceDV.loadDM_DonVis(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.donvi) {
			filter.IdDV = this.donvi
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DonVi = this.gridService.model.filterText['DonVi'];
			filter.MaDonvi = this.gridService.model.filterText['MaDonvi'];
			filter.MaDinhDanh = this.gridService.model.filterText['MaDinhDanh'];
			filter.SDT = this.gridService.model.filterText['SDT'];
			filter.Email = this.gridService.model.filterText['Email'];
			filter.DiaChi = this.gridService.model.filterText['DiaChi'];
		}
		return filter;
	}

	delete(item: DM_DonViModel) {
		const _title: string = 'Xóa đơn vị';
		const _description: string = `Bạn có chắc muốn xóa ${item.DonVi} không?`;
		const _waitDesciption: string = 'Đơn vị đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.ChangeTreDonVi.emit(res);
				this.loadList(true);
			});
		});
	}

	deletes() {
		const _title: string = 'Xóa đơn vị';
		const _description: string = 'Bạn có chắc muốn xóa những đơn vị này không?';
		const _waitDesciption: string = 'Đơn vị đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].Id);
			}
			this.apiService.deletes(idsForDeletion).subscribe(() => {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.ChangeTreDonVi.emit(res);
				this.loadList(true);
				this.selection.clear();
			});
		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dm_donvisResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.dm_donvisResult.forEach(row => this.selection.select(row));
		}
	}

	getItemStatusString(status: boolean = false): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = false): string {
		switch (status) {
			case true:
				return 'metal';
			case false:
				return 'success';
		}
	}

	add() {
		const newData = new DM_DonViModel();
		newData.clear(); // Set all defaults fields
		this.edit(newData);
	}

	edit(DM_DonVi: DM_DonViModel, IsShow: boolean = false) {
		DM_DonVi.IsShow = IsShow;
		const dialogRef = this.dialog.open(DM_DonViEditComponent, { data: { DM_DonVi } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.ChangeTreDonVi.emit(res);
			this.loadList(true);
		});
	}

	view(item: any) {
		this.edit(item, true);
	}

	ImportExcel() {
		const dialogRef = this.dialog.open(DM_DonViImportComponent);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadList();
		});
	}
}