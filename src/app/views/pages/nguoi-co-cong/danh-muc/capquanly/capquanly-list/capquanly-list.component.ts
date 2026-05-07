import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { capquanlyModel } from '../Model/capquanly.model';
import { capquanlyService } from '../Services/capquanly.service';
import { capquanlyDataSource } from '../Model/data-sources/capquanly.datasource';
import { capquanlyEditDialogComponent } from '../capquanly-edit/capquanly-edit.dialog.component';

@Component({
	selector: 'm-capquanly-list',
	templateUrl: './capquanly-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class capquanlyListComponent implements OnInit {
	// Table fields
	dataSource: capquanlyDataSource | undefined;
	displayedColumns = ['STT','RowID', 'Title', 'Range','Summary','NguoiCapNhat','NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<capquanlyModel>(true, []);
	productsResult: capquanlyModel[] = [];
	_name: string = "";
	list_button: boolean = false;
	btnClass: string = "";

	constructor(public apiService: capquanlyService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CAP_QL.NAME");
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
		this.dataSource = new capquanlyDataSource(this.apiService);
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

	Delete(item: capquanlyModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.Delete(item.RowID).subscribe(res => {
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
		const capquanlyModels = new capquanlyModel();
		capquanlyModels.clear(); // Set all defaults fields
		this.Edit(capquanlyModels);
	}

	Edit(_item: capquanlyModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.RowID > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(capquanlyEditDialogComponent, { data: { _item, allowEdit} });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}
}