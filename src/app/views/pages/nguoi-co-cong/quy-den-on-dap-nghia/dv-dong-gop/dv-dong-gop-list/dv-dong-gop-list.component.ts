import { Component, OnInit, OnDestroy, ApplicationRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { dvDongGopModel } from '../Model/dv-dong-gop.model';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { dvDongGopDataSource } from '../Model/data-sources/dv-dong-gop.datasource';
import { dvDongGopServices } from '../Services/dv-dong-gop.service';
import { dvDongGopImportComponent } from '../dv-dong-gop-import/dv-dong-gop-import.component';
import { DVDongGopEditDialogComponent } from '../dv-dong-gop-edit/dv-dong-gop-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dv-dong-gop-list',
	templateUrl: './dv-dong-gop-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DVDongGopListComponent implements OnInit, OnDestroy {
	haveFilter: boolean = false;
	dataSource: dvDongGopDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<dvDongGopModel>(true, []);
	productsResult: dvDongGopModel[] = [];
	_name: string = "";
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	list_button: boolean;

	constructor(public dvDongGopService1: dvDongGopServices,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
    	this._name = this.translate.instant("DV_DONGGOP.NAME");
	}
    
  	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})

		if (this.dvDongGopService1 !== undefined) {
			this.dvDongGopService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
		} //mặc định theo priority

		//#region ***Filter***
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['DVDongGop'] = "";
		this.girdModel.filterText['DiaChi'] = "";
		
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);

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
				name: 'DVDongGop',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'GhiChu',
				displayName: 'Ghi chú',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 12,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
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
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.girdModel, this.cookieService);
		this.gridService.cookieName = 'displayedColumns_dvdg'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dvdg'));

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
		this.dataSource = new dvDongGopDataSource(this.dvDongGopService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.dvDongGopService1.lastFilter$.getValue();
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
	
	filterConfiguration(): any {
		const filter: any = {};
		if(this.gridService.model.filterText){
			filter.DVDongGop = this.gridService.model.filterText['DVDongGop'];
			filter.DiaChi = this.gridService.model.filterText['DiaChi'];
		}
		return filter;
  	}
  
  	/** Delete */
	DeleteWorkplace(_item: dvDongGopModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.dvDongGopService1.deleteItem(_item.Id).subscribe(res => {
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
		const dvdgModel = new dvDongGopModel();
		dvdgModel.clear(); // Set all defaults fields
		this.EditdvDongGop(dvdgModel);
  	}
  
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
  	}
  
  	EditdvDongGop(_item: dvDongGopModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(DVDongGopEditDialogComponent, { data: { _item: _item, allowEdit: allowEdit } });
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

	Import() {
		const dialogRef = this.dialog.open(dvDongGopImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) { 
				return;
			}
			this.loadDataList();
		});
	}
}