import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Services
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ReviewExportComponent, SettingProcessComponent } from '../../../components';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';
import { HoSoNCCDuyetDataSource } from '../Model/data-sources/ho-so-ncc-duyet.datasource';
import { HoSoNCCDuyetDialogComponent } from '../ho-so-ncc-duyet/ho-so-ncc-duyet-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-ho-so-ncc-duyet-list',
	templateUrl: './ho-so-ncc-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCDuyetListComponent implements OnInit {
	// Table fields
	dataSource: HoSoNCCDuyetDataSource | undefined;
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
	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = true;
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	selectedTab: number = 0;

	constructor(
		public objectService: HoSoNCCDuyetService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
			this._name = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.route.data.subscribe(data => {
			if (data.IsEnable_Duyet!=undefined)
				this.IsEnable_Duyet = data.IsEnable_Duyet;
		})
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
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'CreatedDate', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.LoaiHoSo = '';
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
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: true,
				isShow: true,
			},
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
			//{
			//	stt: 11,
			//	name: 'TinhTrang',
			//	displayName: 'Tình trạng',
			//	alwaysChecked: false,
			//	isShow: false,
			//},
			//{
			//	stt: 13,
			//	name: 'IsTre',
			//	displayName: 'Trễ hạn',
			//	alwaysChecked: false,
			//	isShow: true,
			//},
			{
				stt: 12,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: true,
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
			// {
			// 	stt: 94,
			// 	name: 'CreatedDate1',
			// 	displayName: 'Ngày tạo1',
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
				isShow: true,
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
		this.gridService.cookieName = 'displayedColumns_hosonccdaduyet'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hosonccdaduyet'));

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
		this.dataSource = new HoSoNCCDuyetDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				queryParams.filter.IsEnable_Duyet = this.IsEnable_Duyet;
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
		this.selection.clear();
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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
		filter.IsEnable_Duyet = this.IsEnable_Duyet;
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.LoaiHoSo = this.gridService.model.filterText.LoaiHoSo;
		}
		return filter;
	}

	/* UI */
	getItemStatusString(status: boolean = true): string {
		switch (status) {
			case true:
				return 'Đã duyệt';
			case false:
				return 'Chưa duyệt';
		}
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'success';
			case false:
				return 'metal';
		}
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	viewCT(id: number) {
		window.open('/chi-tiet-ho-so/'+id, '_blank')
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

	duyets(duyet: boolean = true) {
		var data = {
			ids: this.selection.selected.filter(x => !x.IsEnable_Duyet).map(x => x.Id),
			value: duyet
		};
		let tt = duyet ? 'DUYET' : 'KHONGDUYET';
		const _title = this.translate.instant('OBJECT.' + tt + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + tt + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + tt + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + tt + '.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.objectService.Duyets(data).subscribe(res => {
				if (res && res.status === 1) {
					let str = " " + res.data.success + "/" + res.data.total;
					this.layoutUtilsService.showInfo(_deleteMessage + str);
					this.ngOnInit();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
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

	Download(object: any) {
		window.open(object.path, '_blank');
	}

	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 2 } });
		dialogRef.afterClosed().subscribe(res => { });
	}

	changeTab($event: any) {
		this.selectedTab = $event;
		//this.filterConfiguration();
	}

	inhuongdan(QuaTrinhKhongCoNguoiDuyet: any) {
		let id_quatrinh_lichsu: number = 0;
		this.commonService.getIdHuongDan(QuaTrinhKhongCoNguoiDuyet.Id, 2).subscribe(res1 => {
			if (res1 && res1.status == 1) {
				id_quatrinh_lichsu = +res1.data;
				this.commonService.getHuongDan(id_quatrinh_lichsu, 2).subscribe(res => {
					if (res && res.status == 1) {
						const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
						dialogRef.afterClosed().subscribe(res2 => {
							if (!res2) return;
							this.commonService.exportHuongDan(id_quatrinh_lichsu, 2, res2.loai).subscribe(response => {
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
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				})
			}  else {
				this.layoutUtilsService.showError(res1.error.message);
			}
		});
	}

	InBienNhan(object: any) {
		this.commonService.getBienNhan(object.Id).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res2 => {
					if (!res2) return;
					this.commonService.exportBienNhan(object.Id, res2.loai).subscribe(response => {
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
						this.layoutUtilsService.showError("Xuất biên nhận thất bại")
					});
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	TraLai(item: any) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(HoSoNCCDuyetDialogComponent, { data: { _item, isDuyet: true, isReturn: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadDataList();
			}
		});
	}

	Export() {
		if (!this.paginator || !this.sort || !this.gridService) return;
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'SoQuyetDinh' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});

		let index = cols.indexOf("Id_HinhThuc");
		if (index != -1)
			cols[index] = 'strHinhThuc';
		index = cols.indexOf("IsTre_Duyet");
		if (index != -1) 
			cols[index] = 'Deadline_Duyet';
		index = cols.indexOf("IsTre");
		if (index != -1) 
			cols[index] = 'Deadline';

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols
			},
			true
		);
		this.objectService.exportListHS_DaDuyet(queryParams).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất danh sách thất bại")
		});
	}

	print: boolean = false;
	printTicket(print_template: any) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();
		const element = document.getElementById(print_template);
		if (!element) return;
		let innerContents = element.innerHTML;
		let str = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for CreatedDate">Ngày tạo</button>';
		let str1 = '<span aria-label="Change sorting for CreatedDate">Ngày tạo</span>';
		innerContents = innerContents.replace(str, str1);
		let zoom = '';
		if (this.gridService && this.gridService.IsAllColumnsChecked()) {
			zoom = `body {
				zoom: 60%;
			}`;
		}
		let title = !this.IsEnable_Duyet? 'Hồ sơ người có công cần duyệt' : 'Hồ sơ người có công đã duyệt';
		const popupWinindow = window.open();
		if (!popupWinindow) return;
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>'+title+'</title></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print {
			`+zoom+`
			th:last-child,
			td:last-child,
			.hiden-print {
				display: none !important;
			}
			td {
				border-bottom: 1px solid #dee2e6;
				padding: 10px;
				font-size: 10pt;
			}
			th {
				padding: 10px;
				font-size: 12pt;
			}
		}
		</style>
		`);

		popupWinindow.document.close();
		// popupWinindow.print();
		popupWinindow.onafterprint = window.close;
		// setTimeout(popupWinindow.close, 0);
		this.print = false;
		this.changeDetectorRefs.detectChanges();
	}
}