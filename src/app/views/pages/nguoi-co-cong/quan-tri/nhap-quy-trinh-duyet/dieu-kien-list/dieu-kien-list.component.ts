// Angular
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RxJS
import { BehaviorSubject, merge } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
// Service
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
	@Input('Id_QuyTrinh') idqt: number;
	// Table fields
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	// Filter fields
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
	dataSource1: NhapQuyTrinhDuyetDataSource;
	displayedColumns1 = ['#', 'DieuKien', 'DoiTuong', /*'title', 'value', */'actions'];
	@ViewChild('paginator_tab2', { static: true }) paginator1: MatPaginator;
	@ViewChild('sort2', { static: true }) sort1: MatSort;
	// Selection
	selection = new SelectionModel<NhapCapQuanLyDuyetModel>(true, []);
	productsResult: NhapCapQuanLyDuyetModel[] = [];
	viewLoading: boolean = false;
	allowEdit: boolean = true;
	list_button: boolean;

	constructor(
		public nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		private commonService: CommonService,
		private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private routesPage: Router,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }


	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.viewLoading = true;
		this.loadingSubject.next(true);

		//#region điều kiện
		this.sort1.sortChange.subscribe(() => (this.paginator1.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort1.sortChange, this.paginator1.page)
			.pipe(
				tap(() => {
					this.loadDataList1();
				})
			)
			.subscribe();
		this.dataSource1 = new NhapQuyTrinhDuyetDataSource(this.nhapQuyTrinhDuyetService);
		this.activatedRoute.params.subscribe(params => {
			let queryParams = this.nhapQuyTrinhDuyetService.lastFilter1$.getValue();
			if (this.idqt != undefined)
				queryParams.filter.ID_QuyTrinh = this.idqt;
			// First load
			this.dataSource1.loadListDieuKien(queryParams);
		});
		this.dataSource1.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator1.pageIndex > 0) {
					this.loadDataList1(false);
				}
			}
		});
		//#endregion
	}

	ngOnChanges() {
		if (!this.dataSource1)
			this.ngOnInit();
	}
	loadDataList1(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort1.direction,
			this.sort1.active,
			holdCurrentPage ? this.paginator1.pageIndex : this.paginator1.pageIndex = 0,
			this.paginator1.pageSize
		);
		this.dataSource1.loadListDieuKien(queryParams);
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
	AddDieuKien() {
		const quytrinhModel: any = {
			Id: 0,
			Id_QuyTrinh: this.item.ID_QuyTrinh
		}
		this.UpdateDieuKien(quytrinhModel);
	}
	UpdateDieuKien(_item: any, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(DieuKienEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadDataList1();
			}
		});

	}
	deleteDieuKien(row: any) {
		const _title = "Xóa";
		const _description = "Bạn có chắc muốn xóa quy trình theo đối tượng không";
		const _waitDesciption = "Dữ liệu đang được xóa";
		const _deleteMessage = "Xóa quy trình theo đối tượng thành công";

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.nhapQuyTrinhDuyetService.deleteDieuKien(row.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList1();
			});
		});
	}
	//#endregion
}
