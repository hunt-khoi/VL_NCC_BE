import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter, ViewEncapsulation, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ReplaySubject } from 'rxjs';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'kt-choose-users',
	templateUrl: './choose-users.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class ChooseUsersComponent implements OnInit, OnChanges {
	@Input() options: any = {
		showSearch: true,//hiển thị search input hoặc truyền keyword
		keyword: '',
		data: []
	};
	@Output() ItemSelected = new EventEmitter<any>();
	@Output() IsSearch = new EventEmitter<any>();

	listUser: any[] = [];
	public filteredUsers: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	public userFilterCtrl: FormControl = new FormControl();

	constructor(
		public dialog: MatDialog,
		public commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef) { }

	ngOnInit() {
		this.userFilterCtrl.valueChanges
			.pipe()
			.subscribe(() => {
				this.filterUsers();
			});
	}

	ngOnChanges() {
		this.userFilterCtrl.setValue('');
		this.listUser = [];

		if (this.options.showSearch == undefined)
			this.options.showSearch = true;
		if (this.options != undefined) {
			if (this.options.data) {
				this.listUser = this.options.data;
				this.filterUsers();
				this.changeDetectorRefs.detectChanges();
			} else {
				this.commonService.getDSNguoiDungLite().subscribe(res => {
					if (res && res.status === 1) {
						this.listUser = res.data.map((x: { UserID: any; FullName: any; UserName: any; image: any; }) => {
							return {
								id_nv: x.UserID,
								hoten: x.FullName,
								username: x.UserName,
								mobile: '',
								tenchucdanh: '',
								image: x.image
							}
						});
						if (this.options.excludes && this.options.excludes.length > 0) {
							var arr = this.options.excludes;
							this.listUser = this.listUser.filter(x => !arr.includes(x.id_nv));
						}
						this.filterUsers();
						this.changeDetectorRefs.detectChanges();
					};
				});
			}
		}
		if (!this.options.showSearch)
			this.filterUsers();
	}

	protected filterUsers() {
		if (!this.listUser) return;
		
		let search = !this.options.showSearch ? this.options.keyword : this.userFilterCtrl.value;
		if (!search) {
			this.filteredUsers.next(this.listUser.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		if (search[0] == '@') {
			this.filteredUsers.next(
				this.listUser.filter(bank => ("@" + bank.username.toLowerCase()).indexOf(search) > -1)
			);
		}
		else {
			this.filteredUsers.next(
				this.listUser.filter(bank => bank.hoten.toLowerCase().indexOf(search) > -1)
			);
		}
	}
	select(user: any) {
		this.ItemSelected.emit(user)
	}
	stopPropagation(event: any) {
		this.IsSearch.emit(event)
	}
}