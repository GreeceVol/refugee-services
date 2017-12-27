import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Service } from '../../models/service';

@Component({
  selector: 'ServiceList',
  moduleId: module.id,
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent {

  @Output() onServiceItemTap = new EventEmitter();

  @Input() services: Service[];

  selectService(service: Service) {
    this.onServiceItemTap.emit({
      service
    });
  }
}
