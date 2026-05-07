import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatMenuTrigger, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { NoiDungChiModel } from '../Models/danh-muc-khac.model';
import { TableService } from './../../../../../partials/table/table.service';
import { NoiDungChiService } from '../Services/noi-dung-chi.service';
import { NoDungChiDataSource } from '../Models/data-sources/noi-dung-chi.datasource';
import { CookieService } from 'ngx-cookie-service';
import { NoiDungChiDetailComponent } from '../noi-dung-chi-detail/noi-dung-chi-detail.component';

@Component({
	selector: 'kt-noi-dung-chi-list',
	templateUrl: './noi-dung-chi-list.component.html'
})

export class NoiDungChiListComponent implements OnInit {
	dataSource: NoDungChiDataSource | undefined;
	haveFilter: boolean = false;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = "";
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private translate: TranslateService,
		private apiService: NoiDungChiService) {
			this._name = this.translate.instant("NOIDUNGCHI.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['NoiDung'] = "";
		this.gridModel.filterText['GhiChu'] = "";
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
				stt: 3,
				name: 'NoiDung',
				displayName: 'Nội dung',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'GhiChu',
				displayName: 'Ghi chú',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'config',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			},
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
						this.loadDataList();
					})
				).subscribe();
		}

		this.dataSource = new NoDungChiDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.NoiDung = this.gridService.model.filterText['NoiDung'];
			filter.GhiChu = this.gridService.model.filterText['GhiChu'];
		}
		return filter;
	}

	Add() {
		let item = new NoiDungChiModel();
		item.clear();
		this.Config(item);
	}

	Config(_item: any, allowEdit = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NoiDungChiDetailComponent, { data: { _item: _item, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	Delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}
}