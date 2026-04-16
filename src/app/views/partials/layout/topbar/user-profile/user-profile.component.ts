import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../../../core/auth';
import { AuthService } from '../../../../../core/auth/_services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import { VaiTroComponent } from '../vai-tro/vai-tro.component';
import { MatDialog } from '@angular/material';
import { GlobalVariable } from '../../../../pages/global';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';

var swRegistration: any = null;
@Component({
	selector: 'kt-user-profile',
	templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
	// Public properties
	user$: Observable<User> | undefined;
	isReset: any;

	@Input() avatar: boolean = true;
	@Input() greeting: boolean = true;
	@Input() badge: boolean = false;
	@Input() icon: boolean = false;

	constructor(public dialog: MatDialog,
		private auth: AuthService,
		private router: Router,
		public commonService: CommonService,
		private tokenStorage: TokenStorage) {
	}

	ngOnInit(): void {
		let data = JSON.parse(localStorage.getItem("UserInfo") + "");
		this.user$ = new Observable((observer) => {
			// observable execution
			observer.next(data)
			observer.complete()
		})
		this.auth.getDictionary().subscribe(res => {
			if (res && res.status == 1) {
				res.data.emotions.map((x : any) => {
					GlobalVariable.emotions[x.key] = x.value;
				})
				res.data.accounts.map((x : any) => {
					GlobalVariable.accounts[x.key] = x.value;
				})
				GlobalVariable.icons = res.data.icons;
			}
		})
		this.permissionNof();
		this.isReset = setInterval(() => {
			this.resetSession();
		}, 240000);
	}

	async logout() {
		// this.store.dispatch(new Logout());
		try {
			if (swRegistration !== undefined) {
				var auth = this.auth;
				await swRegistration.pushManager.getSubscription()
					.then(function (subscription: any) {
						if (subscription) {
							auth.DeleteFCM(subscription).subscribe(res => { });
							return subscription.unsubscribe();
						}
					})
					.catch(function (error: any) {
					});
			}
			clearInterval(this.isReset);
			this.auth.logout(true);
		}
		catch (ex) {
			clearInterval(this.isReset);
			this.auth.logout(true);
			//this.router.navigate(['/login']);
		}
	}

	resetSession() {		
		this.auth.resetSession().subscribe(
			res => {
				if (res && res.status == 1) {
					res.data.Token = res.data.ResetToken;
					this.tokenStorage.updateStorage(res.data);
				} else {
					clearInterval(this.isReset);
					this.tokenStorage.clear();
					// this.dialog.closeAll();
					this.router.navigate(['/login']);
				}
			},
			err => {
				clearInterval(this.isReset);
				this.tokenStorage.clear();
				// this.dialog.closeAll();
				this.router.navigate(['/login']);
			});
	}

	init_doivaitro() {
		this.auth.getVaiTro().subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(VaiTroComponent, { data: { VaiTros: res.data } });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
						return;
					}
				});
			}
		});
	}

	permissionNof() {
		if (Notification && Notification.permission !== "granted") {
			Notification.requestPermission(function (status) {
				if (Notification.permission !== status) {
					//Notification.permission = status;
				}
			});
		}
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			var auth = this.auth;
			navigator.serviceWorker.register('sw.js')
				.then(function (swReg) {
					swRegistration = swReg;
					auth.CreateFCM().subscribe(res => {
						if (res && res.status == 1) {
							var token = localStorage.getItem('PublicKey')
							if (token != res.data) {// token mới
								localStorage.setItem('PublicKey', res.data);
								if (swReg.active == null) return;
								swReg.active.postMessage(JSON.stringify({
									Token: localStorage.getItem(environment.authTokenKey),
									ApiUrl: environment.ApiRoot,
									applicationServerPublicKey: res.data
								}));
							}
						}
					});
				})
				.catch(function (error) {
					// console.error('Service Worker Error', error);
				});
		} else {
			console.warn('Service Worker and Push is not supported');
		}
	}

	/*
		Nếu tên quá dài, chỉ lấy 2 ký tự đầu
	*/
	getName(name: string) {
		if(name.length >= 15) {
			let t = name.split(" ", 2);
			let short_Name = t[0] + ' ' + t[1];
			return short_Name
		} else {
			return name;
		}
	}
}