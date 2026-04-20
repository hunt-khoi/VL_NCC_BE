import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../Services/notify.service';
import { NotifyDataSource } from '../Model/data-sources/notify.datasource';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../core/_base/crud';
import { CommonService } from '../../nguoi-co-cong/services/common.service';
import moment from 'moment';

@Component({
	selector: 'm-notify-list',
	templateUrl: './notify-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotifyListComponent implements OnInit {
	// Table fields
	dataSource: NotifyDataSource | undefined;
	displayedColumns = ['select', 'STT', 'NoiDung', 'CreatedDate', 'CreatedBy', 'UpdatedDate', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	loai: number | null = null;
	from: any;
	to: any;
	_name: string = '';
	list_button: boolean = false;
	Capcocau: number = 0;
	lstLoaiNoti: any[] = [];

	constructor(public notifyService: NotifyService,
		private danhMucService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = 'Thông báo';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})

		this.danhMucService.ListLoaiNoti().subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoaiNoti = res.data
				if (this.Capcocau == 3) {
					let idx = this.lstLoaiNoti.findIndex(x => x.id == 7)
					this.lstLoaiNoti.splice(idx, 1);
				}
				if (this.Capcocau == 1) {
					let idx = this.lstLoaiNoti.findIndex(x => x.id == 6)
					this.lstLoaiNoti.splice(idx, 1);
				}
			}
		})

		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
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
		this.dataSource = new NotifyDataSource(this.notifyService);
		this.route.queryParams.subscribe(_ => {
			this.loadDataList(false);
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

	loadDataList(holdCurrentPage: boolean = true, loai: number | null = null) {
		if (!this.paginator || !this.sort || !this.dataSource) return;
		this.loai = loai;
		this.selection.clear();
		let filter = this.filterConfiguration();
		if (loai != null) filter.Loai = loai;
		const queryParams = new QueryParamsModel(
			filter,
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = { includeRead: 1 };
		if (this.from)
			filter["TuNgay"] = moment(this.from).format("DD/MM/YYYY");
		if (this.to)
			filter["DenNgay"] = moment(this.to).format("DD/MM/YYYY");;
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		return numSelected === this.productsResult.length;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				this.selection.select(row);
			});
		}
	}

	xem(object: any) {
		this.danhMucService.ReadNotify(object.IdRow).subscribe(res => {
			if (res && res.status == 1) {
				object.IsRead = true;
				this.router.navigateByUrl(object.Link, {});
			}
		});
	}

	markAsRead(isDelete = false) {
		let _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		let _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		let _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		let _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		if (!isDelete) {
			_title = "Đánh dấu tất cả là đã đọc";
			_description = "Bạn có chắc muốn đánh dấu tất cả là đã đọc";
			_waitDesciption = "Đang đánh dấu tất cả là đã đọc";
			_deleteMessage = "Đánh dấu tất của là đã đọc thành công";
		}
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.notifyService.markAsRead(isDelete).subscribe(res => {
					if (res && res.status == 1) {
						this.loadDataList();
					} else
						this.layoutUtilsService.showError(res.error.message);
				});
			}
		});
	}

	xoa(object: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.notifyService.delete(object.IdRow).subscribe(res => {
					if (res && res.status == 1) {
						this.loadDataList();
					} else
						this.layoutUtilsService.showError(res.error.message);
				});
			}
		});
	}

	xoas() {
		let data = this.selection.selected.map(x => x.IdRow);
		const _title = this.translate.instant('OBJECT.DELETE_MULTY.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE_MULTY.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE_MULTY.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE_MULTY.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.notifyService.deletes(data).subscribe(res => {
					if (res && res.status === 1) {
						this.layoutUtilsService.showInfo(_deleteMessage);
						this.loadDataList();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			}
		});
	}
}
