import { Injectable } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Rx';

import { Api } from '../constants/api.constants';
import { Key } from '../constants/key.constants';
import { Volunteer } from '../models/volunteer';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

interface ILoginResponse {
  token: string;
  volunteer: Volunteer;
}

@Injectable()
export class AuthService {
  constructor(
    private _routerExtensions: RouterExtensions,
    private _networkService: NetworkService,
    private _storageService: StorageService
  ) { }

  login(volunteer: Volunteer): Observable<ILoginResponse> {

    return this._networkService.post<ILoginResponse>(
      Api.LOGIN_URL,
      {
        username: volunteer.email,
        password: volunteer.password
      }
    )
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
