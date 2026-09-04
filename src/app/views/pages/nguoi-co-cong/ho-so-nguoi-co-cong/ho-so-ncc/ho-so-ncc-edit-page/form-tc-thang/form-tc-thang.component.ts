import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../../core/auth/_services/token-storage.service';
import { CommonService } from '../../../../services/common.service';
import { HoSoNCCService } from './../../Services/ho-so-ncc.service';
import { TroCapRowEditComponent } from '../../../../components';
import { FormBaseComponent } from '../form-base.component';

@Component({
	selector: 'kt-form-tc-thang',
	templateUrl: './form-tc-thang.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormTCThangComponent extends FormBaseComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	//#region nhúng mảng form trợ cấp
	childComponentType = TroCapRowEditComponent;
	@ViewChild("libInsertion", { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef | undefined;
	//#endregion

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;

	constructor(private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: HoSoNCCService,
		public layoutUtilsService: LayoutUtilsService,
		public changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		super(commonService, layoutUtilsService, changeDetectorRefs);
	}

	ngOnInit() {
		this.selectedTab = 0;
		this.item = this.data._item;
		this.Id_LoaiHoSo = this.item.Id_LoaiHoSo;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.loadProvinces();
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 2) { //cấp huyện
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
				}
			}
			if (res.Capcocau == 3) { //cấp xã
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
		})

		this.loadListDanToc();
		this.loadListTonGiao();
		this.loadCommonData();

		this.createForm();
		this.loadLoaiTC([23]);
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createForm() {
		const temp: any = Object.assign(this.buildBaseForm(this.item), {
			LyDoTamDC: [], //tạm đình chỉ
			LyDoDinhChi: [], //đình chỉ
			NoiDungHC: []
		});
		this.itemForm = this.fb.group(temp);

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		if (this.item.Id > 0) {
			this.itemForm.controls.NguoiThoCungLietSy.disable();
			this.itemForm.controls.QuanHeVoiLietSy.disable();
		}
		Object.keys(this.itemForm.controls).forEach(controlName => {
			if (this.itemForm)
				this.itemForm.controls[controlName].markAsUntouched();
		});
	}

	onSubmit(callapi: boolean = false) {
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		let EditHoSoNCC: any = this.prepareCustomer(this.itemForm, this.item.Id, this.data.id_ncc);
		if (!EditHoSoNCC) return;
		if (this.nhapTC) {
			EditHoSoNCC.TroCapModel = [];
			for (var i = 0; i < this.lstTC.length; i++) {
				if (this.lstTC[i].cmpRef && !this.lstTC[i].cmpRef.hostView.destroyed) {
					let EditTroCap = this.lstTC[i].onSubmit();
					if (!EditTroCap) {
						this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin trợ cấp");
						return;
					}
					EditHoSoNCC.TroCapModel.push(EditTroCap);
				}
			}
		}
		if (!callapi)
			return EditHoSoNCC;

		this.disabledBtn = true;
		this.objectService.Create(EditHoSoNCC).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
				this.layoutUtilsService.showInfo(_messageType);
				this.ngOnInit();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	addTC() {
		if (!this.insertionPoint) return;
		if (this.lstTC.length > 0) {
			this.lstTC = [];
			this.insertionPoint.clear()
		}
		for (var i = 0; i < this.listLoaiTroCap.length; i++) {
			var item = this.listLoaiTroCap[i]
			let componentRef = this.insertionPoint.createComponent(this.childComponentType);
			let instance = componentRef.instance;
			instance.cmpRef = componentRef;
			if (item.id == 23) { //hàng tháng
				instance.data = {
					_item: { Id_LoaiTC: item.id, Title: item.title },
					allowEdit: true,
					showDel: true,
					showCat: true,
					showTCTuNgay: true
				};
			}
			instance.close$.subscribe(() => {
				if (instance.cmpRef)
					instance.cmpRef.destroy();
			});
			this.lstTC.push(instance);
		}
	}
}