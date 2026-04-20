import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Services
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { HoSoNCCModule } from './../../ho-so-ncc/ho-so-ncc.module';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { ThanNhanModel } from '../../than-nhan/Model/than-nhan.model';
import { ThanNhanService } from './../Services/than-nhan.service';
import { ThanNhanDataSource } from '../../than-nhan/Model/data-sources/than-nhan.datasource';
import { ThanNhanEditDialogComponent } from './../than-nhan-edit/than-nhan-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-than-nhan-list',
	templateUrl: './than-nhan-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThanNhanListComponent implements OnInit {

	// Table fields
	dataSource: ThanNhanDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];
	_name = '';
	objectId = '';
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	_user: any = {};
	list_button: boolean = false;

	constructor(
		private router: Router,
		public objectService: ThanNhanService,
		private hosoService: HoSoNCCService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commomService: CommonService,
		private detechChange: ChangeDetectorRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('THANNHAN.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		var arr = this.router.url.split("/");
		if (arr.length > 1) {
			this.objectId = arr[arr.length - 2];
			this.hosoService.getItem(+this.objectId).subscribe(res => {
				if (res && res.status === 1) {
					this._user = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.detechChange.detectChanges();
			});
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
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
				stt: 2,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'Id_QHGiaDinh',
				displayName: 'Quan hệ gia đình',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'IsThoCung',
				displayName: 'Là người thờ cúng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 12,
				name: 'SoHoSo',
				displayName: 'Số hồ sơ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 13,
				name: 'NguyenQuan',
				displayName: 'Nguyên quán',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
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
		this.gridService.cookieName = 'displayedColumnsThanNhanNCC';
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumnsThanNhanNCC'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new ThanNhanDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				queryParams.filter.Id_NCC = this.objectId;
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.detechChange.detectChanges();
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
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
		queryParams.filter.Id_NCC = this.objectId;
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.Id_NCC = this.objectId;
		}
		return filter;
	}

	/** Delete */
	Delete(_item: ThanNhanModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.Delete(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
					this.loadDataList();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}
	
	setThoCung($event: any, item: any) {
		if(item.IsCanCu) return;
		$event.preventDefault();
		let title = "Cập nhật người thờ cúng";
		let message = "Bạn có chắc muốn thay đổi người thờ cúng";
		let waiting_mess = "Yêu cầu đang được xử lý"
		const dialogRef = this.layoutUtilsService.deleteElement(title, message, waiting_mess);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			let id_tn = 0;
			//k thờ cúng->set thờ cúng
			if (!item.IsThoCung) id_tn = item.Id;
			this.objectService.SetThoCung(id_tn, +this.objectId).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo("Thay đổi người thờ cúng thành công");
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Add() {
		const objectModel = new ThanNhanModel();
		objectModel.clear(); // Set all defaults fields
		this.Edit(objectModel);
	}

	Edit(_item: ThanNhanModel, allowEdit: boolean = true) {
		let id_ncc = this.objectId;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(ThanNhanEditDialogComponent, { data: { _item, allowEdit, id_ncc } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
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