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
import { BieuMauService } from '../Services/bieu-mau.service';
import { CanCuService } from '../Services/can-cu.service';
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { BieuMauEditDialogComponent } from '../bieu-mau-edit/bieu-mau-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-bieu-mau-list',
	templateUrl: './bieu-mau-list.component.html'
})
export class BieuMauListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name: string = "";
	gridService: TableService | undefined;
	gridModel: TableModel | undefined;
	lstLoai: any[] = [];
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService,
		private cookieService: CookieService,
		private bmService: BieuMauService,
		private ccService: CanCuService,
		private commonService: CommonService) {
		this._name = this.translate.instant("BIEUMAU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['So'] = "";
		this.gridModel.filterText['BieuMau'] = "";
		this.gridModel.filterText['Version'] = "";
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
		this.gridModel.filterGroupDataChecked['IsHieuLuc'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		this.commonService.liteCanCu().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				let lst = res.data.map((x: any) => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataChecked['SoCanCu'] = lst;
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})
		this.commonService.ListLoaiBieuMau().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.lstLoai = res.data;
				this.gridService.model.filterGroupDataChecked['Loai'] = this.lstLoai.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})

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
				name: 'So',
				displayName: 'Số',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 3,
				name: 'BieuMau',
				displayName: 'Biểu mẫu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Version',
				displayName: 'Phiên bản',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Loai',
				displayName: 'Nhóm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'SoCanCu',
				displayName: 'Căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'HieuLuc_From',
				displayName: 'Hiệu lực từ',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 5,
				name: 'HieuLuc_To',
				displayName: 'Hiệu lực đến',
				alwaysChecked: false,
				isShow: false
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

				stt: 10,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			},
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService, 
			this.ref, 
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_bieumau1'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_bieumau1'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		this.dataSource = new CanCuBieuMauDataSource(this.bmService, this.ccService);
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				let queryParams = this.bmService.lastFilter$.getValue();
				this.dataSource.loadListBieuMau(queryParams);
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
		this.dataSource.loadListBieuMau(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.So = this.gridService.model.filterText['So'];
			filter.BieuMau = this.gridService.model.filterText['BieuMau'];
			filter.Version = this.gridService.model.filterText['Version'];
		}
		return filter;
	}

	Add() {
		let item: any = { Id: 0, Version: '1.0.0', content: '$', isTinh: true, isHuyen: false, isXa: false }; //ko tự check huyện, xã
		this.Edit(item);
	}

	Edit(_item: any, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(BieuMauEditDialogComponent, { data: { _item, allowEdit } });
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

			this.bmService.Delete(item.Id).subscribe(res => {
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

	getLoai(loai: any) {
		let find = this.lstLoai.find(x => x.id == loai);
		if (find)
			return find.title;
		return '';
	}

	download(item: any) {
		let IdTemplate = item.Id;
		//this.bmService.previewByTemplate(IdTemplate).subscribe(res => {
		//	if (res && res.status == 1) {
		//		const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		//		dialogRef.afterClosed().subscribe(res => {
		//			if (!res) {
		//			} else {
		//				this.bmService.exportByTemplate(IdTemplate, res.loai).subscribe(response => {
		//					const headers = response.headers;
		//					const filename = headers.get('x-filename');
		//					const type = headers.get('content-type');
		//					const blob = new Blob([response.body], { type });
		//					const fileURL = URL.createObjectURL(blob);
		//					const link = document.createElement('a');
		//					link.href = fileURL;
		//					link.download = filename;
		//					link.click();
		//				});
		//			}
		//		});
		//	} else
		//		this.layoutUtilsService.showError(res.error.message);
		//})

		this.bmService.download(IdTemplate).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}
}