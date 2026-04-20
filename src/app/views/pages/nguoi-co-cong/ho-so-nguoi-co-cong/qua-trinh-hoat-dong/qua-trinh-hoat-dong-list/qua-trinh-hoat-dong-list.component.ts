import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { HoSoNCCModule } from '../../ho-so-ncc/ho-so-ncc.module';
import { QuaTrinhHoatDongDataSource } from '../Model/data-sources/qua-trinh-hoat-dong.datasource';
import { QuaTrinhHoatDongService } from '../Services/qua-trinh-hoat-dong.service';
import { QuaTrinhHoatDongEditDialogComponent } from '../qua-trinh-hoat-dong-edit/qua-trinh-hoat-dong-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-qua-trinh-hoat-dong-list',
	templateUrl: './qua-trinh-hoat-dong-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuaTrinhHoatDongListComponent implements OnInit {

	// Table fields
	dataSource: QuaTrinhHoatDongDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];

	_name = '';
	objectId = '';
	_user: any = {};
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public objectService: QuaTrinhHoatDongService,
		private hosoService: HoSoNCCService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private commonService: CommonService,
		private detechChange: ChangeDetectorRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('QT_HOATDONG.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		var arr = this.router.url.split("/");
		if (arr.length > 1) {
			this.objectId = arr[arr.length - 2];
			this.hosoService.getItem(+this.objectId).subscribe(res => {
				if (res && res.status === 1) {
					this._user = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.detechChange.detectChanges();
			});
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.So = '';
		this.gridModel.filterText.NoiCap = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 1,
				name: 'TuNgay',
				displayName: 'Từ ngày',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'DenNgay',
				displayName: 'Đến ngày',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'CapBac',
				displayName: 'Cấp bậc',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'ChucVu',
				displayName: 'Chức vụ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'DiaBan',
				displayName: 'Địa bàn',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 7,
				name: 'TinhTrang',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
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
		this.gridService.cookieName = 'displayedColumnsQTHoatDong';
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumnsQTHoatDong'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new QuaTrinhHoatDongDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				queryParams.sortField = 'TuNgay';
				queryParams.filter.Id_NCC = this.objectId;
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
		queryParams.filter.Id_NCC = this.objectId;
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.Id_NCC = this.objectId;
		}
		return filter;
	}

	/** Delete */
	Delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.objectService.Delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Add() {
		const objectModel: any = {}
		this.Edit(objectModel);
	}

	Edit(_item: any, allowEdit: boolean = true) {
		_item.Id_NCC = this.objectId;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(QuaTrinhHoatDongEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
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

	/* UI */
	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--success';
			case false:
				return 'kt-badge--metal';
		}
	}
}