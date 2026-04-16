import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
// Services
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { NienHanDuyetService } from '../Services/nien-han-duyet.service';

@Component({
	selector: 'm-nien-han-duyet-list',
	templateUrl: './nien-han-duyet-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class NienHanDuyetListComponent implements OnInit {
	// Table fields
	filterCondition = '';
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	expandedElement: any | null;

	UserInfo: any;
	selectedTab: number = 0;
	lstDot: any[] = [];
	filterprovinces: number = 0;
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	list_button: boolean = false;
	range: number = 0;

	constructor(public NienHanService1: NienHanDuyetService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._name = this.translate.instant("Danh sách nhập niên hạn");
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
				this.getRange();
			}
		})
	}

	getRange() {
		this.NienHanService1.getRange().subscribe(res => {
			if (res && res.status == 1) {
				this.range = res.data;
			}
		})
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
		this.CommonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
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

	rowClick(element: any) {
		if (element.Id > 0) return;
		this.expandedElement = this.expandedElement === element.DistrictID ? null : element.DistrictID;
	}

	changed_tab($event) {
		//this.selectedTab = $event;
	}
}