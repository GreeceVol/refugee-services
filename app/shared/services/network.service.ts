import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Key } from '../constants/key.constants';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';

@Injectable()
export class NetworkService {

  constructor(
    private _http: Http,
    private _cacheService: CacheService,
    private _storageService: StorageService
  ) { }

  authGet<T>(url: string, cacheKey: string): Observable<T> {
    const headers = this._getHeaders(true);

    const getObservable = this._http.get(
      url,
      { headers }
    )
      .map((resp: Response) => resp.json());

    return cacheKey ? this._cacheService.observable(cacheKey, getObservable) : getObservable;
  }

  authPost<T>(url: string, body: object = null): Observable<T> {
    const headers = this._getHeaders(true);

    return this._http.post(
      url,
      body ? JSON.stringify(body) : null,
      { headers }
    )
      .map((resp: Response) => resp.json());
  }

  post<T>(url: string, body: object = null): Observable<T> {
    const headers = this._getHeaders(false);

    return this._http.post(
      url,
      body ? JSON.stringify(body) : null,
      { headers }
    )
      .map((resp: Response) => resp.json());
  }

  private _getHeaders(hasAuthToken: boolean = false): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (hasAuthToken) {
      headers.append('Authorization', `Bearer ${this._storageService.getString(Key.TOKEN)}`);
    }

    return headers;
  }
}
