import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, OnDestroy } from '@angular/core';
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
import { loaiDieuDuongModel } from '../Model/loaidieuduong.model';
import { loaiDieuDuongServices } from '../Services/loaidieuduong.service';
import { loaiDieuDuongDataSource } from '../Model/data-sources/loaidieuduong.datasource';
import { LoaiDieuDuongEditDialogComponent } from '../loai-dieu-duong-edit/loaidieuduong-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-loai-dieu-duong-list',
	templateUrl: './loaidieuduong-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoaiDieuDuongListComponent implements OnInit, OnDestroy {
	dataSource: loaiDieuDuongDataSource | undefined;
	displayedColumns = ['STT', 'Id', 'LoaiDieuDuong', 'MoTa', 'Locked', 'Priority', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	haveFilter: boolean = false;

	_name: string = "";
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(public apiService: loaiDieuDuongServices,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private translate: TranslateService) {
    		this._name = this.translate.instant("LOAI_DD.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['LoaiDieuDuong'] = "";
		this.gridModel.filterText['MoTa'] = "";
		this.gridModel.disableButtonFilter['Locked'] = false;
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

		this.gridModel.filterGroupDataChecked['Locked'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

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
				isShow: true
			},
			//{

			//	stt: 2,
			//	name: 'Id',
			//	displayName: 'Id',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{

				stt: 3,
				name: 'LoaiDieuDuong',
				displayName: 'Loại điều dưỡng',
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
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);
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
		this.dataSource = new loaiDieuDuongDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(params => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult  && this.paginator) {
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
		if (this.gridService && this.gridService.model.filterText){
			filter.LoaiDieuDuong = this.gridService.model.filterText['LoaiDieuDuong'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		return filter;
  	}
  
	Delete(item: loaiDieuDuongModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.Id).subscribe(res => {
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
	  
	Lock(item: any, islock = true) {
		let _message = (islock ? "Khóa" : "Mở khóa") + " loại điều dưỡng thành công";
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

			this.apiService.lock(item.Id, islock).subscribe(res => {
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
		const dataModel = new loaiDieuDuongModel();
		dataModel.clear(); // Set all defaults fields
		this.Edit(dataModel);
  	}
  
  	Edit(_item: loaiDieuDuongModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(LoaiDieuDuongEditDialogComponent, { data: { _item: _item, allowEdit: allowEdit } });
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