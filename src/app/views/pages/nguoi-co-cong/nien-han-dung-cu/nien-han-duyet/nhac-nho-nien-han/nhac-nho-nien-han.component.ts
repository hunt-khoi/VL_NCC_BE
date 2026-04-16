import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, OnChanges, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import * as moment from 'moment';
import { SettingProcessComponent } from '../../../components';
import { NienHanDuyetDataSource } from '../Model/data-sources/nien-han-duyet.datasource';
import { NienHanDuyetService } from '../Services/nien-han-duyet.service';
import { NienHanDuyetDialogComponent } from '../nien-han-duyet/nien-han-duyet.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-nhac-nho-nien-han',
	templateUrl: './nhac-nho-nien-han.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class NhacNhoNienHanComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: NienHanDuyetDataSource;
	nam: number;
	dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@Input() isxa: boolean = false;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;

	productsResult: any[] = [];
	idCommentShowDialog = 0;
	UserInfo: any;
	lstDot: any[] = [];
	filterprovinces: number;
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	list_button: boolean;
	Capcocau: number = 0;
	istonghop: boolean;

	constructor(public NienHanService1: NienHanDuyetService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this.nam = moment().get("year");
		this._name = this.translate.instant("Danh sách nhập niên hạn");
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
			this.Capcocau = res.Capcocau;
		})
		this.CommonService.liteDotNienHan(true).subscribe(res => {
			this.lstDot = res.data;
		})
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotNienHan'] = "";

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		let availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'DotNienHan',
				displayName: 'Đợt nhập niên hạn',
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
			{
				stt: 6,
				name: this.isxa ? 'Xa' : 'DistrictName',
				displayName: this.isxa ? 'Xã' : 'Huyện',
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
				stt: 8,
				name: 'TongTien',
				displayName: 'Tổng tiền',
				alwaysChecked: false,
				isShow: true
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

		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		this.dataSource = new NienHanDuyetDataSource(this.NienHanService1);

		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	loadListDot() {
		this.dot = 0;
		this.dataSource.entitySubject.next([]);
		this.CommonService.liteDotNienHan(true, this.nam).subscribe(res => {
			this.lstDot = res.data;
		})
		this.loadDataList()
	}

	sortChange($event) {
		this.sort = $event;
		// If the user changes the sort order, reset back to the first page.
		this.paginator.pageIndex = 0;
		this.loadDataList();
	}
	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
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
	
	nhacnhos() {
		let field = this.isxa ? "Id_Xa" : "DistrictID"
		let ids = [];
		ids = this.productsResult.filter(x => x.Id==null).map(x => x[field]);
		let data = {
			dot: this.dot,
			ids: ids
		}
		this.NienHanService1.nhacNho(data).subscribe(res => {
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở thành công")
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	nhacnho(item) {
		let id = this.isxa ? item.Id_Xa : item.DistrictID;
		let data = {
			dot: this.dot,
			ids: [id]
		}
		this.NienHanService1.nhacNho(data).subscribe(res => {
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở thành công")
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}
	timeline(QuaTrinhKhongCoNguoiDuyet: any) {
		var data = { id_phieu: QuaTrinhKhongCoNguoiDuyet.Id };
		const dialogRef = this.dialog.open(SettingProcessComponent, { data: { data: data, Type: 7 } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}

	DuyetNienHan(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NienHanDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.loadDataList();
			}
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams, true, this.isxa);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.dot > 0)
			filter.Id_Dot = this.dot;
		return filter; //trả về đúng biến filter
	}

}
