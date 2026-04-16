import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dottangquaModel, dottangqua_NCCModel } from '../../dot-tang-qua/Model/dot-tang-qua.model';
import { TranslateService } from '@ngx-translate/core';
import { dottangquaService } from '../Services/dot-tang-qua.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';
import { SoToTrinhEditDialogComponent } from '../so-to-trinh-edit/so-to-trinh-edit.dialog.component';

@Component({
	selector: 'm-dot-tang-qua-edit-dialog',
	templateUrl: './dot-tang-qua-edit.dialog.component.html',
})

export class dottangquaEditDialogComponent implements OnInit {
	item: dottangquaModel;
	oldItem: dottangquaModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listNhomLeTet: any[] = [];

	FilterCtrl: string = '';
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listNCC: any[] = [];

	listNguon: any[] = [];
	NCC_MQs: dottangqua_NCCModel[] = [];
	tempXoa: dottangqua_NCCModel[] = [];
	tempThem: dottangqua_NCCModel[] = [];

	datasource: MatTableDataSource<any>;
	count: number = 0;
	details: any[] = [];
	displayedColumns = ['STT', 'DoiTuong'];
	displayedColumns1 = ['STT', 'NguoiCoCong'];

	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('fileUpload', { static: true }) fileUpload;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<dottangquaEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public dottangquaService: dottangquaService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DOT_TANG_QUA.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 

		this.datasource = new MatTableDataSource(this.NCC_MQs);
		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;

			this.dottangquaService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.details = this.item.Details //cho xem

					this.NCC_MQs = this.item.Details //cho sửa
					this.datasource = new MatTableDataSource(this.NCC_MQs);
					this.count = this.NCC_MQs.length; //lấy chiều dài mảng chi tiết bna đầu

					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		this.loadNhom();
	}

	loadNhom() {
		this.danhMucService.liteNhomLeTet().subscribe(res => {
			this.listNhomLeTet = res.data;
			this.changeDetectorRefs.detectChanges();
		});

		this.danhMucService.liteDoiTuongNhanQua(false, true).subscribe(res => {
			this.listNCC = res.data;
			this.changeDetectorRefs.detectChanges();
			this.filter();
		})

		this.danhMucService.liteNguonKinhPhi().subscribe(res => {
			this.listNguon = res.data;
			this.listNguon.forEach(x => { this.displayedColumns.push('Nguon' + x.id); this.displayedColumns1.push('Nguon' + x.id) });
			this.displayedColumns1.push('action');
			this.changeDetectorRefs.detectChanges();
		})
	}

	changeIdNCC(id: number): string {
		let input = ""
		this.listNCC.forEach(i => {
			if (i.id == id)
				input = i.title
		});
		return input;
	}

	getValue(row, id_nguon) {
		let id_nhomletet = this.itemForm.controls["Id_NhomLeTet"].value;
		if (id_nhomletet == undefined || row.MucQuas == undefined)
			return '';
		let find = row.MucQuas.find(x => x.Id_NguonKinhPhi == id_nguon);
		if (find != null)
			return find.SoTien;
		else
			return 0;
	}

	changeMuc($event, row, id_nguon) {
		// let id_nhom = this.itemForm.controls["Id_NhomLeTet"].value;
		let find = row.MucQuas.find(x => x.Id_NguonKinhPhi == id_nguon);
		if (find != null) {
			if ($event.target.value == "")
				find.SoTien = null;
			else {
				let v = this.danhMucService.stringToInt($event.target.value);
				find.SoTien = v;
			}
		}
	}

	updateDe(row) {
		let item = Object.assign({}, row);
		item.Id_DotTangQua = this.item.Id;
		this.dottangquaService.editDoiTuongs(item).subscribe(res => {
			if (res && res.status == 1)
				this.layoutUtilsService.showInfo("Cập nhật mức quà thành công");
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	createForm() {
		this.itemForm = this.fb.group({
			DotTangQua: [this.item.DotTangQua, Validators.required],
			Id_NhomLeTet: [this.item.Id_NhomLeTet, Validators.required],
			Nam: ['' + this.item.Nam, Validators.required],
			MoTa: [this.item.MoTa],
			Locked: [this.item.Locked],
			Priority: ['' + this.item.Priority],
			NguoiCoCong: [],
			fileDinhKems: [this.item.FileDinhKems],
			SoQD: [this.item.SoQD],
			NgayQD: [this.item.NgayQD],
			SoCV: [this.item.SoCV],
			NgayCV: [this.item.NgayCV],
		});

		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	//Hai hàm phục vụ hiển thị chưa lưu xuống DB
	addIntoTable() {
		const controls = this.itemForm.controls;
		const _item = new dottangqua_NCCModel();

		_item.Id_DotTangQua = this.item.Id;
		_item.Id_DoiTuongNCC = controls['NguoiCoCong'].value;
		_item.selected = true;
		_item.MucQuas = this.listNCC.find(x => +x.id == +_item.Id_DoiTuongNCC).data
							.filter(x => +x.Id_NhomLeTet == this.item.Id_NhomLeTet);

		//kiểm tra trùng Id_NCC trong danh sách
		if (this.NCC_MQs.find(({ Id_DoiTuongNCC }) => Id_DoiTuongNCC == _item.Id_DoiTuongNCC)) { 
			//so sánh 2 dấu bằng chỉ so sánh giá trị '3' = 3
			this.layoutUtilsService.showError("Đối tượng NCC này đã được thêm vào danh sách")
			return;
		}
		
		this.NCC_MQs.push(_item);
		this.datasource = new MatTableDataSource(this.NCC_MQs); //để load lại bảng khi datasource thay đổi
		this.tempThem.push(_item); //cho cập nhật thêm đối tượng

		this.changeDetectorRefs.detectChanges();
	}

	removeOutoTable(item: dottangqua_NCCModel) {
		if (this.NCC_MQs.length < 2) {
			this.NCC_MQs = []
			this.datasource = new MatTableDataSource(this.NCC_MQs);
		}

		let index = this.NCC_MQs.indexOf(item, 0); //tìm item từ vt 0
		if (index > -1) {
			this.NCC_MQs.splice(index, 1)
			this.datasource = new MatTableDataSource(this.NCC_MQs);
		}

		this.tempXoa.push(item); //cho cập nhật xóa đối tượng
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DOT_TANG_QUA.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DOT_TANG_QUA.DETAIL') + `- ${this.item.DotTangQua}`;
			return result;
		}
		result = this.translate.instant('DOT_TANG_QUA.UPDATE') + `- ${this.item.DotTangQua}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): dottangquaModel {
		const controls = this.itemForm.controls;
		const _item = new dottangquaModel();
		_item.Id = this.item.Id;
		_item.DotTangQua = controls['DotTangQua'].value;
		_item.Id_NhomLeTet = controls['Id_NhomLeTet'].value;
		_item.Nam = controls['Nam'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.Locked = controls['Locked'].value;
		_item.FileDinhKems = controls['fileDinhKems'].value;
		_item.Priority = controls['Priority'].value;
		_item.SoQD = controls['SoQD'].value;
		_item.SoCV = controls['SoCV'].value;
		//_item.SoTT = controls['SoTT'].value;
		if (controls.NgayQD.value !== '')
			_item.NgayQD = this.danhMucService.f_convertDate(controls.NgayQD.value);
		if (controls.NgayCV.value !== '')
			_item.NgayCV = this.danhMucService.f_convertDate(controls.NgayCV.value);
		//if (controls.NgayTT.value !== '')
		//	_item.NgayTT = this.danhMucService.f_convertDate(controls.NgayTT.value);
		_item.DoiTuongs = [];
		this.NCC_MQs.forEach(x => {
			if (x.selected) {
				let temp = { Id_DoiTuongNCC: x.Id_DoiTuongNCC, MucQuas: x.MucQuas.filter(y => y.Id_NhomLeTet == _item.Id_NhomLeTet) };
				_item.DoiTuongs.push(temp);
			}
		})
		return _item;
	}

	onSubmit(withBack: boolean = false) {

		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const EditDot = this.prepareCustomer();
		if (EditDot.Id > 0) {
			this.UpdateDot(EditDot, withBack);
		} else {
			this.CreateDot(EditDot, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}
	saveTable() {
		if (this.NCC_MQs.length < this.count) { //đang xóa một số đối tượng
			this.tempXoa.forEach(i => this.dottangquaService.deleteDoiTuongs(i.Id).subscribe(res => {
				if (res && res.status == 1)
					this.ngOnInit(); //khởi tạo lại dialog
				else
					this.layoutUtilsService.showError(res.error.message);
			}));
		}

		if (this.NCC_MQs.length == this.count) { //đang edit một số đối tượng
			// có 2 trường hợp: 1 là thêm n pt và xóa n pt, 2 là ko thêm xóa chỉ thay đổi Id_MucQua
		}

		if (this.NCC_MQs.length > this.count) { //đang thêm một số đối tượng
			this.dottangquaService.addDoiTuongs(this.tempThem).subscribe(res => {
				if (res && res.status == 1)
					this.ngOnInit(); //khởi tạo lại dialog
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}
	UpdateDot(_item: dottangquaModel, withBack: boolean) {

		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		this.disabledBtn = true;
		this.dottangquaService.updateDotTangQua(_item).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else { //lưu và thêm mới, withBack = false
					this.ngOnInit(); //khởi tạo lại dialog
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});

	}

	CreateDot(_item: dottangquaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		_item.DoiTuongs = this.NCC_MQs;
		this.dottangquaService.createDotTangQua(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.NCC_MQs = [];
					this.details = [];
					this.datasource = new MatTableDataSource(this.NCC_MQs);
					this.fileUpload = [];
					this.ngOnInit();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	filter() {
		if (!this.listNCC) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listdoituongncc.next(this.listNCC.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listdoituongncc.next(
			this.listNCC.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}
	updateSoTT(allowEdit: boolean = true) {
		let _item = Object.assign({}, this.item);
		const dialogRef = this.dialog.open(SoToTrinhEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
		});
	}
}
