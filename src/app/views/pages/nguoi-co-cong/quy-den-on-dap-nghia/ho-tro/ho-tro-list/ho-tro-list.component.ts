import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ApplicationRef, OnChanges } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';

import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { QueryParamsModel, LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TableModel } from 'app/views/partials/table';
import { TableService } from 'app/views/partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { HoTroService } from '../Services/ho-tro.service';
import { NienHanModel } from '../../../nien-han-dung-cu/nien-han/Model/nien-han.model';
import { HoTroDataSource } from '../Model/data-sources/ho-tro.datasource';
import { HoTroEditDialogComponent } from '../ho-tro-edit/ho-tro-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-ho-tro-list',
	templateUrl: './ho-tro-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoTroListComponent implements OnInit, OnChanges {
	donvi: any;
	dataTreeDonVi: any[] = [];
	CapCoCau: number;
	dot: number = 0;
	nam: number;
	dataSource: HoTroDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort', { static: true }) sort: MatSort;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	idParent: number;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<NienHanModel>(true, []);
	productsResult: NienHanModel[] = [];
	lstStatus: any[] = [];
	showTruyCapNhanh: boolean = true;
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	requiredImportFirst: boolean = false;
	list_button: boolean;

	constructor(
		private changeDetect: ChangeDetectorRef,
		public commonService: CommonService,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		public HoTroService1: HoTroService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService) {
			this._name = this.translate.instant("Hỗ trợ đối tượng");
		}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.CapCoCau = res.Capcocau;
			this.idParent = res.ID_Goc;
			if (this.idParent == 0)
				this.idParent = res.ID_Goc_Cha;
			if (this.CapCoCau == 1)
				this.GetTreeDonVi();
		})

		this.list_button = CommonService.list_button();
		if (this.HoTroService1 !== undefined) {
			this.HoTroService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Id', 0, 10));
		} //mặc định theo id

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['TenDanhSach'] = "";
		this.gridModel.filterText['Nam'] = "";

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.commonService.getStatusHoTroQuy().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				if (this.filterStatus)
					this.lstStatus = this.lstStatus.filter(x => x.id == +this.filterStatus);
				this.gridService.model.filterGroupDataChecked['Status'] = this.lstStatus.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
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
				stt: 3,
				name: 'TenDanhSach',
				displayName: 'Tên danh sách',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Id_DonVi',
				displayName: 'Đơn vị',
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
			{
				stt: 6,
				name: 'TongSo',
				displayName: 'Tổng số',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongTien',
				displayName: 'Tổng tiền yêu cầu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongTienHoTro',
				displayName: 'Tổng tiền hỗ trợ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
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
		this.gridService.cookieName = 'displayedColumns_hotro'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hotro'));

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
		this.dataSource = new HoTroDataSource(this.HoTroService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.HoTroService1.lastFilter$.getValue();
			if (this.nam)
				queryParams.filter.Nam = this.nam;
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
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams);
	}
	filterConfiguration(): any {
		const filter: any = {};
		if (this.nam)
			filter.Nam = this.nam;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.gridService.model.filterText) {
			filter.TenDanhSach = this.gridService.model.filterText['TenDanhSach'];
			filter.MoTa = this.gridService.model.filterText['Nam'];
		}

		if (this.donvi) {
			if (this.donvi.Type == 'H')
				filter.Id_Huyen = this.donvi.ID_Goc;
			if (this.donvi.Type == 'X')
				filter.Id_Xa = this.donvi.ID_Goc;
		}

		return filter; //trả về đúng biến filter
	}

	GetTreeDonVi() {
		this.loadingSubject.next(true);
		this.dataTreeDonVi = [];
		this.commonService.GetTreeDonViHC(this.idParent, 0).subscribe(res => { //idParent
			this.loadingSubject.next(false);
			let tree = [];
			if (res.data) {
				let i = 0;
				res.data.forEach(element => {
					let item = element;
					if (i == 0) {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',
							active: true
						}
					}
					else {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',

						}
					}

					tree.push(item);
					i++;
				});
			}
			this.dataTreeDonVi = tree;
			this.changeDetect.detectChanges();
		});
	}
	treeDonViChanged(item) {
		if (item) {
			this.donvi = item.data;
		}
	}
	checkAllowExport() {
		return this.dot == 0 || this.donvi.Type != 'H';
	}

		/** Delete */
	DeleteWorkplace(_item: NienHanModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.HoTroService1.deleteItem(_item.Id).subscribe(res => {
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

	GuiDuyet(_item: NienHanModel) {
		const _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.HoTroService1.guiDuyet(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	ThuHoi(_item: NienHanModel) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.HoTroService1.thuHoi(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	AddWorkplace() {
		const NienHanModels = new NienHanModel();
		NienHanModels.clear(); // Set all defaults fields
		this.EditNhom(NienHanModels, true);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	EditNhom(_item: NienHanModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(HoTroEditDialogComponent, { data: { _item, allowEdit }, width: "80%" });
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

	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}

	export(item) {
		// this.HoTroService1.exportExcelDeXuat(item.Id).subscribe(res => {
		// 	const headers = res.headers;
		// 	const filename = headers.get('x-filename');
		// 	const type = headers.get('content-type');
		// 	const blob = new Blob([res.body], { type });
		// 	const fileURL = URL.createObjectURL(blob);
		// 	const link = document.createElement('a');
		// 	link.href = fileURL;
		// 	link.download = filename;
		// 	link.click();
		// })
	}

	raQuyetDinh (_item) {
		// const dialogRef = this.dialog.open(QuyetDinhCapTienDialogComponent, { data: { _item } });
		// dialogRef.afterClosed().subscribe(res => {
		// 	if (!res) {
		// 	} else {
		// 		this.layoutUtilsService.showInfo("Tạo quyết định thành công");
		// 		this.ngOnInit();
		// 	}
		// });
	}

	inQuyetDinh (id) {
		// this.HoTroService1.downloadQD(id).subscribe(response => {
		// 	const headers = response.headers;
		// 	const filename = headers.get('x-filename');
		// 	const type = headers.get('content-type');
		// 	const blob = new Blob([response.body], { type });
		// 	const fileURL = URL.createObjectURL(blob);
		// 	const link = document.createElement('a');
		// 	link.href = fileURL;
		// 	link.download = filename;
		// 	link.click();
		// },
		// (err) => {
		// 	this.layoutUtilsService.showError("Có lỗi xảy ra, vui lòng thử lại sau !");
		// });
	}
}