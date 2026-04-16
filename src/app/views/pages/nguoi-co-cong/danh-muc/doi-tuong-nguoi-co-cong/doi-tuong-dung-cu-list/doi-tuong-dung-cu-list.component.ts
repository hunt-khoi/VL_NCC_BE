import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { DoiTuongDCCHModel } from '../Model/doi-tuong-nguoi-co-cong.model';
import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongNguoiCoCongModule } from '../doi-tuong-nguoi-co-cong.module';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoiTuongDungCuChinhHinhDataSource } from '../Model/data-sources/doi-tuong-dung-cu.datasource';
import { DoiTuongDungCuEditComponent } from '../doi-tuong-dung-cu-edit/doi-tuong-dung-cu-edit.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'kt-dm-doi-tuong-dung-cu-list',
  templateUrl: './doi-tuong-dung-cu-list.component.html',
})

export class DoiTuongDungCuListComponent implements OnInit {

    // Table fields
	dataSource: DoiTuongDungCuChinhHinhDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterStatus = '';
	filterType = '';
	listLoai: any[] = [];
	// Selection
	selection = new SelectionModel<DoiTuongNguoiCoCongModule>(true, []);
	productsResult: DoiTuongNguoiCoCongModule[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	_STT = '';
	_DOITUONG = '';
	_MADOITUONG = '';
	_MOTA = '';
	_LOCKED = '';
	_LOAI = '';
	_PRIORITY = '';
	_CREATEDBY = '';
	_CREATEDDATE = '';
	_NHOMLOAIDOITUONGNCC = '';
	_UPDATED_BY = '';
	_UPDATED_DATE = '';
	_ACTIONS = '';
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;

	filtertypes: number = 1;
	constructor(
		public doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private translate: TranslateService) {
		this._name = this.translate.instant('DOITUONGDCCH.NAME');
		this._DOITUONG = this.translate.instant('DOITUONGDCCH.DOITUONG');
		this._MADOITUONG = this.translate.instant('DOITUONGDCCH.MADOITUONG');
		this._MOTA = this.translate.instant('DOITUONGDCCH.MOTA');
		this._LOAI = this.translate.instant('DOITUONGDCCH.LOAI');
		this._LOCKED = this.translate.instant('DOITUONGDCCH.LOCKED');
		this._PRIORITY = this.translate.instant('DOITUONGDCCH.PRIORITY');
		this._ACTIONS = this.translate.instant('COMMON.TACVU');
		this._STT = this.translate.instant('COMMON.STT');
		this._CREATEDBY = this.translate.instant('DOITUONGDCCH.CREATEDBY');
		this._CREATEDDATE = this.translate.instant('DOITUONGDCCH.CREATEDDATE');
		this._UPDATED_BY = this.translate.instant('COMMON.UPDATED_BY');
		this._UPDATED_DATE = this.translate.instant('COMMON.UPDATED_DATE');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.MaDoiTuong = '';
		this.gridModel.filterText.MoTa = '';
		this.gridModel.filterText.Locked = '';
		this.gridModel.filterText.NhomLoaiDoiTuongNCC = '';

		this.gridModel.filterGroupDataChecked.Locked = [
			{
				name: 'Đã khóa',
				value: 'True',
				checked: false
			},
			{
				name: 'Hoạt động',
				value: 'False',
				checked: false
			}
		];

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 2,
				name: 'Id',
				displayName: 'ID',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'MaDoiTuong',
				displayName: this._MADOITUONG,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DoiTuong',
				displayName: this._DOITUONG,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'Priority',
				displayName: this._PRIORITY,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Locked',
				displayName: this._LOCKED,
				alwaysChecked: false,
				isShow: true,
			},

			{
				stt: 8,
				name: 'MoTa',
				displayName: this._MOTA,
				alwaysChecked: false,
				isShow: false,
			}, {
				stt: 9,
				name: 'CreatedBy',
				displayName: this._CREATEDBY,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'CreatedDate',
				displayName: this._CREATEDDATE,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'UpdatedBy',
				displayName: this._UPDATED_BY,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 12,
				name: 'UpdatedDate',
				displayName: this._UPDATED_DATE,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: this._ACTIONS,
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
		this.gridService.cookieName = 'displayedColumns_dtdungcu'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dtdungcu'));
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
		this.dataSource = new DoiTuongDungCuChinhHinhDataSource(this.doiTuongNguoiCoCongService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.doiTuongNguoiCoCongService.lastFilterDC$.getValue();
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {

		const filter: any = {};
		filter.Type = this.filtertypes;
		if (this.gridService.model.filterText) {

			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.MaDoiTuong = this.gridService.model.filterText.MaDoiTuong;
			filter.MoTa = this.gridService.model.filterText.MoTa;
		}
		return filter;
	}

	/* UI */
	getItemStatusString(status: boolean = true): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	/** Delete */
	DeleteWorkplace(_item: DoiTuongDCCHModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.doiTuongNguoiCoCongService.deleteItemDCCH(_item.Id).subscribe(res => {
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
		const doiTuongBHYTModel = new DoiTuongDCCHModel();
		doiTuongBHYTModel.clear(); // Set all defaults fields
		this.Editdoituongbaohiem(doiTuongBHYTModel);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	Editdoituongbaohiem(_item: DoiTuongDCCHModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DoiTuongDungCuEditComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	Lock(_item: DoiTuongDCCHModel, value: boolean = false) {
		let _message = _item.Locked ? 'Mở khóa thành công' : 'Khóa thành công';
		let _title;
		let _description;
		let _waitDesciption;
		if (!_item.Locked) {
			_title = this.translate.instant('OBJECT.LOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.LOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.LOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		} else {
			_title = this.translate.instant('OBJECT.UNLOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.UNLOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.UNLOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		}

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.doiTuongNguoiCoCongService.LockDCCH(_item.Id, value).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_message);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

}
