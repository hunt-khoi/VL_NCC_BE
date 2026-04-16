// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService } from 'app/core/_base/crud';
import { dutoankinhphiService } from '../Services/du-toan-kinh-phi.service';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-du-toan-kinh-phi-import',
	templateUrl: './du-toan-kinh-phi-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DuToanKinhPhiImportComponent implements OnInit, OnDestroy {
	
	// Public properties
	DoiTuongTrangCap: any;
	itemForm: FormGroup;
	hasFormErrors = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;
	lstDuToan: any[] = [];
	lstDuToanError: any[] = [];
	dataSource = new MatTableDataSource(this.lstDuToan);
	viewLoading = false;
	isChange = false;
	_soLanImport = 0;
	_dataImport: any[] = [];
	HTMLStr = '';
	isReview = false;
	displayedColumns: string[] = ['STT', 'DungCu', 'actions'];
	private componentSubscriptions: Subscription;
	isError: boolean = false;

	listdistrict: any[] = [];
	listDisplayDisctrics= ['empty'];

	constructor(
		public dialogRef: MatDialogRef<DuToanKinhPhiImportComponent>,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		private tokenStorage: TokenStorage,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private objectService: dutoankinhphiService) { }

	ngOnInit() {
		this.viewLoading = false;

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.loadGetListDistrictByProvinces(res.IdTinh);
		})
		this.createForm();
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.listdistrict.forEach(x => { 
				this.displayedColumns.push('soluong' + x.ID_Row);
				this.displayedColumns.push('kinhphi' + x.ID_Row); 
				this.listDisplayDisctrics.push('district' + x.ID_Row)  
			});

			this.listDisplayDisctrics.push('empty1');
			this.changeDetectorRefs.detectChanges();
		});
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}
	filter($event) {
		if (!$event.checked)
			this.dataSource = new MatTableDataSource(this.lstDuToan);
		else {
			this.dataSource = new MatTableDataSource(this.lstDuToanError);
		}
		this.changeDetectorRefs.detectChanges();
	}

	createForm() {
		this.itemForm = this.itemFB.group({
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
		this.lstDuToan = [];
		this.lstDuToanError = [];
		this.isError = false;
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		this.objectService.importFile(data).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status === 1) {
				this.lstDuToan = res.data;
				this.lstDuToanError = this.lstDuToan.filter(x => x.isError);
				this.dataSource = new MatTableDataSource(this.lstDuToan);
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		});
	}

	getValue(row, id_huyen, isSoLuong: boolean = true) {
		let rowCT = this.lstDuToan[row];
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

	luuImport() {
		let files = this.itemForm.controls["file"].value;
		if (!files) {
			this.layoutUtilsService.showError("Vui lòng chọn file");
			return;
		}
		this.viewLoading = true;
		var data: any = files[0];
		data.review = false; //import
		this.objectService.importFile(data).subscribe(res => {
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
		this.objectService.downloadTemplate().subscribe(response => {
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
