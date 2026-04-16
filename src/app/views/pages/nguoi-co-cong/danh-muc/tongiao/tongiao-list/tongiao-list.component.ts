import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { tongiaoService } from '../Services/tongiao.service';
// Models
import { tongiaoEditDialogComponent } from '../tongiao-edit/tongiao-edit.dialog.component';
import { tongiaoDataSource } from '../Model/data-sources/tongiao.datasource';
import { tongiaoModel } from '../Model/tongiao.model';
import { CommonService } from '../../../services/common.service';
import { SubheaderService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-tongiao-list',
	templateUrl: './tongiao-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class tongiaoListComponent implements OnInit {

	// Table fields
	dataSource: tongiaoDataSource;
	displayedColumns = ['Id_row', 'Tentongiao','Priority','NguoiCapNhat','NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Selection
	selection = new SelectionModel<tongiaoModel>(true, []);
	productsResult: tongiaoModel[] = [];
	_name: string = '';
	list_button: boolean;

	constructor(public tongiaoService: tongiaoService,
		private danhMucService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		public subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant('TONGIAO.NAME'); 
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new tongiaoDataSource(this.tongiaoService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			if (params.id) {
				queryParams = this.tongiaoService.lastFilter$.getValue();
				this.restoreState(queryParams, +params.id);
			}
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
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {

		const filter: any = {};
		return filter;
	}

	/** Delete */
	Delete(_item: tongiaoModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.tongiaoService.deleteItem(_item.Id_row).subscribe(res => {
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
		const tongiaoModels = new tongiaoModel();
		tongiaoModels.clear(); // Set all defaults fields
		this.Update(tongiaoModels);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	Update(_item: tongiaoModel, allowEdit:boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id_row > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(tongiaoEditDialogComponent, { data: { _item, allowEdit } });
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
}
