import { Component, OnInit, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { SelectionModel } from '@angular/cdk/collections';
import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';

@Component({
	selector: 'm-update-muc-qua',
	templateUrl: './update-muc-qua.dialog.component.html',
})
export class UpdateMucQuaDialogComponent implements OnInit {
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listNCC: any[] = [];
	listNhomLeTet: any[] = [];
	listNguon: any[] = [];

	datasource: MatTableDataSource<any>;
	displayedColumns = ['select', 'STT', 'DoiTuong'];
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	isZoomSize: boolean = false;

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
		// if (event.ctrlKey && event.keyCode == 13) { //phím Enter
		// 	this.onSubmit(false);
		// }
	}

	constructor(public dialogRef: MatDialogRef<UpdateMucQuaDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.createForm();
		this.viewLoading = true;
		this.loadNhom();
		this.danhMucService.liteDoiTuongNhanQua(false, true).subscribe(res => {
			if (res && res.status === 1) {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				this.listNCC = res.data;
				this.productsResult = this.listNCC;
				this.datasource = new MatTableDataSource(this.listNCC);
				this.changeDetectorRefs.detectChanges();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	loadNhom() {
		this.danhMucService.liteNhomLeTet().subscribe(res => {
			this.listNhomLeTet = res.data;
			this.changeDetectorRefs.detectChanges();
		});

		this.danhMucService.liteNguonKinhPhi().subscribe(res => {
			this.listNguon = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	createForm() {
		this.itemForm = this.fb.group({
			SoTien: ['', Validators.required],
			Id_NhomLeTet: [null, Validators.required],
			Id_NguonKinhPhi: [null, Validators.required],
		});
	}

	/** UI */
	getTitle(): string {
		return 'Cập nhật mức quà cho nhiều đối tượng';
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id_NguonKinhPhi = controls['Id_NguonKinhPhi'].value;
		_item.Id_NhomLeTet = controls['Id_NhomLeTet'].value;
		_item.SoTien = +controls['SoTien'].value;
		_item.DoiTuongs = this.listNCC.filter(x => x.selected).map(x => x.id);
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
		this.UpdateDot(EditDot, withBack);
	}

	closeForm() {
		this.dialogRef.close();
	}
	
	UpdateDot(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.UpdateMucQuaDoiTuongs(_item).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
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
