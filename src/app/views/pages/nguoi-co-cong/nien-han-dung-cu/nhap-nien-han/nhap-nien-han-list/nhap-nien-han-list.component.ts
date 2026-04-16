import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { NhapNienHanDataSource } from '../Model/data-sources/nhap-nien-han.datasource';
import { NhapNienHanService } from '../Services/nhap-nien-han.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { NienHanEditDialogComponent } from '../../nien-han/nien-han-edit/nien-han-edit.dialog.component';
import { NienHanModel } from '../../nien-han/Model/nien-han.model';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-nhap-nien-han-list',
	templateUrl: './nhap-nien-han-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NhapNienHanListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: NhapNienHanDataSource;
	@Input() donvi: any;
	@Input() nam: number;
	@Input() dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	_name = "";
	Capcocau = 3;

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	requiredImportFirst: boolean = false;
	list_button: boolean;

	constructor(public NienHanService: NhapNienHanService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = "Đợt niên hạn cần nhập";
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotNienHan'] = "";

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
				name: 'DotNienHan',
				displayName: 'Đợt nhập niên hạn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 5,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 6,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 7,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)


		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new NhapNienHanDataSource(this.NienHanService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.NienHanService.lastFilter$.getValue();
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
	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.nam)
			filter.Nam = this.nam;
		if (this.dot > 0)
			filter.Id_Dot = this.dot;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.DotNienHan = this.gridService.model.filterText['DotNienHan'];
		}

		return filter; 
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Giao(Id_Dot) {
		const _title = this.translate.instant('Giao nhập niên hạn');
		const _description = this.translate.instant('Bạn có chắc muốn giao nhập niên hạn cho xã');
		const _waitDesciption = this.translate.instant('Nhập niên hạn đang được giao...');
		const _deleteMessage = this.translate.instant('Giao thành công');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NienHanService.giao(Id_Dot).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	AddWorkplace(item) {
		const NienHanModels = new NienHanModel();
		NienHanModels.clear(); // Set all defaults fields
		NienHanModels.Id_Dot = item.Id;
		NienHanModels.Nam = item.Nam;
		if (item.Id_TroCapCha > 0) {
			NienHanModels.Id_Parent = item.Id_TroCapCha;
		}
		this.EditNhom(NienHanModels);
	}

	EditNhom(_item: NienHanModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam = 'OBJECT.EDIT.ADD_MESSAGE';
		let addDeXuat = true;
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: 'niên hạn' });
		const dialogRef = this.dialog.open(NienHanEditDialogComponent, { data: { _item, allowEdit, addDeXuat }, width:'80%', disableClose: true });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
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

}
