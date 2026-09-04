import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Type, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';
import { COMPONENT_MAPPING } from './ho-so-ncc.mapping';

@Component({
	selector: 'kt-ho-so-ncc-edit-page',
	templateUrl: './ho-so-ncc-edit-page.component.html',
	styleUrls: ['./ho-so-ncc-edit-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCEditPageComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	loading$ = new BehaviorSubject<boolean>(false);
	lstLoai$ = new BehaviorSubject<any[]>([]);
	lstLoaiTemp: any[] = [];
	_NAME: string = 'Hồ sơ NCC';
	disabledBtn: boolean = false;

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

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	filterBanks() {
		this.loadListLoaiHS_Dt(this.tenloai)
	}

	loadListLoaiHS_Dt(tendt: string = '') {
		this.commonService.liteDoiTuongNCC_LoaiHS(false, tendt).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.lstLoai$.next(res.data);
			this.lstLoaiTemp = [...res.data]; // FIX BUG: Lưu backup danh sách gốc
			this.loading$.next(false);
			this.changeDetectorRefs.detectChanges();
		});
	}

	back() {
		history.back();
	}

	handleInput(event: KeyboardEvent): void {
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

		this.childComponentData = { _item: Object.assign({}, this._item) };
		//#region Chọn component child
		// Tạo key ưu tiên theo Loại hồ sơ và Đối tượng (VD: '4_5' - Cắt tuất của liệt sĩ)
		const specificKey = `${this._item.Id_LoaiHoSo}_${this._item.Id_DoiTuongNCC}`;
		// Tạo key dự phòng cho các Loại hồ sơ dùng chung mọi đối tượng (VD: '10_all' - Đính chính)
		const fallbackKey = `${this._item.Id_LoaiHoSo}_all`;
		// Tìm Component: Ưu tiên dò key cụ thể trước -> Xong mới dò key dự phòng -> Nếu không có thì bỏ trống
		this.childComponentType = COMPONENT_MAPPING[specificKey] || COMPONENT_MAPPING[fallbackKey] || undefined;
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
		this.objectService.Create(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		const current = this.lstLoai$.getValue();
		moveItemInArray(current, event.previousIndex, event.currentIndex);
		this.lstLoai$.next([...current]);
	}

	isExpand: boolean = false;
	clearAllBut(id: number) {
		this.isExpand = true;
		const lst1 = this.lstLoaiTemp.filter(y => y.id == id);
		this.lstLoai$.next(lst1);
	}

	reloadListLoai() {
		this.isExpand = false;
		this.lstLoai$.next([...this.lstLoaiTemp]);
	}
}