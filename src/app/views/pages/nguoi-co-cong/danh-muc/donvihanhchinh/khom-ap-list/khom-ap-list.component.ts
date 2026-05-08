import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge, ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { KhomApEditDialogComponent } from '../khom-ap-edit/khom-ap-edit.dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-khom-ap-list',
	templateUrl: './khom-ap-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class KhomApListComponent implements OnInit {
	// Table fields
	dataSource: donvihanhchinhDataSource | undefined;
	displayedColumns = ['RowID','Title', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterward = '';
	listward: any[] = [];
	FilterCtrlWard: string = '';
	filteredListWard: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	_name = '';

    gridService: TableService | undefined;
    gridModel: TableModel | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public apiService: donvihanhchinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private danhMucService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
		this._name = 'Khóm, ấp';
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.loadWard();
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.WardName = '';
		this.gridModel.filterText.Title = '';

		const availableColumns = [ 
			{
				stt: 1,
				name: 'RowID',
				displayName: 'Row ID',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'Title',
				displayName: 'Tên khóm, ấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'WardName',
				displayName: 'Tên phường xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'NguoiCapNhat',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'NgayCapNhat',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				isShow: true,
			}
		];

		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
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

		this.dataSource = new donvihanhchinhDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilterKhomAp$.getValue();
				this.dataSource.loadListKhomAp(queryParams);
			}
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadListKhomAp(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterward && this.filterward.length > 0) {
			filter.WardID = +this.filterward;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.WardName = this.gridService.model.filterText.WardName;
			filter.Title = this.gridService.model.filterText.Title;
		}
		return filter;

	}

	Delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.DeleteKhomAp(item.RowID).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Add() {
		const models: any = {};
		this.Update(models);
	}

	Update(_item: any) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.RowID > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(KhomApEditDialogComponent, { data: { _item }, width: '500px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	// ====================Hàm change
	loadWard() {
		this.filterward = '';
		this.danhMucService.GetListWardByProvince(this.filterprovinces).subscribe(res => {
			this.listward = res.data;
			this.filteredListWard.next(this.listward);
			// this.itemForm.controls['xa'].setValue('');
			this.changeDetectorRefs.detectChanges();
		});
		this.loadDataList();
	}

	filterWard() {
		if (!this.listward) { return; }
		let search = this.FilterCtrlWard;
		if (!search) {
			this.filteredListWard.next(this.listward.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.filteredListWard.next(
			this.listward.filter(xa => xa.Ward.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 413;
		return tmp_height + 'px';
	}
}