import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

import { Api } from '../constants/api.constants';
import { Volunteer } from '../models/volunteer';
import { StorageService } from './storage.service';

interface ILoginResponse {
  token: string;
  volunteer: Volunteer;
}

@Injectable()
export class AuthService {
  constructor(private http: Http, private storageService: StorageService) { }

  login(volunteer: Volunteer): Observable<ILoginResponse> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post(
      Api.LOGIN_URL,
      JSON.stringify({
        username: volunteer.email,
        password: volunteer.password
      }),
      { headers }
    )
      .map((response: Response) => response.json())
      .do((data: ILoginResponse) => {
        this.storageService.setString(StorageService.KEY_TOKEN, data.token);
      });
  }
}
