import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapQuyTrinhDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
import { DieuKienEditDialogComponent } from '../dieu-kien-edit/dieu-kien-edit.dialog.component';

@Component({
	selector: 'm-dieu-kien-list',
	templateUrl: './dieu-kien-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DieuKienListComponent implements OnInit, OnChanges, OnDestroy {
	private destroy$ = new Subject<void>();
	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('Id_QuyTrinh') idqt: number | undefined;
	item: NhapQuyTrinhDuyetModel = new NhapQuyTrinhDuyetModel();
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	//==========================
	dataSource: NhapQuyTrinhDuyetDataSource | undefined;
	displayedColumns = ['#', 'DieuKien', 'DoiTuong', /*'title', 'value', */'actions'];
	@ViewChild('paginator_tab2', { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort2', { static: true }) sort: MatSort | undefined;

	viewLoading: boolean = false;
	allowEdit: boolean = true;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public apiService: NhapQuyTrinhDuyetService,
		private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';
		this.viewLoading = true;
		this.loadingSubject.next(true);

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

		this.dataSource = new NhapQuyTrinhDuyetDataSource(this.apiService);
		this.activatedRoute.params.subscribe(_ => {
			if (this.dataSource) {
				let queryParams = this.apiService.lastFilter1$.getValue();
				if (this.idqt)
					queryParams.filter.ID_QuyTrinh = this.idqt;
				this.dataSource.loadListDieuKien(queryParams);
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnChanges() {
		if (!this.dataSource)
			this.ngOnInit();
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
		this.dataSource.loadListDieuKien(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.ID_QuyTrinh = this.idqt;
		return filter;
	}

	goBack() {
		window.history.back();
	}

	//#region điều kiện
	Add() {
		const quytrinhModel: any = {
			Id: 0,
			Id_QuyTrinh: this.item.ID_QuyTrinh
		}
		this.Update(quytrinhModel);
	}

	Update(_item: any, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(DieuKienEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) 
				this.loadDataList();
		});
	}

	delete(row: any) {
		const _title = "Xóa";
		const _description = "Bạn có chắc muốn xóa quy trình theo đối tượng không";
		const _waitDesciption = "Dữ liệu đang được xóa";
		const _deleteMessage = "Xóa quy trình theo đối tượng thành công";
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.deleteDieuKien(row.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
	//#endregion
}