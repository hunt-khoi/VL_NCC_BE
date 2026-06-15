import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { SysConfigModel } from '../Model/config.model';
import { ConfigService } from '../Services/config.service';

@Component({
	selector: 'kt-config-edit',
	templateUrl: './config-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ConfigEditComponent implements OnInit, OnDestroy {
	// Public properties
	Config: SysConfigModel = new SysConfigModel();
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	disabledBtn: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isChange: boolean = false;
	isZoomSize: boolean = false;
	private componentSubscriptions: Subscription | undefined;
	allowEdit: boolean = true;

	//chip
	@ViewChild("chipList", { static: true }) chipList: MatChipList | undefined;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	chips: string[] = [];

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(
		public dialogRef: MatDialogRef<ConfigEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: ConfigService,
		private commonService: CommonService) { }

	async ngOnInit() {
		this.commonService.fixedPoint = 0;
		this.viewLoading = true;
		this.Config = this.data.Config;
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.data.Config && this.data.Config.IdRow > 0) {
			this.apiService.getConfigById(this.data.Config.IdRow).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.Config = res.data;
					this.createForm();
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
		let value: any = this.Config.Value == null ? '' : this.Config.Value;
		if (this.Config.Type == 'BOOLEAN')
			value = this.Config.Value == '1' ? true : false;
		let temp = {
			code: [this.Config.Code == null ? '' : this.Config.Code, [Validators.required, Validators.maxLength(20)]],
			value: [value, [Validators.required, Validators.maxLength(200)]],
			priority: [this.Config.Priority, Validators.min(1)],
			description: [this.Config.Description, Validators.min(1)],
		}
		if (this.Config.Pattern && this.Config.Type != 'LIST') {
			temp.value = [value, [Validators.required, Validators.maxLength(200), Validators.pattern(this.Config.Pattern)]];
		}
		this.itemForm = this.itemFB.group(temp);
		if (this.Config.Type == 'LIST') {
			this.chips = this.Config.Value.split(",");
			this.itemForm.get('value')?.statusChanges.subscribe(
				status => {
					if (this.chipList)
						this.chipList.errorState = status === 'INVALID';
				}
			);
		}
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (!this.allowEdit)
			return 'Xem chi tiết cấu hình';
		return `Chỉnh sửa cấu hình - ${this.Config.Code} `;
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
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
		// eslint-disable-next-line prefer-const
		let editedConfig = this.prepareConfigs();
		this.updateConfig(editedConfig)
	}

	prepareConfigs(): SysConfigModel {
		const controls = this.itemForm.controls;
		const _Config = Object.assign({}, this.Config);
		if (this.Config.Type == 'LIST')
			_Config.Value = this.chips.join(",");
		else {
			if (this.Config.Type == "BOOLEAN")
				_Config.Value = controls['value'].value ? '1' : '0';
			else
				_Config.Value = controls['value'].value + '';
		}
		_Config.Priority = controls['priority'].value;
		return _Config;
	}

	updateConfig(item: SysConfigModel) {
		this.apiService.updateConfig(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = `Cập nhật cấu hình thành công`;
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

	//#region chip
	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;
		// Add our fruit
		if ((value || '').trim()) {
			if (this.Config.Pattern) {
				var regex = new RegExp(this.Config.Pattern);
				var rex = regex.test(value.trim());
				if (rex)
					this.chips.push(value.trim());
				else {
					this.layoutUtilsService.showError("Giá trị không hợp lệ");
					return;
				}
			} else
				this.chips.push(value.trim());
		}
		// Reset the input value
		if (input) {
			input.value = '';
		}
		this.itemForm.controls['value'].setValue(this.chips.join(","));
	}

	remove(chip: string): void {
		const index = this.chips.indexOf(chip);
		if (index >= 0) {
			this.chips.splice(index, 1);
		}
		this.itemForm.controls['value'].setValue(this.chips.join(","));
	}
	//#endregion
}
