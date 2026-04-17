import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table';
import { SettingProcessComponent } from '../../../components';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';
import { QuaTrinhKhongCoNguoiDuyetDataSource } from '../Model/data-sources/qua-trinh-khong-co-nguoi-duyet.datasource';
import { QuaTrinhKhongCoNguoiDuyetService } from '../Services/qua-trinh-khong-co-nguoi-duyet.service';
import { QuaTrinhKhongCoNguoiDuyetEditComponent } from '../qua-trinh-khong-co-nguoi-duyet-edit/qua-trinh-khong-co-nguoi-duyet-edit.component';

@Component({
	selector: 'm-qua-trinh-khong-co-nguoi-duyet-list',
	templateUrl: './qua-trinh-khong-co-nguoi-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class QuaTrinhKhongCoNguoiDuyetListComponent implements OnInit {
	// Table fields
	dataSource: QuaTrinhKhongCoNguoiDuyetDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;
	// Selection
	selection = new SelectionModel<any>(true, []);
	dataResult: any[] = [];
	tmpdataResult: any[] = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	previousIndex: number = 0;
	listLoai: any[] = [];
	selectedLoai: string = '';
	gridService: TableService | undefined;
	gridModel: TableModel = new TableModel();
	trangthaiduyet: boolean = false;
	list_button: boolean = false;

	constructor(
		public dataService: QuaTrinhKhongCoNguoiDuyetService,
		public dialog: MatDialog,
		private changeDetect: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.dataService.GetListLoai().subscribe(res => {
			if (res && res.data) {
				this.listLoai = res.data;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetect.detectChanges();
		});
		let availableColumns = [
			{
				stt: 1,
				name: '#',
				displayName: '#',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'ten_phieu',
				displayName: 'Phiếu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'so_phieu',
				displayName: 'Số phiếu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'ngay_tao',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'nguoi_tao',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'checker',
				displayName: 'Người xử lý',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'tinh_trang',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'Deadline',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.haveFilter = true;
		this.gridModel.filterText.ten_phieu = '';
		this.gridModel.filterText.so_phieu = '';
		this.gridModel.filterText.nguoi_tao = '';		
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();
		
		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new QuaTrinhKhongCoNguoiDuyetDataSource(this.dataService);
		this.dataSource.entitySubject.subscribe(res => {
			this.dataResult = res
			this.tmpdataResult = []
			if (this.dataResult && this.paginator) {
				if (this.dataResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadList(false);
				}
				for (let i = 0; i < this.dataResult.length; i++) {
					let tmpElement = Object.assign(this.dataResult[i]);
					this.tmpdataResult.push(tmpElement);
				}
			}
		});
	}

	loadList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadData(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.Loai = this.selectedLoai;
		filter.trangthai = this.trangthaiduyet ? 2 : 0;
		if (this.gridService && this.gridService.model.filterText) {
			filter.so_phieu = this.gridService.model.filterText.so_phieu;
			filter.ten_phieu = this.gridService.model.filterText.ten_phieu;
			filter.nguoi_tao = this.gridService.model.filterText.nguoi_tao;
		}
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.dataResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	edit(QuaTrinhKhongCoNguoiDuyet: any, isThaoluan = false) {
		var loaiphieu = this.listLoai.find(x => x.id == this.selectedLoai);
		const dialogRef = this.dialog.open(QuaTrinhKhongCoNguoiDuyetEditComponent, { data: { QuaTrinhKhongCoNguoiDuyet, isThaoluan, loai: this.selectedLoai, urlTo: loaiphieu.urlTo } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadList();
		});
	}

	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: QuaTrinhKhongCoNguoiDuyet, Type: QuaTrinhKhongCoNguoiDuyet.id_loai } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.loadList();
		});
	}
	
	// log(item) {
	// 	let loai = 0;
	// 	if (this.selectedLoai == '2')
	// 		loai = 8;
	// 	if (this.selectedLoai == '1')
	// 		loai = 14;
	// 	if (this.selectedLoai == '3')
	// 		loai = 16;
	// 	if (this.selectedLoai == '4')
	// 		loai = 0;
	// 	if (this.selectedLoai == '5')
	// 		loai = 0;
	// 	if (this.selectedLoai == '6')
	// 		loai = 16;
	// 	if (this.selectedLoai == '7')
	// 		loai = 0;
	// 	if (this.selectedLoai == '8')
	// 		loai = 0;
	// 	let url = `/log/doi-tuong/${loai}/${item.id_phieu}`;
	// 	window.open(url, "_blank");
	// }
}