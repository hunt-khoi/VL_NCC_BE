import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { AuthNoticeService, AuthService } from '../../../../core/auth';
import { LayoutConfigService } from '../../../../core/_base/layout';
import { CommonService } from '../../nguoi-co-cong/services/common.service';
import objectPath from 'object-path';
import { environment } from 'environments/environment';

const DEMO_PARAMS = {
	EMAIL: '',
	PASSWORD: ''
};

@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
	@ViewChild(ReCaptchaComponent, { static: false }) recaptcha: ReCaptchaComponent | undefined;
	loginForm: FormGroup | undefined;
	loading = false;
	isLoggedIn$: Observable<boolean> | undefined;
	errors: any = [];
	logo: string = "";
	constants: any;
	expression: boolean = false;
	private unsubscribe: Subject<any>;
	private returnUrl: any;
	showCaptcha: boolean = false;
	numShowRecaptcha: number = 0;
	captchaResponse: string = "";
	YOUR_SITE_KEY: string = "";
	error_txt: any = {
		username: "",
		password: ""
	}

	constructor(
		private router: Router,
		private auth: AuthService,
		public dialog: MatDialog,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private layoutConfigService: LayoutConfigService,
		private commonService: CommonService) {
		this.unsubscribe = new Subject();
	}

	async ngOnInit() {
		this.dialog.closeAll();
		this.initLoginForm();
		this.constants = this.layoutConfigService.getConfig('constants');
		await this.commonService.getConfig(["NUM_CAPCHA"]).toPromise().then(res => {
			if (res && res.status == 1)
				this.numShowRecaptcha = +res.data.NUM_CAPCHA;
		})
		//this.numShowRecaptcha = environment.numShowCaptcha;
		this.YOUR_SITE_KEY = environment.YOUR_SITE_KEY;
		let crr_num = parseInt(localStorage.getItem("NumLogin") + '');
		if (!crr_num) crr_num = 0;
		if (this.numShowRecaptcha > 0 && crr_num > this.numShowRecaptcha) {
			this.showCaptcha = true;
		}
		// redirect back to the returnUrl before login
		this.route.queryParams.subscribe(params => {
			this.returnUrl = params.returnUrl || '/';
			if (this.returnUrl == '/error/404')
				this.returnUrl = '';
		});
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice("");
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	initLoginForm() {
		this.loginForm = this.fb.group({
			username: [DEMO_PARAMS.EMAIL, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(320) 
			])],
			password: [DEMO_PARAMS.PASSWORD, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(100)
			])]
		});
	}

	submit() {
		this.authNoticeService.setNotice("");
		if (!this.loginForm) return;
		const controls = this.loginForm.controls;
		this.error_txt = {
			username: '',
			password: ''
		}
		if (objectPath.get(controls, 'username.errors.required')) {
			this.error_txt.username = this.translate.instant('AUTH.VALIDATION.REQUIRED', { name: this.translate.instant('AUTH.INPUT.USERNAME') });
		}
		if (objectPath.get(controls, 'username.errors.minlength.requiredLength')) {
			this.error_txt.username = this.translate.instant('AUTH.VALIDATION.MIN_LENGTH_FIELD', { name: this.translate.instant('AUTH.INPUT.USERNAME') }) + " 3 ký tự";
		}
		if (objectPath.get(controls, 'username.errors.maxlength.requiredLength')) {
			this.error_txt.username = this.translate.instant('AUTH.VALIDATION.MAX_LENGTH_FIELD', { name: this.translate.instant('AUTH.INPUT.USERNAME') }) + " 320 ký tự";
		}
		if (objectPath.get(controls, 'password.errors.required')) {
			this.error_txt.password = this.translate.instant('AUTH.VALIDATION.REQUIRED', { name: this.translate.instant('AUTH.INPUT.PASSWORD') });
		}

		if (objectPath.get(controls, 'password.errors.minlength.requiredLength')) {
			this.error_txt.password = this.translate.instant('AUTH.VALIDATION.MIN_LENGTH_FIELD', { name: this.translate.instant('AUTH.INPUT.PASSWORD') }) + " 3 ký tự";
		}
		if (objectPath.get(controls, 'password.errors.maxlength.requiredLength')) {
			this.error_txt.password = this.translate.instant('AUTH.VALIDATION.MAX_LENGTH_FIELD', { name: this.translate.instant('AUTH.INPUT.PASSWORD') }) + " 320 ký tự";
		}
		/** check form */
		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loading = true;
		const authData = {
			username: controls.username.value,
			password: controls.password.value,
			checkReCaptCha: this.showCaptcha,
			GReCaptCha: this.captchaResponse
		};
		this.auth
			.login(authData.username, authData.password, authData.checkReCaptCha, authData.GReCaptCha)
			.subscribe(response => {
				let numlogin = parseInt(localStorage.getItem("NumLogin") + '');
				localStorage.setItem("NumLogin", (numlogin + 1) + '');
				if (response && response.status === 1) {
					this.error_txt = {
						username: '',
						password: ''
					}
					localStorage.setItem("NumLogin", "0");
					this.router.navigate([this.returnUrl]);
				}
				else {
					this.authNoticeService.setNotice(response.error.message, 'danger');
				}
				if (this.captchaResponse && this.recaptcha) {
					this.recaptcha.reset();
				}
				if (this.numShowRecaptcha > 0 && numlogin > this.numShowRecaptcha) {
					this.showCaptcha = true;
				}
				this.loading = false;
				this.cdr.detectChanges();
			});
	}

	isControlHasError(controlName: string, validationType: string): boolean {
		if (!this.loginForm) return false;
		const control = this.loginForm.controls[controlName];
		if (!control) return false;
		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	public handleCorrectCaptcha(captchaResponse: string): void {
		this.captchaResponse = captchaResponse;
	}
}