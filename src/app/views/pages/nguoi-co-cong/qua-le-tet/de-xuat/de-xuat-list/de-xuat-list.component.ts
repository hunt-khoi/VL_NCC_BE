import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { DeXuatEditDialogComponent } from '../de-xuat-edit/de-xuat-edit.dialog.component';
import { DeXuatDataSource } from '../Model/data-sources/de-xuat.datasource';
import { DeXuatModel } from '../Model/de-xuat.model';
import { DeXuatService } from '../Services/de-xuat.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { ReviewExportComponent } from '../../../components';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-de-xuat-list',
	templateUrl: './de-xuat-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DeXuatListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: DeXuatDataSource | undefined;
	@Input() donvi: any;
	@Input() nam: number = 0;
	@Input() dot: number = 0;
	@Input() cap: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<DeXuatModel>(true, []);
	productsResult: DeXuatModel[] = [];
	lstStatus: any[] = [];
	_name = "";

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	visibleGuiDuyet: boolean = false;
	vivibleThuHoi: boolean = false;
	IsVisible_Duyet: boolean = false;
	IsEnable_Duyet: boolean = false;
	requiredImportFirst: boolean = false;

	constructor(public apiService: DeXuatService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DE_XUAT.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotTangQua'] = "";
		this.gridModel.filterText['MoTa'] = "";
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
				name: 'DotTangQua',
				displayName: 'Đợt tặng quà lễ tết',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Id_Xa',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true
			},
			//{
			//	stt: 6,
			//	name: 'Id_NguonKinhPhi',
			//	displayName: 'Nguồn kinh phí',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{
				stt: 7,
				name: 'NhomLeTet',
				displayName: 'Nhóm lễ tết',
				alwaysChecked: false,
				isShow: true,
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
				name: 'Status',
				displayName: 'Tình trạng',
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
		this.gridService.cookieName = 'displayedColumns_dxl'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dxl'));
		this.LoadFilterGroupData(); //load group

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
		this.dataSource = new DeXuatDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				if (this.nam)
					queryParams.filter.Nam = this.nam;
				if (this.dot > 0)
					queryParams.filter.Id_DotTangQua = this.dot;
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

	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
	}

	LoadFilterGroupData() {
		this.CommonService.liteNhomLeTet().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked.Id_NhomLeTet = res.data.map((x: any) => {
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

		this.CommonService.getStatusDotTangQua().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				if (this.filterStatus)
					this.lstStatus = this.lstStatus.filter(x => x.id == +this.filterStatus);
				if (this.cap == 1) 
					this.lstStatus = this.lstStatus.filter(x => x.id != 0); //ko bao gồm trạng thái nháp
				
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
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
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
		if (this.gridService && this.gridService.model.filterText) {
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

	Delete(item: DeXuatModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
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
				this.loadDataList();
			});
		});
	}

	GuiDuyet(item: DeXuatModel) {
		const _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.guiDuyet(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	ThuHoi(item: DeXuatModel) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.thuHoi(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	Add() {
		const DeXuatModels = new DeXuatModel();
		DeXuatModels.clear(); // Set all defaults fields
		this.Edit(DeXuatModels, true, true);
	}

	Edit(_item: DeXuatModel, allowEdit: boolean = true, addDeXuat: boolean = false) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DeXuatEditDialogComponent, 
			{ data: { _item, allowEdit, addDeXuat }, width: "80%", disableClose: true });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	getStatusString(status: number) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}

	In(id: number, mau = 1) {
		this.apiService.previewDeXuat(id, mau).subscribe(res => {
			if (res && res.status == 1) {
				let dialogRef;
				if (mau > 1)
					dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data, width: '1000px' });
				else
					dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });

				dialogRef.afterClosed().subscribe(res => {
					if (!res) return;
					this.apiService.exportDeXuat(id, mau, mau > 1, res.loai).subscribe(response => {
						if (response && response.body) {
							const headers = response.headers;
							const filename = headers.get('x-filename');
							const type = headers.get('content-type');
							const blob = new Blob([response.body], { type: type || undefined });
							const fileURL = URL.createObjectURL(blob);
							const link = document.createElement('a');
							link.href = fileURL;
							link.download = filename || '';
							link.click();
						}
					})
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	export(item: any) {
		this.apiService.exportExcelDeXuat(item.Id).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất danh sách thất bại");
		});
	}
}