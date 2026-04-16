import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
// Models
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { wardModel } from '../Model/donvihanhchinh.model';
import { wardEditDialogComponent } from '../ward-edit/ward-edit.dialog.component';
import { QueryParamsModel, LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { TableModel } from 'app/views/partials/table';
import { TableService } from 'app/views/partials/table/table.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-ward-list',
	templateUrl: './ward-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class wardListComponent implements OnInit {
	// Table fields
	dataSource: donvihanhchinhDataSource;
	displayedColumns = ['RowID','WardName',"DistrictName", 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterprovinces: number;
	listprovinces: any[] = [];

	filterdistrict = '';
	listdistrict: any[] = [];
	// Selection
	selection = new SelectionModel<wardModel>(true, []);
	productsResult: wardModel[] = [];
	_name = '';

	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;

	constructor(
		public wardService: donvihanhchinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private danhMucService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
		this._name = this.translate.instant('WARD.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		// Load unit list
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.loadQuanHuyenChange();
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign(
			{},
			this.gridModel.filterText
		);
		this.gridModel.filterText.WardName = '';

		const availableColumns = [ 
			{
				stt: 1,
				name: 'RowID',
				displayName: 'Row ID',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'WardName',
				displayName: 'Tên phường xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'DistrictName',
				displayName: 'Tên quận huyện',
				alwaysChecked: false,
				isShow: true,
			},
			// {
			// 	stt: 4,
			// 	name: 'WardName',
			// 	displayName: 'Tên phường xã',
			// 	alwaysChecked: false,
			// 	isShow: true,
			// },
			{
				stt: 5,
				name: 'NguoiCapNhat',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'NgayCapNhat',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				isShow: true,
			}
		];

		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

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
		// Init DataSource
		this.dataSource = new donvihanhchinhDataSource(this.wardService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.wardService.lastFilterXa$.getValue();
			// First load
			this.dataSource.loadListward(queryParams);
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
			this.paginator.pageSize
		);
		this.dataSource.loadListward(queryParams);
	}

	filterConfiguration(): any {

		const filter: any = {};
		if (this.filterdistrict && this.filterdistrict.length > 0) {
			filter.DistrictID = +this.filterdistrict;
		}

		if (this.gridService.model.filterText) {
			filter.WardName = this.gridService.model.filterText.WardName?this.gridService.model.filterText.WardName:'';
			filter.DistrictName = this.gridService.model.filterText.DistrictName?this.gridService.model.filterText.DistrictName:'';
		}

		return filter;

	}

	/** Delete */
	Delete(_item: wardModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.wardService.deleteWard(_item.RowID).subscribe(res => {
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
		const districtModels = new wardModel();
		districtModels.clear(); // Set all defaults fields
		this.Update(districtModels);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	Update(_item: wardModel) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.RowID > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(wardEditDialogComponent, { data: { _item }, width: '500px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	// ====================Hàm change

	loadQuanHuyenChange() {
		this.danhMucService.GetListDistrictByProvinces(this.filterprovinces).subscribe(res => {
			this.listdistrict = res.data;
			// this.itemForm.controls['xa'].setValue('');
			this.changeDetectorRefs.detectChanges();
		});
	}

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 413;
		return tmp_height + 'px';
	}
}
