import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { NguoiDungDPSService } from '../Services/nguoi-dung-dps.service';
import { NguoiDungDPSModel } from '../Model/nguoi-dung-dps.model';
import { NguoiDungDPSDataSource } from '../Model/data-sources/nguoi-dung-dps.datasource';
import { NguoiDungDPSEditComponent } from '../nguoi-dung-dps-edit/nguoi-dung-dps-edit.component';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { NguoiDungVaiTroComponent } from '../nguoi-dung-vai-tro/nguoi-dung-vai-tro.component';
import { NguoiDungDPSImportComponent } from '../nguoi-dung-dps-import/nguoi-dung-dps-import.component';
import { NguoiDungDPSResetPasswordComponent } from '../nguoi-dung-dps-reset-password/nguoi-dung-dps-reset-password.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-nguoi-dung-dps-list',
	templateUrl: './nguoi-dung-dps-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class NguoiDungDPSListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: NguoiDungDPSDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;
	@ViewChild('printPage', { static: true }) printPage: ElementRef | undefined;
	// Filter fields
	listIdGroup: any[] = [];

	// Selection
	selection = new SelectionModel<NguoiDungDPSModel>(true, []);
	nguoidungdpssResult: NguoiDungDPSModel[] = [];
	tmpnguoidungdpssResult: NguoiDungDPSModel[] = [];

	haveFilter: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	name = 'Người dùng';
	rR = {};
	curUser: any = {};
	DonVi: number = 0;
	datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	VaiTro: number = 0;
	lstVaiTro: any[] = [];
	ChuaCoVaiTro: boolean = false;
	gridService: TableService | undefined;
	girdModel: TableModel | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		private apiService: NguoiDungDPSService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private commonService: CommonService,
		private translate: TranslateService) { }

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		this.tokenStorage.getUserRolesObject().subscribe(t => {
			this.rR = t;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.curUser = res;
		})

		//#region ***Filter***
		this.girdModel = new TableModel();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['FullName'] = "";
		this.girdModel.filterText['UserName'] = "";
		this.girdModel.filterText['Email'] = "";
		this.girdModel.filterText['PhoneNumber'] = "";
		this.girdModel.filterText['MaNV'] = "";
		this.girdModel.filterText['ViettelStudy'] = "";
		this.girdModel.disableButtonFilter['Active'] = true;
		this.girdModel.disableButtonFilter['NhanLichDonVi'] = true;
		this.girdModel.disableButtonFilter['ChucVu'] = true;
		let optionsTinhTrang = [
			{
				name: 'Khóa',
				value: '0',
			},
			{
				name: 'Kích hoạt',
				value: '1',
			}
		];
		this.girdModel.filterGroupDataChecked['Active'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});
		this.girdModel.filterGroupDataChecked['NhanLichDonVi'] = [
			{
				name: 'Có',
				value: 'True',
				checked: false
			},
			{
				name: 'Không',
				value: 'False',
				checked: false
			}
		]
		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			//{
			//	stt: 1,
			//	name: 'select',
			//	displayName: 'Check chọn',
			//	alwaysChecked: true,
			//	isShow: true
			//},
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'Avatar',
				displayName: 'Avatar',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'MaNV',
				displayName: 'Mã NV',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 4,
				name: 'UserName',
				displayName: 'Tên đăng nhập',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 5,
				name: 'FullName',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true
			},
			//{
			//	stt: 6,
			//	name: 'ViettelStudy',
			//	displayName: 'Tài khoản Viettel Study',
			//	alwaysChecked: false,
			//	isShow: true
			//},
			{
				stt: 7,
				name: 'ChucVu',
				displayName: 'Chức vụ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
				name: 'Email',
				displayName: 'Email',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'PhoneNumber',
				displayName: 'Số điện thoại',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 11,
				name: 'ExpDate',
				displayName: 'Ngày hết hạn',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 12,
				name: 'Active',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 13,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: false
			},
			//{
			//	stt: 14,
			//	name: 'NhanLichDonVi',
			//	displayName: 'Nhận lịch đơn vị',
			//	alwaysChecked: false,
			//	isShow: false
			//},
			{
				stt: 15,
				name: 'LastLogin',
				displayName: 'Đăng nhập lần cuối',
				alwaysChecked: false,
				isShow: false
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

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_nguoidung'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nguoidung'));
		//#endregion

		this.loadData();

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
		this.dataSource = new NguoiDungDPSDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadNguoiDungDPSs(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.nguoidungdpssResult = res;
			this.tmpnguoidungdpssResult = [];
			if (this.nguoidungdpssResult  && this.paginator) {
				if (this.nguoidungdpssResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList();
				} else {
					for (let i = 0; i < this.nguoidungdpssResult.length; i++) {
						let tmpElement = new NguoiDungDPSModel();
						tmpElement.copy(this.nguoidungdpssResult[i])
						this.tmpnguoidungdpssResult.push(tmpElement);
					}
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	loadData() {
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
		});
		this.commonService.ListVaiTroByDonVi(this.DonVi).subscribe(res => {
			if (res && res.status == 1)
				this.lstVaiTro = res.data;
			else {
				this.lstVaiTro = [];
				this.layoutUtilsService.showError(res.error.message);
			}
		});
		this.commonService.ListChucVu(this.DonVi).subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked['ChucVu'] = res.data.map((x: any) => {
					return {
						id: x.id,
						name: x.title,
						value: x.id,
						checked: false
					}
				});
			} else {
				this.gridService.model.filterGroupDataChecked['ChucVu'] = [];
			}
			this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
		})
	}

	LoadPagePrint() {
		if (!this.printPage) return;
		const printPage = this.printPage.nativeElement as HTMLElement;
		printPage.click()
	}

	GetValueNode(item: any) {
		this.DonVi = item.id;
		this.VaiTro = 0;
		this.loadData();
		this.loadDataList(true);
	}

	loadDataList(holdCurrentPage: boolean = false) {
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
		this.dataSource.loadNguoiDungDPSs(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		filter.ChuaCoVaiTro = this.ChuaCoVaiTro;
		if (this.DonVi > 0)
			filter.Donvi = this.DonVi;
		if (this.VaiTro > 0)
			filter.VaiTro = this.VaiTro;
		if (this.gridService && this.gridService.model.filterText) {
			filter.FullName = this.gridService.model.filterText['FullName'];
			filter.UserName = this.gridService.model.filterText['UserName'];
			filter.Email = this.gridService.model.filterText['Email'];
			filter.PhoneNumber = this.gridService.model.filterText['PhoneNumber'];
			filter.MaNV = this.gridService.model.filterText['MaNV'];
			filter.ViettelStudy = this.gridService.model.filterText['ViettelStudy'];
		}
		return filter;
	}

	/** ACTIONS */
	delete(item: NguoiDungDPSModel) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn xóa người dùng?';
		const _waitDesciption: string = 'Người dùng đang được xóa...';
		const _deleteMessage = `Xóa người dùng thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.deleteNguoiDungDPS(item.UserID).subscribe(res => {
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

	lock(item: any, islock = true) {
		let _message = (islock ? "Khóa" : "Mở khóa") + " người dùng thành công";
		this.apiService.lock(item.UserID, islock).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_message);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.loadDataList(true);
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.nguoidungdpssResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.nguoidungdpssResult.forEach(row => this.selection.select(row));
		}
	}

	add() {
		const newNguoiDungDPS = new NguoiDungDPSModel();
		newNguoiDungDPS.clear(); // Set all defaults fields
		this.edit(newNguoiDungDPS);
	}

	edit(NguoiDungDPS: NguoiDungDPSModel, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(NguoiDungDPSEditComponent, { data: { NguoiDungDPS: NguoiDungDPS, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			if (NguoiDungDPS.Id)
				this.loadDataList();
			else
				this.loadDataList(true);
		});
	}

	resetPass(NguoiDungDPS: NguoiDungDPSModel, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(NguoiDungDPSResetPasswordComponent, { data: { NguoiDungDPS: NguoiDungDPS, allowEdit: allowEdit }, width: '650px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			if (NguoiDungDPS.Id)
				this.loadDataList();
			else
				this.loadDataList(true);
		});
	}

	vaitro(_item: NguoiDungDPSModel) {
		const dialogRef = this.dialog.open(NguoiDungVaiTroComponent, { data: { _item }/*, width: '80%'*/ });
		dialogRef.afterClosed().subscribe(res => { });
	}

	giahan(item: NguoiDungDPSModel) {
		const _title: string = 'Xác nhận';
		const _description: string = 'Bạn chắc chắn gia hạn mật khẩu cho người dùng?';
		const _waitDesciption: string = 'Người dùng đang được gia hạn...';
		const _deleteMessage = `Gia hạn mật khẩu người dùng thành công`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.apiService.GiaHan(item.UserID).subscribe(res => {
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

	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Khóa';
			case 1:
				return 'Hoạt động';
		}
		return '';
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'kt-badge--metal';
			case 1:
				return 'kt-badge--success';
		}
		return '';
	}

	import() {
		const dialogRef = this.dialog.open(NguoiDungDPSImportComponent);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList();
		});
	}

	exportFile() {
		this.apiService.ExportFile().subscribe(response => {
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

	public convetToPDF() {
		// window.scrollTo(0, 0);
		// var data = document.getElementById('printpdf');
		// var hiden = document.getElementsByClassName('hiden-print') as HTMLCollectionOf<HTMLElement> ;
		// for(var i=0; i< hiden.length; i++){
		// 	hiden[i].style.display = "none"
		 
		// }
		// html2canvas(data).then(canvas => {
		// 	// Few necessary setting options
		// 	var imgWidth = 219;
		// 	var pageHeight = 295;
		// 	var imgHeight = 512*canvas.height/canvas.width;
		// 	var heightLeft = imgHeight;
		// 	const contentDataURL = canvas.toDataURL('image/png')
		// 	let pdf;
		// 	pdf = new jspdf.jsPDF('p', 'mm', 'a4');
		// 	var x = 0;
		// 	var y = 0;
		// 	for(var i=0; i< hiden.length; i++){
		// 		hiden[i].style.display = ""
		// 	}
		// 	pdf.addImage(contentDataURL, 'PNG', x, y, imgWidth, imgHeight)
		// 	pdf.save('danh-sach-nguoi-dung.pdf'); // Generated PDF
		// });
		// this.viewLoading = false;
	}
	
	DownloadFile() {
		// download the file using old school javascript method
		// var hiden = document.getElementsByClassName('hiden-print') as HTMLCollectionOf<HTMLElement> ;
		// for(var i=0; i< hiden.length; i++){
		// 	hiden[i].style.visibility = "hidden"
		// }
		// this.exportAsService.save(this.exportAsConfig, 'hinhanh').subscribe(() => {
		// });
		
		// setTimeout(() => {
		// 	for(var i=0; i< hiden.length; i++){
		// 		hiden[i].style.visibility = "visible"
		// 	}
		// }, 10000);
	}
}