import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
// RXJS
import { tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { dottangquaDataSource } from '../Model/data-sources/dot-tang-qua.datasource';
import { dottangquaModel } from '../Model/dot-tang-qua.model';
import { dottangquaService } from '../Services/dot-tang-qua.service';
import { dottangquannewEditDialogComponent } from '../dot-tang-qua-new-edit/dot-tang-qua-new-edit.dialog.component';
import { dottangquaEditDialogComponent } from '../dot-tang-qua-edit/dot-tang-qua-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-dot-tang-qua-list',
	templateUrl: './dot-tang-qua-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class dottangquaListComponent implements OnInit {
	// Table fields
	dataSource: dottangquaDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<dottangquaModel>(true, []);
	productsResult: dottangquaModel[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	list_button: boolean;

	constructor(public dottangquaService1: dottangquaService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private cookieService: CookieService,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DOT_TANG_QUA.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		if (this.dottangquaService1 !== undefined) {
			this.dottangquaService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} //mặc định theo priority

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotTangQua'] = "";
		this.gridModel.filterText['MoTa'] = "";

		this.gridModel.disableButtonFilter['Locked'] = true;
		this.gridModel.disableButtonFilter['Id_NhomLeTet'] = true;

		let optionsTinhTrang = [
			{
				name: 'Đã khóa',
				value: 'True', //ko in hoa ko nhận
			},
			{
				name: 'Hoạt động',
				value: 'False',
			}
		];

		this.gridModel.filterGroupDataChecked['Locked'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.CommonService.liteNhomLeTet().subscribe(res => {
			this.gridService.model.filterGroupDataChecked['Id_NhomLeTet'] = res.data.map(x => {
				return {
					name: x.title,
					value: x.id,
					checked: false
				}
			});
			this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
		})
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
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true
			},
			//{
			//	stt: 6,
			//	name: 'Id_NguonKinhPhi',
			//	displayName: 'Nguồn kinh phí',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{
				stt: 7,
				name: 'Id_NhomLeTet',
				displayName: 'Nhóm lễ tết',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'Locked',
				displayName: 'Locked',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 11,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 12,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 13,
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


		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_dtq'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dtq'));
		this.LoadFilterGroupData(); //load group

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
		this.dataSource = new dottangquaDataSource(this.dottangquaService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.dottangquaService1.lastFilter$.getValue();
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

	/* HÀM LOAD FILTER GROUPDATA
	*/
	LoadFilterGroupData() {
		this.CommonService.liteNhomLeTet().subscribe(res => {
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked.Id_NhomLeTet = res.data.map(x => {
					return {
						id: x.id,
						name: x.title,
						value: x.id,
						checked: false
					};
				});
			} else {
				this.gridService.model.filterGroupDataChecked.Id_NhomLeTet = [];
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
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.DotTangQua = this.gridService.model.filterText['DotTangQua'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
			if (this.gridService.model.filterText['Nam'])
				filter.Nam = this.gridService.model.filterText['Nam'];
		}

		return filter; //trả về đúng biến filter
	}

	/** Delete */
	DeleteWorkplace(_item: dottangquaModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.dottangquaService1.deleteItem(_item.Id).subscribe(res => {
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

	//Khóa
	BlockWorkplace(_item: dottangquaModel) {
		let _description = '';
		let _waitDesciption = '';
		let _title = '';
		let Locked = false;
		if (_item.Locked == false) {
			_description = 'Bạn có chắc chắn muốn khóa đợt tặng quà này không ?';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Khóa đợt tặng quà';
			Locked = true;
		}
		else {
			_description = 'Bạn có chắc chắn muốn mở khóa đợt tặng quà này không ?';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Mở khóa đợt tặng quà';
			Locked = false;
		}

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption); //thay đổi titile là ra confirm khác
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList(); //để không biến mất ổ khóa
				return;
			}
			this.dottangquaService1.lock(_item.Id, Locked).subscribe(res => {
				if (res && res.status === 1) {
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});

	}

	AddWorkplace() {
		const dottangquaModels = new dottangquaModel();
		dottangquaModels.clear(); // Set all defaults fields
		this.EditNhom(dottangquaModels);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	EditNhom(_item: dottangquaModel, allowEdit: boolean = true) {
		//câu thông báo khi thực hiện trong tác vụ
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		let dialogRef;
		if (_item.Id == 0)
			dialogRef = this.dialog.open(dottangquannewEditDialogComponent, { data: { _item, allowEdit }, width: '80%' });
		else
			dialogRef = this.dialog.open(dottangquaEditDialogComponent, { data: { _item, allowEdit }, width: '80%' });
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
	Nhanban(_item: dottangquaModel, allowEdit: boolean = true) {
		//câu thông báo khi thực hiện trong tác vụ
		let saveMessageTranslateParam = 'OBJECT.EDIT.DUPLICATE';
		let nhanban = true;
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(dottangquannewEditDialogComponent, { data: { _item, allowEdit, nhanban }, width: '80%' });
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

	//phục vụ CSS
	covertLockButton(lock: boolean): string {
		switch (lock) {
			case false:
				return 'lock_open';
			case true:
				return 'lock'
		}
	}

	covertToolTip(lock: boolean): string {
		switch (lock) {
			case true:
				return 'COMMON.UNBLOCK';
			case false:
				return 'COMMON.BLOCK';
		}
	}

	covertLockToString(lock: boolean): string {
		switch (lock) {
			case true:
				return 'Đã khóa';
			case false:
				return 'Hoạt động';
		}
	}

	covertLockToColor(lock: boolean): string {
		switch (lock) {
			case false:
				return 'kt-badge--success';
			case true:
				return 'kt-badge--metal';
		}
	}
}
