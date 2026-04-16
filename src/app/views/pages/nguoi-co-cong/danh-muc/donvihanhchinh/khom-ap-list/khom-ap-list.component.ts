import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
// Models
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { districtModel, wardModel } from '../Model/donvihanhchinh.model';
import { QueryParamsModel, LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { TableModel } from 'app/views/partials/table';
import { TableService } from 'app/views/partials/table/table.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { KhomApEditDialogComponent } from '../khom-ap-edit/khom-ap-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-khom-ap-list',
	templateUrl: './khom-ap-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class KhomApListComponent implements OnInit {
	
	// Table fields
	dataSource: donvihanhchinhDataSource;
	displayedColumns = ['RowID','Title', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterprovinces: number;
	listprovinces: any[] = [];

	filterdistrict = '';
	listdistrict: any[] = [];

	filterward = '';
	listward: any[] = [];
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
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
		this._name = 'Khóm, ấp';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		// Load unit list
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			// this.filterprovinces=this.listprovinces[0].Id_row+'';
			// this.loadDataList();
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
		this.gridModel.filterText.Title = '';
		this.gridModel.filterText.DistrictName = '';

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
				name: 'Title',
				displayName: 'Tên khóm, ấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'WardName',
				displayName: 'Tên phường xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DistrictName',
				displayName: 'Tên quận huyện',
				alwaysChecked: false,
				isShow: true,
			},
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
			queryParams = this.wardService.lastFilterKhomAp$.getValue();
			// First load
			this.dataSource.loadListKhomAp(queryParams);
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
		this.dataSource.loadListKhomAp(queryParams);
	}

	filterConfiguration(): any {

		const filter: any = {};
		if (this.filterdistrict && this.filterdistrict.length > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward && this.filterward.length > 0) {
			filter.WardID = +this.filterward;
		}

		if (this.gridService.model.filterText) {
			filter.WardName = this.gridService.model.filterText.WardName;
			filter.Title = this.gridService.model.filterText.Title;
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

			this.wardService.deleteKhomAp(_item.RowID).subscribe(res => {
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
		const dialogRef = this.dialog.open(KhomApEditDialogComponent, { data: { _item }, width: '500px' });
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
		this.loadDataList();
	}
	loadWard() {
		this.filterward = '';
		this.danhMucService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
			this.listward = res.data;
			// this.itemForm.controls['xa'].setValue('');
			this.changeDetectorRefs.detectChanges();
		});
		this.loadDataList();
	}

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 413;
		return tmp_height + 'px';
	}
}
