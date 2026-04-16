// Angular
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Service
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { DoiTuongBaoHiemModel } from '../Model/doi-tuong-bao-hiem.model';
import { DoiTuongBaoHiemDataSource } from '../Model/data-sources/doi-tuong-bao-hiem.datasource';
import { DoiTuongBaoHiemService } from '../Services/doi-tuong-bao-hiem.service';
import { DoiTuongBaoHiemEditDialogComponent } from '../doi-tuong-bao-hiem-edit/doi-tuong-bao-hiem-edit-dialog.component';
import { DoiTuongBaoHiemImportComponent } from '../doi-tuong-bao-hiem-import/doi-tuong-bao-hiem-import.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-doi-tuong-bao-hiem-list',
	templateUrl: './doi-tuong-bao-hiem-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongBaoHiemListComponent implements OnInit {
	// Table fields
	dataSource: DoiTuongBaoHiemDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	listward: any[] = [];
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	
	constructor(
		public objectService: DoiTuongBaoHiemService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private cookieService: CookieService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage,
		private router: Router) {
		this._name = this.translate.instant('DOITUONGBHYT.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterdistrict = +res.ID_Goc_Cha;
				this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterGroupDataChecked['Type'] = [{
				name: 'Theo pháp lệnh',
				value: '1',
				checked: false,
			}, {
				name: 'Theo các nghị định, quyết định',
				value: '2',
				checked: false,
			},
		];
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
				name: 'SoHoSo',
				displayName: 'Sổ Hồ Sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'HoTen',
				displayName: 'Họ tên',
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
				stt: 9,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'KhomAp',
				displayName: 'Khóm/ấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'Type',
				displayName: 'Loại đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: this.translate.instant('COMMON.CREATED_BY'),
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: this.translate.instant('COMMON.CREATED_DATE'),
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: this.translate.instant('COMMON.UPDATED_BY'),
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: this.translate.instant('COMMON.UPDATED_DATE'),
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
		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

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
		this.gridService.cookieName = 'displayedColumns_doituongBH'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_doituongBH'));

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new DoiTuongBaoHiemDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
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

	loadDataList(holdCurrentPage: boolean = true) {
		this.selection.clear();
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


	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.loadDataList();
	}

	filterWardD(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterdistrict > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}

		if (this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
		}

		return filter;
	}


	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/** Delete */
	DeleteWorkplace(_item: DoiTuongBaoHiemModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	AddWorkplace() {
		const objectModel = new DoiTuongBaoHiemModel();
		objectModel.clear(); // Set all defaults fields
		this.Editobject(objectModel);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Editobject(_item: DoiTuongBaoHiemModel, allowEdit: boolean = true) {
		_item.ProvinceID = this.filterprovinces;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DoiTuongBaoHiemEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	Import() {
		const dialogRef = this.dialog.open(DoiTuongBaoHiemImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadDataList();
		});
	}

	Export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols
			},
			true
		);
		this.objectService.exportList(queryParams).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất danh sách thất bại")
		});
	}
	print: boolean = false;
	printTicket(print_template) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();
		let innerContents = document.getElementById(print_template).innerHTML;
		// let str = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for CreatedDate">Ngày tạo</button>';
		// let str1 = '<span aria-label="Change sorting for CreatedDate">Ngày tạo</span>';
		// innerContents = innerContents.replace(str, str1);
		const popupWinindow = window.open();
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>'+this._name+'</title></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print {
			th:last-child,
			td:last-child,
			.hiden-print {
				display: none !important;
			}
			td{
				border-bottom: 1px solid #dee2e6;
				padding: 10px;
				font-size: 10pt;
			}
			th{
				padding: 10px;
				font-size: 12pt;
			}
			
		}
		</style>
		`);

			popupWinindow.document.close();
			// popupWinindow.print();
		popupWinindow.onafterprint = window.close;
			// setTimeout(popupWinindow.close, 0);
		this.print = false;
		this.changeDetectorRefs.detectChanges();
	 }
}
