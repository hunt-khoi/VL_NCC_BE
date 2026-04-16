import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from '../Services/log.service';
import { LogDataSource } from '../Model/data-sources/log.datasource';
import { CommonService } from '../../../services/common.service';
import { QueryParamsModel } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-file-list',
	templateUrl: './file-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileListComponent implements OnInit {
	// Table fields
	dataSource: LogDataSource | undefined;
	displayedColumns = ['STT', 'Name', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	folder: string = 'theochucnang';
	list_button: boolean = false;

	constructor(public apiService: LogService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService) {
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
		this.dataSource = new LogDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) { 
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadListFile(queryParams);
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

	load(folder: any) {
		this.folder = folder;
		this.loadDataList();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadListFile(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = { folder: this.folder };
		return filter;
	}

	Download(object: any) {
		window.open(object.path, '_blank');
	}
}