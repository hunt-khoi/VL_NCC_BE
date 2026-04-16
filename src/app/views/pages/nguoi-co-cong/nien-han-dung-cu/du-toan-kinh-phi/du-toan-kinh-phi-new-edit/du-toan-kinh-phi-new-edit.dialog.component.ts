import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dutoankinhphiModel, dutoankinhphi_NCCModel, DuToanModel } from '../Model/du-toan-kinh-phi.model';
import { TranslateService } from '@ngx-translate/core';
import { dutoankinhphiService } from '../Services/du-toan-kinh-phi.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { SelectionModel } from '@angular/cdk/collections';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'm-du-toan-kinh-phi-new-edit-dialog',
	templateUrl: './du-toan-kinh-phi-new-edit.dialog.component.html',
})

export class dutoankinhphinnewEditDialogComponent implements OnInit {

	item: dutoankinhphiModel;
	oldItem: dutoankinhphiModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;

	listNCC: any[] = [];
	NCC_DCs: dutoankinhphi_NCCModel[] = [];

	listdistrict: any[] = [];
	listDisplayDisctrics= ['empty'];

	datasource: MatTableDataSource<any>;
	count: number = 0;
	chiTiets : any[] = [];
	displayedColumns = ['STT', 'DoiTuong'];

	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('fileUpload', { static: true }) fileUpload;

	_name = "";
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	nhanban = false;

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

	constructor(public dialogRef: MatDialogRef<dutoankinhphinnewEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private commonService: CommonService,
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

		if (this.data.nhanban) {
			this.nhanban = this.data.nhanban;
		}

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
					this.item = res.data;
					if (this.nhanban) {
						this.item.Id = 0;
					}
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}

		this.loadNhom();
	}

	loadNhom() {
		this.commonService.liteDungCuChinhHinh(false, false, true).subscribe(res => {
			this.listNCC = res.data;
			//if (this.item.Id == 0) {
			this.NCC_DCs = res.data.map(x => { return { Id_DungCu: x.id, TenDungCu: x.title, TriGia: x.trigia }; });
			//}
			this.productsResult = this.NCC_DCs;
			this.datasource = new MatTableDataSource(this.NCC_DCs);
			this.load_listChiTiets();
			this.changeDetectorRefs.detectChanges();
		})

	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.listdistrict.forEach(x => { 
				this.displayedColumns.push('soluong' + x.ID_Row);
				this.displayedColumns.push('kinhphi' + x.ID_Row); 
				this.listDisplayDisctrics.push('district' + x.ID_Row)  
			});

			this.changeDetectorRefs.detectChanges();
		});
	}

	createForm() {
		this.itemForm = this.fb.group({
			DuToan: [this.item.DuToan, Validators.required],
			Nam: [this.item.Nam, Validators.required],
			MoTa: [this.item.MoTa],
			Locked: [this.item.Locked],
			Priority: ['' + this.item.Priority],
			fileDinhKems: [this.item.FileDinhKems],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit) //false thì không cho sửa
	
		this.itemForm.disable();
	}

	load_listChiTiets(){
		this.NCC_DCs.forEach(x => {
			let temp : any = {};
			temp.Id_DungCu = x.Id_DungCu;
			temp.Huyens = [];
			this.listdistrict.forEach(y => {
				let huyen : any = {};
				huyen.SoDoiTuong = 1;
				huyen.Id_Huyen = y.ID_Row;
				huyen.KinhPhi = +x.TriGia;
				temp.Huyens.push(huyen);
			});
			this.chiTiets.push(temp)
		})
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

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DU_TOAN_KINH_PHI.ADD');
		if (this.nhanban) {
			result = this.translate.instant('Nhân bản') + ` - ${this.item.DuToan}`;
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('DU_TOAN_KINH_PHI.DETAIL') + ` - ${this.item.DuToan}`;
			return result;
		}
		result = this.translate.instant('DU_TOAN_KINH_PHI.UPDATE') + ` - ${this.item.DuToan}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): DuToanModel {
		const controls = this.itemForm.controls;
		let _item: DuToanModel = new DuToanModel;
		_item.Id = this.item.Id;
		_item.DuToan = controls['DuToan'].value;
		_item.Nam = +controls['Nam'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.FileDinhKems = controls['fileDinhKems'].value;
		_item.Priority = +controls['Priority'].value;
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
		} else {
			this.CreateDot(EditDot, withBack);
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

	CreateDot(_item: DuToanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dutoankinhphiService.createDuToan(_item).subscribe(res => {
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

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		return numSelected === this.productsResult.length;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
			this.productsResult.forEach(row => {
				row.selected = false;
			});
		} else {
			this.productsResult.forEach(row => {
				row.selected = true;
				this.selection.select(row)
			});
		}
	}
}
