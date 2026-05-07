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
import { TableService } from './../../../../../partials/table/table.service';
import { LoaiQuyetDinhService } from '../Services/loai-quyet-dinh.service';
import { loaiDieuDuongModel } from './../../loai-dieu-duong/Model/loaidieuduong.model';
import { LoaiQuyetDinhDataSource } from './../Models/data-sources/loai-quyet-dinh.datasource';
import { LoaiQuyetDinhDetailComponent } from './../loai-quyet-dinh-detail/loai-quyet-dinh-detail.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-loai-quyet-dinh-list',
	templateUrl: './loai-quyet-dinh-list.component.html'
})

export class LoaiQuyetDinhListComponent implements OnInit {
	dataSource: LoaiQuyetDinhDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	haveFilter: boolean = false;

	_name: string = "";
	_listHoso: any;
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private cookieService: CookieService,
		private apiService: LoaiQuyetDinhService) {
		this._name = this.translate.instant('NHOM_QD.NAME');
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['LoaiQuyetDinh'] = "";
		this.gridModel.filterText['MoTa'] = "";
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
				name: 'LoaiQuyetDinh',
				displayName: 'Loại quyết định',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'MoTa',
				displayName: 'Mô tả',
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

		this.dataSource = new LoaiQuyetDinhDataSource(this.apiService);
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
			filter.LoaiQuyetDinh = this.gridService.model.filterText['LoaiQuyetDinh'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		return filter;
	}

	Add() {
		let item: any = {};
		item.Id = 0;
		this.Config(item);
	}

	Config(_item: any, allowEdit = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(LoaiQuyetDinhDetailComponent, { data: { _item: _item, allowEdit: allowEdit } });
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