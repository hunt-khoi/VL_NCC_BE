import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { cachNhapModel } from '../Model/cachnhap.model';
import { cachNhapService } from '../Services/cachnhap.service';
import { cachnhapDataSource } from '../Model/data-sources/cachnhap.datasource';
import { cachnhapEditDialogComponent } from '../cachnhap-edit/cachnhap-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-cachnhap-list',
	templateUrl: './cachnhap-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class cachNhapListComponent implements OnInit {
	// Table fields
	dataSource: cachnhapDataSource | undefined;
	displayedColumns = ['STT', 'cachnhap', 'MoTa', 'Locked', 'Priority', 'CreatedBy', 'CreatedDate', 'UpdatedBy', 'UpdatedDate', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(public apiService: cachNhapService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CACH_NHAP.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} 

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['CachNhap'] = "";
		this.gridModel.disableButtonFilter['Locked'] = true;

		let optionsTinhTrang = [
			{
				name: 'Đã khóa',
				value: 'True', //ko in hoa ko nhận
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
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'CachNhap',
				displayName: 'Cách nhập',
				alwaysChecked: false,
				isShow: true
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
		this.dataSource = new cachnhapDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
	}

	LoadFilterGroupData() {
		this.CommonService.liteLoaiSoLieu().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked.Id_LoaiSoLieu = res.data.map((x: any) => {
					return {
						id: x.id,
						name: x.title,
						value: x.id,
						checked: false
					};
				});
			} else {
				this.gridService.model.filterGroupDataChecked.Id_LoaiSoLieu = [];
			}
			this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.CachNhap = this.gridService.model.filterText['CachNhap'];
		}
		return filter; //trả về đúng biến filter
	}

	Delete(item: cachNhapModel) {
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

	Add() {
		const dataModel = new cachNhapModel();
		dataModel.clear(); // Set all defaults fields
		this.Edit(dataModel);
	}

	Edit(_item: cachNhapModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(cachnhapEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}

	//phục vụ CSS
	covertLockButton(lock: boolean): string {
		switch (lock) {
			case true:
				return 'lock_open';
			case false:
				return 'lock'
		}
	}

	covertToolTip(lock: boolean): string {
		switch (lock) {
			case true:
				return 'COMMON.UNBLOCK';
			case false:
				return 'COMMON.BLOCK';
		}
	}

	covertLockToString(lock: boolean): string {
		switch (lock) {
			case true:
				return 'Đã khóa';
			case false:
				return 'Hoạt động';
		}
	}

	covertLockToColor(lock: boolean): string {
		switch (lock) {
			case false:
				return 'kt-badge--success';
			case true:
				return 'kt-badge--metal';
		}
	}
}