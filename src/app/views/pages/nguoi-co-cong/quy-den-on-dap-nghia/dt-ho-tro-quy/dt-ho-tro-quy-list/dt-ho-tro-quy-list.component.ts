import { Component, OnInit, OnDestroy, ApplicationRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { dtHoTroModel } from '../Model/dt-ho-tro-quy.model';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { dtHoTroDataSource } from '../Model/data-sources/dt-ho-tro-quy.datasource';
import { dtHoTroServices } from '../Services/dt-ho-tro-quy.service';
import { HoTroEditDialogComponent } from '../../ho-tro/ho-tro-edit/ho-tro-edit.dialog.component';
import { DTHoTroEditDialogComponent } from '../dt-ho-tro-quy/dt-ho-tro-quy-edit.dialog.component';
import { DTHoTroHoTroDialogComponent } from '../dt-ho-tro-quy-ho-tro/dt-ho-tro-quy-ho-tro.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dt-ho-tro-quy-list',
	templateUrl: './dt-ho-tro-quy-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DTHoTroListComponent implements OnInit, OnDestroy {

	dataSource: dtHoTroDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = "";
	Capcocau: number = 0;
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	listward: any[] = [];

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;

	constructor(public dtHoTroService1: dtHoTroServices,
		public dialog: MatDialog,
		public commonService: CommonService,
		private cookieService: CookieService,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
    		this._name = this.translate.instant("DT_HOTRO.NAME");
	}
    
  /** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})
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
		if (this.dtHoTroService1 !== undefined) {
			this.dtHoTroService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
		} //mặc định theo priority

		//#region ***Filter***
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		//#region ***Drag Drop***
		let availableColumns = [
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
				isShow: false
			},
			{
				stt: 3,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'SoHoSo',
				displayName: 'Số hồ sơ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 6,
				name: 'ChiPhiYeuCau',
				displayName: 'Chi phí yêu cầu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'NamSinh',
				displayName: 'Năm sinh',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 11,
				name: 'KhomAp',
				displayName: 'Khóm/ấp',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 12,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 13,
				name: 'IsHoTro',
				displayName: 'Trạng thái',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 14,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 15,
				name: 'GhiChu',
				displayName: 'Ghi chú',
				alwaysChecked: false,
				isShow: false
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
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
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
		this.gridService.cookieName = 'displayedColumns_hotroquy'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hotroquy'));

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
		this.dataSource = new dtHoTroDataSource(this.dtHoTroService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.dtHoTroService1.lastFilter$.getValue();
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
	
	ngOnDestroy() {
		this.gridService.Clear();
	}

	loadDataList(holdCurrentPage: boolean = true) {
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
	DeleteWorkplace(_item: dtHoTroModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.dtHoTroService1.deleteItem(_item.Id).subscribe(res => {
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
	  
 	AddWorkplace() {
		const dvdgModel = new dtHoTroModel();
		dvdgModel.clear(); // Set all defaults fields
		this.EditdtHoTro(dvdgModel);
  	}

  	EditdtHoTro(_item: dtHoTroModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(DTHoTroEditDialogComponent, { data: { _item: _item, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else
			{
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
 	}

	HoTro(_item: dtHoTroModel) {
		const dialogRef = this.dialog.open(DTHoTroHoTroDialogComponent, { data: { _item: _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else
			{
				this.layoutUtilsService.showInfo('Hỗ trợ đối tượng thành công');
				this.loadDataList();
			}

		});
 	}

	getStatusString(ishotro: boolean) {
		if (ishotro)
			return 'primary';
		return ''
	}


	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.filter(row => row.AllowCreate).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (row.AllowCreate)
					this.selection.select(row)
			});
		}
	}

	taoList() {
		let ids = this.selection.selected.filter(x => !x.IsHoTro).map(x => x.Id).toString();
		const dialogRef = this.dialog.open(HoTroEditDialogComponent, { data: { ids: ids, allowEdit: true } });
		dialogRef.afterClosed().subscribe(res => {
			this.loadDataList();
			this.selection.clear(); //clear nội dung đã chọn
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
		this.dtHoTroService1.exportList(queryParams).subscribe(response => {
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
		let zoom ='';
		if(this.gridService.IsAllColumnsChecked()){
			zoom = `body {
				zoom: 60%;
			}`;
		}
		const popupWinindow = window.open();
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>'+this._name+'</title></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print {
			`+zoom+`
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