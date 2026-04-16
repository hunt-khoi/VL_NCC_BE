import { Component, OnInit, OnDestroy, ApplicationRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { loaiGiayToServices } from '../Services/loaigiayto.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
// Models
import { LoaiGiayToEditDialogComponent } from '../loaigiayto-edit/loaigiayto-edit.dialog.component';
import { loaiGiayToDataSource } from '../Model/data-sources/loaigiayto.datasource';
import { loaiGiayToModel } from '../Model/loaigiayto.model';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-loai-giay-to-list',
	templateUrl: './loaigiayto-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaiGiayToListComponent implements OnInit, OnDestroy {
	haveFilter: boolean = false;
	dataSource: loaiGiayToDataSource;
	displayedColumns = ['STT', 'Id', 'LoaiGiayTo', 'MoTa', 'Locked', 'Priority', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<loaiGiayToModel>(true, []);
	productsResult: loaiGiayToModel[] = [];
	_name: string = "";
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	list_button: boolean;
	constructor(public loaiGiayToService1: loaiGiayToServices,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
    this._name = this.translate.instant("LOAI_GT.NAME");}
    

  /** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})

		if (this.loaiGiayToService1 !== undefined) {
			this.loaiGiayToService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} //mặc định theo priority

		//#region ***Filter***
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['LoaiGiayTo'] = "";
		this.girdModel.filterText['MoTa'] = "";
		this.girdModel.disableButtonFilter['Locked'] = false;

		let optionsTinhTrang = [
			{
				name: 'Khóa',
				value: 'True',
			},
			{
				name: 'Hoạt động',
				value: 'False',
			}
		];

		this.girdModel.filterGroupDataChecked['Locked'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		//this.commonService.getListNhomNguoiDung().subscribe(res => {
		//	if (res && res.status === 1) {
		//		this.listIdGroup = res.data;
		//	};
		//	this.gridService.filterGroupDataChecked['IdGroup'] = this.listIdGroup.map(x => {
		//		return {
		//			id: x.IdGroup,
		//			name: x.GroupName,
		//			value: x.IdGroup,
		//			checked: false
		//		}
		//	});
		//	this.gridService.filterGroupDataCheckedFake = Object.assign({}, this.gridService.filterGroupDataChecked);
		//});
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
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 2,
				name: 'Id',
				displayName: 'Id',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'LoaiGiayTo',
				displayName: 'Loại giấy tờ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'Locked',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
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
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();


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
		this.dataSource = new loaiGiayToDataSource(this.loaiGiayToService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.loaiGiayToService1.lastFilter$.getValue();
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
			filter.LoaiGiayTo = this.gridService.model.filterText['LoaiGiayTo'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		return filter;
  	}
  
  	/** Delete */
	DeleteWorkplace(_item: loaiGiayToModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.loaiGiayToService1.deleteItem(_item.Id).subscribe(res => {
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
	  
	lock(_item: any, islock = true) {
		let _message = (islock ? "Khóa" : "Mở khóa") + " loại giấy tờ thành công";
		let _title;
		let _description;
		let _waitDesciption;
		if(islock){
			_title = this.translate.instant('OBJECT.LOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.LOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.LOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		}
		else{
			_title = this.translate.instant('OBJECT.UNLOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.UNLOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.UNLOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		}

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.loaiGiayToService1.lock(_item.Id, islock).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_message);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}
  
 	AddWorkplace() {
		const loaigiaytoModel = new loaiGiayToModel();
		loaigiaytoModel.clear(); // Set all defaults fields
		this.EditLoaiGiayTo(loaigiaytoModel);
  	}
  
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
  	}
  
  	EditLoaiGiayTo(_item: loaiGiayToModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(LoaiGiayToEditDialogComponent, { data: { _item: _item, allowEdit: allowEdit } });
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
  
	getItemCssClassByStatus(status: boolean = false): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	getItemStatusString(status: boolean = false): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}
}
