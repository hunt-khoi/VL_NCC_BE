// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { HoSoNhaOService } from '../Services/ho-so-nha-o.service';
import { HoSoNhaOModel } from '../Model/ho-so-nha-o.model';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-ho-so-nha-o-import',
	templateUrl: './ho-so-nha-o-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOImportComponent implements OnInit, OnDestroy {
	// Public properties
	HoSoNCC: HoSoNhaOModel;
	HoSoNCCForm: FormGroup;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	lstNCC: HoSoNhaOModel[] = [];

	dataSource = new MatTableDataSource(this.lstNCC);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'SoHoSo', 'HoTen', 'NgaySinh', 'GioiTinh', 'DoiTuong', 'HinhThucHoTro', 'DiaChi','KhomAp', 'Title', 'ChiPhiYeuCau', 'NoiDungHoTro', 'actions'];
	private componentSubscriptions: Subscription;

	constructor(
		public dialogRef: MatDialogRef<HoSoNhaOImportComponent>,
		private HoSoNCCFB: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private HoSoNhaOService: HoSoNhaOService) { }

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
		this.HoSoNCCForm = this.HoSoNCCFB.group({
			file: [''],
		});
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.HoSoNCCForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
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
		this.HoSoNhaOService.importFile(data).subscribe(res => {
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
		this.HoSoNhaOService.importFile(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.dialogRef.close(true);
				let msg;
				if(res.data.success > 0)
				{
					msg = "Import thành công " + res.data.success + "/" + res.data.total;
					this.layoutUtilsService.showInfo(msg);
				}
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	DownloadFileMau() {
		this.HoSoNhaOService.downloadTemplate().subscribe(response => {
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
			this.layoutUtilsService.showError("Tải xuống file mẫu thất bại")
		});
	}
}
