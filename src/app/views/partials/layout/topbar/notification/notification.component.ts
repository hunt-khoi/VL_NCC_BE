import { Component, Input, OnInit, OnChanges, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { CommonService } from '../../../../pages/nguoi-co-cong/services/common.service';
import { MatDialog } from '@angular/material';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SignalRService } from '../../../../pages/nguoi-co-cong/services/signalR.service';
import { MenuHorizontalService } from '../../../../../core/_base/layout';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['notification.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit, OnChanges {
	// Show dot on top of the icon
	@Input() dot: string;

	// Show pulse on icon
	@Input() pulse: boolean;
	@Input() pulseLight: boolean;

	// Set icon class name
	@Input() icon = 'flaticon2-bell-alarm-symbol';
	@Input() iconType: '' | 'success';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';
	@Input() type: 'brand' | 'success' = 'success';

	@Input() products$: Observable<any>;

	@ViewChild(NgbDropdown, { static: true }) ngbDropdown: NgbDropdown;
	isReset: any;
	ThongBao: any = {
		Total: { Total: 0 },
		Page: {}
	}
	LoaiThongBao = [{ }];
	// ThongBaoNoiBo: any[]=[];
	// ThongBao: any[]=[];
	selectedLoai: any;
	UserID: number;
	isStopScroll: boolean = false;

	@ViewChild('scrollViewTB', { static: false }) scrollViewTB: ElementRef;
	@HostListener('scroll', ['$event'])
	scrollViewHandler(event, item) {
		if (this.isStopScroll) return;
		this.selectedLoai = item;
		if (item = "ThongBao") {
			if (this.scrollViewTB) {
				let total = this.scrollViewTB.nativeElement.scrollHeight - this.scrollViewTB.nativeElement.offsetHeight;
				try {
					if (this.scrollViewTB.nativeElement.scrollTop + 5 >= total) {
						if (total > 0) {
							if (this.ThongBao.Page[item].Page < this.ThongBao.Page[item].AllPage) {
								this.ThongBao.Page[item].Page++;
								this.GetThongBaoPage(this.ThongBao.Page[item].Size, this.ThongBao.Page[item].Page);
							}
						}
					}
				} catch (err) { }
			}
		}
	}

	constructor(private commonService: CommonService,
		public dialog: MatDialog,
		private signalRService: SignalRService,
		private changeDetect: ChangeDetectorRef,
		public menuHorService: MenuHorizontalService,
		private tokenStorage: TokenStorage,
		private router: Router) { }

	backGroundStyle(): string {
		if (!this.bgImage) {
			return 'none';
		}

		return 'url(' + this.bgImage + ')';
	}

	ngOnDestroy() {
		this.signalRService.disconnectToken();
	}
	ngAfterViewInit() {
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserID = res.id;
		})
		this.getThongBao();

		this.signalRService.notifyReceived.subscribe(response => {
			if (response == null) return;
			for (let i = 0; i < response.length; i++) {
				let res = response[i];
				if (res.UserID != this.UserID) continue; //check local
				let index = this.ThongBao["ThongBao"].findIndex(x => x.IdRow == res.IdRow);
				if (index >= 0) {
					if (res.Disabled)
						this.ThongBao["ThongBao"].splice(index, 1);
					else {
						if (res.IsRead) {
							this.ThongBao["ThongBao"][index] = res;
						}
					}
					if (res.IsRead) {
						this.ThongBao.Total.Total--;
						this.ThongBao.Total["ThongBao"]--;
					}
				} else {
					if (res.IsNew) {
						this.ThongBao["ThongBao"].unshift(res);
						this.ThongBao.Total.Total++;
						this.ThongBao.Total["ThongBao"]++;
					}
				}
			}
			this.changeDetect.detectChanges();
		})
	}

	ngOnChanges() {
		//clearInterval(this.isReset);
	}

	getLastest(lastID) {
		this.commonService.GetThongBaoLastest(lastID).subscribe(res => {
			if (res && res.status == 1) {
				let total = 0;
				for (var property in res.data) {
					let _property = res.data[property];
					this.ThongBao.Total[property] = _property.Unread;
					total += _property.Unread;
					if (_property.List.length > 0) {
						_property.List.forEach(element => {
							this.ThongBao[property].unshift(element);
						});
					}
					this.ThongBao.Page[property].AllPage = _property.Page.AllPage;
				}
				this.ThongBao.Total.Total = total;
				this.changeDetect.detectChanges();
			}
		})
	}

	getThongBao() {
		this.commonService.GetThongBao().subscribe(res => {
			if (res && res.status == 1) {
				let total = 0;
				this.ThongBao = {
					Total: { Total: 0 },
					Page: {}
				};
				this.LoaiThongBao = [];
				for (var property in res.data) {
					this.LoaiThongBao.push({
						Name: res.data[property].Name,
						Key: property
					})

					total += res.data[property].Unread;
					this.ThongBao.Total[property] = res.data[property].Unread;
					this.ThongBao[property] = res.data[property].List;
					this.ThongBao.Page[property] = res.data[property].Page;
				}
				this.ThongBao.Total.Total = total;
			}
			this.changeDetect.detectChanges();
		});
	}
	
	GetThongBaoPage(pagesize, pageindex) {
		this.isStopScroll = true;
		this.commonService.GetThongBaoPage(pagesize, pageindex).subscribe(res => {
			if (res && res.status == 1) {
				this.ThongBao["ThongBao"] = this.ThongBao["ThongBao"].concat(res.data.List);
				this.isStopScroll = false;
				this.changeDetect.detectChanges();
			}
		});
	}

	view(Key, ThongBao) {
		this.commonService.ReadNotify(ThongBao.IdRow).subscribe(res => {
			//ThongBao.IsRead = true;
			//window.location.href = environment.BERoot + ThongBao.Link;
			this.router.navigateByUrl(ThongBao.Link);
			this.ngbDropdown.close();
		});
	}
}
