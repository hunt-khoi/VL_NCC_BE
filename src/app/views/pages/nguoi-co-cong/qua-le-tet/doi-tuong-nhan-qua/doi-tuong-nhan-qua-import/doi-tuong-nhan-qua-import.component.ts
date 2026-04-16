// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { DoiTuongNhanQuaService } from '../Services/doi-tuong-nhan-qua.service';
import { DoiTuongNhanQuaModel } from '../Model/doi-tuong-nhan-qua.model';

@Component({
	selector: 'kt-doi-tuong-nhan-qua-import',
	templateUrl: './doi-tuong-nhan-qua-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNhanQuaImportComponent implements OnInit, OnDestroy {

	// Public properties
	DoiTuongNhanQua: DoiTuongNhanQuaModel;
	itemForm: FormGroup;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	lstNCC: DoiTuongNhanQuaModel[] = [];
	lstNCCError: DoiTuongNhanQuaModel[] = [];
	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'SoHoSo', 'HoTen', 'NgaySinh', 'GioiTinh', 'DoiTuong', 'DiaChi', 'KhomAp', 'Title', 'DistrictName', 'NguoiThoCungLietSy', 'QuanHeVoiLietSy', 'actions'];
	private componentSubscriptions: Subscription;
	newTemplate: boolean = true;
	isError: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<DoiTuongNhanQuaImportComponent>,
		private DoiTuongNhanQuaFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private DoiTuongNhanQuaService: DoiTuongNhanQuaService) { }

	ngOnInit() {
		this.viewLoading = false;
		this.createForm();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}
	filter($event) {
		if (!$event.checked)
			this.dataSource = new MatTableDataSource(this.lstNCC);
		else {
			this.dataSource = new MatTableDataSource(this.lstNCCError);
		}
		this.changeDetectorRefs.detectChanges();
	}

	createForm() {
		this.itemForm = this.DoiTuongNhanQuaFB.group({
			file: [''],
		});
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	numberOnly(event): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	loadImport() {
		this.lstNCC = [];
		this.lstNCCError = [];
		this.isError = false;
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		let mau = 1;
		if (this.newTemplate)
			mau = 2;
		this.DoiTuongNhanQuaService.importFile(data, mau).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.lstNCC = res.data;
				this.lstNCCError = this.lstNCC.filter(x => x.isError);
				this.dataSource = new MatTableDataSource(this.lstNCC);
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		});
	}

	luuImport() {
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		data.review = false;
		let mau = 1;
		if (this.newTemplate)
			mau = 2;
		this.DoiTuongNhanQuaService.importFile(data, mau).subscribe(res => {
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
		let mau = 1;
		if (this.newTemplate)
			mau = 2;
		this.DoiTuongNhanQuaService.downloadTemplate(mau).subscribe(response => {
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
			this.layoutUtilsService.showError("Tải xuống file mẫu thất bại");
		});
	}
}
