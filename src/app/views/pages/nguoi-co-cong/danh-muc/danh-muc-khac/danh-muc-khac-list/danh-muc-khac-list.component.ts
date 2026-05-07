import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatMenuTrigger, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { TokenStorage } from './../../../../../../core/auth/_services/token-storage.service';
import { DanhMucKhacService } from '../Services/danh-muc-khac.service';
import { DanhmuckhacModel } from '../Models/danh-muc-khac.model';
import { loaiDieuDuongModel } from './../../loai-dieu-duong/Model/loaidieuduong.model';
import { DanhMucKhacDataSource } from './../Models/data-sources/danh-muc-khac.datasource';
import { DanhmuckhacDetailComponent } from './../danhmuckhac-detail/danhmuckhac-detail.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-danh-muc-khac-list',
	templateUrl: './danh-muc-khac-list.component.html'
})
export class DanhMucKhacListComponent implements OnInit {
	dataSource: DanhMucKhacDataSource | undefined;
	haveFilter: boolean = false;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	_name: string = "";
	_listHoso: any;

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService,
		private apiService: DanhMucKhacService) {
		this._name = this.translate.instant("LOAIHOSO.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})

		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['MaLoaiHoSo'] = "";
		this.gridModel.filterText['LoaiHoSo'] = "";
		this.gridModel.filterText['MoTa'] = "";
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

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
				name: 'MaLoaiHoSo',
				displayName: 'Mã loại hồ sơ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'LoaiHoSo',
				displayName: 'Loại hồ sơ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Id_DoiTuongNCC',
				displayName: 'Đối tượng NCC',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: false
			},
			//{
			//	stt: 5,
			//	name: 'MauCongNhan',
			//	displayName: 'Mẫu công nhận',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			//{

			//	stt: 6,
			//	name: 'LoaiGiayTo',
			//	displayName: 'Loại giấy tờ',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			//{

			//	stt: 7,
			//	name: 'LoaiGiayToCC',
			//	displayName: 'Loại giấy tờ căn cứ',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{

				stt: 10,
				name: 'config',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			},
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

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

		this.dataSource = new DanhMucKhacDataSource(this.apiService);
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.MaLoaiHoSo = this.gridService.model.filterText['MaLoaiHoSo'];
			filter.LoaiHoSo = this.gridService.model.filterText['LoaiHoSo'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		return filter;
	}


	Add() {
		let item = new DanhmuckhacModel();
		item.clear();
		this.Config(item);
	}

	Config(_item: any, allowEdit = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DanhmuckhacDetailComponent, { data: { _item: _item, allowEdit: allowEdit } });
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
}