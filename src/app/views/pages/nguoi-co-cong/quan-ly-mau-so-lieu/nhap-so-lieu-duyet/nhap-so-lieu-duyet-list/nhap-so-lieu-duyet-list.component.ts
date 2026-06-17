import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { tap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { SettingProcessComponent } from '../../../components';
import { NhapSoLieuModel } from '../../nhap-so-lieu/Model/nhap-so-lieu.model';
import { NhapSoLieuDuyetService } from '../Services/nhap-so-lieu-duyet.service';
import { NhapSoLieuDuyetDataSource } from '../Model/data-sources/nhap-so-lieu-duyet.datasource';
import { NhapSoLieuDuyetDialogComponent } from '../nhap-so-lieu-duyet/nhap-so-lieu-duyet-dialog.component';
import { NhapSoLieuEditDialogComponent } from '../../nhap-so-lieu/nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-nhap-so-lieu-duyet-list',
	templateUrl: './nhap-so-lieu-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NhapSoLieuDuyetListComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	// Table fields
	dataSource: NhapSoLieuDuyetDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = '';
	// filter District
	filterprovinces: number = 0;
	filterdistrict: number = 0;
	filterDonVi: number = 0;
	listprovinces: any[] = [];
	listdistrict: any[] = [];
	listDonViTheoMauSoLieu: any[] = [];
	listDonVi: any[] = [];

	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;

	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	idCommentShowDialog = 0;
	list_button: boolean  = false;
	btnClass: string = "";

	constructor(
		private objectService: NhapSoLieuDuyetService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
			this._name = this.translate.instant('MAU_SO_LIEU.nhapsl');
			this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
				this.idCommentShowDialog = +params['showcmt'];
			});
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
			if (data.IsEnable_Duyet != undefined)
				this.IsEnable_Duyet = data.IsEnable_Duyet;
		})
		this.selection = new SelectionModel<any>(true, []);
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
		});
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}

		this.commonService.GetAllProvinces().pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.listprovinces = res.data;
		});

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MauSoLieu = '';
		this.gridModel.filterText.DistrictID = this.filterdistrict;
		this.gridModel.filterGroupDataChecked['TinhTrang'] = [
			{
				name: 'Đã duyệt',
				value: 'True',
				checked: false,
			},
			{
				name: 'Chưa duyệt',
				value: 'False',
				checked: false,
			},
		];
		this.gridModel.filterGroupDataChecked['IsTre'] = [
			{
				name: 'Trễ hạn',
				value: 'True',
				checked: false,
			},
			{
				name: 'Chưa trễ hạn',
				value: 'False',
				checked: false,
			},
		];
		this.gridModel.filterGroupDataChecked['IsTre_Duyet'] = [
			{
				name: 'Trễ hạn',
				value: 'True',
				checked: false,
			},
			{
				name: 'Chưa trễ hạn',
				value: 'False',
				checked: false,
			},
		];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'MauSoLieu',
				displayName: 'Mẫu số liệu',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			//{
			//	stt: 11,
			//	name: 'TinhTrang',
			//	displayName: 'Tình trạng',
			//	alwaysChecked: false,
			//	isShow: false,
			//},
			//{
			//	stt: 12,
			//	name: 'IsTre',
			//	displayName: 'Trễ hạn',
			//	alwaysChecked: false,
			//	isShow: true,
			//},
			{
				stt: 12,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 13,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			},
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_nsldl'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nsldl'));

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
		this.dataSource = new NhapSoLieuDuyetDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				queryParams.filter.IsEnable_Duyet = this.IsEnable_Duyet;
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
		this.loadGetListDonViCoMauSoLieu();
		this.ShowDialog();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ShowDialog() {
		// if (this.idCommentShowDialog > 0) {
		// 	var _item: any = {};
		// 	_item.Id = this.idCommentShowDialog;
		// 	this.Duyet(_item, false);
		// }
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : (this.paginator.pageIndex = 0),
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadList(queryParams);
	}

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.loadDataList();
	}

	filterDonViId(id: any) {
		this.filterDonVi = id;
		this.loadDataList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		filter.IsEnable_Duyet = this.IsEnable_Duyet;

		if (this.filterdistrict > 0) 
			filter.DistrictID = +this.filterdistrict;
		if (this.filterDonVi > 0) 
			filter.Id_DonVi = +this.filterDonVi;

		if (this.gridService && this.gridService.model.filterText) {
			filter.MauSoLieu = this.gridService.model.filterText.MauSoLieu;
		}
		return filter;
	}

	/* UI */
	getItemStatusString(status: boolean = true): string {
		switch (status) {
			case true:
				return 'Đã duyệt';
			case false:
				return 'Chưa duyệt';
		}
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'success';
			case false:
				return 'metal';
		}
	}
	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadGetListDonViCoMauSoLieu() {
		if (!this.dataSource) return;
		this.dataSource.entitySubject.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			res.forEach((item: any) => {
				let check: boolean = false;
				for (const dv of this.listDonVi) {
					if (dv.Id_DonVi == item.Id_DonVi) {
						check = true;
						break;
					}
				}
				if (!check) 
					this.listDonVi.push(item);
			});
		});
	}

	Duyet(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NhapSoLieuDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				this.loadDataList();
			}
		});
	}

	duyets(duyet: boolean = true) {
		let ids = this.selection.selected.filter((x) => !x.IsEnable_Duyet).map((x) => x.Id);
		if (ids.length == 0) {
			this.layoutUtilsService.showInfo('Số liệu được chọn đã được duyêt/không duyệt trước đó');
			return;
		}
		var data = {
			ids: ids,
			value: duyet,
		};
		let tt = duyet ? 'DUYET' : 'KHONGDUYET';
		const _title = this.translate.instant('OBJECT.' + tt + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + tt + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + tt + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + tt + '.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}

			this.objectService.Duyets(data).pipe(takeUntil(this.destroy$)).subscribe((res) => {
				if (res && res.status === 1) {
					let str = ' ' + res.data.success + '/' + res.data.total;
					this.layoutUtilsService.showInfo(_deleteMessage + str);
					this.ngOnInit();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.filter((row) => !row.IsEnable_Duyet).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach((row) => {
				if (!row.IsEnable_Duyet) this.selection.select(row);
			});
		}
	}

	EditObject(_item: NhapSoLieuModel, allowEdit: boolean = true, duyetSoLieu: boolean = true) {
		const dialogRef = this.dialog.open(NhapSoLieuEditDialogComponent, { data: { _item, allowEdit, duyetSoLieu } });
		dialogRef.afterClosed().subscribe((res) => { });
	}

	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 3 } });
		dialogRef.afterClosed().subscribe(res => { });
	}

	TraLai(item: any) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NhapSoLieuDuyetDialogComponent, { data: { _item, isDuyet: true, isReturn: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) 
				this.loadDataList();
		});
	}
}