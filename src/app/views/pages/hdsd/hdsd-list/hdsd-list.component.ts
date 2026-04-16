import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { hdsdService } from '../Services/hdsd.service';
import { hdsdDataSource } from '../Model/data-sources/hdsd.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { LayoutUtilsService, QueryParamsModel } from '../../../../core/_base/crud';
import { CommonService } from '../../nguoi-co-cong/services/common.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { HDSDEditDialogComponent } from '../hdsd-edit/hdsd-edit.dialog.component';

@Component({
	selector: 'm-hdsd-list',
	templateUrl: './hdsd-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class hdsdListComponent implements OnInit {
	// Table fields
	dataSource: hdsdDataSource | undefined;
	displayedColumns = ['STT', 'HDSD', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	listchucdanh: any[] = [];
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	showTruyCapNhanh: boolean = true;
	_name: string = '';
	list_button: boolean = false;
	ver: any={};
	rR: any={};
	verS: string = "";

	constructor(public apiService: hdsdService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		public subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('HDSD.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.apiService.getVersion().subscribe(res => {
			this.ver = res.data;
			this.changeDetectorRefs.detectChanges();
		})
		this.tokenStorage.getUserRolesObject().subscribe(t => {
			this.rR = t;
			this.changeDetectorRefs.detectChanges();
		});

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
		this.dataSource = new hdsdDataSource(this.apiService);
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

	Download(object: any) {
		window.open(object.path, '_blank');
	}

	Add() {
		let item: any = { Id: 0 };
		this.Edit(item);
	}

	Edit(item: any, allowEdit: boolean = true) {
		let saveMessageTranslateParam = item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(HDSDEditDialogComponent, { data: { item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	delete(item: any) {
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
}