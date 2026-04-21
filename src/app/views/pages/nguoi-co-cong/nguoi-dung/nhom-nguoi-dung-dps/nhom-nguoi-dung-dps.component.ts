import { Component, OnInit, Injectable } from '@angular/core';
import { NhomNguoiDungDPSService } from './Services/nhom-nguoi-dung-dps.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';

@Component({
    selector: 'kt-nhom-nguoi-dung-dps',
    templateUrl: './nhom-nguoi-dung-dps.component.html',
})
@Injectable()
export class NhomNguoiDungDPSComponent implements OnInit {

  constructor(private apiService : NhomNguoiDungDPSService) { }

  ngOnInit() {
    if (this.apiService)
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'DisplayOrder', 0, 10));
  }
}