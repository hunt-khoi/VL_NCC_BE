import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';
import { dotnienhanModel, dotnienhan_NCCModel } from '../Model/dot-nien-han.model';
import { dotnienhanService } from '../Services/dot-nien-han.service';

@Component({
	selector: 'm-dot-nien-han-edit-dialog',
	templateUrl: './dot-nien-han-edit.dialog.component.html',
})

export class dotnienhanEditDialogComponent implements OnInit {

	item: dotnienhanModel;
	oldItem: dotnienhanModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';

	FilterCtrl: string = '';
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listNCC: any[] = [];

	NCC_MQs: dotnienhan_NCCModel[] = [];
	tempXoa: dotnienhan_NCCModel[] = [];
	tempThem: dotnienhan_NCCModel[] = [];

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

	constructor(public dialogRef: MatDialogRef<dotnienhanEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public dotnienhanService: dotnienhanService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("DOT_NIEN_HAN.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit; 
		this.datasource = new MatTableDataSource(this.NCC_MQs);

		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;

			this.dotnienhanService.getItem(this.item.Id).subscribe(res => {
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
		this.danhMucService.liteDoiTuongNhanQua(false, true).subscribe(res => {
			this.listNCC = res.data;
			this.changeDetectorRefs.detectChanges();
			this.filter();
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

	createForm() {
		this.itemForm = this.fb.group({
			DotNienHan: [this.item.DotNienHan, Validators.required],
			Nam: ['' + this.item.Nam, Validators.required],
			MoTa: [this.item.MoTa],
			Locked: [this.item.Locked],
			Priority: ['' + this.item.Priority],
			fileDinhKems: [this.item.FileDinhKems],
			SoQD: [this.item.SoQD],
			NgayQD: [this.item.NgayQD],
		});

		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	//Hai hàm phục vụ hiển thị chưa lưu xuống DB
	addIntoTable() {
		const controls = this.itemForm.controls;
		const _item = new dotnienhan_NCCModel();

		_item.Id_DotTangQua = this.item.Id;
		_item.Id_DoiTuongNCC = controls['NguoiCoCong'].value;
		_item.selected = true;
		_item.MucQuas = this.listNCC.find(x => +x.id == +_item.Id_DoiTuongNCC).data.filter(x => +x.Id_NhomLeTet == this.item.Id_NhomLeTet);

		//kiểm tra trùng Id_NCC trong danh sách
		if (this.NCC_MQs.find(({ Id_DoiTuongNCC }) => Id_DoiTuongNCC == _item.Id_DoiTuongNCC)) { //so sánh 2 dấu bằng chỉ so sánh giá trị '3' = 3
			this.layoutUtilsService.showError("Đối tượng NCC này đã được thêm vào danh sách")
			return;
		}
		this.NCC_MQs.push(_item);
		this.datasource = new MatTableDataSource(this.NCC_MQs); //để load lại bảng khi datasource thay đổi

		this.tempThem.push(_item); //cho cập nhật thêm đối tượng

		this.changeDetectorRefs.detectChanges();
	}

	removeOutoTable(item: dotnienhan_NCCModel) {
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
		let result = this.translate.instant('DOT_NIEN_HAN.ADD');
		if (this.item.Id == 0) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DOT_NIEN_HAN.DETAIL') + `- ${this.item.DotNienHan}`;
			return result;
		}
		result = this.translate.instant('DOT_NIEN_HAN.UPDATE') + `- ${this.item.DotNienHan}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): dotnienhanModel {
		const controls = this.itemForm.controls;
		const _item = new dotnienhanModel();
		_item.Id = this.item.Id;
		_item.DotNienHan = controls['DotNienHan'].value;
		_item.Nam = controls['Nam'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.Locked = controls['Locked'].value;
		_item.FileDinhKems = controls['fileDinhKems'].value;
		_item.Priority = controls['Priority'].value;
		_item.SoQD = controls['SoQD'].value;
		if (controls.NgayQD.value !== '')
			_item.NgayQD = this.danhMucService.f_convertDate(controls.NgayQD.value);
		
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
			this.tempXoa.forEach(i => this.dotnienhanService.deleteDoiTuongs(i.Id).subscribe(res => {
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
			this.dotnienhanService.addDoiTuongs(this.tempThem).subscribe(res => {
				if (res && res.status == 1)
					this.ngOnInit(); //khởi tạo lại dialog
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	UpdateDot(_item: dotnienhanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dotnienhanService.updateDotNienHan(_item).subscribe(res => {
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

	CreateDot(_item: dotnienhanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		_item.DoiTuongs = this.NCC_MQs;
		this.dotnienhanService.createDotNienHan(_item).subscribe(res => {
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
}
