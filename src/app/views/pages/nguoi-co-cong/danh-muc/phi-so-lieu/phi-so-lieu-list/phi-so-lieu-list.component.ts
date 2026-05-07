import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { PhiSoLieuModel } from '../Model/phi-so-lieu.model';
import { PhiSoLieuServices } from '../Services/phi-so-lieu.service';
import { PhiSoLieuDataSource } from '../Model/data-sources/phi-so-lieu.datasource';
import { PhiSoLieuDialogComponent } from '../phi-so-lieu-edit/phi-so-lieu-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-phi-so-lieu-list',
	templateUrl: './phi-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhiSoLieuListComponent implements OnInit, OnDestroy {
	dataSource: PhiSoLieuDataSource | undefined;
	displayedColumns = ['STT', 'Id', 'PhiSoLieu', 'MoTa', 'Locked', 'Priority', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	haveFilter: boolean = false;

	_name: string = "";
	gridService: TableService | undefined;
	girdModel: TableModel | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(public apiService: PhiSoLieuServices,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private translate: TranslateService) {
    		this._name = this.translate.instant("PHI_SO_LIEU.NAME");
	}
    

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} 

		//#region ***Filter***
		this.girdModel = new TableModel();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['PhiSoLieu'] = "";
		this.girdModel.filterText['MoTa'] = "";
		this.girdModel.filterText['Locked'] = "";
		// this.girdModel.disableButtonFilter['Locked'] = false;
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
				name: 'PhiSoLieu',
				displayName: 'Nhập số liệu',
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
		this.dataSource = new PhiSoLieuDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
  	}
	
	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
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
		if (this.gridService && this.gridService.model.filterText) {
			filter.PhiSoLieu = this.gridService.model.filterText['PhiSoLieu'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
			filter.Locked = this.gridService.model.filterText['Locked'];
		}
		return filter;
  	}
  
	Delete(item: PhiSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.Delete(item.Id).subscribe(res => {
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
	  
	lock(item: any, islock = true) {
		let _message = (islock ? "Khóa" : "Mở khóa") + " phí số liệu thành công";
		let _title;
		let _description;
		let _waitDesciption;
		if (islock) {
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
			if (!res) return;
			
			this.apiService.Lock(item.Id, islock).subscribe(res => {
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
  
 	Add() {
		const PSLModel = new PhiSoLieuModel();
		PSLModel.clear(); // Set all defaults fields
		this.Edit(PSLModel);
  	}
  
  	Edit(_item: PhiSoLieuModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(PhiSoLieuDialogComponent, { data: { _item: _item, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
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