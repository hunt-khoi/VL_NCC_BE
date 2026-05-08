import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-khom-ap-edit-dialog',
	templateUrl: './khom-ap-edit.dialog.component.html',
})

export class KhomApEditDialogComponent implements OnInit {
	item: any;
	oldItem: any;
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	listprovinces: any[] = [];
	listTinh: any[] = [];
	listXa: any[] = [];
	id_provinces: number = 0;
	FilterCtrlXa: string = '';
	filteredListXa: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	_name: string = "";

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<KhomApEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: donvihanhchinhService,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = 'Khóm, ấp';
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.id_provinces = res.IdTinh;
			this.loadTinhThanhChange(this.id_provinces);
		})
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data;
		});
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
	}

	createForm() {
		this.itemForm = this.fb.group({
			wardName: [this.item.Title, Validators.required],
			xa: ['' + this.item.WardID, Validators.required],
		});
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.RowID) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` - ${this.item.Title}`;
		return result;
	}

	prepare(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.RowID = this.item.RowID;
		_item.Title = controls['wardName'].value; 
		_item.WardID = controls['xa'].value; 
		return _item;
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
		const update = this.prepare();
		if (update.RowID > 0) {
			this.Update(update);
		} else {
			this.Create(update);
		}
	}

	Update(item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.UpdateKhomAp(item).subscribe(res => {
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

	Create(item: any) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.apiService.CreateKhomAp(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({ item });
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	loadTinhThanhChange(idtinh: any) {
		this.danhMucService.GetListWardByProvince(idtinh).subscribe(res => {
			this.listXa = res.data;
			this.filteredListXa.next(this.listXa);
			this.changeDetectorRefs.detectChanges();
		});
	}

	filterXa() {
		if (!this.listXa) { return; }
		let search = this.FilterCtrlXa;
		if (!search) {
			this.filteredListXa.next(this.listXa.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.filteredListXa.next(
			this.listXa.filter(xa => xa.Ward.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
}