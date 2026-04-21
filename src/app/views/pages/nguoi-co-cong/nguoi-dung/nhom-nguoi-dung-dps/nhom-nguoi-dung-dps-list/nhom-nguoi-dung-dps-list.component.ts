import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { NhomNguoiDungDPSDataSource } from '../Model/data-sources/nhom-nguoi-dung-dps.datasource';
import { NhomNguoiDungDPSService } from '../Services/nhom-nguoi-dung-dps.service';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { NhomNguoiDungDPSEditComponent } from '../nhom-nguoi-dung-dps-edit/nhom-nguoi-dung-dps-edit.component';
import { NhomNguoiDungDPSModel } from '../Model/nhom-nguoi-dung-dps.model';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { CommonService } from '../../../services/common.service';
import { PhanQuyenComponent } from '../phan-quyen/phan-quyen.component';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-nhom-nguoi-dung-dps-list',
	templateUrl: './nhom-nguoi-dung-dps-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class NhomNguoiDungDPSListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: NhomNguoiDungDPSDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<NhomNguoiDungDPSModel>(true, []);
	nhomnguoidungdpssResult: NhomNguoiDungDPSModel[] = [];
	tmpnhomnguoidungdpssResult: NhomNguoiDungDPSModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	previousIndex: number = 0;
	name = "Vai trò";
	rR = {};
	DonVi: number = 0;
	datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	gridService: TableService | undefined;
	girdModel: TableModel | undefined;
	disabledBtn: boolean = false;
	list_button: boolean = false;

	constructor(
		private apiService: NhomNguoiDungDPSService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private commonService: CommonService, ) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserRolesObject().subscribe(t => {
			this.rR = t;
		});
		//#region ***Filter***
		this.girdModel = new TableModel();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['GroupName'] = "";
		this.girdModel.filterText['Ma'] = "";
		this.girdModel.filterText['GhiChu'] = "";
		this.girdModel.disableButtonFilter['Locked'] = true;
		this.girdModel.filterGroupDataChecked['Locked'] = [
			{
				name: 'Khóa',
				value: 'True',
				checked: false
			},
			{
				name: 'Hoạt động',
				value: 'False',
				checked: false
			}
		]
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		})
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			//{
			//	stt: 1,
			//	name: 'select',
			//	displayName: 'Check chọn',
			//	alwaysChecked: true,
			//	isShow: true
			//},
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 3,
				name: 'GroupName',
				displayName: 'Tên vai trò',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 4,
				name: 'Ma',
				displayName: 'Mã vai trò',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 5,
				name: 'GhiChu',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true
			},
			//{

			//	stt: 6,
			//	name: 'DonVi',
			//	displayName: 'Đơn vị',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			//{

			//	stt: 7,
			//	name: 'ChucVu',
			//	displayName: 'Chức vụ',
			//	alwaysChecked: false,
			//	isShow: false
			//},
			//{

			//	stt: 8,
			//	name: 'IsDefault',
			//	displayName: 'Vai trò mặc định',
			//	alwaysChecked: false,
			//	isShow: false
			//},
			{

				stt: 9,
				name: 'DisplayOrder',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 10,
				name: 'Locked',
				displayName: 'Trạng thái',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 11,
				name: 'ModifiedBy',
				displayName: 'Người cập nhật cuối',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 12,
				name: 'ModifiedDate',
				displayName: 'Lần cập nhật cuối',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_vaitro'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_vaitro'));
		//#endregion

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
		this.dataSource = new NhomNguoiDungDPSDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(() => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadNhomNguoiDungDPSs(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.nhomnguoidungdpssResult = res;
			this.tmpnhomnguoidungdpssResult = [];
			if (this.nhomnguoidungdpssResult && this.paginator) {
				if (this.nhomnguoidungdpssResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(true);
				} else {
					for (let i = 0; i < this.nhomnguoidungdpssResult.length; i++) {
						let tmpElement = new NhomNguoiDungDPSModel();
						tmpElement.copy(this.nhomnguoidungdpssResult[i])
						this.tmpnhomnguoidungdpssResult.push(tmpElement);
					}
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	GetValueNode(item: any) {
		this.DonVi = item.id;
		this.loadDataList(true);
	}

	loadDataList(holdCurrentPage: boolean = false) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadNhomNguoiDungDPSs(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if (this.DonVi > 0)
			filter.DonVi = this.DonVi;
		if (this.gridService && this.gridService.model.filterText) {
			filter.GroupName = this.gridService.model.filterText['GroupName'];
			filter.GhiChu = this.gridService.model.filterText['GhiChu'];
			filter.Ma = this.gridService.model.filterText['Ma'];
		}
		return filter;
	}

	/** ACTIONS */
	/** Delete */
	delete(item: NhomNguoiDungDPSModel) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn xóa vai trò?';
		const _waitDesciption: string = 'Vai trò đang được xóa...';
		const _deleteMessage = `Xóa vai trò thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.IdGroup).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList(true);
			});
		});
	}

	lock(item: NhomNguoiDungDPSModel, islock = true) {
		let _message = (islock ? "Khóa" : "Mở khóa") + " vai trò thành công";
		this.apiService.lock(item.IdGroup, islock).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_message);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.loadDataList(true);
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.nhomnguoidungdpssResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.nhomnguoidungdpssResult.forEach(row => this.selection.select(row));
		}
	}

	add() {
		const newNhomNguoiDungDPS = new NhomNguoiDungDPSModel();
		newNhomNguoiDungDPS.clear(); // Set all defaults fields
		this.edit(newNhomNguoiDungDPS);
	}

	edit(NhomNguoiDungDPS: NhomNguoiDungDPSModel, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(NhomNguoiDungDPSEditComponent, { data: { NhomNguoiDungDPS: NhomNguoiDungDPS, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList(true);
		});
	}

	phanquyen(NhomNguoiDungDPS: NhomNguoiDungDPSModel) {
		const dialogRef = this.dialog.open(PhanQuyenComponent, { data: { NhomNguoiDungDPS } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList(true);
		});
	}

	/* UI */
	getItemStatusString(status: boolean = false): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = false): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}
}