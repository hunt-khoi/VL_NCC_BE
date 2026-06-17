import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { NhapSoLieuModel } from '../Model/nhap-so-lieu.model';
import { NhapSoLieuService } from '../Services/nhap-so-lieu.service';
import { NhapSoLieuDataSource } from '../Model/data-sources/nhap-so-lieu.datasource';
import { NhapSoLieuEditDialogComponent } from '../nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';
import { NhapSoLieuDuyetDialogComponent } from '../../nhap-so-lieu-duyet/nhap-so-lieu-duyet/nhap-so-lieu-duyet-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-nhap-so-lieu-list',
	templateUrl: './nhap-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NhapSoLieuListComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	// Table fields
	dataSource: NhapSoLieuDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus: number = 0;
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	_name: string = '';
	// filter District
	filterprovinces: number = 0;
	filterdistrict: number = 0;
	filterDonVi: number = 0;
	listprovinces: any[] = [];
	listdistrict: any[] = [];
	listDonViTheoMauSoLieu: any[] = [];
	listDonVi: any[] = [];
	//Duyệt - thu hồi
	visibleGuiDuyet: boolean = false;
	visibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;
	thaotac: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public objectService: NhapSoLieuService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService) {
			this._name = 'Nhập số liệu';
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';
		this.selection = new SelectionModel<any>(true, []);
		this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
			if (data.Status)
				this.filterStatus = data.Status;
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MauSoLieu', 0, 10));
		}

		this.commonService.GetAllProvinces().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listprovinces = res.data;
		});
		this.commonService.liteMauSoLieuTheoDonVi().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listDonViTheoMauSoLieu = res.data;
			const tempList = this.listDonViTheoMauSoLieu.map(data => data.data);
			this.listDonVi = Array.from(new Set(tempList.map(dv => dv.Id_DonVi)))
				.map(id => {
					return tempList.find(a => a.Id_DonVi === id)
				})
		})

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MauSoLieu = '';
		this.gridModel.filterText.Status = '';
		this.gridModel.filterText.Locked = '';
		this.gridModel.filterText.DistrictID = this.filterdistrict;
		this.gridModel.filterText.Id_DonVi = this.filterDonVi;
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.commonService.getStatusNhapSoLieu().pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				// if (this.filterStatus)
				// 	this.lstStatus = this.lstStatus.filter(x => x.id == +this.filterStatus);
				// else
				// 	this.lstStatus = this.lstStatus.filter(x => x.id != 2);
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
				name: 'MauSoLieu',
				displayName: 'Mẫu số liệu',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
			},
			// {
			// 	stt: 6,
			// 	name: 'Checker',
			// 	displayName: 'Người kiểm tra',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
			// {
			// 	stt: 7,
			// 	name: 'CheckDate',
			// 	displayName: 'Ngày kiểm tra',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
			// {
			// 	stt: 8,
			// 	name: 'SentBy',
			// 	displayName: 'Người gửi',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
			// {
			// 	stt: 9,
			// 	name: 'SentDate',
			// 	displayName: 'Ngày gửi',
			// 	alwaysChecked: false,
			// 	isShow: false,
			// },
			// {
			// 	stt: 10,
			// 	name: 'Deadline',
			// 	displayName: 'Hạn chót',
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
				displayName: this.translate.instant('COMMON.UPDATED_BY'),
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: this.translate.instant('COMMON.UPDATED_DATE'),
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
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_dsnNsl'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dsnNsl'));

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

		// Init DataSource
		this.dataSource = new NhapSoLieuDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		// Read from URL itemId, for restore previous state
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus)
			filter.Status = this.filterStatus;
		else
			filter.DaDuyet = "0";

		if (this.filterdistrict > 0) 
			filter.DistrictID = +this.filterdistrict;
		if (this.filterDonVi > 0) 
			filter.Id_DonVi = +this.filterDonVi;
		
		if (this.gridService && this.gridService.model.filterText) {
			filter.MauSoLieu = this.gridService.model.filterText.MauSoLieu;
		}
		return filter;
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	GuiDuyet(_item: any) {
		const _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.GuiDuyet(_item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	guiDuyets(gui = true) {
		let data = [];
		if (gui)
			data = this.selection.selected.filter(x => x.visibleGuiDuyet).map(x => x.Id);
		else
			data = this.selection.selected.filter(x => x.visibleThuHoi).map(x => x.Id);

		var title = gui ? 'GUIDUYET' : 'THUHOI';
		const _title = this.translate.instant('OBJECT.' + title + '.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.' + title + '.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.' + title + '.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.' + title + '.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			if (gui)
				this.objectService.GuiDuyets(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
					if (res && res.status === 1) {
						let str = " " + res.data.success + "/" + res.data.total;
						this.layoutUtilsService.showInfo(_deleteMessage + str);
						this.ngOnInit();
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
				});
			else
				this.objectService.ThuHois(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	ThuHoi(item: any) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.ThuHoi(item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Duyet(item: any, isDuyet: boolean = true) {
		let _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(NhapSoLieuDuyetDialogComponent, { data: { _item, isDuyet } });
		dialogRef.afterClosed().subscribe((res) => {
			if (res) 
				this.loadDataList();
		});
	}

	DeleteWorkplace(item: NhapSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.deleteItem(item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	EditObject(_item: NhapSoLieuModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NhapSoLieuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getStatusString(status: any) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}

	getItemStatusString(status: number): string {
		switch (status) {
			// case -2:
			// 	return 'Hủy';
			case -1:
				return 'Không duyệt';
			case 0:
				return 'Nháp';
			case 1:
				return 'Chờ phê duyệt';
			case 2:
				return 'Đã phê duyệt';
		}
		return '';
	}
	
	AddWorkplace() {
		const objectModel = new NhapSoLieuModel();
		objectModel.clear();
		this.EditObject(objectModel);
	}

	Export() {
		if (!this.gridService || !this.paginator || !this.sort) return;
		let gridService = this.gridService;
		var cols = gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
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
		this.objectService.exportList(queryParams).pipe(takeUntil(this.destroy$)).subscribe(response => {
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

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
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

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.loadDataList();
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	filterDonViId(id: any) {
		this.filterDonVi = id;
		this.loadDataList();
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => this.selection.select(row));
		}
	}
}