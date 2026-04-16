import { BaseModel } from '../../../../../../core/_base/crud/models/_base.model';

export class BaoCaoVanDongModel extends BaseModel {
	tong_KHCT: number;
	TongVanDong: number;
	TongDV: number;
	TongTuVanDongDuoc: number;
	TongDVC: number;
	TongGiaoVanDongDuoc: number;

	clear() {
		this.tong_KHCT = 0;
		this.TongVanDong = 0;
		this.TongDV = 0;
		this.TongTuVanDongDuoc = 0;
		this.TongDVC = 0;
		this.TongGiaoVanDongDuoc = 0;
	}
}
