import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { DanhMucKhacService } from '../Services/danh-muc-khac.service';

@Component({
	selector: 'kt-tro-cap-import',
	templateUrl: './tro-cap-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TroCapImportComponent implements OnInit, OnDestroy {
	// Public properties
	HoSoNCC: any;
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	lstNCC: any[] = [];
	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'MaTroCap', 'TroCap', 'Id_LoaiHoSo', 'TienTroCap', 'PhuCap', 'TienMuaBao','TroCapNuoiDuong', 'Id_BieuMau', 'actions'];
	private destroy$ = new Subject<void>();

	constructor(
		public dialogRef: MatDialogRef<TroCapImportComponent>,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: DanhMucKhacService) { }

	ngOnInit() {
		this.viewLoading = false;
		this.createForm(); 
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			file: [''],
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	numberOnly(event: any): boolean {
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
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		this.apiService.importFile(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		data.review = false;
		this.apiService.importFile(data).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		this.apiService.downloadTemplate().pipe(takeUntil(this.destroy$)).subscribe(response => {
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