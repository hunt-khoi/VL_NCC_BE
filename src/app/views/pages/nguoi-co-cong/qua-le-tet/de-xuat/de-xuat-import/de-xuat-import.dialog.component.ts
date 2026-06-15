import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DeXuatModel } from '../Model/de-xuat.model';
import { DeXuatService } from '../Services/de-xuat.service';

@Component({
	selector: 'm-de-xuat-import-dialog',
	templateUrl: './de-xuat-import.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DeXuatImportDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	@ViewChild('fileUpload', { static: true }) fileUpload: any;
	DeXuatModel: DeXuatModel = new DeXuatModel();
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;
	_soLanImport: number = 0;
	_dataImport: any[] = [];
    HTMLStr: string='';
	id: number = 0;
	allowImport = false;
	disabledBtn: boolean = false;
	private componentSubscriptions: Subscription | undefined;

	constructor(
		public dialogRef: MatDialogRef<DeXuatImportDialogComponent>,
        private importFB: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private DeXuatService: DeXuatService) {}

	ngOnInit() {
        this.viewLoading = false;
        this.id = this.data;
		this.DeXuatService.data_import.subscribe(res => {
			this._dataImport = [...res];
		});
		this.createForm();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
		this.DeXuatService.data_import.next([]);
	}

	createForm() {
		this.itemForm = this.importFB.group({
			FileDuLieu: [''],
			ErrorMessage: [''],
		});
	}
    
	closeDialog() {
		this.dialogRef.close(this.isChange); 
    }
    
	selectFile() {
		this.itemForm.controls['ErrorMessage'].setValue('');
		let el: HTMLInputElement = this.fileUpload.nativeElement as HTMLInputElement;
		el.type = "text";
		el.type = "file";
		el.click();
	}

    //kiểm tra định dạng file và gán lại tên file cho control
	FileSelected(evt: any) {
		if (evt.target.files && evt.target.files.length) { //Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let fileName = file.name;
			var res = fileName.match(/.xls$|.xlsx$/g);
			if (!res) {
				this.layoutUtilsService.showError('File không hợp lệ');
				return;
			}
			if (!res["includes"]('.xlsx') && !res["includes"]('.xls')) {
				this.layoutUtilsService.showError('File không hợp lệ.');
				return;
			}
			else {
				this.itemForm.controls['FileDuLieu'].patchValue(fileName);
				// this.checkDataIsValid()
			}
		}
		else { //Không có file
			this.itemForm.controls['FileDuLieu'].patchValue('');
		}
    }
    
	checkDataIsValid(): boolean {
		// Kiểm tra Form Control 'FileDuLieu' có tồn tại và hợp lệ không
		const fileControl = this.itemForm.controls['FileDuLieu'];
		const isControlValid = fileControl && fileControl.valid;
		// Kiểm tra thẻ input HTML xem đã có file được chọn chưa
		const fileInput = document.getElementById("fileUploadExcel") as HTMLInputElement;
		let hasSelectedFile = false;
		if (fileInput && fileInput.type === 'file') {
			if (fileInput.files && fileInput.files.length > 0) {
				hasSelectedFile = true;
			}
		}
		return isControlValid && hasSelectedFile;
	}

	reviewFile() {	
		let el: any = this.fileUpload.nativeElement;
		var service = this.DeXuatService;
		var useBase64: boolean = true;
		for (var idx = 0; idx < el.files.length; idx++) {
			if (useBase64) {
				var fileName = el.files[idx].name;
                let reader = new FileReader();
                let id = this.id; //id đợt tặng quà
				var a = this.itemForm.controls['FileDuLieu'];
				var b = this.itemForm.controls['ErrorMessage'];
				let self = this;
				reader.readAsDataURL(el.files[idx]);
				reader.onload = function () {
					let base64Str = reader.result as String;
					var metaIdx = base64Str.indexOf(';base64,');
					base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
					var data = {
						fileName: fileName,
                        strBase64: base64Str, //truyền data
                        Id_DotTangQua: id   //truyền id
					};
					service.lastFileUpload$.next(data);
					service.import(data).pipe(takeUntil(self.destroy$)).subscribe(res => {
						if (res && res.status == 1) {
                            let i = 1;
                            for (const pt of res.data){
                                if (pt.isError) {
                                    a.setValue(''); //mất file đã load lên
                                    b.setValue('Lỗi dòng '+i+" : "+pt.message);
                                    return;
                                }
                                i = i+1;
                            }
						} else {
							a.setValue('');
							b.setValue(res.error.message);
							return;
						}
					});
				};
			}
			else {
				let inputs = new FormData();
				inputs.append('file', el.files[idx]);
			}
		}
		this.allowImport = true;
    }

	luuImport() {
        let el: any = this.fileUpload.nativeElement;
		var service = this.DeXuatService;
        var useBase64: boolean = true;
		for (var idx = 0; idx < el.files.length; idx++) {
			if (useBase64) {
				var fileName = el.files[idx].name;
                let reader = new FileReader();
                let id = this.id; //id đợt tặng quà
				var a = this.itemForm.controls['FileDuLieu'];
				var b = this.itemForm.controls['ErrorMessage'];
				let isChange = this.isChange;
				const show = this.layoutUtilsService;
				let self = this;
				reader.readAsDataURL(el.files[idx]);
				reader.onload = function () {
					let base64Str = reader.result as String;
					var metaIdx = base64Str.indexOf(';base64,');
					base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
					var data = {
						fileName: fileName,
                        strBase64: base64Str, //truyền data
                        Id_DotTangQua: id,   //truyền id
                        review: false   //import ko review nữa
					};
					service.lastFileUpload$.next(data);
					service.import(data).pipe(takeUntil(self.destroy$)).subscribe(res => {
						if (res && res.status == 1) {
							isChange = true;
							a.setValue('');
							b.setValue('');
                            show.showInfo('Import thành công '+res.success+" dòng trong tổng số "+res.total+" dòng của file dữ liệu !!");
						}
						else {
							a.setValue('');
							b.setValue(res.error.message);
							show.showError('Import thất bại, vui lòng kiểm tra lại file excel!');
						}
					});
                };
			}
        }
	}
}