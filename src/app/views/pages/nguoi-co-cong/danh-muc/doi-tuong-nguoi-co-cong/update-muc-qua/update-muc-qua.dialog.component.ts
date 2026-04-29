import { Component, OnInit, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DoiTuongNguoiCoCongService } from '../Services/doi-tuong-nguoi-co-cong.service';

@Component({
	selector: 'm-update-muc-qua',
	templateUrl: './update-muc-qua.dialog.component.html',
})
export class UpdateMucQuaDialogComponent implements OnInit {
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listNCC: any[] = [];
	listNhomLeTet: any[] = [];
	listNguon: any[] = [];

	datasource: MatTableDataSource<any> | undefined;
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
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<UpdateMucQuaDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public apiService: DoiTuongNguoiCoCongService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService) {
	}

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

	getTitle(): string {
		return 'Cập nhật mức quà cho nhiều đối tượng';
	}

	prepare(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		let item: any = {};
		item.Id_NguonKinhPhi = controls['Id_NguonKinhPhi'].value;
		item.Id_NhomLeTet = controls['Id_NhomLeTet'].value;
		item.SoTien = +controls['SoTien'].value;
		item.DoiTuongs = this.listNCC.filter(x => x.selected).map(x => x.id);
		return item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const EditDot = this.prepare();
		this.Update(EditDot);
	}

	closeForm() {
		this.dialogRef.close();
	}
	
	Update(item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.UpdateMucQuaDoiTuongs(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({ item });
			}
			else {
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