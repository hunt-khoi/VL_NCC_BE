import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { dottangquaService } from '../Services/dot-tang-qua.service';
import { dottangquaModel, dottangqua_NCCModel } from '../../dot-tang-qua/Model/dot-tang-qua.model';

@Component({
	selector: 'm-dot-tang-qua-new-edit-dialog',
	templateUrl: './dot-tang-qua-new-edit.dialog.component.html',
})

export class dottangquannewEditDialogComponent implements OnInit {
	item: dottangquaModel = new dottangquaModel();
	oldItem: dottangquaModel = new dottangquaModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	listNhomLeTet: any[] = [];
	listNCC: any[] = [];
	listMucQua: any[] = [];
	listNguon: any[] = [];

	NCC_MQs: dottangqua_NCCModel[] = [];
	datasource: MatTableDataSource<any> | undefined;
	count: number = 0;
	displayedColumns = ['select', 'STT', 'DoiTuong'];

	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean = false;
	nhanban = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	@ViewChild('fileUpload', { static: true }) fileUpload: any;

	_name = "";
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];

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

	constructor(public dialogRef: MatDialogRef<dottangquannewEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public apiService: dottangquaService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DOT_TANG_QUA.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit; 
		if (this.data.nhanban) {
			this.nhanban = this.data.nhanban;
		}
		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.nhanban) {
						this.item.Id = 0;
						this.item.Locked = true;
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
		this.danhMucService.liteNhomLeTet().subscribe(res => {
			this.listNhomLeTet = res.data;
			this.changeDetectorRefs.detectChanges();
		});

		this.danhMucService.liteDoiTuongNhanQua(false, true).subscribe(res => {
			this.listNCC = res.data;
			//if (this.item.Id == 0) {
			this.NCC_MQs = res.data.map((x: any) => { return { Id_DoiTuongNCC: x.id, DoiTuong: x.title, MucQuas: x.data, selected: true }; });
			//}
			this.productsResult = this.NCC_MQs;
			this.datasource = new MatTableDataSource(this.NCC_MQs);
			this.changeDetectorRefs.detectChanges();
		})

		this.danhMucService.liteMucQua().subscribe(res => {
			this.listMucQua = res.data;
			this.changeDetectorRefs.detectChanges();
		})

		this.danhMucService.liteNguonKinhPhi().subscribe(res => {
			this.listNguon = res.data;
			this.listNguon.forEach(x => { this.displayedColumns.push('Nguon' + x.id) });
			this.changeDetectorRefs.detectChanges();
		})
	}

	createForm() {
		this.itemForm = this.fb.group({
			DotTangQua: [this.item.DotTangQua, Validators.required],
			Id_NhomLeTet: [this.item.Id_NhomLeTet, Validators.required],
			Nam: [this.item.Nam, Validators.required],
			MoTa: [this.item.MoTa],
			Locked: [this.item.Locked],
			Priority: ['' + this.item.Priority],
			NguoiCoCong: [],
			MucQua: [],
			fileDinhKems: [this.item.FileDinhKems],
		});

		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	getValue(row: any, id_nguon: number) {
		if (!this.itemForm) return '';
		let id_nhomletet = this.itemForm.controls["Id_NhomLeTet"].value;
		if (id_nhomletet == undefined)
			return '';
		let find = row.MucQuas.find((x: any) => +x.Id_NhomLeTet == +id_nhomletet && +x.Id_NguonKinhPhi == +id_nguon);
		if (find != null)
			return this.danhMucService.f_currency_V2(find.SoTien);
		return '';
	}

	getTitle(): string {
		let result = this.translate.instant('DOT_TANG_QUA.ADD');
		if (this.nhanban) {
			result = this.translate.instant('DOT_TANG_QUA.NHANBAN') + `- ${this.item.DotTangQua}`;
			return result;
		}
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

	prepare(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = this.item.Id;
		_item.DotTangQua = controls['DotTangQua'].value;
		_item.Id_NhomLeTet = controls['Id_NhomLeTet'].value;
		_item.Nam = +controls['Nam'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.Locked = controls['Locked'].value;
		_item.FileDinhKems = controls['fileDinhKems'].value;
		_item.Priority = +controls['Priority'].value;
		_item.DoiTuongs = [];
		this.NCC_MQs.forEach(x => {
			if (x.selected) {
				let temp = { Id_DoiTuongNCC: x.Id_DoiTuongNCC, MucQuas: x.MucQuas.filter(y => y.Id_NhomLeTet == _item.Id_NhomLeTet) };
				_item.DoiTuongs.push(temp);
			}
		})
		//this.NCC_MQs.filter(x => x.selected);
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const EditDot = this.prepare();
		if (EditDot.Id > 0) {
			this.UpdateDot(EditDot, withBack);
		} else {
			this.CreateDot(EditDot, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateDot(item: dottangquaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {  //lưu và đóng, withBack = true
					this.dialogRef.close({ item });
				}
				else { //lưu và thêm mới, withBack = false
					this.ngOnInit(); //khởi tạo lại dialog
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateDot(item: dottangquaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
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

	onAlertClose() {
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
