import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ReviewExportComponent, SettingProcessComponent } from '../../../components';
import { HuongDanDataSource } from '../Model/data-sources/huong-dan.datasource';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';
import { HuongDanHuongThienDialogComponent } from '../huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';
import { HoSoNCCDuyetDialogComponent } from '../ho-so-ncc-duyet/ho-so-ncc-duyet-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-huong-dan-list',
	templateUrl: './huong-dan-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HuongDanListComponent implements OnInit {

	// Table fields
	dataSource: HuongDanDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name = '';
	// filter District
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;

	constructor(
		public objectService: HoSoNCCDuyetService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
			this._name = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.Capcocau = res.Capcocau;
				this.filterdistrict = '' + res.ID_Goc_Cha;
				this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterGroupDataChecked['TinhTrang'] = [{
			name: 'Đã duyệt',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa duyệt',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre_Duyet'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'ngay_tao',
				displayName: 'Ngày hướng dẫn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'SoHoSo',
				displayName: 'Số Hồ Sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'KhomAp',
				displayName: 'Khóm/ấp ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'LoaiHoSo',
				displayName: 'Loại hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 13,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 14,
				name: 'NguoiThoCungLietSy',
				displayName: 'Người thờ cúng liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 15,
				name: 'QuanHeVoiLietSy',
				displayName: 'Quan hệ với liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(
			true,
			this.gridModel.availableColumns
		);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

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
		this.dataSource = new HuongDanDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
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
		this.dataSource.loadList(queryParams);
	}
	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.filterward = '';
		this.loadDataList();
		this.commonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}
	filterWardID(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterdistrict) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
		}
		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.filter(row => !row.IsEnable_Duyet).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (!row.IsEnable_Duyet)
					this.selection.select(row)
			});
		}
	}

	Duyet(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(HoSoNCCDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				//this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	Download(object: any) {
		window.open(object.path, '_blank');
	}

	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 2 } });
		dialogRef.afterClosed().subscribe(res => { });
	}

	inhuongdan(id_quatrinh_lichsu: number) {
		this.commonService.getHuongDan(id_quatrinh_lichsu, 5).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res2 => {
					this.commonService.exportHuongDan(id_quatrinh_lichsu, 5, res2.loai).subscribe(response => {
						const headers = response.headers;
						const filename = headers.get('x-filename');
						const type = headers.get('content-type');
						const blob = new Blob([response.body], { type });
						const fileURL = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = fileURL;
						link.download = filename;
						link.click();
					}, err => {
						this.layoutUtilsService.showError("Xuất hướng dẫn thất bại")
					});
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	capNhat(id_quatrinh_lichsu: number) {
		let item = { id_quytrinh_lichsu: id_quatrinh_lichsu };
		const dialogRef = this.dialog.open(HuongDanHuongThienDialogComponent, { data: {item} });
		dialogRef.afterClosed().subscribe(res => { });
	}
}