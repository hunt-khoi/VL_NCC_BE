import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import moment from 'moment';
import { CommonService } from '../nguoi-co-cong/services/common.service';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/core/auth';
import { VaiTroComponent } from 'app/views/partials/layout';

@Component({
	selector: 'kt-profile',
	templateUrl: './profile.component.html',
	encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
	thoihan: string = '';
	num: number = 0;
	user$: Observable<any> | undefined;
	exp_show: number = 0;

	constructor(private commonService: CommonService,
		public dialog: MatDialog,
		private auth: AuthService,
		private detechChange: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		this.commonService.getConfig(["EXP_SHOW"]).subscribe(res => {
			if (res && res.status == 1)
				this.exp_show = +res.data.EXP_SHOW;
			this.detechChange.detectChanges();
		})
		let data = JSON.parse(localStorage.getItem("UserInfo") + "");
		if (data.exp != null) {
			let date2 = moment(data.exp);
			this.thoihan = date2.format("DD/MM/YYYY");
			let date1 = moment();
			this.num = date2.diff(date1, 'days');
		}
		this.user$ = new Observable((observer) => {
			// observable execution
			observer.next(data)
			observer.complete()
		})
	}
	
	back() {
		history.back();
	}

	init_doivaitro() {
		this.auth.getVaiTro().subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(VaiTroComponent, { data: { VaiTros: res.data } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) return;
				});
			}
		});
	}
}