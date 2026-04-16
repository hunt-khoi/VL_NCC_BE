import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, Input, EventEmitter, SimpleChange, AfterViewInit, ElementRef, ViewChild, Pipe } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog} from '@angular/material';
import { Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommentService } from './comment.service';
import { EmotionDialogComponent } from '../emotion-dialog/emotion-dialog.component';
import { GlobalVariable } from '../../../../pages/global';
import { CommentEditDialogComponent } from './comment-edit-dialog/comment-edit-dialog.component';
import { PopoverContentComponent } from 'ngx-smart-popover';
import { DomSanitizer } from '@angular/platform-browser';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../../../../core/auth';
import { ReviewExportComponent } from '../review-export/review-export.component';

@Component({
	selector: 'kt-comment',
	templateUrl: './comment.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentComponent implements OnInit, OnDestroy, AfterViewInit {
	@Output() ListResult: EventEmitter<any> = new EventEmitter<any>();//event for component
	@Output() inserted: EventEmitter<any> = new EventEmitter<any>();//event for component
	@Input() Id: number = 0;;//Id của đối tượng
	@Input() View?: boolean = false;//view cho xem hay ko
	//@Input() ListChecked?: any[] = [];//tên node roof có chứa các con của node, default = children
	@Input() Loai: number = 0;//1: đề xuất, 2 hồ sơ, 3: số liệu, 4: bhyt, 5: ht nhà ở, 6,7: niên hạn, 8: ht từ quỹ 
	// nếu không cả Mã và Tên đều Emty thì nút xuất file word sẽ không xuất hiện
	@Input() disabledInput: boolean = false; //tùy vào đk mà cho comment hay ko

	listResult = new Subject();
	ItemData: any = {};
	FormControls: FormGroup | undefined;
	hasFormErrors: boolean = false;
	disBtnSubmit: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isChange: boolean = false;
	isZoomSize: boolean = false;
	LstDanhMucKhac: any[] = [];
	datatreeDonVi: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	componentSubscriptions: Subscription | undefined;
	ListDonViCon: any[] = [];
	ListVanBan: any[] = [];
	datasource: any;

	ListAttachFile: any[] = [];
	ListYKien: any[] = [];
	AcceptInterval: boolean = true;
	NguoiNhan: string = '';
	//NguoiNhans:any[]=[{FullName:'người 1'},{FullName:'người 2'}];

	Comment: string = '';
	AttachFileComment: any[] = [];
	fileControl: FormControl = new FormControl();
	setting: any = {
		ACCEPT_DINHKEM: '',
		MAX_SIZE: 0
	};
	files: any = {};
	//reload: boolean = true;
	UserData: any = {};
	emotions: any = {};
	accounts: any = {};
	icons: any[] = [];
	anchors: any;
	//tag username
	@ViewChild('myPopoverC', { static: true }) myPopover: PopoverContentComponent | undefined;
	selected: any[] = [];
	selectedChild: any[] = [];
	listUser: any[] = [];
	options: any = {};
	@ViewChild('matInput', { static: true }) matInput: ElementRef | undefined;
	@ViewChild('hiddenText', { static: true }) textEl: ElementRef | undefined;
	CommentTemp: string = '';
	indexxxxx: number = -1;
	item_choose: number = -1;
	@ViewChild('myPopoverB', { static: true }) myPopoverU: PopoverContentComponent | undefined;
	it: any = {};

	constructor(
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private service: CommentService,
		public commonService: CommonService,
		private elementRef: ElementRef,
		private auth: AuthService,
		private sanitized: DomSanitizer) {
	}

	transform(value: any) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	ngOnChanges(changes: SimpleChange) {
		if (changes['Id']) {
			this.ngOnInit();
		}
	}

	async ngOnInit() {
		if (GlobalVariable.icons.length == 0) {
			this.auth.getDictionary().subscribe(res => {
				if (res && res.status == 1) {
					res.data.emotions.map((x: any) => {
						GlobalVariable.emotions[x.key] = x.value;
					})
					res.data.accounts.map((x: any) => {
						GlobalVariable.accounts[x.key] = x.value;
					})
					GlobalVariable.icons = res.data.icons;
					this.emotions = GlobalVariable.emotions;
					this.accounts = GlobalVariable.accounts;
					this.icons = GlobalVariable.icons;
				}
			})
		}
		this.emotions = GlobalVariable.emotions;
		this.accounts = GlobalVariable.accounts;
		this.icons = GlobalVariable.icons;
		this.options = this.getOptions();
		this.commonService.getDSNguoiDungLite().subscribe(res => {
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.listUser = res.data.map((x: any) => {
					return {
						id_nv: x.UserID,
						hoten: x.FullName,
						username: x.UserName,
						charname: x.CharName,
						mobile: '',
						tenchucdanh: '',
						image: x.image
					}
				});
			}
			this.options = this.getOptions();
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserData = {
				Image: res.avata,
				HoTen: res.fullname,
				ChucVu: res.tenvaitro,
				Username: res.username,
				Charname: res.charname,
			};
		})
		this.AcceptInterval = true;
		this.viewLoading = true;
		if (this.Id > 0) 
			this.getDSYKien();
	}

	ngAfterViewInit() {
		this.anchors = this.elementRef.nativeElement.querySelectorAll('.inline-tag');
		this.anchors.forEach((anchor: HTMLAnchorElement) => {
			anchor.addEventListener('click', this.clickOnUser);
		})
	}

	getDSYKien() {
		this.service.getDSYKien(this.Id, this.Loai).subscribe(res => {
			if (res && res.status == 1) {
				this.ListYKien = res.data;
				this.createForm();
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	getDSYKien_Interval() {
		var NguoiNhan_Tam = '';
		this.service.getDSYKien(this.Id, this.Loai).subscribe(res => {
			if (res && res.status == 1) {
				let data: any = res.data;
				for (var j = 0; j < data.length; j++) {
					let check: boolean = false;
					let rowj = data[j];
					for (var i = 0; i < this.ListYKien.length; i++) {
						let rowi = this.ListYKien[i];
						if (rowj.IdRow == rowi.IdRow) {
							check = true;
							rowi.CreatedDate = rowj.CreatedDate;
							rowi.comment = rowj.comment;
							rowi.NguoiTao.hoten = rowj.NguoiTao.hoten;
							rowi.NguoiTao.image = rowj.NguoiTao.image;
							rowi.Attachments = rowj.Attachment;

							for (var a = 0; a < rowi.NguoiNhans.length; a++) {
								NguoiNhan_Tam += rowi.NguoiNhans[a].NguoiTao.hoten + '\n';
							}
							this.NguoiNhan = NguoiNhan_Tam;
							this.Children_Interval(rowj.Children, rowi.Children);
						}
					}
					if (!check) {
						this.ListYKien.push(rowj);
					}
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	Children_Interval(data: any, children: any) {
		for (var j = 0; j < data.length; j++) {
			let check: boolean = false;
			let rowj = data[j];
			for (var i = 0; i < children.length; i++) {
				let rowi = children[i];
				if (rowj.IdRow == rowi.IdRow) {
					check = true;
					rowi.CreatedDate = rowj.CreatedDate;
					rowi.comment = rowj.comment;
					rowi.NguoiTao.hoten = rowj.NguoiTao.hoten;
					rowi.NguoiTao.image = rowj.NguoiTao.image;
					rowi.Attachments = rowj.Attachment;
					this.changeDetectorRefs.detectChanges();
				}
			}
			if (!check) {
				children.push(rowj);
				this.ListAttachFile.push([])
			}
		}
	}

	CheckedChange(p: any, e: any) {
		p.check = e;
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
		this.AcceptInterval = false;
	}

	createForm() {
		for (var i = 0; i < this.ListYKien.length; i++) {
			this.ListAttachFile.push([])
		}
	}

	GetListAttach(ind: number): any {
		return this.ListAttachFile[ind];
	}

	isControlInvalid(controlName: string): boolean {
		if (!this.FormControls) return false;
		const control = this.FormControls.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onSubmit() {
		let ArrDVC: any[] = [];
		for (var i = 0; i < this.ListDonViCon.length; i++) {
			if (this.ListDonViCon[i].check) {
				ArrDVC.push(this.ListDonViCon[i]);
			}
		}
	}

	ShowOrHideComment(ind: number) {
		if (this.disabledInput) return;
		var x = document.getElementById("ykchild" + ind);
		if (!x) return;
		if (!x.style.display || x.style.display === "none") {
			x.style.display = "block";
		} else {
			x.style.display = "none";
		}
	}

	//type=1: comment, type=2: reply
	CommentInsert(e: any, Parent: number, ind: number, type: number) {
		var objSave: any = {};
		objSave.comment = e.trim();
		if (type == 1)  
			objSave.Attachments = this.AttachFileComment; 
		else 
			objSave.Attachments = this.ListAttachFile[ind]; 
		
		if (objSave.comment == '' && (objSave.Attachments == null || objSave.Attachments.length == 0)) {
			return;
		}
		objSave.id_parent = Parent;
		objSave.object_type = this.Loai;
		objSave.object_id = this.Id;
		if (type == 1) {
			objSave.Attachments = this.AttachFileComment;
			objSave.Users = this.selected;
		}
		else {
			objSave.Attachments = this.ListAttachFile[ind];
			objSave.Users = this.getListTagUser(e, this.selectedChild);
		}
		this.service.getDSYKienInsert(objSave).subscribe(res => {
			if (res && res.status == 1) {
				if (type == 1) { 
					this.Comment = '';
					this.AttachFileComment = []; 
				}
				else {
					(<HTMLInputElement>document.getElementById("CommentRep" + ind)).value = "";
					this.ListAttachFile[ind] = [];
				}
				if (Parent == 0) {
					this.ListYKien.unshift(res.data);
					this.inserted.emit(res.data);
				} else {
					this.ListYKien[ind].Children.unshift(res.data);
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	selectFile_PDF(ind: number) {
		if (ind == -1) {
			let f = document.getElementById("PDFInpdd");
			if (!f) return;
			f.click();
		}
		else {
			let f = document.getElementById("PDFInpdd" + ind);
			if (!f) return;
			f.click();
		}
	}

	onSelectFile_PDF(event: any, ind: number) {
		if (this.disabledInput) return;
		if (event.target.files && event.target.files[0]) {
			var filesAmount = event.target.files[0];
			if (ind == -1) {
				for (var i = 0; i < this.AttachFileComment.length; i++) {
					if (filesAmount.name == this.AttachFileComment[i].filename) {
						this.layoutUtilsService.showInfo("File đã tồn tại");
						return;
					}
				}
			}
			else {
				for (var i = 0; i < this.ListAttachFile[ind].length; i++) {
					if (filesAmount.name == this.ListAttachFile[ind][i].filename) {
						this.layoutUtilsService.showInfo("File đã tồn tại");
						return;
					}
				}
			}

			event.target.type = 'text';
			event.target.type = 'file';
			var reader = new FileReader();
			let base64Str: any;
			reader.onload = (event: any) => {
				base64Str = event.target["result"]
				var metaIdx = base64Str.indexOf(';base64,');
				base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
				if (ind == -1) {
					this.AttachFileComment.push({ filename: filesAmount.name, strBase64: base64Str });
					this.changeDetectorRefs.detectChanges();
				}
				else {
					this.ListAttachFile[ind].push({ filename: filesAmount.name, strBase64: base64Str });
					this.changeDetectorRefs.detectChanges();
				}
			}
			reader.readAsDataURL(filesAmount);
		}
	}

	DeleteFile_PDF(ind: number, ind1: number) {
		if (this.disabledInput) return;
		let id;
		if (ind == -1)
			id = this.AttachFileComment[ind1].id_row;
		else
			id = this.ListAttachFile[ind][ind1].id_row;
		if (!id) {
			if (ind == -1)
				this.AttachFileComment.splice(ind1, 1);
			else
				this.ListAttachFile[ind].splice(ind1, 1);
			return;
		}
		this.commonService.Delete_FileDinhKem(id).subscribe(res => {
			if (res && res.status == 1) {
				if (ind == -1) {
					this.AttachFileComment.splice(ind1, 1);
				}
				else {
					this.ListAttachFile[ind].splice(ind1, 1);
				}
			}
		})
	}

	DownloadFile(link: string) {
		if (this.disabledInput) return;
		window.open(link);
	}

	preview(link: string) {
		if (this.disabledInput) return;
		window.open(link);
	}

	reply(item: any, index: number) {
		var ele = (<HTMLInputElement>document.getElementById("CommentRep" + index));
		ele.value = "@" + item.NguoiTao.username + " ";
		ele.focus();
	}

	openEmotionDialog(ind: number, id_p: number) {
		const dialogRef = this.dialog.open(EmotionDialogComponent, { data: {}, width: '500px' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.CommentInsert(res, id_p, ind, 2);
		});
	}

	clickOnUser = (event: Event) => {
		// Prevent opening anchors the default way
		event.preventDefault();
		event.stopPropagation();
		const anchor = event.target as HTMLAnchorElement;
		this.it = this.listUser.find(x => x.username == anchor.getAttribute('data-username'));
		this.changeDetectorRefs.detectChanges();
		if (this.myPopoverU)
			this.myPopoverU.show();
	}
	
	clickonbox() {
		if (this.myPopoverU)
			this.myPopoverU.hide();
	}

	parseHtml(str: string) {
		if (!str) return '';
		var html = str;
		var reg = /@\w*(\.[A-Za-z]\w*)|\@[A-Za-z]\w*/gm
		var reg1 = /\:[A-Za-z]\w*\:/gm
		var match = html.match(reg);
		if (match != null) {
			for (var i = 0; i < match.length; i++) {
				var key = match[i] + '';
				var username = key.slice(1);
				if (this.accounts[key]) {
					var re = `<span class="url inline-tag" data-username="${username}">${this.accounts[key]}</span>`;
					html = html.replace(key, re);
				}
			}
		}
		match = html.match(reg1);
		if (match != null) {
			for (var i = 0; i < match.length; i++) {
				var key = match[i] + '';
				if (this.emotions[key]) {
					var re = `<img src="${this.emotions[key]}" />`;
					html = html.replace(key, re);
				}
			}
		}
		setTimeout(() => {
			this.ngAfterViewInit();
		}, 10)
		//return html;
		return this.sanitized.bypassSecurityTrustHtml(html)
	}

	like(item: any, icon: any) {
		if (this.disabledInput) return;
		this.service.like(item.id_row, icon).subscribe(res => {
			if (res && res.status == 1) {
				item.Like = res.data.Like;
				item.Likes = res.data.Likes;
				this.changeDetectorRefs.detectChanges();
			}
		})
	}

	remove(item: any, index: number, indexc: number = -1) {
		const _title = 'Xóa bình luận';
		const _description = 'Bạn có chắc chắn muốn xóa bình luận ?';
		const _waitDesciption = 'Đang xử lý ...';
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.service.remove(item.id_row).subscribe(res => {
				if (res && res.status == 1) {
					if (indexc >= 0) //xóa con
						this.ListYKien[index].Children.splice(indexc, 1);
					else
						this.ListYKien.splice(index, 1);
					this.changeDetectorRefs.detectChanges();
				}
			})
		});
	}

	initUpdate(item: any, index: number, indexc: number = -1) {
		var data = Object.assign({}, item);
		const dialogRef = this.dialog.open(CommentEditDialogComponent, { data: data, width: '500px' });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				item.comment = res.comment
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	//#region tag username
	getOptions() {
		var options: any = {
			showSearch: false,
			keyword: this.getKeyword(),
			data: this.listUser.filter(x => this.selected.findIndex(y => x.id_nv == y.id_nv) < 0),
		};
		return options;
	}
	getKeyword() {
		let i = this.CommentTemp.lastIndexOf('@');
		if (i >= 0) {
			let temp = this.CommentTemp.slice(i);
			if (temp.includes(' '))
				return '';
			return this.CommentTemp.slice(i);
		}
		return '';
	}
	ItemSelected(data: any) {
		if (this.item_choose == -1) {
			this.selected.push(data);
		} else {
			this.selectedChild.push(data);
		}
		let i = this.CommentTemp.lastIndexOf('@');
		this.CommentTemp = this.CommentTemp.substr(0, i) + '@' + data.username + ' ';
		if (this.myPopover) this.myPopover.hide();
		if (this.matInput) {
			let ele = (<HTMLInputElement>this.matInput.nativeElement);
			if (this.item_choose >= 0)
				ele = (<HTMLInputElement>document.getElementById("CommentRep" + this.item_choose));
			ele.value = this.CommentTemp;
			ele.focus();
		}
		this.changeDetectorRefs.detectChanges();
	}
	click($event: any, vi: number = -1) {
		if (this.myPopover)
			this.myPopover.hide();
	}
	onSearchChange($event: any, vi: number = -1) {
		this.item_choose = vi;
		if (vi >= 0)
			this.CommentTemp = (<HTMLInputElement>document.getElementById("CommentRep" + vi)).value;
		else
			this.CommentTemp = this.Comment;
		
		if (this.selected.length > 0) {
			var reg = /@\w*(\.[A-Za-z]\w*)|\@[A-Za-z]\w*/gm
			var match = this.CommentTemp.match(reg);
			if (match != null && match.length > 0) {
				let arr = match.map(x => x);
				this.selected = this.selected.filter(x => arr.includes('@' + x.username));
			} else {
				this.selected = [];
			}
		}

		if (!this.myPopover || !this.textEl) return;
		this.options = this.getOptions();
		if (this.options.keyword) {
			let el = $event.currentTarget;
			if (this.item_choose >= 0) {
				var ele = (<HTMLInputElement>document.getElementById("inputtext" + this.item_choose));
				var w = this.textEl.nativeElement.offsetWidth + 100;
				var h = ele.offsetTop + 200;
				this.myPopover.show();
				this.myPopover.top = el.offsetTop + h;
				this.myPopover.left = el.offsetLeft + w;
			} else {
				var w = this.textEl.nativeElement.offsetWidth + 25;
				var h = 0;
				this.myPopover.show();
				this.myPopover.top = el.offsetTop + h;
				this.myPopover.left = el.offsetLeft + w;
			}
			//this.myPopover.top = rect.y + h;
			//this.myPopover.left = w ;
			this.changeDetectorRefs.detectChanges();
		} else {
			this.myPopover.hide();
		}
	}

	getListTagUser(chuoi: string, array: any[]) {
		var arr: any[] = [];
		var user: any[] = []
		chuoi.split(' ').forEach(element => {
			if (element[0] == '@') {
				user.push(element);
			}
		});;
		user = Array.from(new Set(user));
		user.forEach(element => {
			var x = array.find(x => x.username == element.substr(1));
			if (x) arr.push(x)
		})
		return arr;
	}

	inhuongdan(id_quatrinh_lichsu: number) {
		if (this.disabledInput) return;
		this.commonService.getHuongDan(id_quatrinh_lichsu, this.Loai).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) return;

					this.commonService.exportHuongDan(id_quatrinh_lichsu, res.loai).subscribe(response => {
						const headers = response.headers;
						const filename = headers.get('x-filename');
						const type = headers.get('content-type');
						const blob = new Blob([response.body], { type });
						const fileURL = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = fileURL;
						link.download = filename;
						link.click();
					}, err => {
						this.layoutUtilsService.showError("Xuất hướng dẫn thất bại")
					});
				});
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}
	//#endregion
}