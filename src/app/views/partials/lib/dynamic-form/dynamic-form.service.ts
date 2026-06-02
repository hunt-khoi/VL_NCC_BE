import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DynamicFormService {
    API_ROOT_URL: string;
    API_ROOT: string;

    constructor(private http: HttpClient, @Inject('httpHeaders') private httpHeaders: any, @Inject('env') private env: any) {
        this.API_ROOT_URL = this.env.ApiRoot + '/df';
        this.API_ROOT = this.env.ApiRoot + "/";
    }

    getActionById(id: any) {
        return this.http.get<any>(this.API_ROOT_URL + `/DFDetail?id=${id}`, {
            headers: this.httpHeaders
        });
    }

    DFDetailObjectTest(id: any, idValue: any) {
        return this.http.get<any>(this.API_ROOT_URL + `/DFDetailObjectTest?idProcess=${id}&idObject=${idValue}`, {
            headers: this.httpHeaders
        });
    }

    getForeignKeyData(api: any) {
        return this.http.get<any>(this.API_ROOT + api, { headers: this.httpHeaders });
    }

    getValueById(api: any, key: any, value: any) {
        return this.http.get<any>(this.API_ROOT + api + `?${key}=${value}`, { headers: this.httpHeaders });
    }

    excuteAction(data: any) {
        if (data.Method == "get") {
            let url = "";
            if (data.controls.length > 0) {
                for (var i = 0; i < data.controls.length; i++) {
                    if (data.controls[i].NewData || data.controls[i].ColumnName == data.IdColumn) {
                        url += !url ? "?" : "&";
                        url += data.controls[i].ColumnName + "=" + data.controls[i].value;
                        if (data.controls[i].ColumnNameAs) {
                            url += !url ? "?" : "&";
                            url += data.controls[i].ColumnNameAs + "=" + data.controls[i].value;
                        }
                    }
                }
                if (data.DefaultValues) {
                    for (var i = 0; i < data.DefaultValues.length; i++) {
                        url += !url ? "?" : "&";
                        url += data.DefaultValues[i].ColumnName + "=" + data.DefaultValues[i].DefaultValue;
                        if (data.DefaultValues[i].ColumnNameAs) {
                            url += !url ? "?" : "&";
                            url += data.DefaultValues[i].ColumnNameAs + "=" + data.DefaultValues[i].DefaultValue;
                        }
                    }
                }
            }
            url = this.API_ROOT + data.Url + url;
            return this.http.get<any>(url, { headers: this.httpHeaders });
        }
        else {
            let url = this.API_ROOT + data.Url;
            let item: any = {};
            for (var i = 0; i < data.controls.length; i++) {
                if (data.controls[i].NewData || data.controls[i].ColumnName == data.IdColumn) {
                    let value;
                    value = data.controls[i].value;
                    item[data.controls[i].ColumnName] = value;
                    if (data.controls[i].ColumnNameAs) {
                        item[data.controls[i].ColumnNameAs] = value;
                    }
                }
            }
            if (data.DefaultValues) {
                for (var i = 0; i < data.DefaultValues.length; i++) {
                    let value = data.DefaultValues[i].DefaultValue;
                    if (data.DefaultValues[i].IdControl == -3) //json
                        value = JSON.parse(value);
                    if (data.DefaultValues[i].IdControl == 2) //số
                        value = +value;
                    if (data.DefaultValues[i].IdControl == 7) //bool
                        value = value == 1;
                    item[data.DefaultValues[i].ColumnName] = value;
                    if (data.DefaultValues[i].ColumnNameAs) {
                        item[data.DefaultValues[i].ColumnNameAs] = value;
                    }
                }
            }
            item.IdF = data.IdF;
            item.IdButton = data.IdButton;
            return this.http.post<any>(url, item, { headers: this.httpHeaders });
        }
    }

    excute(data: any) {
        if (data.Method == "get") {
            let url = "";
            if (data.DefaultValues) {
                for (var i = 0; i < data.DefaultValues.length; i++) {
                    url += !url ? "?" : "&";
                    url += data.DefaultValues[i].ColumnName + "=" + data.DefaultValues[i].DefaultValue;
                    if (data.DefaultValues[i].ColumnNameAs) {
                        url += !url ? "?" : "&";
                        url += data.DefaultValues[i].ColumnNameAs + "=" + data.DefaultValues[i].DefaultValue;
                    }
                }
            }
            url = this.API_ROOT + data.Url + url;
            return this.http.get<any>(url, { headers: this.httpHeaders });
        }
        else {
            let url = this.API_ROOT + data.Url;
            if (data.DefaultValues) {
                for (var i = 0; i < data.DefaultValues.length; i++) {
                    let value = data.DefaultValues[i].DefaultValue;
                    if (data.DefaultValues[i].IdControl == -3) //json
                        value = JSON.parse(value);
                    if (data.DefaultValues[i].IdControl == 2) //số
                        value = +value;
                    if (data.DefaultValues[i].IdControl == 7) //bool
                        value = value == 1;
                    data[data.DefaultValues[i].ColumnName] = value;
                    if (data.DefaultValues[i].ColumnNameAs) {
                        data[data.DefaultValues[i].ColumnNameAs] = value;
                    }
                }
            }
            return this.http.post<any>(url, data, { headers: this.httpHeaders });
        }
    }
}