import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Services
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCModule } from '../../ho-so-ncc/ho-so-ncc.module';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { GiayToModel } from '../Model/giay-to.model';
import { GiayToService } from '../Services/giay-to.service';
import { GiayToDataSource } from '../Model/data-sources/giay-to.datasource';
import { GiayToEditDialogComponent } from './../giay-to-edit/giay-to-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-giay-to-list',
	templateUrl: './giay-to-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GiayToListComponent implements OnInit {

	// Table fields
	dataSource: GiayToDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	objectId = '';
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	_user: any = {};
	list_button: boolean;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public objectService: GiayToService,
		private hosoService: HoSoNCCService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private detechChange: ChangeDetectorRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('GIAYTO.NAME');
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
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'So',
				displayName: 'Số',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'GiayTo',
				displayName: 'Giấy tờ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NoiCap',
				displayName: 'Nơi cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'NgayCap',
				displayName: 'Ngày cấp',
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
				stt: 11,
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
		this.gridService.cookieName = 'displayedColumnsGiayToNCC';

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumnsGiayToNCC'));

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
		this.dataSource = new GiayToDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			queryParams.sortField = 'So';
			queryParams.filter.Id_NCC = this.objectId;
			// First load
			this.dataSource.loadList(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.detechChange.detectChanges();
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
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
		queryParams.filter.Id_NCC = this.objectId;
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.So = this.gridService.model.filterText.So;
			filter.NoiCap = this.gridService.model.filterText.NoiCap;
			filter.Id_NCC = this.objectId;
		}

		return filter;
	}

	/** Delete */
	DeleteWorkplace(_item: GiayToModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}
	AddWorkplace() {
		const objectModel = new GiayToModel();
		objectModel.clear(); // Set all defaults fields
		this.Editobject(objectModel);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	Editobject(_item: GiayToModel, allowEdit: boolean = true) {
		let id_ncc = this.objectId;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(GiayToEditDialogComponent, { data: { _item, allowEdit, id_ncc } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
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
	Download(object) {
		window.open(object.path, '_blank');
	}
}
