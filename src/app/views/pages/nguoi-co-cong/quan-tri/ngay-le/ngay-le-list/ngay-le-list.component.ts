import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HolidaysService } from '../Services/ngay-le.service';
import { HolidaysEditDialogComponent} from '../ngay-le-edit/ngay-le-edit.dialog.component';
import { HolidaysDataSource } from '../Model/data-sources/ngay-le.datasource';
import { HolidaysModel } from '../Model/ngay-le.model';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-ngay-le-list',
	templateUrl: './ngay-le-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class HolidaysListComponent implements OnInit {
	
	// Table fields
	dataSource: HolidaysDataSource | undefined;
	displayedColumns = ['STT', 'Title', 'Ngay','GhiChu','UpdatedDate','UpdatedBy', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<HolidaysModel>(true, []);
	productsResult: HolidaysModel[] = [];
	_name: string = "";
	list_button: boolean = false;

	constructor(public apiService: HolidaysService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("NGAYLE.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
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
		this.dataSource = new HolidaysDataSource(this.apiService);
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

	Delete(item: HolidaysModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.deleteItem(item.Id_row).subscribe(res => {
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
		const HolidaysModels = new HolidaysModel();
		HolidaysModels.clear(); // Set all defaults fields
		this.Edit(HolidaysModels);
	}

	Edit(_item: HolidaysModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id_row > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(HolidaysEditDialogComponent, { data: { _item, allowEdit} });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}
}