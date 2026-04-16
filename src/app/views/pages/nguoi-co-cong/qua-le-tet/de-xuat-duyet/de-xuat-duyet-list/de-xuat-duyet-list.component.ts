import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { DeXuatDuyetDataSource } from '../Model/data-sources/de-xuat-duyet.datasource';
import { DeXuatDuyetService } from '../Services/de-xuat-duyet.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { DeXuatDuyetDialogComponent } from '../de-xuat-duyet/de-xuat-duyet.dialog.component';
import { DeXuatEditDialogComponent } from '../../de-xuat/de-xuat-edit/de-xuat-edit.dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import * as moment from 'moment';
import { DeXuatTongHopDialogComponent } from '../de-xuat-tong-hop/de-xuat-tong-hop.dialog.component';
import { DisplayHtmlContentComponent, SettingProcessComponent } from '../../../components';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-de-xuat-duyet-list',
	templateUrl: './de-xuat-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class DeXuatDuyetListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: DeXuatDuyetDataSource;
	@Input() donvi: any;
	@Input() nam: number;
	@Input() dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	expandedElement: any | null;

	idCommentShowDialog = 0;
	UserInfo: any;
	selectedTab: number = 0;
	lstDot: any[] = [];
	filterprovinces: number = 0;
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	list_button: boolean = false;

	constructor(public DeXuatService1: DeXuatDuyetService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
			this.nam = moment().get("year");
			this._name = this.translate.instant("DE_XUAT.NAME");
			this.route.queryParams.subscribe(params => {
				this.idCommentShowDialog = +params['showcmt'];
			});
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.route.data.subscribe(data => {
			if (data.IsEnable_Duyet != undefined)
				this.IsEnable_Duyet = data.IsEnable_Duyet;
		})
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.filterdistrict = '' + res.ID_Goc_Cha;
				this.CommonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		this.CommonService.liteDotQua(true, this.nam).subscribe(res => {
			this.lstDot = res.data;
		})
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotTangQua'] = "";
		this.gridModel.filterText['MoTa'] = "";

		this.gridModel.filterGroupDataChecked['IsTre'] = [{
			name: 'Trễ hạn', value: 'True', checked: false
		},
		{
			name: 'Chưa trễ hạn', value: 'False', checked: false
		}]
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

		let availableColumns = [
			{
				stt: 0,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'DotTangQua',
				displayName: 'Đợt tặng quà lễ tết',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true
			},
			//{
			//	stt: 4,
			//	name: 'Id_NguonKinhPhi',
			//	displayName: 'Nguồn kinh phí',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{
				stt: 5,
				name: 'NhomLeTet',
				displayName: 'Nhóm lễ tết',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'DistrictName',
				displayName: 'Huyện',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'Id_Xa',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'SLTang',
				displayName: 'SL tăng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'SLGiam',
				displayName: 'SL giảm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongSo',
				displayName: 'Tổng số',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'TongTien',
				displayName: 'Tổng tiền',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'IsTre_Duyet',
				displayName: 'Thời hạn cá nhân',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 11,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 12,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 13,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_dxd' 
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dxd'));
		this.LoadFilterGroupData(); //load group

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new DeXuatDuyetDataSource(this.DeXuatService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.DeXuatService1.lastFilter$.getValue();
			queryParams.filter.IsEnable_Duyet = this.IsEnable_Duyet;
			if (this.nam)
				queryParams.filter.Nam = this.nam;
			if (this.dot > 0)
				queryParams.filter.Id_DotTangQua = this.dot;
			if (this.UserInfo.Capcocau < 3 && this.selectedTab > 0)//huyện, tỉnh tổng hợp
				queryParams.more = true;
			// First load
			this.dataSource.loadList(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});

		this.ShowDialog();
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.CommonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.filterward = '';
		this.loadDataList();
		this.CommonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	loadListDot() {
		this.dot = 0;
		this.selection.clear();
		this.dataSource.entitySubject.next([]);
		this.CommonService.liteDotQua(true, this.nam).subscribe(res => {
			this.lstDot = res.data;
		})
		if (this.selectedTab == 0)
			this.loadDataList();
	}

	sortChange($event) {
		this.sort = $event;
		// If the user changes the sort order, reset back to the first page.
		//this.paginator.pageIndex = 0;
		this.loadDataList();
	}
	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
	}

	ShowDialog() {
		// if (this.idCommentShowDialog > 0) {
		// 	var _item: any = {};
		// 	_item.Id = this.idCommentShowDialog;
		// 	this.DuyetDotTangQua(_item, false);
		// }
	}

	/* HÀM LOAD FILTER GROUPDATA
	*/
	LoadFilterGroupData() {
		this.CommonService.liteNhomLeTet().subscribe(res => {
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked.Id_NhomLeTet = res.data.map(x => {
					return {
						id: x.id,
						name: x.title,
						value: x.id,
						checked: false
					};
				});
			} else {
				this.gridService.model.filterGroupDataChecked.Id_NhomLeTet = [];
			}
			this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
		});
	}
	changeTab($event) {
		this.selectedTab = $event;
		this.selection.clear();
		this.dataSource.entitySubject.next([]);
		if (this.selectedTab == 1 && this.dot == 0)
			return;
		this.loadDataList(false);
	}
	loadDataList(holdCurrentPage: boolean = true) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		if (this.UserInfo.Capcocau < 3 && this.selectedTab > 0)//huyện, tỉnh tổng hợp
			queryParams.more = true;
		this.dataSource.loadList(queryParams, this.selectedTab == 0 ? 3 : this.UserInfo.Capcocau);
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.IsEnable_Duyet = this.IsEnable_Duyet;
		if (this.selectedTab == 1) {
			filter.id_dot = this.dot;
			filter.id_huyen = this.UserInfo.ID_Goc_Cha;
			return filter;
		} else {
			if (this.filterdistrict != '')
				filter.Id_Huyen = this.filterdistrict;
			if (this.filterward != '')
				filter.Id_Xa = this.filterward;
		}
		if (this.nam)
			filter.Nam = this.nam;
		if (this.dot > 0)
			filter.Id_DotTangQua = this.dot;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.DotTangQua = this.gridService.model.filterText['DotTangQua'];
			filter.MoTa = this.gridService.model.filterText['MoTa'];
		}
		if (this.donvi) {
			if (this.donvi.Type == 'H')
				filter.Id_Huyen = this.donvi.ID_Goc;
			if (this.donvi.Type == 'X')
				filter.Id_Xa = this.donvi.ID_Goc;
		}
		return filter; //trả về đúng biến filter
	}

	DuyetDotTangQua(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(DeXuatDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.loadDataList();
			}
		});
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}
	detail(_item) {
		const dialogRef = this.dialog.open(DeXuatEditDialogComponent, { data: { _item, allowEdit: false }, disableClose: true });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
			}
		});
	}

	rowClick(element) {
		if (element.Id > 0)
			return;
		this.expandedElement = this.expandedElement === element.DistrictID ? null : element.DistrictID;
	}
	
	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		let numRows = this.productsResult.filter(row => !row.IsEnable_Duyet && row.Id != null).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (!row.IsEnable_Duyet && row.Id != null)
					this.selection.select(row)
			});
		}
	}

	showCanDuyet(item) {
		let html = `<table style="width:100%" class="table-bordered table-sm">
		<tr>
			<th class="stt-cell">STT</th>
			<th class="text-center">Xã</th>
			<th class="text-center">SL tăng</th>
			<th class="text-center">SL giảm</th>
			<th class="text-center">Tổng số</th>
			<th class="text-center">Đã gửi</th>
			<th class="text-center">Đã duyệt</th>
		</tr>`;
		let arr: any[] = item.Xa.list;
		arr.forEach(function (x, index) {
			html += `<tr style="` + (x.IsEnable_Duyet ? "color:red" : "") + `">
						<td class="text-center">${index + 1}</td>
						<td>${x.Title}</td>
						<td class="text-center">${x.SLTang}</td>
						<td class="text-center">${x.SLGiam}</td>
						<td class="text-center">${x.TongSo}</td>
						<td class="text-center">${x.SentDate}</td>
						<td class="text-center">${x.NgayDuyet}</td>
					</tr>`	;
		})
		html += `</table>`;
		let data = { html: html, title: 'Danh sách xã thuộc huyện' }
		const dialogRef = this.dialog.open(DisplayHtmlContentComponent, { data: data });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
			}
		})
	}

	detailTongHop(data: any, allowEdit: boolean = true) {
		data.dot = this.dot;
		const dialogRef = this.dialog.open(DeXuatTongHopDialogComponent, { data: { data, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
			}
		})
	}

	duyets(duyet = true, isTongHop: boolean = false) {
		let lst = this.selection.selected.filter(x => !x.IsEnable_Duyet).map(x => x.Id);
		if (lst.length == 0)
			return;
		if (isTongHop) {
			let data = { dv: this.UserInfo.ID_Goc_Cha, ids: lst };
			if (this.UserInfo.Capcocau == 1) //tỉnh
			{
				lst = [];
				for (var i = 0; i < this.selection.selected.length; i++) {
					let x = this.selection.selected[i];
					if (!x.IsEnable_Duyet)
						lst = lst.concat(x.ids);
				}
				data = { dv: 0, ids: lst };
			}
			this.detailTongHop(data);
			return;
		}
		var data = {
			ids: lst,
			value: duyet
		};
		let tt = duyet ? 'DUYET' : 'KHONGDUYET';
		const _title = this.translate.instant('OBJECT.' + tt + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + tt + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + tt + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + tt + '.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.DeXuatService1.Duyets(data).subscribe(res => {
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
	nhacnhos() {
		let ids = [];
		if (this.UserInfo.Capcocau == 2)
			ids = this.productsResult.filter(x => x.Id == null).map(x => x.Id_Xa);
		if (this.UserInfo.Capcocau == 1)
			ids = this.productsResult.filter(x => +x.Xa.sl > +x.Xa.can_duyet).map(x => x.DistrictID);
		let data = {
			cap: this.UserInfo.Capcocau,
			dot: this.dot,
			ids: ids
		}
		this.DeXuatService1.nhacNho(data).subscribe(res => {
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở thành công")
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
			;
	}

	nhacnho(id_xa: any) {
		let data = {
			cap: this.UserInfo.Capcocau,
			dot: this.dot,
			ids: [id_xa]
		}
		this.DeXuatService1.nhacNho(data).subscribe(res => {
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở thành công")
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 1 } });
		dialogRef.afterClosed().subscribe(res => { });
	}
	
	TraLai(item: any) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(DeXuatDuyetDialogComponent, { data: { _item, isDuyet: true, isReturn: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.loadDataList();
			}
		});
	}
}