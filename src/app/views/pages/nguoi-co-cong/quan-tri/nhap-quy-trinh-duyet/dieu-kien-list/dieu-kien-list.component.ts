import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapCapQuanLyDuyetModel, NhapQuyTrinhDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { DieuKienEditDialogComponent } from '../dieu-kien-edit/dieu-kien-edit.dialog.component';

@Component({
	selector: 'm-dieu-kien-list',
	templateUrl: './dieu-kien-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DieuKienListComponent implements OnInit, OnChanges {
	@Input('Id_QuyTrinh') idqt: number | undefined;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	//==========================
	loadingControl = new BehaviorSubject<boolean>(false);
	item: NhapQuyTrinhDuyetModel;
	oldItem: NhapQuyTrinhDuyetModel;
	hasFormErrors: boolean = false;
	//==========================
	showButton: boolean = false;
	showvitri: boolean = true;
	showPQ: boolean = true;
	//==========================
	dataSource: NhapQuyTrinhDuyetDataSource | undefined;
	displayedColumns = ['#', 'DieuKien', 'DoiTuong', /*'title', 'value', */'actions'];
	@ViewChild('paginator_tab2', { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort2', { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<NhapCapQuanLyDuyetModel>(true, []);
	productsResult: NhapCapQuanLyDuyetModel[] = [];
	viewLoading: boolean = false;
	allowEdit: boolean = true;
	list_button: boolean = false;

	constructor(
		public nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		private commonService: CommonService,
		private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }


	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
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

		this.dataSource = new NhapQuyTrinhDuyetDataSource(this.nhapQuyTrinhDuyetService);
		this.activatedRoute.params.subscribe(_ => {
			if (this.dataSource) {
				let queryParams = this.nhapQuyTrinhDuyetService.lastFilter1$.getValue();
				if (this.idqt)
					queryParams.filter.ID_QuyTrinh = this.idqt;
				this.dataSource.loadListDieuKien(queryParams);
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
			
			this.nhapQuyTrinhDuyetService.deleteDieuKien(row.Id).subscribe(res => {
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