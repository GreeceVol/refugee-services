import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { RouterExtensions } from 'nativescript-angular/router';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

import { Api } from '../constants/api.constants';
import { Key } from '../constants/key.constants';
import { Volunteer } from '../models/volunteer';
import { StorageService } from './storage.service';

interface ILoginResponse {
  token: string;
  volunteer: Volunteer;
}

@Injectable()
export class AuthService {
  constructor(
    private _http: Http,
    private _storageService: StorageService,
    private _routerExtensions: RouterExtensions
  ) { }

  login(volunteer: Volunteer): Observable<ILoginResponse> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this._http.post(
      Api.LOGIN_URL,
      JSON.stringify({
        username: volunteer.email,
        password: volunteer.password
      }),
      { headers }
    )
      .map((response: Response) => response.json())
      .do((data: ILoginResponse) => {
        this._storageService.setString(Key.TOKEN, data.token);
      });
  }

  logout() {
    this._storageService.clearAll();
    this._routerExtensions.navigate(['/login'], { clearHistory: true });
  }

  isAuthenticated(): boolean {
    return !!this._storageService.getString(Key.TOKEN);
  }
}
