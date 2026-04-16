import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../../services/common.service';
import { ReviewExportComponent } from '../../../components';
import { NhapBaoHiemDataSource } from '../Model/data-sources/nhap-bao-hiem.datasource';
import { BaoHiemYTModel } from '../Model/nhap-bao-hiem.model';
import { NhapBaoHiemService } from '../Services/nhap-bao-hiem.service';
import { NhapBaoHiemEditDialogComponent } from '../nhap-bao-hiem-edit/nhap-bao-hiem-edit.dialog.component';

@Component({
	selector: 'm-nhap-bao-hiem-list',
	templateUrl: './nhap-bao-hiem-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NhapBaoHiemListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: NhapBaoHiemDataSource;
	@Input() donvi: any;
	@Input() nam: number;
	@Input() dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<BaoHiemYTModel>(true, []);
	productsResult: BaoHiemYTModel[] = [];
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
	allowNhap: boolean = false;
	constructor(public NhapBaoHiemService1: NhapBaoHiemService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("NHAP_BHYT.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.checkNhap();
		this.list_button = CommonService.list_button();
		if (this.NhapBaoHiemService1 !== undefined) {
			this.NhapBaoHiemService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} //mặc định theo priority

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['TenDanhSach'] = "";

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.CommonService.getStatusNhapBaoHiem().subscribe(res => {
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
				stt: 2,
				name: 'TenDanhSach',
				displayName: 'Tên danh sách',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Id_Xa',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Thang',
				displayName: 'Tháng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'SLTang',
				displayName: 'SL tăng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'SLGiam',
				displayName: 'SL giảm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongSo',
				displayName: 'Tổng số',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'TongTien',
				displayName: 'Tổng tiền',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
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
		this.dataSource = new NhapBaoHiemDataSource(this.NhapBaoHiemService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.NhapBaoHiemService1.lastFilter$.getValue();
			if (this.nam)
				queryParams.filter.Nam = this.nam;
			// if (this.dot > 0)
			// 	queryParams.filter.Id_DotTangQua = this.dot;
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

	checkNhap() {
		this.NhapBaoHiemService1.checkAllowNhap().subscribe(res => {
			this.allowNhap = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/* HÀM LOAD FILTER GROUPDATA
	*/
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
		if (this.dot > 0)
			filter.Id_DotTangQua = this.dot;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.DotTangQua = this.gridService.model.filterText['TenDanhSach'];
		}
		if (this.donvi) {
			if (this.donvi.Type == 'H')
				filter.Id_Huyen = this.donvi.ID_Goc;
			if (this.donvi.Type == 'X')
				filter.Id_Xa = this.donvi.ID_Goc;
		}

		return filter; //trả về đúng biến filter
	}

	/** Delete */
	DeleteWorkplace(_item: BaoHiemYTModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NhapBaoHiemService1.deleteItem(_item.Id).subscribe(res => {
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

	GuiDuyet(_item: BaoHiemYTModel) {
		const _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NhapBaoHiemService1.guiDuyet(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	ThuHoi(_item: BaoHiemYTModel) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NhapBaoHiemService1.thuHoi(_item.Id).subscribe(res => {
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
		const BaoHiemYTModels = new BaoHiemYTModel();
		BaoHiemYTModels.clear(); // Set all defaults fields
		this.EditNhom(BaoHiemYTModels, true, true);
	}

	EditNhom(_item: BaoHiemYTModel, allowEdit: boolean = true, addNhap: boolean = false) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NhapBaoHiemEditDialogComponent, { data: { _item, allowEdit, addNhap }, width: "80%"});
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

	In(id, mau = 1) {
		// this.NhapBaoHiemService1.previewDeXuat(id, mau).subscribe(res => {
		// 	if (res && res.status == 1) {
		// 		let dialogRef;
		// 		if (mau > 1)
		// 			dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data, width: '1000px' });
		// 		else
		// 			dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		// 		dialogRef.afterClosed().subscribe(res => {
		// 			if (!res) {
		// 			} else {
		// 				this.NhapBaoHiemService1.exportDeXuat(id, mau, mau > 1, res.loai).subscribe(response => {
		// 					const headers = response.headers;
		// 					const filename = headers.get('x-filename');
		// 					const type = headers.get('content-type');
		// 					const blob = new Blob([response.body], { type });
		// 					const fileURL = URL.createObjectURL(blob);
		// 					const link = document.createElement('a');
		// 					link.href = fileURL;
		// 					link.download = filename;
		// 					link.click();
		// 				}, 
		// 				err => {
		// 					let message = "Chức năng không hỗ trợ hoặc có lỗi xảy ra!!"
		// 					this.layoutUtilsService.showError(message);
		// 				});
		// 			}
		// 		});
		// 	} else
		// 		this.layoutUtilsService.showError(res.error.message);
		// })
	}
	export(item) {
		// this.NhapBaoHiemService1.exportExcelDeXuat(item.Id).subscribe(res => {
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
}
