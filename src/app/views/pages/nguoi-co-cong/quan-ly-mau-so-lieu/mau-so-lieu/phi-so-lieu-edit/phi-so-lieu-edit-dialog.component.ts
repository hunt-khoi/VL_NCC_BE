import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { FormDetail } from '../Model/detail-list.model';
import { MauSoLieuService } from './../Services/mau-so-lieu.service';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-phi-so-lieu-edit-dialog',
	templateUrl: './phi-so-lieu-edit-dialog.component.html',
})

export class PhiSoLieuEditDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	object: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	listPhiSoLieu: any[] = [];
	listCachNhap: any[] = [];
	uutien: '';
	mota: '';
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_name = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<PhiSoLieuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private objectService: MauSoLieuService,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant('MAU_SO_LIEU.phisolieu');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.loadListPhiSoLieu();
		this.loadListCachNhap();
		this.createForm();
	}

	createForm() {
		const temp: any = {
			PhiSoLieu: ['', Validators.required],
			CachNhap: ['1', Validators.required],
		};
		this.itemForm = this.fb.group(temp);
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.chonnhapsl');
	}
	
	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		const _item = new FormDetail();
		if (this.item.Id_Detail == undefined) {
			_item.Id_Detail = 0
		} else {
			_item.Id_Detail = this.item.Id_Detail;
		}
		_item.IdPhiSoLieu = controls.PhiSoLieu.value;
		_item.CachNhap = controls.CachNhap.value;
		for (const pls of this.listPhiSoLieu) {
			if (pls.id == controls.PhiSoLieu.value) {
				_item.PhiSoLieu = pls.title;
			}
		}
		return _item;
	}

	onSubmit(withBack: boolean) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const object = this.prepareData();
		let dup = this.item.Detail.find(x => x.IdPhiSoLieu == object.IdPhiSoLieu && x.CachNhap == object.CachNhap);
		if (dup != null) {
			this.layoutUtilsService.showError("Phí số liệu với cách nhập này đã tồn tại");
			return;
		}
		if (this.item.Id_Detail > 0) {
			this.CreateDetailChild(this.item.Id_Detail,object,withBack);
		} else {
			this.loadingAfterSubmit = true;
			this.viewLoading = true;
			this.disabledBtn = true;
			this.item.Detail.push(object);
			this.dialogRef.close();
		}
	}

	CreateDetailChild(id,object,withBack){
		this.objectService.CreateDetailChild(id, object).subscribe(res => {
			this.disabledBtn = false;
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						object
					});
					this.item.Detail.push(object);
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				}
			} else {
				if (res.error.allowForce)
				{
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						let object1:any=Object.assign({},object)
						object1.Force=true;
						this.CreateDetailChild(id,object1,withBack);
					});

				}else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	loadListPhiSoLieu() {
		this.commonService.litePhiSoLieu().subscribe(res => {
			this.listPhiSoLieu = res.data;
			this.listPhiSoLieu$.next(res.data);
		});
	}

	FilterCtrl_sl: string = '';
	listPhiSoLieu$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	
	filter() {
		if (!this.listPhiSoLieu) {
			return;
		}
		let search = this.FilterCtrl_sl;
		if (!search) {
			this.listPhiSoLieu$.next(this.listPhiSoLieu.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listPhiSoLieu$.next(
			this.listPhiSoLieu.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	loadListCachNhap() {
		this.commonService.liteCachNhap().subscribe(res => {
			this.listCachNhap = res.data;
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
