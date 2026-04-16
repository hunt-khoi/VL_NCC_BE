import { LoaiQuyetDinhDetailComponent } from './../loai-quyet-dinh-detail/loai-quyet-dinh-detail.component';
import { LoaiQuyetDinhDataSource } from './../Models/data-sources/loai-quyet-dinh.datasource';
import { LoaiQuyetDinhService } from './../services/loai-quyet-dinh.service';
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
import { TokenStorage } from './../../../../../../core/auth/_services/token-storage.service';
import { loaiDieuDuongModel } from './../../loai-dieu-duong/Model/loaidieuduong.model';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-loai-quyet-dinh-list',
	templateUrl: './loai-quyet-dinh-list.component.html'
})

export class LoaiQuyetDinhListComponent implements OnInit {

	dataSource: LoaiQuyetDinhDataSource;
	haveFilter: boolean = false;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	_name: string = "";
	_listHoso: any;
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	list_button: boolean;

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private TokenStorage: TokenStorage,
		private translate: TranslateService,
		private cookieService: CookieService,
		private danhmuckhacService: LoaiQuyetDinhService) {
		this._name = this.translate.instant('NHOM_QD.NAME');
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();

		this.TokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})

		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['LoaiQuyetDinh'] = "";
		this.girdModel.filterText['MoTa'] = "";

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
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.girdModel, this.cookieService);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();


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
		let queryParams = new QueryParamsModel({});
		this.dataSource = new LoaiQuyetDinhDataSource(this.danhmuckhacService);
		this.route.queryParams.subscribe(params => {
			queryParams = this.danhmuckhacService.lastFilter$.getValue();
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {

		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.LoaiQuyetDinh = this.gridService.model.filterText['LoaiQuyetDinh'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		return filter;
	}


	AddWorkplace() {
		let item: any = {};
		item.Id = 0;
		this.Config(item);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Config(_item, allowEdit = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(LoaiQuyetDinhDetailComponent, { data: { _item: _item, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	/** Delete */
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

			this.danhmuckhacService.delete(_item.Id).subscribe(res => {
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
