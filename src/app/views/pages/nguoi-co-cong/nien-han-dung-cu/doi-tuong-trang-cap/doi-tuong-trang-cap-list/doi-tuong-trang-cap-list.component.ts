import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
//Service
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { DoiTuongTrangCapModel } from '../Model/doi-tuong-trang-cap.model';
import { DoiTuongTrangCapService } from '../Services/doi-tuong-trang-cap.service';
import { DoiTuongTrangCapDataSource } from '../Model/data-sources/doi-tuong-trang-cap.datasource';
import { DoiTuongTrangCapEditDialogComponent } from '../doi-tuong-trang-cap-edit/doi-tuong-trang-cap-edit-dialog.component';
import { DoiTuongTrangCapImportComponent } from '../doi-tuong-trang-cap-import/doi-tuong-trang-cap-import.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-doi-tuong-trang-cap-list',
	templateUrl: './doi-tuong-trang-cap-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongTrangCapListComponent implements OnInit {
	// Table fields
	dataSource: DoiTuongTrangCapDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterType = '';
	listchucdanh: any[] = [];

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
	thaotac: number = 0;
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	constructor(
		public objectService: DoiTuongTrangCapService,
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
		this._name = 'Đối tượng trang cấp';
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

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.commonService.getStatusNCC().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
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

		// create availableColumns
		const availableColumns = [
			//{
			//	stt: 0,
			//	name: 'select',
			//	displayName: 'Chọn',
			//	alwaysChecked: false,
			//	isShow: false,
			//},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'SoHoSo',
				displayName: 'Sổ Hồ Sơ',
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
				stt: 4,
				name: 'SoTheoDoi',
				displayName: 'Sổ Theo Dõi',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'NamSinh',
				displayName: 'Năm sinh',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'HoTenThanNhan',
				displayName: 'Họ tên Thân Nhân',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'QuanHeVoiLietSy',
				displayName: 'Quan Hệ Với Liệt Sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 10,
				name: 'KhomAp',
				displayName: 'Khóm/ấp',
				alwaysChecked: true,
				isShow: true,
			},
			
			{
				stt: 11,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 12,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 13,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 14,
				name: 'GhiChu',
				displayName: 'Ghi chú ',
				alwaysChecked: false,
				isShow: false,
			},
			// {
			// 	stt: 15,
			// 	name: 'DungCu',
			// 	displayName: 'Dụng ',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
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
		this.gridService.cookieName = 'displayedColumns_doituongtrangcap'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_doituongtrangcap'));

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
		this.dataSource = new DoiTuongTrangCapDataSource(this.objectService);
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
	DeleteWorkplace(_item: DoiTuongTrangCapModel) {
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
		const objectModel = new DoiTuongTrangCapModel();
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

	Editobject(_item: DoiTuongTrangCapModel, allowEdit: boolean = true) {
		_item.ProvinceID = this.filterprovinces;
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DoiTuongTrangCapEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}
	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		let numRows = this.productsResult.length;
		if (this.thaotac == 1)
			numRows = this.productsResult.filter(row => row.visibleGuiDuyet).length;
		if (this.thaotac == 2)
			numRows = this.productsResult.filter(row => row.visibleThuHoi).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (this.thaotac == 0 || (this.thaotac == 1 && !row.visibleGuiDuyet) || (this.thaotac == 2 && !row.visibleThuHoi)) {

				} else {
					this.selection.select(row)
				}
			});
		}
	}

	Import() {
		const dialogRef = this.dialog.open(DoiTuongTrangCapImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadDataList();
		});
	}

	Export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'SoQuyetDinh' && x != 'actions');
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
				text-align: left;
			}
			th{
				padding: 10px;
				font-size: 12pt;
			}
			table{
				width: 100%;
			}
		}
		</style>
	  `);
	  	popupWinindow.document.close();
		popupWinindow.onafterprint = window.close;
		  this.print = false;
	 }
}
