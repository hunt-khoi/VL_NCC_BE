import { TroCapDetailComponent } from './../tro-cap-detail/tro-cap-detail.component';
import { HoSoNCCModule } from './../../../ho-so-nguoi-co-cong/ho-so-ncc/ho-so-ncc.module';
import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './../../../services/common.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { DanhMucKhacService } from './../services/danh-muc-khac.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TableService } from './../../../../../partials/table/table.service';
import { TableModel } from './../../../../../partials/table/table.model';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { DanhMucTroCapDataSource } from './../Models/data-sources/danh-muc-khac.datasource';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DanhmucTrocapModel } from '../Models/danh-muc-tro-cap.model';
import { TroCapImportComponent } from '../tro-cap-import/tro-cap-import.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-danh-muc-loai-tro-cap',
	templateUrl: './danh-muc-loai-tro-cap.component.html',
})
export class DanhMucLoaiTroCapComponent implements OnInit {

	// Table fields
	dataSource: DanhMucTroCapDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	productsResult: HoSoNCCModule[] = [];
	_name = '';
	objectId = '';
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	_user: any = {};
	list_button: boolean;

	constructor(
		private router: Router,
		private actRoute: ActivatedRoute,
		public objectService: DanhMucKhacService,
		private cookieService: CookieService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService) {
		this._name = this.translate.instant("TROCAP.NAME"); 
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MaTroCap = '';
		this.gridModel.filterText.TroCap = '';

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 0,
				name: 'Id',
				displayName: 'Id',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 1,
				name: 'MaTroCap',
				displayName: 'Mã trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'TroCap',
				displayName: 'Trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'LoaiHoSo',
				displayName: 'Đối tượng NCC',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'TienTroCap',
				displayName: 'Tiền trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'PhuCap',
				displayName: 'Phụ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
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
		this.gridService.cookieName = 'displayedColumns_loaitrocap'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_loaitrocap'));

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
		this.dataSource = new DanhMucTroCapDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilterTC$.getValue();
			queryParams.filter.Id_NCC = this.objectId;
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
			filter.MaTroCap = this.gridService.model.filterText.MaTroCap;
			filter.TroCap = this.gridService.model.filterText.TroCap;
			filter.Id_NCC = this.objectId;
		}

		return filter;
	}


	AddWorkplace() {
		const objectModel = new DanhmucTrocapModel();
		objectModel.clear()
		this.Editobject(objectModel);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Editobject(_item: any, allowEdit: boolean = true) {
		_item.Id_NCC = this.objectId;
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(TroCapDetailComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	import() {
		const dialogRef = this.dialog.open(TroCapImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadDataList();
		});
	}

	delete(_item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteTC(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}
}
