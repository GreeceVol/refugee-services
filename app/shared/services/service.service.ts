import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Api } from '../constants/api.constants';
import { Key } from '../constants/key.constants';
import { Service } from '../models/service';
import { NetworkService } from '../services/network.service';

@Injectable()
export class ServiceService {

  constructor(
    private _networkService: NetworkService
  ) { }

  getList(): Observable<Service[]> {
    return this._networkService.authGet(Api.LIST_URL, Key.SERVICE_LIST);
  }

  getServiceByID(id: number): Observable<Service> {

    return this.getList()
      .map((services: Service[]) => {
        const matchingService = services.find((service: Service) => service.ID === id);

        return matchingService ? new Service(matchingService) : null;
      });
  }
}
