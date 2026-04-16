import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { dutoankinhphiModel, dutoankinhphi_NCCModel, DuToanModel } from '../Model/du-toan-kinh-phi.model';
import { dutoankinhphiService } from '../Services/du-toan-kinh-phi.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-du-toan-kinh-phi-edit-dialog',
	templateUrl: './du-toan-kinh-phi-edit.dialog.component.html',
})

export class dutoankinhphiEditDialogComponent implements OnInit {
	item: dutoankinhphiModel;
	oldItem: dutoankinhphiModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	_item: any;
	listdistrict: any[] = [];
	listDisplayDisctrics= ['empty'];
	list_id_DCDT :any[] = [];
	chiTiets : any[] = [];

	NCC_DCs: dutoankinhphi_NCCModel[] = [];
	tempXoa: dutoankinhphi_NCCModel[] = [];
	tempThem: dutoankinhphi_NCCModel[] = [];

	datasource: MatTableDataSource<any>;
	count: number = 0;
	details: any[] = [];
	displayedColumns = ['STT', 'DungCu'];

	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
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

	constructor(public dialogRef: MatDialogRef<dutoankinhphiEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public commonService: CommonService,
		public dutoankinhphiService: dutoankinhphiService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DU_TOAN_KINH_PHI.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.loadGetListDistrictByProvinces(res.IdTinh);
		})
		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.dutoankinhphiService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this._item = res.data;
					this.chiTiets = this._item.Details
					this.NCC_DCs = this._item.Details

					this.datasource = new MatTableDataSource(this.NCC_DCs);
					this.count = this.NCC_DCs.length; //lấy chiều dài mảng chi tiết bna đầu
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.listdistrict.forEach(x => { 
				this.displayedColumns.push('soluong' + x.ID_Row);
				this.displayedColumns.push('kinhphi' + x.ID_Row); 
				this.listDisplayDisctrics.push('district' + x.ID_Row)  
			});

			if(this.allowEdit)
				this.displayedColumns.push('action');
			this.listDisplayDisctrics.push('empty1');
			this.changeDetectorRefs.detectChanges();
		});
	}

	getValue(row, id_huyen, isSoLuong: boolean = true) {
		let rowCT = this.chiTiets[row];
		let index = rowCT.Huyens.findIndex(x => x.Id_Huyen == id_huyen);
		if(index > -1) {
			if (isSoLuong) {
				return rowCT.Huyens[index].SoDoiTuong;
			} else {
				return rowCT.Huyens[index].KinhPhi;
			}
		}
		return 0;
	}

	changeMuc($event, row, id_huyen, isSoLuong: boolean = true) {
		var value = $event.target.value
		var rowCT = this.chiTiets[row];
		let index = rowCT.Huyens.findIndex(x => x.Id_Huyen == id_huyen);
		if (index > -1) {
			if (isSoLuong) {
				if (value >= 1) {
					rowCT.Huyens[index].SoDoiTuong = value;
					// var kinhphi_now = Number((document.getElementById('kinhPhi_i' + row) as HTMLInputElement).value);
					// (document.getElementById('kinhPhi_i' + row) as HTMLInputElement).value = (kinhphi_now * value).toString();
				}
				else {
					this.layoutUtilsService.showError('Nhập số lượng lớn hơn hoặc bằng 1!');
					(document.getElementById('soLuong_i' + row) as HTMLInputElement).value = rowCT.Huyens[index].SoDoiTuong;
				}
			}
			else {
				if (value > 0) {
					rowCT.Huyens[index].KinhPhi = value;
				}
				else {
					this.layoutUtilsService.showError('Nhập kinh phí lớn hơn 0!');
					(document.getElementById('kinhPhi_i' + row) as HTMLInputElement).value = rowCT.Huyens[index].KinhPhi;
				}
			}
		}
	}

	updateDe(row) {
		this.dutoankinhphiService.editDungCus(row).subscribe(res => {
			if (res && res.status == 1)
				this.layoutUtilsService.showInfo("Cập nhật chi tiết dự toán thành công");
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	createForm() {
		this.itemForm = this.fb.group({
			DuToan: [this.item.DuToan, Validators.required],
			Nam: ['' + this.item.Nam, Validators.required],
			MoTa: [this.item.MoTa],
			Priority: ['' + this.item.Priority],
			fileDinhKems: [this.item.FileDinhKems],
			SoQD: [this.item.SoQD],
			NgayQD: [this.item.NgayQD],
		});
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DU_TOAN_KINH_PHI.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DU_TOAN_KINH_PHI.DETAIL') + ` - năm ${this.item.Nam}`;
			return result;
		}
		result = this.translate.instant('DU_TOAN_KINH_PHI.UPDATE') + ` - năm ${this.item.Nam}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): DuToanModel {
		const controls = this.itemForm.controls;
		const _item = new DuToanModel();
		_item.Id = this.item.Id;
		_item.DuToan = controls['DuToan'].value;
		_item.Nam = controls['Nam'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.FileDinhKems = controls['fileDinhKems'].value;
		_item.Priority = controls['Priority'].value;
		_item.ChiTiets = this.chiTiets;
		
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
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateDot(_item: DuToanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dutoankinhphiService.updateDuToan(_item).subscribe(res => {
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

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
