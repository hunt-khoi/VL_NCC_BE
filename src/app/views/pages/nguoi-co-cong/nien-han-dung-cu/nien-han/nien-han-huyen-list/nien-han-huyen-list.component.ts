import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { ReviewExportComponent } from '../../../components';
import { NienHanDataSource } from '../Model/data-sources/nien-han.datasource';
import { NienHanModel } from '../Model/nien-han.model';
import { NienHanService } from '../Services/nien-han.service';
import { NienHanEditDialogComponent } from '../nien-han-edit/nien-han-edit.dialog.component';
import { QuyetDinhCapTienDialogComponent } from '../quyet-dinh-cap-tien/quyet-dinh-cap-tien-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'm-nien-han-huyen-list',
	templateUrl: './nien-han-huyen-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NienHanHuyenListComponent implements OnInit, OnChanges {
	// Table fields
	dataSource: NienHanDataSource;
	@Input() donvi: any;
	@Input() nam: number;
	@Input() dot: number = 0;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<NienHanModel>(true, []);
	productsResult: NienHanModel[] = [];
	lstStatus: any[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;

	visibleGuiDuyet: boolean;
	vivibleThuHoi: boolean;
	IsVisible_Duyet: boolean;
	IsEnable_Duyet: boolean;
	requiredImportFirst: boolean = false;
	list_button: boolean;
	Capcocau: number = 0;
	
	constructor(public NienHanService1: NienHanService,
		public CommonService: CommonService,
		private cookieService: CookieService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("Nhập niên hạn");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		if (this.NienHanService1 !== undefined) {
			this.NienHanService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Id', 0, 10));
		} //mặc định theo id
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['DotNienHan'] = "";
		this.gridModel.filterText['Nam'] = "";

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		this.CommonService.getStatusNhapNienHan().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
				if (this.filterStatus)
					this.lstStatus = this.lstStatus.filter(x => x.id == +this.filterStatus);
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
		let availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'DotNienHan',
				displayName: 'Đợt niên hạn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'Id_DonVi',
				displayName: 'Huyện',
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
				stt: 9,
				name: 'SoToTrinh',
				displayName: 'Số tờ trình',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'SoQuyetDinh',
				displayName: 'Số quyết định',
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
		this.gridService.cookieName = 'displayedColumns_nienhanHuyen'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nienhanHuyen'));

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new NienHanDataSource(this.NienHanService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.NienHanService1.lastFilter$.getValue();
			if (this.nam)
				queryParams.filter.Nam = this.nam;
			if (this.dot > 0)
				queryParams.filter.Id_Dot = this.dot;
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
	}
	ngOnChanges() {
		if (this.dataSource)
			this.loadDataList();
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.nam)
			filter.Nam = this.nam;
		if (this.dot > 0)
			filter.Id_Dot = this.dot;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.gridService.model.filterText) {
			filter.DotNienHan = this.gridService.model.filterText['DotNienHan'];
			filter.MoTa = this.gridService.model.filterText['Nam'];
		}

		if (this.donvi) {
			if (this.donvi.Type == 'H')
				filter.Id_Huyen = this.donvi.ID_Goc;
			if (this.donvi.Type == 'X')
				filter.Id_Xa = this.donvi.ID_Goc;
		}

		return filter; //trả về đúng biến filter
	}

	/** Delete */
	DeleteWorkplace(_item: NienHanModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NienHanService1.deleteItem(_item.Id).subscribe(res => {
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

	GuiDuyet(_item: NienHanModel) {
		let _title = this.translate.instant('OBJECT.GUIDUYET.TITLE', { name: this._name.toLowerCase() });
		let _description = this.translate.instant('OBJECT.GUIDUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		let _waitDesciption = this.translate.instant('OBJECT.GUIDUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		let _deleteMessage = this.translate.instant('OBJECT.GUIDUYET.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (_item.SLGiao > 0 && _item.SLGiao != _item.SLNhap) { //chưa nhập đủ sl giao
				_title = "Xác nhận hủy";
				_description = "Các đơn vị đã giao sẽ được hủy khi gửi duyệt";
				const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
						return;
					}
					this.callGuiDuyet(_item.Id, true, _deleteMessage);
				})
			}
			else {
				this.callGuiDuyet(_item.Id, false, _deleteMessage);
			}
		});
	}

	callGuiDuyet(Id: number, IsUpdate: boolean, strSucess: string) {
		this.NienHanService1.guiDuyet(Id, false, IsUpdate).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(strSucess);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.loadDataList();
		});
	}

	HuyGiao(_item: NienHanModel) {
		const _title = this.translate.instant('Hủy giao nhập niên hạn');
		const _description = this.translate.instant('Bạn có chắc muốn hủy giao nhập niên hạn cho xã');
		const _waitDesciption = this.translate.instant('Giao nhập niên hạn đang được hủy ...');
		const _deleteMessage = this.translate.instant('Hủy thành công');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NienHanService1.huyGiao(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	ThuHoi(_item: NienHanModel) {
		const _title = this.translate.instant('OBJECT.THUHOI.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.THUHOI.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.THUHOI.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.THUHOI.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.NienHanService1.thuHoi(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.loadDataList();
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}

	AddWorkplace() {
		const NienHanModels = new NienHanModel();
		NienHanModels.clear(); // Set all defaults fields
		this.EditNhom(NienHanModels, true, true);
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	EditNhom(_item: NienHanModel, allowEdit: boolean = true, addDeXuat: boolean = false) {
		let saveMessageTranslateParam = '';
		//câu thông báo khi thực hiện trong tác vụ
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NienHanEditDialogComponent, { data: { _item, allowEdit, addDeXuat }, width: "80%", disableClose: true });
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

	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}
	GetGiayBaoTien(id) {
		this.NienHanService1.getGiayBaoTien(id).subscribe(res => {
			if (res && res.status == 1) {
				let dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
					} else {
						this.NienHanService1.exportGiayBaoNhanTien(id, res.loai).subscribe(response => {
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
							this.layoutUtilsService.showError("Xuất giấy báo nhận tiền thất bại");
						});
					}
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}
	
	export(item) {
		// this.NienHanService1.exportExcelDeXuat(item.Id).subscribe(res => {
		// 	const headers = res.headers;
		// 	const filename = headers.get('x-filename');
		// 	const type = headers.get('content-type');
		// 	const blob = new Blob([res.body], { type });
		// 	const fileURL = URL.createObjectURL(blob);
		// 	const link = document.createElement('a');
		// 	link.href = fileURL;
		// 	link.download = filename;
		// 	link.click();
		// })
	}

	raQuyetDinh (_item) {
		const dialogRef = this.dialog.open(QuyetDinhCapTienDialogComponent, { data: { _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo("Tạo quyết định thành công");
				this.ngOnInit();
			}
		});
	}

	inQuyetDinh (id) {
		this.NienHanService1.downloadQD(id).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất quyết định thất bại");
		});
	}

	raToTrinh (_item) {
		let IsQD = false;
		const dialogRef = this.dialog.open(QuyetDinhCapTienDialogComponent, { data: { _item, IsQD } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo("Tạo tờ trình thành công");
				this.ngOnInit();
			}
		});
	}

	inToTrinh (id) {
		this.NienHanService1.downloadTT(id).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất tờ trình thất bại");
		});
	}
}
