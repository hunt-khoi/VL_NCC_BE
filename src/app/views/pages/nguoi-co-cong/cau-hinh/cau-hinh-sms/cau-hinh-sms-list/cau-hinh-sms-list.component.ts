import { Component, OnInit, OnDestroy, ViewChild, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { CauHinhSMSDataSource } from '../Model/data-sources/cau-hinh-sms.datasource';
import { CauHinhSMSService } from '../Services/cau-hinh-sms.service';
import { CauHinhSMSEditComponent } from '../cau-hinh-sms-edit/cau-hinh-sms-edit.component';
import { CauHinhSMSModel } from '../Model/cau-hinh-sms.model';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-cau-hinh-sms-list',
	templateUrl: './cau-hinh-sms-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class CauHinhSMSListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: CauHinhSMSDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<CauHinhSMSModel>(true, []);
	CauHinhSMSsResult: CauHinhSMSModel[] = [];
	tmpCauHinhSMSsResult: CauHinhSMSModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	BatDau_tungay: string = '';
	BatDau_denngay: string = '';
	KetThuc_tungay: string = '';
	KetThuc_denngay: string = '';
	haveFilter: boolean = false;

	IdDonVi: string = '';
	public datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		private apiService: CauHinhSMSService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private cookieService: CookieService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService) { }

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		//#region ***Filter***
		this.getTreeDonVi();
		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['Brandname'] = "";
		this.gridModel.filterText['URL'] = "";
		this.gridModel.filterText['UserName'] = "";
		this.gridModel.disableButtonFilter['Locked'] = true;
		this.gridModel.filterGroupDataChecked = {
			"Locked": [

				{
					name: "Hoạt động",
					value: false,
					checked: false
				},

				{
					name: "Khóa",
					value: true,
					checked: false
				},

			],
		};
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'TenDonVi',
				displayName: 'Tên đơn vị',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'URL',
				displayName: 'URL',
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
				name: 'UserName',
				displayName: 'UserName',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 7,
				name: 'Locked',
				displayName: 'Tình trạng',
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
		//#endregion

		this.commonService.fixedPoint = 0;

		if (!this.sort || !this.paginator) return;
		this.sort.sortChange.subscribe(() => { 
			if (this.paginator) 
				this.paginator.pageIndex = 0; 
		});
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataList(true);
				})
			).subscribe();

		// Init DataSource
		this.dataSource = new CauHinhSMSDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		// // Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.apiService.lastFilter$.getValue();
			if (this.dataSource)
				this.dataSource.loadCauHinhSMSs(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.CauHinhSMSsResult = res
			this.tmpCauHinhSMSsResult = []
			if (this.CauHinhSMSsResult && this.paginator) {
				if (this.CauHinhSMSsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList();
				} else {
					for (let i = 0; i < this.CauHinhSMSsResult.length; i++) {
						let tmpElement = new CauHinhSMSModel();
						tmpElement.copy(this.CauHinhSMSsResult[i])
						this.tmpCauHinhSMSsResult.push(tmpElement);
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

	loadDataList(holdCurrentPage: boolean = false) {
		if (!this.sort || !this.paginator || !this.gridService || !this.dataSource) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filter(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadCauHinhSMSs(queryParams);
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
		if (ind == 3) {
			this.KetThuc_tungay = date[2] + '-' + date[1] + '-' + date[0];
		}
		if (ind == 4) {
			this.KetThuc_denngay = date[2] + '-' + date[1] + '-' + date[0];
		}
		this.loadDataList();
	}

	filter(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.Brandname = this.gridService.model.filterText['Brandname'];
			filter.URL = this.gridService.model.filterText['URL'];
			filter.UserName = this.gridService.model.filterText['UserName'];
		}
		filter.IdDonVi=this.IdDonVi;
		return filter;
	}

	delete(item: CauHinhSMSModel) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn xóa cấu hình sms?';
		const _waitDesciption: string = 'Cấu hình sms đang được xóa...';
		const _deleteMessage = `Xóa thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList(true);
			});
		});
	}

	deletes() {
		const _title: string = 'Xóa danh mục khác';
		const _description: string = 'Bạn có chắc muốn xóa những danh mục khác này không?';
		const _waitDesciption: string = 'Danh mục khác đang được xóa...';
		const _deleteMessage = `Danh mục khác đã được xóa`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(
					this.selection.selected[i].Id
				);
			}
			this.apiService.deletes(idsForDeletion).subscribe(() => {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.loadDataList(true);
				this.selection.clear();
			});
		});
	}

	lock(item:any) {
		this.apiService.LockNUnLock(item.Id,item.Locked).subscribe(res=>{
			if(res && res.status==1){
				this.layoutUtilsService.showInfo(item.Locked?'Mở khóa thành công':'Khóa thành công');
			}
			else{
				this.layoutUtilsService.showError(res.error.message);
			}
			this.loadDataList(true);

		})
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.CauHinhSMSsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.CauHinhSMSsResult.forEach(row => this.selection.select(row));
		}
	}
	/* UI */
	getItemStatusString(status: boolean = false): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = false): string {
		switch (status) {
			case true:
				return 'metal';
			case false:
				return 'success';
		}
	}

	add() {
		const newCauHinhSMS = new CauHinhSMSModel();
		newCauHinhSMS.clear(); // Set all defaults fields
		this.edit(newCauHinhSMS);
	}

	edit(CauHinhSMS: any,View:boolean=false) {
		CauHinhSMS.View = View;
		const dialogRef = this.dialog.open(CauHinhSMSEditComponent, { data: { CauHinhSMS } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList(true);
		});
	}

	DonViChanged(e:any){
		this.IdDonVi=e.id;
		this.loadDataList();
	}
}