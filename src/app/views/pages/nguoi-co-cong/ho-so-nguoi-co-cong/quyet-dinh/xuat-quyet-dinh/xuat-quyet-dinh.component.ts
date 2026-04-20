import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { QuyetDinhService } from '../Services/quyet-dinh.service';
import { QuyetDinhDataSource } from '../Model/data-sources/quyet-dinh.datasource';
import { environment } from '../../../../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-xuat-quyet-dinh',
	templateUrl: './xuat-quyet-dinh.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class XuatQuyetDinhComponent implements OnInit {
	lstLoai: any[] = [];//nhóm quyết định
	lstLoaiHoSo: any[] = [];
	lstLoaiHoSo2: any[] = [];
	list_button: boolean = false;

	// Table fields
	dataSource: QuyetDinhDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	// filter District
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	lstStatus: any[] = [];
	lstcc: any[] = [];
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	Capcocau: number = 0;
	filterCC: number = 0;

	constructor(public objectService: QuyetDinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private cookieService: CookieService,
		private detechChange: ChangeDetectorRef,
		private tokenStorage: TokenStorage) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.commonService.liteConstLoaiQuyetDinh(true).subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoai = res.data;
				this.detechChange.detectChanges();
			}
		})
		this.commonService.liteConstLoaiHoSo(false).subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoaiHoSo = res.data;
				this.detechChange.detectChanges();
			}
		})
		this.commonService.liteConstLoaiHoSo_DT().subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoaiHoSo2 = res.data;
				this.detechChange.detectChanges();
			}
		})
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterDistrictID(+res.ID_Goc_Cha)
			}
		})

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.commonService.liteCanCu().subscribe(res => {
			if (res && res.status == 1)
				this.lstcc = res.data;
		})

		this.selection = new SelectionModel<any>(true, []);
		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.LoaiHoSo = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.commonService.getStatusNCC().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				if (!this.gridService) return;
				this.gridService.model.filterGroupDataChecked['Status'] = this.lstStatus.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})

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
				name: 'SoHoSo',
				displayName: 'Sổ Hồ Sơ',
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
				stt: 6,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'KhomAp',
				displayName: 'Khóm/ấp ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'LoaiHoSo',
				displayName: 'Loại hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'NguoiThoCungLietSy',
				displayName: 'Người thờ cúng liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'QuanHeVoiLietSy',
				displayName: 'Quan hệ với liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 12,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: false,
			},
			// {
			// 	stt: 13,
			// 	name: 'SoQuyetDinh',
			// 	displayName: 'Quyết định',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
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
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
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
		this.gridModel.availableColumns = availableColumns;
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
		this.gridService.cookieName = 'displayedColumns_xqd'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_xqd'));

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
		this.dataSource = new QuyetDinhDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams.sortField = 'NgayGui';
				queryParams.sortOrder = 'desc';
				this.dataSource.loadListNCC(queryParams);
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

	checkDT(arr: any, id_dt: any) {
		let idx = arr.findIndex((x: any) => x.id==id_dt);
		return idx > -1;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.detechChange.detectChanges();
		});
	}
	
	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
		this.loadDataList();
	}

	filterWardD(id: any) {
		this.filterward = id;
		this.loadDataList();
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
		this.dataSource.loadListNCC(queryParams);
	}

	viewCT(id: number) {
		window.open('/chi-tiet-ho-so/'+id, '_blank')
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterdistrict > 0) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.gridService &&  this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.LoaiHoSo = this.gridService.model.filterText.LoaiHoSo;
		}
		return filter;
	}

	chon($event: any) {
		this.selection.clear();
		$event.stopPropagation();
	}

	getStatusString(status: any) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f) return "";
		return f.data.color;
	}

	in(IdTemplate = 0, id_ncc = 0, ispdf: boolean = true) {
		if (id_ncc == 0) {
			if (this.selection.selected.length > 0)
				id_ncc = this.selection.selected[0].Id;
		}
		this.objectService.downloadByTemplate(IdTemplate, id_ncc, ispdf).subscribe(
			response => {
				const headers = response.headers;
				const type = headers.get('content-type');
				const filename = headers.get('x-filename');
				let ApiRoot = environment.ApiRoot.slice(0, environment.ApiRoot.length - 3);
				//let path = "viewer/file-dinh-kem/0?path=" + ApiRoot + "dulieu/quyet-dinh/" + filename;
				let path = ApiRoot + "dulieu/quyet-dinh/" + filename;
				window.open(path, "_blank");
			},
			(err) => {
				this.layoutUtilsService.showError("Không tìm thấy biểu mẫu");
			});
		// this.objectService.previewByTemplate(IdTemplate, id_ncc).subscribe(res => {
		// 	if (res && res.status == 1) {
		// 		const dialogRef = this.dialog.open(ReviewDocxComponent, { data: res.data });
		// 		dialogRef.afterClosed().subscribe(res2 => {
		// 			if (!res2) {
		// 			} else {
		// 				this.objectService.downloadByTemplate(IdTemplate, id_ncc).subscribe(response => {
		// 					const headers = response.headers;
		// 					const filename = headers.get('x-filename');
		// 					const type = headers.get('content-type');
		// 					const blob = new Blob([response.body], { type });
		// 					const fileURL = URL.createObjectURL(blob);
		// 					const link = document.createElement('a');
		// 					link.href = fileURL;
		// 					link.download = filename;
		// 					link.click();
		// 				}, (err) => {
		// 					this.layoutUtilsService.showError("Không tìm thấy biểu mẫu");
		// 				});
		// 			}
		// 		});
		// 	} else
		// 		this.layoutUtilsService.showError(res.error.message);
		// });
	}
}