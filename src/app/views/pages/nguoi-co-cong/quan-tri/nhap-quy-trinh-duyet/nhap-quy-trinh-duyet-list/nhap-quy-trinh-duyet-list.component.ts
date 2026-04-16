import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
//Datasource
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
//Service
import { SubheaderService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, QueryParamsModel, MessageType } from '../../../../../../core/_base/crud';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapQuyTrinhDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { NhapQuyTrinhDuyetEditComponent } from '../nhap-quy-trinh-duyet-edit/nhap-quy-trinh-duyet-edit.component';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-nhap-quy-trinh-duyet-list',
	templateUrl: './nhap-quy-trinh-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush

})

export class NhapQuyTrinhDuyetListComponent implements OnInit {
	// Table fields
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	dataSource: NhapQuyTrinhDuyetDataSource;
	displayedColumns = ['#', 'TieuDe', 'MoTa', 'Loai', 'NhanMailKhiDuyetDon', 'NhanMailKhiKhongDuyetDon', 'NhanMailKhiKhongTimThayNguoiDuyetDon', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Selection
	selection = new SelectionModel<NhapQuyTrinhDuyetModel>(true, []);
	productsResult: NhapQuyTrinhDuyetModel[] = [];
	// Filter fields
	//List các danh sách email
	listKhiDuyetDon: any[] = [];
	listKhiKhongDuyetDon: any[] = [];
	listKhiKhongThayNguoiDuyetDon: any[] = [];
	//==========================
	itemForm: FormGroup;
	loadingControl = new BehaviorSubject<boolean>(false);
	item: NhapQuyTrinhDuyetModel;
	oldItem: NhapQuyTrinhDuyetModel;
	hasFormErrors: boolean = false;
	//==========================
	showButton: boolean = false;
	showvitri: boolean = true;
	//==========================
	showTruyCapNhanh: boolean = true;
	id_menu: number = 371;
	list_button: boolean;

	constructor(
		public nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private routesPage: Router,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();

		let breadcrumbs = [{ title: 'Cấu hình' }, { title: 'Quy trình duyệt', page: '/quy-trinh-duyet' }];
		this.subheaderService.setBreadcrumbs(breadcrumbs);
		this.loadingSubject.next(true);

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

		this.dataSource = new NhapQuyTrinhDuyetDataSource(this.nhapQuyTrinhDuyetService);

		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});

		this.loadDataList();
	}

	/** ACTIONS */

	//------------Load data-------------------------
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
	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		return filter;
	}

	//====================================================================================
	//===Button update trên lưới===========
	Update(row: any) {
		this.showvitri = false;
		this.showButton = true;
		this.item.ID_QuyTrinh = row.ID_Row;
		this.item.TenQuyTrinh = row.TieuDe;
		this.itemForm.controls['tenQuyTrinh'].setValue(row.TieuDe);
		this.itemForm.controls['moTa'].setValue(row.MoTa);
		if (row.data_NhanMailKhiDuyetDon.length > 0) {
			this.listKhiDuyetDon = row.data_NhanMailKhiDuyetDon;
		}
		else {
			this.listKhiDuyetDon = [];
		}
		if (row.data_NhanMailKhiKhongDuyetDon.length > 0) {
			this.listKhiKhongDuyetDon = row.data_NhanMailKhiKhongDuyetDon;
		} else {
			this.listKhiKhongDuyetDon = [];
		}
		if (row.data_NhanMailKhiKhongTimThayNguoiDuyetDon.length > 0) {
			this.listKhiKhongThayNguoiDuyetDon = row.data_NhanMailKhiKhongTimThayNguoiDuyetDon;
		}
		else {
			this.listKhiKhongThayNguoiDuyetDon = [];
		}
		this.changeDetectorRefs.detectChanges();
	}
	//===Button xóa trên lưới===========
	deleteItem(row: any) {
		const _title = "Xóa";
		const _description = "Bạn có chắc muốn xóa không";
		const _waitDesciption = "Dữ liệu đang được xóa";
		const _deleteMessage = "Xóa thành công";

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.nhapQuyTrinhDuyetService.deleteQuyTrinhDuyet(row.ID_QuyTrinh, row.TenQuyTrinh).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete, 5000, true, false);
				}
				else {
					this.layoutUtilsService.showActionNotification(res.error.message, MessageType.Read, 5000, true, false, 3000, 'top');
				}
				this.loadDataList();
			});
		});
	}
	//============Goi Popup=================
	AddQuyTrinhDuyet() {
		const quytrinhModel = new NhapQuyTrinhDuyetModel();
		quytrinhModel.clear(); // Set all defaults fields
		this.UpdateQuyTrinhDuyet(quytrinhModel);
	}
	UpdateQuyTrinhDuyet(_item: NhapQuyTrinhDuyetModel) {
		const _saveMessage = _item.ID_QuyTrinh > 0 ? "Cập nhật thành công" : "Thêm thành công";
		const _messageType = _item.ID_QuyTrinh > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(NhapQuyTrinhDuyetEditComponent, { data: { _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else {
				this.layoutUtilsService.showActionNotification(_saveMessage, _messageType, 5000, true, false);
				this.loadDataList();
			}
		});

	}
}
