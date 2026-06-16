import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { LogService } from './Services/log.service';

@Component({
  selector: 'kt-log',
  templateUrl: './log.component.html',
})
export class LogComponent implements OnInit {

  constructor(private apiService: LogService) { }

  ngOnInit() {
    if (this.apiService != undefined)
      this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'CreatedDate', 0, 10));
  }
}