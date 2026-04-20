import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { HoSoNCCService } from '../Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';

@Component({
	selector: 'kt-ho-so-ncc-import',
	templateUrl: './ho-so-ncc-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoSoNCCImportComponent implements OnInit, OnDestroy {

	// Public properties
	HoSoNCC: HoSoNCCModel = new HoSoNCCModel();
	itemForm: FormGroup | undefined;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	lstNCC: HoSoNCCModel[] = [];
	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'SoHoSo', 'HoTen', 'NgaySinh', 'GioiTinh', 'DoiTuong', 'DiaChi','KhomAp', 'Title', 'DistrictName', 'NguoiThoCungLietSy', 'QuanHeVoiLietSy', 'actions'];
	private componentSubscriptions: Subscription | undefined;

	constructor(
		public dialogRef: MatDialogRef<HoSoNCCImportComponent>,
		private HoSoNCCFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private HoSoNCCService: HoSoNCCService) { }

	ngOnInit() {
		this.viewLoading = false;
		this.createForm();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.itemForm = this.HoSoNCCFB.group({
			file: [''],
		});
	}

	isControlInvalid(controlName: string): boolean {
		if (!this.itemForm) return false;
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	numberOnly(event: any): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) 
			return false;
		return true;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	loadImport() {
		if (!this.itemForm) return;
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		this.HoSoNCCService.importFile(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.lstNCC = res.data;
				this.dataSource = new MatTableDataSource(this.lstNCC);
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		});
	}

	luuImport() {
		if (!this.itemForm) return;
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		data.review = false;
		this.HoSoNCCService.importFile(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.dialogRef.close(true);
				let msg = "Import thành công " + res.data.success + "/" + res.data.total;
				this.layoutUtilsService.showInfo(msg);
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	DownloadFileMau() {
		this.HoSoNCCService.downloadTemplate().subscribe(response => {
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
			this.layoutUtilsService.showError("Tải file mẫu thất bại")
		});
	}
}