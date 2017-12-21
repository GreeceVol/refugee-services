import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListViewEventData } from 'nativescript-pro-ui/listview';
import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';

import { Key } from '../../constants/key.constants';
import { Service } from '../../models/service';
import { ServiceService } from '../../services/service.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'ServiceList',
  moduleId: module.id,
  templateUrl: './service-list.component.html',
  providers: [ServiceService],
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {
  private static MILLIS_IN_A_DAY = 24 * 60 * 60 * 1000;

  @Output() onUnauthorized = new EventEmitter<void>();
  @Output() onServiceItemTap = new EventEmitter();

  services: Service[];

  constructor(
    private _serviceService: ServiceService,
    private _storageService: StorageService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const lastUpdatedTimestamp = this._storageService.getNumber(Key.SERVICE_LIST_LAST_UPDATED_TIME);
    if (!lastUpdatedTimestamp || (lastUpdatedTimestamp - Date.now()) >= ServiceListComponent.MILLIS_IN_A_DAY) {
      this._getServiceList();
    } else {
      try {
        this.services = JSON.parse(this._storageService.getString(Key.SERVICE_LIST, null));
      } catch (ex) {
        this._getServiceList();
      }
    }
    this._changeDetectorRef.detectChanges();
  }

  onPullToRefreshInitiated(args: ListViewEventData) {
    this._serviceService.getList()
      .finally(() => {
        const listView = args.object;
        listView.notifyPullToRefreshFinished();
      })
      .subscribe(this._updateServices, this._handleErrors);
  }

  selectService(service: Service) {
    this.onServiceItemTap.emit({
      service
    });
  }

  private _getServiceList(): void {
    this._serviceService.getList()
      .subscribe(this._updateServices, this._handleErrors);
  }

  private _updateServices(data: Service[]): void {
    this.services = data;
  }

  private _handleErrors(err): void {
    if (err.status === 401) {
      this.onUnauthorized.emit();
    }
  }
}
