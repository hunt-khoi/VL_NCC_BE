import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommonService } from '../../services/common.service';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import * as moment from 'moment';

@Component({
	selector: 'm-thong-ke-tang-giam',
	templateUrl: './thong-ke-tang-giam.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeComponent implements OnInit {
	nam: number;
	Capcocau: number;
	idXa: number = 0;
	listXa: any[] = [];
	idHuyen: number = 0;
	listHuyen: any[] = [];
	data: any[] = [];
	nguons: any[] = [];

	constructor(public dottangquaService1: dottangquaService,
		public CommonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilService: LayoutUtilsService,
		private tokenStorage: TokenStorage) { }

	ngOnInit() {		
		var now = moment();
		this.nam = now.year();
		this.tokenStorage.getUserInfo().subscribe(res => {
				this.Capcocau = res.Capcocau;
			if (res.Capcocau == 2) {
				this.idHuyen = +res.ID_Goc_Cha;
			}
			if (res.Capcocau == 3) {//xã
				this.idHuyen = +res.ID_Goc_Cha;
				this.idXa = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
		});
		this.CommonService.GetListDistrictByProvinces(61).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	loadData() {
		if (this.nam <= 0 || this.idHuyen <= 0) {
			this.layoutUtilService.showError("Vui lòng chọn năm và huyện thống kê");
			return;
		}
		this.dottangquaService1.thongKeTangGiam(this.nam, this.idHuyen, this.idXa).subscribe(res => {
			if (res && res.status == 1) {
				this.data = res.data.data;
				for (var i = 0; i < this.data.length; i++) {
					this.data[i].SL = 0;
					for (var j = 0; j < this.data[i].Xas.length; j++) {
						this.data[i].Xas[j].SL = this.data[i].Xas[j].NCCs.length;
						this.data[i].SL += this.data[i].Xas[j].SL;
					}
				}
				this.nguons = res.data.nguons
				this.changeDetectorRefs.detectChanges();
			} else
				this.layoutUtilService.showError(res.error.message);
		});
	}
	getValue(ncc, Id_NguonKinhPhi) {
		let find = ncc.SoTiens.find(x => +x.Id_NguonKinhPhi == +Id_NguonKinhPhi);
		if (find != null)
			return find.SoTien;
		return 0;
	}
	exportExcel(loai) {
		if (this.idHuyen == 0) {
			this.layoutUtilService.showError("Vui lòng chọn huyện thống kê");
			return;
		}
		this.dottangquaService1.exportTKTangGiam(this.nam, this.idHuyen, this.idXa, true, loai).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilService.showError("Xuất thống kê báo cáo thất bại");
		});
	}

	getWidth(){
		return window.innerWidth;
	}
}
