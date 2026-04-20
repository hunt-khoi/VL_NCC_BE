import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Type } from '@angular/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';
import { FormDinhChinhComponent } from './form-dinh-chinh/form-dinh-chinh.component';
import { FormCatTCComponent } from './form-cat-tc/form-cat-tc.component';
import { FormMTPComponent } from './form-mtp/form-mtp.component';
import { FormCatTuatComponent } from './form-cat-tuat/form-cat-tuat.component';
import { FormTangMoiComponent } from './form-tang-moi/form-tang-moi.component';
import { FormTangTuatLSComponent } from './form-tang-tuat-ls/form-tang-tuat-ls.component';
import { FormTangTuatComponent } from './form-tang-tuat/form-tang-tuat.component';
import { FormTCThangComponent } from './form-tc-thang/form-tc-thang.component';
import { FormTDCComponent } from './form-tdc/form-tdc.component';
import { FormThoCungComponent } from './form-tho-cung/form-tho-cung.component';
import { FormGiayBTComponent } from './form-giay-bt/form-giay-bt.component';
import { FormGiayGTComponent } from './form-giay-gt/form-giay-gt.component';
import { FormTangMoiBMComponent } from './form-tang-moi-bm/form-tang-moi-bm.component';
import { FormDinhChiComponent } from './form-dinh-chi/form-dinh-chi.component';
import { FormCatTC_2LietSyComponent } from './form-cat-tc-2ls/form-cat-tc-2ls.component';
import { FormDinhChinhLSComponent } from './form-dinh-chinh-ls/form-dinh-chinh-ls.component';
import { FormDinhChiLSComponent } from './form-dinh-chi-ls/form-dinh-chi-ls.component';
import { FormTCThang_TuDayComponent } from './form-tc-thang-tuday/form-tc-thang-tuday.component';
import { FormDC_LSComponent } from './form-dc-ls/form-dc-ls.component';
import { FormTDC_LSComponent } from './form-tdc-ls/form-tdc-ls.component';
import { FormDiChuyenComponent } from './form-di-chuyen/form-di-chuyen.component';
import { FormTroCap1LanComponent } from './form-tro-cap-1lan/form-tro-cap-1lan.component';
import { FormCatTC_MTP_TuatComponent } from './form-cat-tc-mtp-tuat/form-cat-tc-mtp-tuat.component';
import { FormCatTC_MTPComponent } from './form-cat-tro-cap-mtp/form-cat-tro-cap-mtp.component';
import { FormCatTuatTTComponent } from './form-cat-tuat-tutran/form-cat-tuat-tutran.component';

@Component({
	selector: 'kt-ho-so-ncc-edit-page',
	templateUrl: './ho-so-ncc-edit-page.component.html',
	styleUrls: ['./ho-so-ncc-edit-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCEditPageComponent implements OnInit {
	loading$ = new BehaviorSubject<boolean>(false);
	lstLoai: any[] = [];
	lstLoaiTemp: any[] = [];
	disabledBtn: boolean = false;
	_NAME: string = 'Hồ sơ NCC';

	ChildComponentInstance: any;
	childComponentType: Type<any> | undefined;
	childComponentData: any = {};
	_item: any = {};
	tenloai: any;
	filteredLoai: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	
	constructor(
		private objectService: HoSoNCCService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		public commonService: CommonService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		this.loading$.next(true);
		this.loadListLoaiHS_Dt();
	}

	filterBanks() { 
		this.loadListLoaiHS_Dt(this.tenloai)
	}

	loadListLoaiHS_Dt(tendt: string = '') {
		this.commonService.liteDoiTuongNCC_LoaiHS(false, tendt).subscribe(res => {
			this.lstLoai = res.data;
			this.loading$.next(false);
			this.changeDetectorRefs.detectChanges();
		});
	}

	back() {
		history.back();
	}

	handleInput(event: KeyboardEvent): void{
		event.stopPropagation();
	} 

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 300;
		return tmp_height + 'px';
	}

	changeTab($event: any, id_doituong: number) {
		this.childComponentType = undefined;
		this.changeDetectorRefs.detectChanges();
		//load form
		this._item = new HoSoNCCModel();
		this._item.clear();
		this._item.Id_DoiTuongNCC = id_doituong;
		this._item.Id_LoaiHoSo = $event;
		if (this._item.Id_DoiTuongNCC == 1)
			this._item.GioiTinh = 2;

		this.childComponentData = {
			_item: Object.assign({}, this._item)
		};
			
		//#region Chọn component child
		switch (this._item.Id_LoaiHoSo) {
			case 1: 
				{ //cắt trợ cấp 
					if (this._item.Id_DoiTuongNCC == 1)  //bà mẹ vnah
						this.childComponentType = FormCatTCComponent;

 					break;
				}
			case 2: 
				{ //cắt trợ cấp + mtp 
					this.childComponentType = FormCatTC_MTPComponent
					break;
				}
			case 3:
				{ //cắt trợ cấp + mai táng phí + tuất x
					this.childComponentType = FormCatTC_MTP_TuatComponent
					break;
				}
			case 4: 
				{ //cắt tuất tái giá x
					if (this._item.Id_DoiTuongNCC == 5) //liệt sĩ
						this.childComponentType = FormCatTuatComponent;

					break;
				}
			case 8:
				{ //di chuyển 
					this.childComponentType = FormDiChuyenComponent;
					break;
				}
			case 10:
				{ //đính chính 
					this.childComponentType = FormDinhChinhComponent 
					break;
				}
			case 11:
				{ //giấy báo tử 
					if (this._item.Id_DoiTuongNCC == 5) 
						this.childComponentType = FormGiayBTComponent

					break
				}
			case 12: 
				{ //giấy giới thiệu x
					this.childComponentType = FormGiayGTComponent
					break
				}
			case 13:
				{ //mai táng phí các đối tượng hưởng trợ cấp 1 lần và cựu chiến binh x
					this.childComponentType = FormMTPComponent
					break;
				}
			case 14:
				{ //tạm đình chỉ 
					this.childComponentType = FormTDCComponent; 
					break;
				}
			case 15:
				{ //tăng mới 
					this.childComponentType = FormTangMoiComponent
					break;
				}
			case 17:
				{ //tăng tuất 
					this.childComponentType = FormTangTuatComponent
					break;
				}
			case 18:
				{ //tăng tuất ls 
					if (this._item.Id_DoiTuongNCC == 5) 
						this.childComponentType = FormTangTuatLSComponent
					
					break;
				}
			case 19: 
				{ //thờ cúng
					if (this._item.Id_DoiTuongNCC == 5) 
						this.childComponentType = FormThoCungComponent
					
					break
				}
			case 20:
				{ //tc 1l 
					if (this._item.Id_DoiTuongNCC == 13 //qđ 53 
						|| this._item.Id_DoiTuongNCC == 9 //kc bảo vệ
						|| this._item.Id_DoiTuongNCC == 4 // trước 1/1/45
						|| this._item.Id_DoiTuongNCC == 18 //tiền khởi nghĩa
						|| this._item.Id_DoiTuongNCC == 1 //bmvnah 
						|| this._item.Id_DoiTuongNCC == 22) { 
						this.childComponentType = FormTroCap1LanComponent 
					}

					break;
				}
			case 21:
				{ //tc hàng tháng 
					if (this._item.Id_DoiTuongNCC == 23) 
						this.childComponentType = FormTCThangComponent 

					break;
				}
			case 22:
				{ //đính chính thông tin hồ sơ liệt sỹ
					this.childComponentType = FormDinhChinhLSComponent;
					break;
				}
			case 23:
				{ //cắt trợ cấp trên 2 liệt sỹ
					if (this._item.Id_DoiTuongNCC == 1) //bà mẹ
						this.childComponentType = FormCatTC_2LietSyComponent

					break;
				}
			case 24:
				{ //tăng mới BM VNAH
					if (this._item.Id_DoiTuongNCC == 1)
						this.childComponentType = FormTangMoiBMComponent

					break;
				}
			case 25:
				{ //đình chỉ
					//id đối tượng: 18, 4, 1, 21, 17, 25, 28, 2, 26, 29, 3, 27, 30, 9, 22, 23, 19
					this.childComponentType = FormDinhChiComponent;
					break;
				}
			// case 27:
			// 	{ //tổng hợp
			// 		this.childComponentType = FormTongHopComponent
			// 		break;
			// 	}
			case 28:
				{ //đình chỉ thờ cúng liệt sỹ
					if (this._item.Id_DoiTuongNCC == 5) 
						this.childComponentType = FormDinhChiLSComponent

					break;
				}
			case 29:
				{ //tạm đình chỉ thờ cúng liệt sỹ
					if (this._item.Id_DoiTuongNCC == 5) 
						this.childComponentType = FormTDC_LSComponent

					break;
				}
			case 30:
				{ //tc 1l thân nhân
					this.childComponentType = FormTroCap1LanComponent 
					break;
				}
			case 31:
				{ //di chuyển ls
					if (this._item.Id_DoiTuongNCC == 5)
						this.childComponentType = FormDC_LSComponent

					break;
				}
			case 32:
				{ //cắt tuất từ trần
					//id đối tượng: 2,3,4,18,17
					this.childComponentType = FormCatTuatTTComponent;
					break;
				}
			case 33:
			case 35:
			case 34:
			case 36:
			case 37:
			case 38:
			case 40:
			case 41:
				{
					this.childComponentType = FormTroCap1LanComponent
					break;
				}
			case 39:
				{
					if (this._item.Id_DoiTuongNCC == 19) //tù đày 
						this.childComponentType = FormTCThang_TuDayComponent
					
					break;
				}
			case 42:
				{ //tăng mới chất độc hóa học
					if (this._item.Id_DoiTuongNCC == 3)  //cdhh
						this.childComponentType = FormTangMoiComponent

					break;
				}
			
		}
		//#endregion
		this.changeDetectorRefs.detectChanges();
	}

	getInstance($event: any) {
		this.ChildComponentInstance = $event;
	}

	onSubmit(withBack: boolean = false) {
		let EditHoSoNCC = this.ChildComponentInstance.onSubmit();
		if (EditHoSoNCC == null) {
			this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin");
			this.ChildComponentInstance.changeDetectorRefs.detectChanges()
			return;
		}
		this.CreateHoSoNCC(EditHoSoNCC, withBack);
	}

	CreateHoSoNCC(item: HoSoNCCModel, withBack: boolean) {
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
				this.layoutUtilsService.showInfo(_messageType);
				if (withBack) 
					this.back();
				else 
					this.ChildComponentInstance.ngOnInit();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	drop(event: CdkDragDrop<string[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, 
				event.previousIndex, 
				event.currentIndex);
		} else {
			transferArrayItem(event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex);
		}
	}

	isExpand: boolean = false;
	clearAllBut(id: number) {
		this.isExpand = true;
		let lst1: any[] = [];
		let idx = this.lstLoai.findIndex(x => x.id == id);
		if (idx >= 0) {
			lst1.push(this.lstLoai[idx]);
			this.lstLoai = lst1;
			this.changeDetectorRefs.detectChanges();
		}
	}

	reloadListLoai() {
		this.isExpand = false;
		this.lstLoai.pop(); //remove 1 pt còn lại trong mảng
		this.lstLoaiTemp.forEach(y => this.lstLoai.push(y));
		this.changeDetectorRefs.detectChanges();
	}
}