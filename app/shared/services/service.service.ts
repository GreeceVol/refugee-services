import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Api } from '../constants/api.constants';
import { Key } from '../constants/key.constants';
import { Service } from '../models/service';
import { StorageService } from '../services/storage.service';

@Injectable()
export class ServiceService {

  constructor(
    private http: Http,
    private storageService: StorageService
  ) { }

  getList(): Observable<Service[]> {
    const headers = this.getHeaders();

    return this.http.get(
      Api.LIST_URL,
      { headers }
    )
      .map((response: Response) => response.json())
      .do((data: Service[]) => {
        this.storageService.setString(Key.SERVICE_LIST, JSON.stringify(data));
        this.storageService.setNumber(Key.SERVICE_LIST_LAST_UPDATED_TIME, Date.now());
      });
  }

  private getHeaders(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.storageService.getString(Key.TOKEN)}`);

    return headers;
  }

}
