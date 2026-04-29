import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { CanCuService } from '../Services/can-cu.service';
import { BieuMauService } from '../Services/bieu-mau.service';
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { CanCuEditDialogComponent } from '../can-cu-edit/can-cu-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-can-cu-list',
	templateUrl: './can-cu-list.component.html'
})
export class CanCuListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = "";
	gridService: TableService | undefined;
	girdModel: TableModel | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		public CommonService: CommonService,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private bmService: BieuMauService,
		private ccService: CanCuService) {
		this._name = this.translate.instant("CANCU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.girdModel = new TableModel();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['SoCanCu'] = "";
		this.girdModel.filterText['CanCu'] = "";
		this.girdModel.filterText['NguoiKy'] = "";
		this.girdModel.filterText['CoQuanBanHanh'] = "";
		this.girdModel.filterText['PhanLoai'] = "";

		let optionsTinhTrang = [
			{
				name: 'Chưa có hiệu lực',
				value: 'null',
			},
			{
				name: 'Hiệu lực',
				value: 'True',
			},
			{
				name: 'Hết hiệu lực',
				value: 'False',
			}
		];
		this.girdModel.filterGroupDataChecked['IsHieuLuc'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);

		//#region ***Drag Drop***
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
				name: 'SoCanCu',
				displayName: 'Số căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'CanCu',
				displayName: 'Căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'NgayBanHanh',
				displayName: 'Ngày ban hành',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 4,
				name: 'HieuLuc_From',
				displayName: 'Hiệu lực từ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'HieuLuc_To',
				displayName: 'Hiệu lực đến',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 6,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 7,
				name: 'IsHieuLuc',
				displayName: 'Có hiệu lực',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 8,
				name: 'NguoiKy',
				displayName: 'Người ký',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 9,
				name: 'CoQuanBanHanh',
				displayName: 'Cơ quan ban hành',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 10,
				name: 'PhanLoai',
				displayName: 'Phân loại',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 10,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			},
		];
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_cancu'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_cancu'));
		//#endregion

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

		this.dataSource = new CanCuBieuMauDataSource(this.bmService, this.ccService);
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				let queryParams = this.ccService.lastFilter$.getValue();
				this.dataSource.loadListCanCu(queryParams);
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

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadListCanCu(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.SoCanCu = this.gridService.model.filterText['SoCanCu'];
			filter.CanCu = this.gridService.model.filterText['CanCu'];
			filter.NguoiKy = this.gridService.model.filterText['NguoiKy'];
			filter.CoQuanBanHanh = this.gridService.model.filterText['CoQuanBanHanh'];
			filter.PhanLoai = this.gridService.model.filterText['PhanLoai'];
		}
		return filter;
	}

	Add() {
		let _item: any = { Id: 0, Priority:1 };
		this.Edit(_item);
	}

	Edit(_item: any, allowEdit: boolean=true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(CanCuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	Delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.ccService.Delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	getItemCssClassByStatus(status: boolean): string {
		if (status == null)
			return '';
		switch (status) {
			case true:
				return 'kt-badge--success';
			case false:
				return 'kt-badge--metal';
		}
	}

	getItemStatusString(status: boolean): string {
		if (status == null)
			return 'Chưa có hiệu lực'
		switch (status) {
			case true:
				return 'Hiệu lực';
			case false:
				return 'Hết hiệu lực';
		}
	}
	
	Download(object: any) {
		window.open(object.path, '_blank');
	}
}