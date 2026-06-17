import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, OnDestroy } from '@angular/core';
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
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { MauSoLieuModel } from '../Model/mau-so-lieu.model';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { MauSoLieuDataSource } from '../Model/data-sources/mau-so-lieu.datasource';
import { MauSoLieuGiaoDialogComponent } from '../mau-so-lieu-giao/mau-so-lieu-giao-dialog.component';
import { ListPhienBanDialogComponent } from '../list-phien-ban-dialog/list-phien-ban.dialog.component';
import { MauSoLieuEditDialogComponent } from './../mau-so-lieu-edit/mau-so-lieu-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-mau-so-lieu-list',
	templateUrl: './mau-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MauSoLieuListComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	// Table fields
	dataSource: MauSoLieuDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	_name: string = '';
	// filter District
	filterprovinces = '';
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;

	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	IsMauTheoPhong: boolean = false;
	FromChild: boolean = false;//ngc lại
	Capcocau: number = 0;
	btnClass: string = '';

	constructor(public objectService: MauSoLieuService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private activateRoute: ActivatedRoute,
		private tokenStorage: TokenStorage,
		private ref: ApplicationRef,
		private translate: TranslateService) {
			this._name = 'Mẫu số liệu';
	}

	ngOnInit() {
		this.activateRoute.url.pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res.length > 0) {
				let path = res[0].path;
				if (path == 'cap-nhat-theo-nam')
					this.IsMauTheoPhong = true;
			}
		})
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
		})

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MauSoLieu = '';
		this.gridModel.filterText.MoTa = '';
		this.gridModel.filterText.DonVi = '';
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
		this.gridModel.filterGroupDataChecked.IsMauTheoPhong = [
			{
				name: 'Mẫu theo phòng',
				value: 'True',
				checked: false
			},
			{
				name: 'Không phải mẫu theo phòng',
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
				displayName: 'Số thứ tự',
				alwaysChecked: true,
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
				name: 'IsMauTheoPhong',
				displayName: 'Mẫu theo phòng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DonVi',
				displayName: 'Đon vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 3,
				name: 'Priority',
				displayName: 'Ưu tiên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'SLGiao',
				displayName: 'Số lần giao',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'Locked',
				displayName: 'Đã khóa',
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
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_msl'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_msl'));

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
		this.dataSource = new MauSoLieuDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.activateRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				if (this.IsMauTheoPhong)
					queryParams.filter.IsMauTheoPhong = "1";
				this.dataSource.loadList(queryParams);
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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
		if (this.FromChild)
			filter.FromChild = "1";
		if (this.IsMauTheoPhong)
			filter.IsMauTheoPhong = "1";
		if (this.gridService && this.gridService.model.filterText) {
			filter.MauSoLieu = this.gridService.model.filterText.MauSoLieu;
			filter.MoTa = this.gridService.model.filterText.MoTa;
			filter.DonVi = this.gridService.model.filterText.DonVi;
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
	DeleteWorkplace(item: MauSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.deleteItem(item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	DeleteNam(item: MauSoLieuModel) {
		let temp: any = Object.assign({}, item);
		const dialogRef = this.dialog.open(ListPhienBanDialogComponent, { data: { _item: temp } });
		dialogRef.afterClosed().subscribe(res => {
			this.loadDataList();
		});
	}

	EditObject(item: MauSoLieuModel, allowEdit: boolean = true) {
		let temp: any = Object.assign({}, item);
		//check sửa xóa dựa vào SL giao của mẫu gần nhất
		if (!this.IsMauTheoPhong) {
			//Xem và sửa phiên bản năm gần nhất
			if (temp.IsMauTheoPhong && temp.MaxChild != undefined)
				temp = Object.assign({}, temp.MaxChild);
		}
		let saveMessageTranslateParam = item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(MauSoLieuEditDialogComponent, { data: { _item: temp, allowEdit, IsMauTheoPhong: this.IsMauTheoPhong }, disableClose: true });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadDataList();
				this.layoutUtilsService.showInfo(_saveMessage);
			}
		});
	}

	AddWorkplace() {
		const objectModel = new MauSoLieuModel();
		objectModel.clear(); // Set all defaults fields
		this.EditObject(objectModel);
	}

	Lock(item: MauSoLieuModel, value: boolean = false) {
		let _message = item.Locked ? 'Mở khóa thành công' : 'Khóa thành công';
		let _title;
		let _description;
		let _waitDesciption;
		if (!item.Locked) {
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
			if (!res) return;
			
			this.objectService.Lock(item.Id, value).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_message);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	BlockWorkplace(item: MauSoLieuModel) {
		let _description = '';
		let _waitDesciption = '';
		let _title = '';
		let Locked = false;
		if (!item.Locked) {
			_description = 'Bạn có chắc chắn muốn khóa mẫu số liệu này không ?';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Khóa mẫu số liệu';
			Locked = true;
		}
		else {
			_description = 'Bạn có chắc chắn muốn mở khóa mẫu số liệu này không ?';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Mở khóa mẫu số liệu';
			Locked = false;
		}
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption); //thay đổi titile là ra confirm khác
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList(); //để không biến mất ổ khóa
				return;
			}
			this.objectService.Lock(item.Id, Locked).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	EditDonVi(_item: any) {
		const dialogRef = this.dialog.open(MauSoLieuGiaoDialogComponent, { data: { _item } });
		dialogRef.afterClosed().subscribe(res => {
			this.loadDataList();
		});
	}
}