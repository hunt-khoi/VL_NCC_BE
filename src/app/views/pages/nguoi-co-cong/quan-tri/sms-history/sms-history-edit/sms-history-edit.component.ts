import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from '../../../../../../../app/core/_base/crud';
import { SMSHistoryService } from '../Services/sms-history.service';
import { CommonService } from '../../../services/common.service';
import { SMSHistoryModel } from '../Model/sms-history.model';

@Component({
	selector: 'kt-sms-history-edit',
	templateUrl: './sms-history-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SMSHistoryEditComponent implements OnInit, OnDestroy {
	// Public properties
	ItemData: any;
	FormControls: FormGroup | undefined;
	hasFormErrors: boolean = false;
	disabledBtn: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	isChange: boolean = false;
	public datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	private componentSubscriptions: Subscription | undefined;
	datasource: any;

	constructor(
		public dialogRef: MatDialogRef<SMSHistoryEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private FormControlFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: SMSHistoryService,
		private commonService: CommonService) { }

	ngOnInit() {
		this.commonService.fixedPoint = 0;
		this.viewLoading = true;
		this.ItemData = new SMSHistoryModel();
		this.ItemData.clear();
		if (this.data.SMSHistory && this.data.SMSHistory.IdSMS > 0) {
			this.apiService.getById(this.data.SMSHistory.IdSMS).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.ItemData = res.data;
					this.datasource = new MatTableDataSource(this.ItemData);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.FormControls = this.FormControlFB.group({
		});
		if (this.data.SMSHistory.View)
			this.FormControls.disable();
	}

	getTitle(): string {
		return `Xem chi tiết lịch sử SMS`;
	}

	isControlInvalid(controlName: string): boolean {
		if (!this.FormControls) return false;
		const control = this.FormControls.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onSubmit(type: boolean) {
		this.hasFormErrors = false;
		if (!this.FormControls) return;
		const controls = this.FormControls.controls;
		/** check form */
		if (this.FormControls.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			let invalid = <FormControl[]>Object.keys(controls).map(key => controls[key]).filter(ctl => ctl.invalid);
			let invalidElem: any = invalid[0];
			invalidElem.nativeElement.focus();
			this.hasFormErrors = true;
			return;
		}
		this.disabledBtn = true;
		let edited = this.prepare();
		if (this.ItemData.Id > 0) {
			this.update(edited)
			return;
		}
		this.add(edited, type);
	}

	prepare(): any {
		if (!this.FormControls) return;
		const controls = this.FormControls.controls;
		const _item: any = {};
		_item.Cast_BDNghi = controls['bDNghi'].value.split('T')[0];
		_item.Cast_KTNghi = controls['kTNghi'].value.split('T')[0];
		_item.DotNghiRQ = controls['dotNghi'].value;
		_item.MoTa = controls['moTa'].value;
		//gán lại giá trị id 
		if (this.ItemData.Id > 0) {
			_item.Id = this.ItemData.Id;
		}
		return _item;
	}

	add(item: SMSHistoryModel, withBack: boolean = false) {
		this.apiService.create(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Thêm thành công`;
				this.layoutUtilsService.showInfo(message);
				if (this.FormControls) 
					this.FormControls.reset();
				if (withBack)
					this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	update(item: SMSHistoryModel) {
		this.apiService.update(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Cập nhật thành công`;
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	async getTreeDonVi() {
		var res = await this.commonService.TreeDonVi().toPromise();
		return res;
	}

	/* UI */
	getItemStatusString(status: number = 0): string {
		switch (status) {
			case 0:
				return 'Thất bại';
			case 1:
				return 'Thành công';
		}
		return '';
	}

	getItemCssClassByStatus(status: number = 0): string {
		switch (status) {
			case 0:
				return 'metal';
			case 1:
				return 'success';
		}
		return '';
	}
}