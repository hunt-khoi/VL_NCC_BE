// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
// RxJS
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { DanhMucKhacService } from '../services/danh-muc-khac.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-tro-cap-import',
	templateUrl: './tro-cap-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TroCapImportComponent implements OnInit, OnDestroy {
	// Public properties
	HoSoNCC: any;
	HoSoNCCForm: FormGroup;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	lstNCC: any[] = [];
	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'MaTroCap', 'TroCap', 'Id_LoaiHoSo', 'TienTroCap', 'PhuCap', 'TienMuaBao','TroCapNuoiDuong', 'Id_BieuMau', 'actions'];
	private componentSubscriptions: Subscription;

	constructor(
		public dialogRef: MatDialogRef<TroCapImportComponent>,
		private HoSoNCCFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private commonService:CommonService,
		private HoSoNCCService: DanhMucKhacService) { }
	/**
	 * On init
	 */
	ngOnInit() {
		this.viewLoading = false;
		this.createForm(); 
	}
	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}
	/**
	 * Create form
	 */
	createForm() {
		this.HoSoNCCForm = this.HoSoNCCFB.group({
			file: [''],
		});
	}

	/**
	 * Check control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.HoSoNCCForm.controls[controlName];
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
		let files = this.HoSoNCCForm.controls["file"].value;
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
		let files = this.HoSoNCCForm.controls["file"].value;
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
