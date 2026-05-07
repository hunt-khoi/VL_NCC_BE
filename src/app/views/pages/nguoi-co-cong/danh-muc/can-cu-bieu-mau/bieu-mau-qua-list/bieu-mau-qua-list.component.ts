import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { BieuMauQuaService } from '../Services/bieu-mau-qua.service';
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { BieuMauQuaEditDialogComponent } from '../bieu-mau-qua-edit/bieu-mau-qua-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-bieu-mau-qua-list',
	templateUrl: './bieu-mau-qua-list.component.html'
})
export class BieuMauQuaListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = "";
	gridService: TableService | undefined;
	girdModel: TableModel | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private bmService: BieuMauQuaService) {
		this._name = this.translate.instant("BIEUMAU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.girdModel = new TableModel();
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
		this.gridService.cookieName = 'displayedColumns_bieumau';
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_bieumau'));

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

		this.dataSource = new CanCuBieuMauDataSource(null, null, this.bmService);
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				let queryParams = this.bmService.lastFilter$.getValue();
				this.dataSource.loadListBieuMauQua(queryParams);
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
		this.dataSource.loadListBieuMauQua(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.BieuMau = this.gridService.model.filterText['BieuMau'];
			filter.Version = this.gridService.model.filterText['Version'];
		}
		return filter;
	}

	Edit(_item: any, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(BieuMauQuaEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}
}