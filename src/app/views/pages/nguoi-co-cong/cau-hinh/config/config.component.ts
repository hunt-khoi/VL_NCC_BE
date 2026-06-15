import { Component, OnInit, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';
import { ConfigService } from './Services/config.service';

@Component({
    selector: 'kt-config',
    templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit {
  constructor(private apiService : ConfigService) {}

  ngOnInit() {
    if (this.apiService != undefined)
		  this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
  }
}