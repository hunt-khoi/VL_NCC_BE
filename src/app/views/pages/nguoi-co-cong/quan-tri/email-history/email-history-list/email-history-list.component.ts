import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { EmailHistoryDataSource } from '../Model/data-sources/email-history.datasource';
import { EmailHistoryService } from '../Services/email-history.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-email-history-list',
	templateUrl: './email-history-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class EmailHistoryListComponent implements OnInit, OnDestroy {

	// Table fields
	dataSource: EmailHistoryDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Filter fields
	// Selection
	selection = new SelectionModel<any>(true, []);
	EmailHistorysResult: any[] = [];
	tmpEmailHistorysResult: any[] = [];

	haveFilter: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	BatDau_tungay: string = '';
	BatDau_denngay: string = '';
	KetThuc_tungay: string = '';
	KetThuc_denngay: string = '';

	IdDonVi: string = '';
	Loai: string = '0';
	public datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	gridService: TableService | undefined;
	girdModel: TableModel = new TableModel();

	constructor(
		private apiService: EmailHistoryService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private cookieService: CookieService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService) { }

	/** LOAD DATA */
	ngOnInit() {
		//#region ***Filter***
		this.getTreeDonVi();

		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['Brandname'] = "";
		this.girdModel.filterText['SDT'] = "";
		this.girdModel.filterText['Username'] = "";
		this.girdModel.filterText['Message'] = "";
		this.girdModel.disableButtonFilter['Locked'] = true;
		//TH1: #filter
		this.girdModel.filterGroupDataChecked = {
			"TrangThai": [
				{
					name: "Thất bại",
					value: 0,
					checked: false
				},
				{
					name: "Thành công",
					value: 1,
					checked: false
				},
			],
		};
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			{
				stt: 1,
				name: 'select',
				displayName: 'Chọn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			// {
			// 	stt: 3,
			// 	name: 'SDT',
			// 	displayName: 'Số điện thoại',
			// 	alwaysChecked: false,
			// 	isShow: true
			// },
			{
				stt: 4,
				name: 'Message',
				displayName: 'Tin nhắn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'Brandname',
				displayName: 'Brandname',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 6,
				name: 'Username',
				displayName: 'Username',
				alwaysChecked: false,
				isShow: true
			},
			// {
			// 	stt: 7,
			// 	name: 'TrangThai',
			// 	displayName: 'Trạng thái',
			// 	alwaysChecked: false,
			// 	isShow: true
			// },
			{
				stt: 8,
				name: 'Loai',
				displayName: 'Loại tin nhắn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Thời gian',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'ThanhCong',
				displayName: 'Thành công',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
			}
		];

		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);
		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.girdModel, this.cookieService);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();
		//#endregion

		this.commonService.fixedPoint = 0;

		if (this.sort && this.paginator) { 
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadEmailHistorysList(true);
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new EmailHistoryDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) { 
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadEmailHistorys(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.EmailHistorysResult = res;
			this.tmpEmailHistorysResult = [];
			if (this.EmailHistorysResult && this.paginator) {
				if (this.EmailHistorysResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadEmailHistorysList();
				} else {
					for (let i = 0; i < this.EmailHistorysResult.length; i++) {
						let tmpElement = Object.assign({}, this.EmailHistorysResult[i]);
						this.tmpEmailHistorysResult.push(tmpElement);
					}
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	getTreeDonVi() {
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatreeDonVi.next(res.data);
			}
			else {
				this.datatreeDonVi.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	loadEmailHistorysList(holdCurrentPage: boolean = false) {
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
		this.dataSource.loadEmailHistorys(queryParams);
	}

	DateChanged(value: any, ind: number) {
		let date = value.targetElement.value.replace(/-/g, '/').split('T')[0].split('/');
		if (+date[0] < 10 && date[0].length < 2)
			date[0] = '0' + date[0];
		if (+date[1] < 10 && date[1].length < 2)
			date[1] = '0' + date[1];

		if (ind == 1) {
			this.BatDau_tungay = date[2] + '-' + date[1] + '-' + date[0];
		}
		if (ind == 2) {
			this.BatDau_denngay = date[2] + '-' + date[1] + '-' + date[0];
		}
		if (value.targetElement.value == '') {
			if (ind == 1) {
				this.BatDau_tungay = '';
			}
			if (ind == 2) {
				this.BatDau_denngay = '';
			}
		}
		else {
			if (ind == 1) {
				var re = /^(\d{4})(\/|\-)(\d{2})(\/|\-)(\d{2})$/;
				if (!this.BatDau_tungay.match(re)) {
					this.layoutUtilsService.showInfo("Thời gian từ ngày không đúng");
					return;
				}
			}
			if (ind == 2) {
				var re = /^(\d{4})(\/|\-)(\d{2})(\/|\-)(\d{2})$/;
				if (!this.BatDau_denngay.match(re)) {
					this.layoutUtilsService.showInfo("Thời gian đến ngày không đúng");
					return;
				}
			}
		}
		this.loadEmailHistorysList();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		//#filter
		if (this.gridService && this.gridService.model.filterText) {
			filter.Brandname = this.gridService.model.filterText['Brandname'];
			filter.SDT = this.gridService.model.filterText['SDT'];
			filter.Username = this.gridService.model.filterText['Username'];
			filter.Message = this.gridService.model.filterText['Message'];
		}
		if (this.BatDau_tungay != '') {
			filter.tungay = this.BatDau_tungay;
		}
		if (this.BatDau_denngay != '') {
			filter.denngay = this.BatDau_denngay;
		}
		filter.IdDonVi = this.IdDonVi;
		filter.Loai = this.Loai;
		return filter;
	}

	delete(item: any) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn xóa lịch sử email?';
		const _waitDesciption: string = 'Lịch sử email đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.IdEmail).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadEmailHistorysList(true);
			});
		});
	}

	deletes() {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn xóa lịch sử email?';
		const _waitDesciption: string = 'Lịch sử email đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].IdEmail);
			}
			this.apiService.deletes(idsForDeletion).subscribe(() => {
				
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.loadEmailHistorysList(true);
				this.selection.clear();
			});
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.EmailHistorysResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.EmailHistorysResult.forEach(row => this.selection.select(row));
		}
	}

	DonViChanged(e: any) {
		this.IdDonVi = e.id;
		this.loadEmailHistorysList();
	}
}