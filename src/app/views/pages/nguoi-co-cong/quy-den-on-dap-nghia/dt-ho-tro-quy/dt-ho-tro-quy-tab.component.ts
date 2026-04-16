import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'm-dt-ho-tro-quy-tab',
	templateUrl: './dt-ho-tro-quy-tab.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DTHoTroTabComponent implements OnInit {
	constructor(private tokenStorage: TokenStorage,) {}
	Capcocau: number = 0;

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})
	}
}