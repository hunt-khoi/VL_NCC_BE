import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel, MessageType } from '../../../../../../core/_base/crud';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapQuyTrinhDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { NhapQuyTrinhDuyetEditComponent } from '../nhap-quy-trinh-duyet-edit/nhap-quy-trinh-duyet-edit.component';
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
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

	dataSource: NhapQuyTrinhDuyetDataSource | undefined;
	displayedColumns = ['#', 'TieuDe', 'MoTa', 'Loai', 'NhanMailKhiDuyetDon', 'NhanMailKhiKhongDuyetDon', 'NhanMailKhiKhongTimThayNguoiDuyetDon', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<NhapQuyTrinhDuyetModel>(true, []);
	productsResult: NhapQuyTrinhDuyetModel[] = [];
	// Filter fields
	//List các danh sách email
	listKhiDuyetDon: any[] = [];
	listKhiKhongDuyetDon: any[] = [];
	listKhiKhongThayNguoiDuyetDon: any[] = [];
	//==========================
	itemForm: FormGroup | undefined;
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
	list_button: boolean = false;

	constructor(
		public nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
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
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
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
		if (!this.paginator || !this.sort || !this.dataSource) return;
		const queryParams = new QueryParamsModel({},
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadList(queryParams);
	}

	//====================================================================================
	//===Button update trên lưới===========
	Update(row: any) {
		this.showvitri = false;
		this.showButton = true;
		this.item.ID_QuyTrinh = row.ID_Row;
		this.item.TenQuyTrinh = row.TieuDe;
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
		if (this.itemForm) {
			this.itemForm.controls['tenQuyTrinh'].setValue(row.TieuDe);
			this.itemForm.controls['moTa'].setValue(row.MoTa);
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
			if (!res) return;
			
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