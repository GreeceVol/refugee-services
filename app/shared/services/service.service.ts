import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Api } from '../constants/api.constants';
import { Key } from '../constants/key.constants';
import { Service } from '../models/service';
import { CacheService } from '../services/cache.service';
import { StorageService } from '../services/storage.service';

@Injectable()
export class ServiceService {

  constructor(
    private _http: Http,
    private _storageService: StorageService,
    private _cacheService: CacheService
  ) { }

  getList(): Observable<Service[]> {
    const headers = this._getHeaders();

    const listObservable: Observable<Service[]> = this._http.get(
      Api.LIST_URL,
      { headers }
    )
      .map((response: Response) => response.json());

    return this._cacheService.observable(Key.SERVICE_LIST, listObservable);
  }

  getServiceByID(id: number): Observable<Service> {

    return this.getList()
      .map((services: Service[]) => {
        const matchingService = services.find((service: Service) => service.ID === id);

        return matchingService ? new Service(matchingService) : null;
      });
  }

  private _getHeaders(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this._storageService.getString(Key.TOKEN)}`);

    return headers;
  }

}
