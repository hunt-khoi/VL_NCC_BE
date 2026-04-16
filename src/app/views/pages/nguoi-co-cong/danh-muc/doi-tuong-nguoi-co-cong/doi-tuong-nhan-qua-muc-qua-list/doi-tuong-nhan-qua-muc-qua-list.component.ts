import { CommonService } from '../../../services/common.service';
import { TableService } from './../../../../../partials/table/table.service';
import { TableModel } from './../../../../../partials/table/table.model';
import { DoiTuongNhanQuaModel } from './../Model/doi-tuong-nguoi-co-cong.model';
import { DoiTuongNguoiCoCongService } from './../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongNguoiCoCongModule } from './../doi-tuong-nguoi-co-cong.module';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoiTuongNhanQuaDataSource } from '../Model/data-sources/doi-tuong-nhan-qua.datasource';
import { DoiTuongNhanQuaMucQuaComponent } from '../doi-tuong-nhan-qua-muc-qua/doi-tuong-nhan-qua-muc-qua.component';
import { UpdateMucQuaDialogComponent } from '../update-muc-qua/update-muc-qua.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dm-doi-tuong-nhan-qua-muc-qua-list',
	templateUrl: './doi-tuong-nhan-qua-muc-qua-list.component.html',
})
export class DoiTuongNhanQuaMucQuaListComponent implements OnInit {

	// Table fields
	dataSource: DoiTuongNhanQuaDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterStatus = '';
	filterType = '';
	listLoai: any[] = [];
	listNhomLeTet: any[] = [];
	listNguon: any[] = [];
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

	constructor(
		public doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private translate: TranslateService) {
		this._name = this.translate.instant('DOITUONGNHANQUA.MUCQUA');
		this._DOITUONG = this.translate.instant('DOITUONGNHANQUA.DOITUONG');
		this._MADOITUONG = this.translate.instant('DOITUONGNHANQUA.MADOITUONG');
		this._MOTA = this.translate.instant('DOITUONGNHANQUA.MOTA');
		this._LOAI = this.translate.instant('DOITUONGNHANQUA.LOAI');
		this._LOCKED = this.translate.instant('DOITUONGNHANQUA.LOCKED');
		this._PRIORITY = this.translate.instant('DOITUONGNHANQUA.PRIORITY');
		this._ACTIONS = this.translate.instant('COMMON.TACVU');
		this._STT = this.translate.instant('COMMON.STT');
		this._CREATEDBY = this.translate.instant('DOITUONGNHANQUA.CREATEDBY');
		this._CREATEDDATE = this.translate.instant('DOITUONGNHANQUA.CREATEDDATE');
		this._NHOMLOAIDOITUONGNCC = this.translate.instant('DOITUONGNHANQUA.NHOMLOAIDOITUONGNCC');
		this._UPDATED_BY = this.translate.instant('COMMON.UPDATED_BY');
		this._UPDATED_DATE = this.translate.instant('COMMON.UPDATED_DATE');
	}

	/** LOAD DATA */
	async ngOnInit() {
		this.list_button = CommonService.list_button();
		await this.loadNhom();
		// filter
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
		];
		
		for (var i = 0; i < this.listNhomLeTet.length; i++) {
			for (var j = 0; j < this.listNguon.length; j++) {
				availableColumns.push(
					{
						stt: i + 10,
						name: 'Nhom' + i + j,
						displayName: this.listNhomLeTet[i].title + " - " + this.listNguon[j].title,
						alwaysChecked: false,
						isShow: true,
					});
			}
		}
		availableColumns.push(
			{
				stt: 99,
				name: 'actions',
				displayName: this._ACTIONS,
				alwaysChecked: true,
				isShow: true,
			});
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
			this.cookieService,
		);
		this.gridService.cookieName = 'displayedColumns_dtnq_mq'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dtnq_mq'));
		this.LoadFilterGroupData();

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
		this.dataSource = new DoiTuongNhanQuaDataSource(this.doiTuongNguoiCoCongService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.doiTuongNguoiCoCongService.lastFilterNQ$.getValue();
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

	async loadNhom() {
		await this.CommonService.liteNhomLeTet().toPromise().then(res => {
			this.listNhomLeTet = res.data;
			//this.changeDetectorRefs.detectChanges();
		});

		await this.CommonService.liteNguonKinhPhi().toPromise().then(res => {
			this.listNguon = res.data;
			//this.changeDetectorRefs.detectChanges();
		})
	}

	getvalue(item, id_nhom, id_nguon) {
		let f = item.Details.find(x => +x.Id_NhomLeTet == +id_nhom && +x.Id_NguonKinhPhi == +id_nguon);
		if (f != null)
			return f.SoTien;
		return '';
	}

	/* HÀM LOAD FILTER GROUPDATA
	*/
	LoadFilterGroupData() {
		this.CommonService.liteNhomLoaiDoiTuongNCC().subscribe(res => {
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked.NhomLoaiDoiTuongNCC = res.data.map(x => {
					return {
						id: x.id,
						name: x.title,
						value: x.id,
						checked: false
					};
				});
			} else {
				this.gridService.model.filterGroupDataChecked.NhomLoaiDoiTuongNCC = [];
			}
			this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
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
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterType && this.filterType.length > 0) {
			filter.type = +this.filterType;
		}
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

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	updatemuc(_item: DoiTuongNhanQuaModel, allowEdit: boolean = true) {
		let temp = Object.assign({}, _item);
		const dialogRef = this.dialog.open(DoiTuongNhanQuaMucQuaComponent, { data: { _item: temp, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
				this.layoutUtilsService.showInfo('Cập nhật mức quà cho đối tượng thành công');
			}
		});
	}
	UpdateMucQua() {
		const dialogRef = this.dialog.open(UpdateMucQuaDialogComponent, {});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
				this.layoutUtilsService.showInfo('Cập nhật mức quà thành công');
			}
		});
	}
}
