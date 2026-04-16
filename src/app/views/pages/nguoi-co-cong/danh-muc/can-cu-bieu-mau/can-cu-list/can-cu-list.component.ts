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
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { BieuMauService } from '../services/bieu-mau.service';
import { CanCuService } from '../services/can-cu.service';
import { CanCuEditDialogComponent } from '../can-cu-edit/can-cu-edit.dialog.component';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-can-cu-list',
	templateUrl: './can-cu-list.component.html'
})
export class CanCuListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;
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
		public CommonService: CommonService,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private bmService: BieuMauService,
		private ccService: CanCuService
	) {
		this._name = this.translate.instant("CANCU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['SoCanCu'] = "";
		this.girdModel.filterText['CanCu'] = "";
		this.girdModel.filterText['NguoiKy'] = "";
		this.girdModel.filterText['CoQuanBanHanh'] = "";
		this.girdModel.filterText['PhanLoai'] = "";

		let optionsTinhTrang = [
			{
				name: 'Chưa có hiệu lực',
				value: 'null',
			},
			{
				name: 'Hiệu lực',
				value: 'True',
			},
			{
				name: 'Hết hiệu lực',
				value: 'False',
			}
		];

		this.girdModel.filterGroupDataChecked['IsHieuLuc'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});

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
				stt: 2,
				name: 'SoCanCu',
				displayName: 'Số căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'CanCu',
				displayName: 'Căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'NgayBanHanh',
				displayName: 'Ngày ban hành',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 4,
				name: 'HieuLuc_From',
				displayName: 'Hiệu lực từ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'HieuLuc_To',
				displayName: 'Hiệu lực đến',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 6,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 7,
				name: 'IsHieuLuc',
				displayName: 'Có hiệu lực',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 8,
				name: 'NguoiKy',
				displayName: 'Người ký',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 9,
				name: 'CoQuanBanHanh',
				displayName: 'Cơ quan ban hành',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 10,
				name: 'PhanLoai',
				displayName: 'Phân loại',
				alwaysChecked: false,
				isShow: false
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
		this.gridService.cookieName = 'displayedColumns_cancu'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_cancu'));


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
		this.dataSource = new CanCuBieuMauDataSource(this.bmService, this.ccService);
		this.route.queryParams.subscribe(params => {
			let queryParams = this.ccService.lastFilter$.getValue();
			// First load
			this.dataSource.loadListCanCu(queryParams);
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
		this.dataSource.loadListCanCu(queryParams);
	}


	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.SoCanCu = this.gridService.model.filterText['SoCanCu'];
			filter.CanCu = this.gridService.model.filterText['CanCu'];
			filter.NguoiKy = this.gridService.model.filterText['NguoiKy'];
			filter.CoQuanBanHanh = this.gridService.model.filterText['CoQuanBanHanh'];
			filter.PhanLoai = this.gridService.model.filterText['PhanLoai'];
		}
		return filter;
	}

	Add() {
		let _item: any = { Id: 0, Priority:1 };
		this.Edit(_item);
	}

	Edit(_item, allowEdit: boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(CanCuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
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

			this.ccService.Delete(_item.Id).subscribe(res => {
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

	getItemCssClassByStatus(status: boolean): string {
		if (status == null)
			return '';
		switch (status) {
			case true:
				return 'kt-badge--success';
			case false:
				return 'kt-badge--metal';
		}
	}

	getItemStatusString(status: boolean): string {
		if (status == null)
			return 'Chưa có hiệu lực'
		switch (status) {
			case true:
				return 'Hiệu lực';
			case false:
				return 'Hết hiệu lực';
		}
	}
	
	Download(object) {
		window.open(object.path, '_blank');
	}
}
