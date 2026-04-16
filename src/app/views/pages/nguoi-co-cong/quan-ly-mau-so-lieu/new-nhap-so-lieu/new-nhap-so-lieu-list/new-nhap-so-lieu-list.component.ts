// Angular
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Service
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { NhapSoLieuModel } from '../Model/new-nhap-so-lieu.model';
import { NhapSoLieuService } from '../../nhap-so-lieu/Services/nhap-so-lieu.service';
import { NhapSoLieuDataSource } from '../Model/data-sources/new-nhap-so-lieu.datasource';
import { NhapSoLieuEditDialogComponent } from '../../nhap-so-lieu/nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-new-nhap-so-lieu-list',
	templateUrl: './new-nhap-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NhapSoLieuListComponent implements OnInit {
	// Table fields
	dataSource: NhapSoLieuDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterStatus: number;
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;

	constructor(
		public objectService: NhapSoLieuService,
		public dialog: MatDialog,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private translate: TranslateService) {
			this._name = this.translate.instant("MAU_SO_LIEU.cannhap");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.selection = new SelectionModel<any>(true, []);
		this.route.data.subscribe(data => {
			if (data.Status)
				this.filterStatus = data.Status;
		})

		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MauSoLieu', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MauSoLieu = '';
		this.gridModel.filterText.Nam = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

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
				name: 'MauSoLieu',
				displayName: 'Mẫu số liệu',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'ThoiGian',
				displayName: 'Thời gian',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'DonVi',
				displayName: 'Đơn vị giao',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
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
		this.gridService.cookieName = 'displayedColumns_nsl'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nsl'));

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new NhapSoLieuDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(() => {
			queryParams = this.objectService.lastFilter$.getValue();
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

		// mở popup thêm từ thông báo
		this.route.params.subscribe(params => {
			const id = params['id'];
			if (id && id > 0) {
				this.objectService.getDetailMauNhap(id).subscribe(res => { 
					if (res.status == 1 && res.data) {
						let data = res.data
						let objectModel: any = {};
						objectModel.Id = 0;
						objectModel.Nam = data.Nam;
						objectModel.Id_MauSoLieu = id;
						objectModel.Id_MauSoLieu_DonVi = data.Id_MauSoLieu_DonVi;
						objectModel.MauSoLieu = data.MauSoLieu;
						this.EditObject(objectModel);
					}
				})
			}
		});
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.MauSoLieu = this.gridService.model.filterText.MauSoLieu;
			filter.Nam = this.gridService.model.filterText.Nam;
		}

		return filter;
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	EditObject(_item: NhapSoLieuModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NhapSoLieuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}


	getItemStatusString(status: number): string {
		switch (status) {
			case -1:
				return 'Không duyệt';
			case 0:
				return 'Nháp';
			case 1:
				return 'Gửi duyệt';
			case 2:
				return 'Duyệt';
		}
		return '';
	}

	AddWorkplace(object: any) {
		let objectModel: any = {};
		objectModel.Id = 0;
		objectModel.Nam = object.Nam;
		objectModel.Id_MauSoLieu = object.Id;
		objectModel.Id_MauSoLieu_DonVi = object.Id_MauSoLieu_DonVi;
		objectModel.MauSoLieu = object.MauSoLieu;
		this.EditObject(objectModel);
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

}
