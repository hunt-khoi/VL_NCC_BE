import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { ActivatedRoute } from '@angular/router';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatMenuTrigger, MatDialog } from '@angular/material';
import { loaiDieuDuongModel } from './../../loai-dieu-duong/Model/loaidieuduong.model';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { BieuMauQuaService } from '../services/bieu-mau-qua.service';
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { BieuMauQuaEditDialogComponent } from '../bieu-mau-qua-edit/bieu-mau-qua-edit.dialog.component';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-bieu-mau-qua-list',
	templateUrl: './bieu-mau-qua-list.component.html'
})
export class BieuMauQuaListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	_name: string = "";
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	list_button: boolean;
	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private bmService: BieuMauQuaService,
		private commonService: CommonService
	) {
		this._name = this.translate.instant("BIEUMAU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['BieuMau'] = "";
		this.girdModel.filterText['Version'] = "";


		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);

		//#region ***Drag Drop***
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
				name: 'BieuMau',
				displayName: 'Biểu mẫu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Version',
				displayName: 'Phiên bản',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 8,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 9,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 10,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			},
		];
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_bieumau'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_bieumau'));


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
		// this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.dataSource = new CanCuBieuMauDataSource(null, null, this.bmService);
		this.route.queryParams.subscribe(params => {
			let queryParams = this.bmService.lastFilter$.getValue();
			// First load
			this.dataSource.loadListBieuMauQua(queryParams);
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

	ngOnDestroy() {
		this.gridService.Clear();
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
		this.dataSource.loadListBieuMauQua(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.BieuMau = this.gridService.model.filterText['BieuMau'];
			filter.Version = this.gridService.model.filterText['Version'];
		}
		return filter;
	}

	Edit(_item, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(BieuMauQuaEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}
}
