import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { DotTangQuaModel } from '../Model/de-xuat-tang-qua.model';
import { DeXuatModel } from '../../de-xuat/Model/de-xuat.model';
import { DeXuatTangQuaService } from '../Services/de-xuat-tang-qua.service';
import { DeXuatTangQuaDataSource } from '../Model/data-sources/de-xuat-tang-qua.datasource';
import { DeXuatEditDialogComponent } from '../../de-xuat/de-xuat-edit/de-xuat-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-de-xuat-tang-qua-list',
	templateUrl: './de-xuat-tang-qua-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DeXuatTQListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: DeXuatTangQuaDataSource | undefined;
	@Input() donvi: any;
	@Input() nam: number = 0;
	@Input() dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<DotTangQuaModel>(true, []);
	productsResult: DotTangQuaModel[] = [];
	lstStatus: any[] = [];
	_name = "";
	Capcocau = 3;

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	visibleGuiDuyet: boolean = false;
	vivibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;
	requiredImportFirst: boolean = false;

	constructor(public apiService: DeXuatTangQuaService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = "Đợt tặng quà cần đề xuất";
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotTangQua'] = "";

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
				name: 'DotTangQua',
				displayName: 'Đợt tặng quà lễ tết',
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

		// Init DataSource
		this.dataSource = new DeXuatTangQuaDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
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

	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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
		if (this.nam) {
			filter.Nam = this.nam;
		}
		if (this.dot > 0) {
			filter.Id_DotTangQua = this.dot;
		}
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DotTangQua = this.gridService.model.filterText['DotTangQua'];
		}
		return filter; 
	}


	Add(Id_Dot: number) {
		const DeXuatModels = new DeXuatModel();
		DeXuatModels.clear(); // Set all defaults fields
		DeXuatModels.Id_DotTangQua = Id_Dot
		this.Edit(DeXuatModels);
	}

	Edit(_item: DeXuatModel) {
		let addDeXuat = true;
		let allowEdit = true;
		const _saveMessage = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: 'đề xuất' });
		const dialogRef = this.dialog.open(DeXuatEditDialogComponent, 
			{ data: { _item, allowEdit, addDeXuat }, width:'80%', disableClose: true });
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