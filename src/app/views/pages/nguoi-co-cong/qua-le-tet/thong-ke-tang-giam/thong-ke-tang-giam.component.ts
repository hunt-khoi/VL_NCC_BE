import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommonService } from '../../services/common.service';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import moment from 'moment';

@Component({
	selector: 'm-thong-ke-tang-giam',
	templateUrl: './thong-ke-tang-giam.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeComponent implements OnInit {
	nam: number = 0;
	Capcocau: number = 0;
	idXa: number = 0;
	listXa: any[] = [];
	listXaOpt: any[] = [];
	listXaFiltered: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	FilterCtrlXa: string = '';
	data: any[] = [];
	nguons: any[] = [];

	constructor(public apiService: dottangquaService,
		public CommonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilService: LayoutUtilsService,
		private tokenStorage: TokenStorage) { }

	ngOnInit() {		
		var now = moment();
		this.nam = now.year();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 3) { //xã
				this.idXa = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
				this.listXaOpt = this.listXa;
				this.listXaFiltered.next(this.listXa.slice());
			}
		});
	}

	filterXa() {
		if (!this.listXaOpt) return;
		let search = this.FilterCtrlXa;
		if (!search) {
			this.listXaFiltered.next(this.listXaOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listXaFiltered.next(
			this.listXaOpt.filter(w => w.Ward.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	loadData() {
		if (this.nam <= 0) {
			this.layoutUtilService.showError("Vui lòng chọn năm thống kê");
			return;
		}
		this.apiService.thongKeTangGiam(this.nam, this.idXa).subscribe(res => {
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

	getValue(ncc: any, Id_NguonKinhPhi: number) {
		let find = ncc.SoTiens.find((x: any) => +x.Id_NguonKinhPhi == +Id_NguonKinhPhi);
		if (find != null)
			return find.SoTien;
		return 0;
	}

	exportExcel(loai: number) {
		this.apiService.exportTKTangGiam(this.nam, this.idXa, true, loai).subscribe(res => {
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