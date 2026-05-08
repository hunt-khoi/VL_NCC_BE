import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { ChucDanhModel } from '../Model/chucdanh.model';
import { ChucDanhService } from '../Services/chucdanh.service';
import { ChucDanhDataSource } from '../Model/data-sources/chucdanh.datasource';
import { ChucDanhEditDialogComponent } from '../chucdanh-edit/chucdanh-edit.dialog.component';

@Component({
	selector: 'm-chucdanh-list',
	templateUrl: './chucdanh-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChucDanhListComponent implements OnInit {
	// Table fields
	dataSource: ChucDanhDataSource | undefined;
	displayedColumns = ['STT', 'Id_CV', 'MaCV', 'TenCV', 'Cap'/*, 'IsManager'*/, 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	listDonVi: any[] = [];
	pageSize: number = 0;
	_name = "";
	list_button: boolean = false;
	btnClass: string = "";
	
	constructor(public apiService: ChucDanhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,) {
		this._name = this.translate.instant("CHUC_DANH.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';
		
		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new ChucDanhDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource) return;
		const queryParams = new QueryParamsModel({},
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadList(queryParams);
	}

	Delete(item: ChucDanhModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.Delete(item.Id_CV).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
					this.loadDataList();
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	Add() {
		const ChucDanhModels = new ChucDanhModel();
		ChucDanhModels.clear(); // Set all defaults fields
		this.Edit(ChucDanhModels);
	}

	Edit(_item: ChucDanhModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id_CV > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(ChucDanhEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			this.loadDataList();
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
			}
		});
	}
}