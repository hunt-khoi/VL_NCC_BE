// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { dvDongGopServices } from '../Services/dv-dong-gop.service';
import { dvDongGopModel } from '../Model/dv-dong-gop.model';

@Component({
	selector: 'kt-dv-dong-gop-import',
	templateUrl: './dv-dong-gop-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class dvDongGopImportComponent implements OnInit, OnDestroy {
	// Public properties
	dvDongGop: dvDongGopModel;
	itemForm: FormGroup;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	lstNCC: dvDongGopModel[] = [];
	lstNCCError: dvDongGopModel[] = [];
	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'HoTen', 'DiaChi', 'GhiChu'];
	private componentSubscriptions: Subscription;
	newTemplate: boolean = true;
	isError: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<dvDongGopImportComponent>,
		private dvDongGopFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private dvDongGopService: dvDongGopServices) { }

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
		this.itemForm = this.dvDongGopFB.group({
			file: [''],
			isError: [this.isError]
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
		this.dvDongGopService.importFile(data).subscribe(res => {
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
		this.dvDongGopService.importFile(data).subscribe(res => {
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
		this.dvDongGopService.downloadTemplate().subscribe(response => {
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
