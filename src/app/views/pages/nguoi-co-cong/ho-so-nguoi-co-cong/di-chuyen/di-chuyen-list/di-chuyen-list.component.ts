// Angular
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
// Services
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { ReviewExportComponent } from '../../../components';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { HoSoNCCModule } from '../../ho-so-ncc/ho-so-ncc.module';
import { DiChuyenService } from '../Services/di-chuyen.service';
import { DiChuyenDataSource } from '../Model/data-sources/di-chuyen.datasource';
import { QuyetDinhEditDialogComponent } from '../../quyet-dinh/quyet-dinh-edit/quyet-dinh-edit-dialog.component';
import { DiChuyenEditDialogComponent } from '../di-chuyen-edit/di-chuyen-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-di-chuyen-list',
	templateUrl: './di-chuyen-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DiChuyenListComponent implements OnInit {

	// Table fields
	dataSource: DiChuyenDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	objectId = '';
	_user: any = {};
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	ncc: any;
	list_button: boolean;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public objectService: DiChuyenService,
		private hosoService: HoSoNCCService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private commonService: CommonService,
		private detechChange: ChangeDetectorRef,
		private translate: TranslateService) {
		this._name = this.translate.instant('DICHUYEN.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		var arr = this.router.url.split("/");
		if (arr.length > 1) {
			this.objectId = arr[arr.length - 2];
			this.hosoService.getItem(+this.objectId).subscribe(res => {
				if (res && res.status === 1) {
					this._user = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.detechChange.detectChanges();
			});
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.So = '';
		this.gridModel.filterText.NoiCap = '';

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},

			{
				stt: 1,
				name: 'NgayChuyen',
				displayName: 'Ngày chuyển',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'Id_Tinh',
				displayName: 'Tỉnh',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'Id_Huyen',
				displayName: 'Huyện',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'Id_Xa',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'DiaChi',
				displayName: 'Địa chihr',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'SoQuyetDinh',
				displayName: 'Quyết định',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(
			true,
			this.gridModel.availableColumns
		);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumnsDiChuyenNCC';

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumnsDiChuyenNCC'));

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new DiChuyenDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			queryParams.sortField = 'NgayChuyen';
			queryParams.sortOrder = 'desc';
			queryParams.filter.Id_NCC = this.objectId;
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

		this.objectService.getNCC(+this.objectId).subscribe(res => {
			if (res && res.status === 1) {
				this.ncc = res.data;
			} else {
				this.layoutUtilsService.showError(res.error.message);
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
			this.gridService.model.filterGroupData
		);
		queryParams.filter.Id_NCC = this.objectId;
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.So = this.gridService.model.filterText.So;
			filter.NoiCap = this.gridService.model.filterText.NoiCap;
			filter.Id_NCC = this.objectId;
		}

		return filter;
	}

	/** Delete */
	DeleteWorkplace(_item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	AddWorkplace() {
		const objectModel: any = {}
		this.Editobject(objectModel);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	Editobject(_item: any, allowEdit: boolean = true) {
		_item.Id_NCC = this.objectId;
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DiChuyenEditDialogComponent, { data: { _item, allowEdit, ncc: this.ncc } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
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

	reviewDeNghiDC(item) {
		this.objectService.previewDN(item.Id, parseInt(this.objectId)).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
					} 
					else {
						this.objectService.exportDN(item.Id, parseInt(this.objectId)).subscribe(response => {
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
							this.layoutUtilsService.showError("Xuất đề nghị di chuyển thất bại")
						});
					}
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	reviewPhieuBaoDC(item) {
		this.objectService.previewQD(item.Id, parseInt(this.objectId)).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
					} 
					else {
						this.objectService.exportQD(item.Id, parseInt(this.objectId)).subscribe(response => {
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
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	in(item) {
		// this.objectService.downloadQD(item.Id_NCC, item.Id_QuyetDinh).subscribe(res => {
		// 	if (res && res.status == 1) {
		// 		const dialogRef = this.dialog.open(ReviewDocxComponent, { data: res.data });
		// 		dialogRef.afterClosed().subscribe(res2 => {
		// 			if (!res2) {
		// 			} else {
		// 				this.objectService.getQDDC(item.Id_NCC, item.Id_QuyetDinh).subscribe(response => {
		// 					const headers = response.headers;
		// 					const filename = headers.get('x-filename');
		// 					const type = headers.get('content-type');
		// 					const blob = new Blob([response.body], { type });
		// 					const fileURL = URL.createObjectURL(blob);
		// 					const link = document.createElement('a');
		// 					link.href = fileURL;
		// 					link.download = filename;
		// 					link.click();
		// 				}, (err) => {
		// 					this.layoutUtilsService.showError("Không tìm thấy biểu mẫu");
		// 				});
		// 			}
		// 		});
		// 	} else
		// 		this.layoutUtilsService.showError(res.error.message);
		// });

		this.objectService.downloadQD(item.Id_NCC, item.Id_QuyetDinh).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();

			// tắt xem trước
			// let ApiRoot = environment.ApiRoot.slice(0, environment.ApiRoot.length - 3);
			// let path = "viewer/file-dinh-kem/0?path=" + ApiRoot + "dulieu/quyet-dinh/" + filename;
			// window.open(path, "_blank");
		},
		(err) => {
			this.layoutUtilsService.showError("Vui lòng cập nhật biểu mẫu quyết định di chuyển");
		})
	}

	raQuyetDinh(item) {
		let _item: any = {
			ObjectType: 2,
			ObjectId: item.Id,
			Id_NCC: item.Id_NCC
		}
		const dialogRef = this.dialog.open(QuyetDinhEditDialogComponent, { data: { _item, callapi: false } });
		dialogRef.afterClosed().subscribe(respone => {
			if (!respone) {
			} else {
				this.objectService.Duyet(respone).subscribe(res => {
					if (res && res.status == 1) {
						this.layoutUtilsService.showInfo("Tạo quyết định thành công");
						this.ngOnInit();
					} else
						this.layoutUtilsService.showError(res.error.message);
				})
			}
		})
	}
}
