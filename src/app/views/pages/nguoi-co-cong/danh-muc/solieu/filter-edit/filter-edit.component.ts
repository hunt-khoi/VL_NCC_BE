import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FilterModel, FilterDetailModel } from '../Model/filter.model';
import { filterService } from '../Services/filter.service';
import { DatePipe } from '@angular/common';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-filter-edit',
	templateUrl: './filter-edit.component.html',
})

export class filterEditComponent implements OnInit {

	oldItem: FilterModel;
	item: FilterModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	isZoomSize: boolean = false;
	show_operators: boolean = false;
	show_option_1: boolean = false;
	show_option_2: boolean = false;
	show_option_3: boolean = false;
	list_filter_key: any[] = [];
	list_filter_key_goc: any[] = [];
	list_options: any[] = [];
	list_operators: any[] = [];
	inputdata: string = '';
	listColumn: any[] = [];
	listCaLamViec: any[] = [];
	filter_key: string = '';
	filter_operators: string = '';
	filter_options: string = '';
	listChiTiet: any[] = [];
	datadetail: any[] = [];
	list_data_old: any[] = [];
	list_pheptoan: any[] = [];
	list_pheptoan_goc: any[] = [];
	list_bang: any[] = [
		{ id: 'tbl_ncc', title: 'Người có công' },
		{ id: 'tbl_doituongnhanqua', title: 'Quà lễ tết' },
	];
	_name: string = "";
	allowEdit: boolean = true;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<filterEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private _service: filterService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private danhMucChungService: CommonService,
		private datepipe: DatePipe,
		private router: Router,) {
		this._name = 'trích xuất';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = new FilterModel();
		this.item.clear();
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this._service.Get_list_filterkey().subscribe(res => {
			if (res && res.status === 1) {
				this.list_filter_key_goc = res.data;
				this.list_filter_key = this.list_filter_key_goc.filter(x => x.table_name == this.item.bang);
				this.changeDetectorRefs.detectChanges();
			};
		});
		this.danhMucChungService.liteFilterOperator().subscribe(res => {
			if (res && res.status === 1) {
				this.list_pheptoan_goc = res.data;
				this.list_pheptoan = this.list_pheptoan_goc.filter(x => x.data.table_name == this.item.bang);
				this.changeDetectorRefs.detectChanges();
			};
		});
		if (this.item.id_row > 0) {
			this._service.Detail(this.item.id_row).subscribe(res => {
				if (res && res.status === 1) {
					this.item = res.data;
					this.createForm();
					this.datadetail = res.data.details;
					this.listColumn = [];
					if (this.datadetail.length > 0) {
						setTimeout(() => {
							this.datadetail.map((item, index) => {
								let title = this.list_filter_key.find(x => x.id_row == item.id_key);
								title.Selected = true;
								if (title == null || title == undefined) {
									return '';
								}
								else {
									// this.listColumn[index].StrTitle = title.title + ' ' + item.operator + ' ' + item.value;
									this.listColumn.push({
										StrTitle: title.title + ' <b>' + item.operator + '</b> ' + item.value,
										title: title.title,
										operator: item.operator,
										value: item.value,
										id_key: item.id_key,
										id_row: item.id_row
									});
									this.list_data_old.push({
										title: title.title,
										operator: item.operator,
										value: item.value,
										id_key: item.id_key,
										id_row: item.id_row
									});
									this.changeDetectorRefs.detectChanges();
								}
							});
						}, 1000);
					}
				};
			});
			this.viewLoading = true;
		}
		else {
			// this.themcot();
			this.viewLoading = false;
		}
		this.createForm();
	}
	
	createForm() {
		this.itemForm = this.fb.group({
			title: ['' + this.item.title, Validators.required],
			loai: ['', Validators.required],
			operators: ['', Validators.required],
			options: ['', Validators.required],
			title_input: ['', Validators.required],
			time: [],
			pheptoan: [this.item.pheptoan, Validators.required],
			bang: [this.item.bang, Validators.required],
		});
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changebang(this.item.bang);
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		let result = "Thêm mới bộ trích xuất";
		if (!this.item || !this.item.id_row) {
			return result;
		}
		if (!this.allowEdit) {
			result = 'Chi tiết bộ trích xuất';
			return result;
		}
		result = 'Cập nhật bộ trích xuất';
		return result;
	}

	/** ACTIONS */
	prepare(): FilterModel {
		const controls = this.itemForm.controls;
		const item = new FilterModel();
		item.id_row = this.data._item.id_row;
		item.title = controls['title'].value;
		if (this.listColumn.length > 0) {
			this.listColumn.map((item, index) => {
				let _true = this.list_data_old.find(x => x.id_row === item.id_row);
				if (_true) {
					const ct = new FilterDetailModel();
					ct.id_row = item.id_row;
					ct.id_key = item.id_key;
					ct.operator = item.operator;
					ct.value = item.value;
					this.listChiTiet.push(ct);
				}
				else {
					const ct = new FilterDetailModel();
					if (ct.id_row == undefined)
						ct.id_row = 0;
					ct.id_key = item.id_key;
					ct.operator = item.operator;
					ct.value = item.value;
					this.listChiTiet.push(ct);
				}
			});
		}
		item.details = this.listChiTiet;
		item.pheptoan = controls['pheptoan'].value;
		item.bang = controls['bang'].value;
		return item;
	}

	FilterChange(e: any) {
		let filter_key = this.list_filter_key.find(x => x.id_row == e);
		if (filter_key == null || filter_key == undefined) {
			return '';
		};
		this.show_operators = true;
		this.list_operators = filter_key.operators;
		this.list_options = filter_key.options;
		//filter_key.loai: 1: options, 2 text-string, 3: text_date
		if (filter_key.loai == 1) {
			this.show_option_2 = false;
			this.show_option_3 = false;
			this.show_option_1 = true;
		}
		else {
			if (filter_key.loai == 2) {
				this.show_option_1 = false;
				this.show_option_3 = false;
				this.show_option_2 = true;
			}
			else {
				this.show_option_1 = false;
				this.show_option_2 = false;
				this.show_option_3 = true;
			}
		}
		return filter_key.loai;
	}
	Filter_Options(e: any) {
		let filter_option = this.list_options.find(x => x.id == e);
		if (filter_option == null || filter_option == undefined) {
			return '';
		};
		return filter_option.id;
	}

	Filter_operators(e: any) {
		let filter_operators = this.list_operators.find(x => x.id == e);
		if (filter_operators == null || filter_operators == undefined) {
			return '';
		};
		return filter_operators.id;

	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		this.itemForm.controls['loai'].setValue(' ');
		this.itemForm.controls['operators'].setValue(' ');
		this.itemForm.controls['options'].setValue(' ');
		this.itemForm.controls['title_input'].setValue(' ');
		this.itemForm.controls['time'].setValue(null);
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const updatedegree = this.prepare();

		if (updatedegree.id_row > 0) {
			this.Update(updatedegree, withBack);
		} else {
			this.Create(updatedegree, withBack);
		}
	}
	filterConfiguration(): any {

		const filter: any = {};
		return filter;
	}
	Update(_item: FilterModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this._service.Update_filter(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					// this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: FilterModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this._service.Insert_filter(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.item.clear();
					this.listColumn = [];
					this.createForm();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}
	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
	changebang(bang) {
		this.list_pheptoan = this.list_pheptoan_goc.filter(x => x.data.table_name == bang);
		this.list_filter_key = this.list_filter_key_goc.filter(x => x.table_name == bang);
		this.show_operators = false;
		this.show_option_1 = false;
		this.show_option_2 = false;
		this.show_option_3 = false;
	}

	text(e: any, vi: any) {
		if (!((e.keyCode > 95 && e.keyCode < 106)
			|| (e.keyCode > 45 && e.keyCode < 58)
			|| e.keyCode == 8)) {
			e.preventDefault();
		}
	}
	themcot() {
		this.changeDetectorRefs.detectChanges();
	}
	addcot() {
		const controls = this.itemForm.controls;
		let key = this.list_filter_key.find(x => x.id_row == this.filter_key);
		if (key) {
			let _filter = new FilterDetailModel;
			_filter.id_key = key.id_row;
			_filter.title = key.title;
			let operators = this.list_operators.find(x => x.id == this.filter_operators);
			if (operators || operators != undefined) {
				_filter.operator = operators.id;
			}
			if (key.loai == 1) {
				if (!this.filter_options) {
					this.hasFormErrors = true;
					this.layoutUtilsService.showError("Vui lòng chọn giá trị");
					return;
				}
				let options = this.list_options.find(x => x.id == this.filter_options);
				if (options || operators != undefined) {
					_filter.value = options.id;
				}
			}
			else {
				if (key.loai == 2) {
					_filter.value = controls['title_input'].value;
					if (!_filter.value) {
						this.hasFormErrors = true;
						this.layoutUtilsService.showError("Vui lòng nhập giá trị");
						return;
					}
				}
				else {
					if (controls['time'].value == null) {
						this.hasFormErrors = true;
						this.layoutUtilsService.showError("Vui lòng chọn thời gian");
						return;
					}
					_filter.value = this.datepipe.transform(controls['time'].value, 'dd/MM/yyyy');
				}
			}
			_filter.StrTitle = key.title + ' ' + _filter.operator + ' ' + _filter.value;
			this.listColumn.push(_filter);
			key.Selected = true;
			this.itemForm.controls['loai'].setValue(' ');
			this.list_operators = [];
			this.itemForm.controls['operators'].setValue(' ');
			this.list_options = [];
			this.itemForm.controls['options'].setValue(' ');
			this.itemForm.controls['title_input'].setValue(' ');
			this.itemForm.controls['time'].setValue(null);
		}
		this.changeDetectorRefs.detectChanges();
	}
	updateChanges() {
		this.onChange(this.listColumn);
	}

	onChange: (_: any) => void = (_: any) => { };
	remove(index) {
		let key = this.list_filter_key.find(x => x.id_row == this.listColumn[index].id_key);
		if (key != undefined)
			key.Selected = false;
		this.listColumn.splice(index, 1);
		this.changeDetectorRefs.detectChanges();
	}
	checkShow(index: number) {
		try {
			let r = this.listCaLamViec.filter((item, vi) => {
				let t1 = this.listColumn.findIndex(x => +x.ID_Row === +item.ID_Row);
				return t1 !== -1 ? t1 == index : t1 == -1;
			});
			return r;
		} catch (error) {
			return [];
		}
	}
	DeleteFilter() {
		const _title = this.translate.instant('JeeHR.xoa');
		const _description = this.translate.instant('JeeHR.bancochacchanmuonxoakhong');
		const _waitDesciption = this.translate.instant('JeeHR.dulieudangduocxoa');
		const _deleteMessage = this.translate.instant('JeeHR.xoathanhcong');
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._service.Delete_filter(this.item.id_row).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
					let _backUrl = `tasks`;
					this.router.navigateByUrl(_backUrl);
					this.dialogRef.close();
					this.changeDetectorRefs.detectChanges();
				}
				else {
					this.ngOnInit();
					this.layoutUtilsService.showError(res.error.message);
				}

			});
		});
	}
}
