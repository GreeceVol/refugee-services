import { Injectable, ViewContainerRef } from '@angular/core';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import * as dialogs from 'ui/dialogs';

import { DatepickerModalComponent } from '../components/datepicker-modal/datepicker-modal.component';
import { NumberModalComponent } from '../components/number-modal/number-modal.component';
import { Service } from '../models/service';
import { ServiceAction } from '../models/service-action';
import { ServiceFunction } from '../models/service-function';

interface IActionOptions {
  service: Service;
  serviceFunction: ServiceFunction;
  serviceAction: ServiceAction;
  inputValue?: Date | number;
  userHash: string;
  force?: boolean;
}

@Injectable()
export class DialogService {

  constructor(
    private _modalService: ModalDialogService
  ) { }

  showActionDialog(options: dialogs.ActionOptions): Promise<string> {
    return dialogs.action(options);
  }

  showGenericPromptDialog(options: dialogs.PromptOptions): Promise<string> {
    return dialogs.prompt(options)
      .then((result: dialogs.PromptResult) => {
        return result.text;
      });
  }

  showNumericPromptDialog(viewContainerRef: ViewContainerRef): Promise<number> {
    const options: ModalDialogOptions = {
      viewContainerRef,
      fullscreen: false
    };

    return this._modalService.showModal(NumberModalComponent, options) as Promise<number>;
  }

  showDatePromptDialog(viewContainerRef: ViewContainerRef): Promise<Date> {

    const options: ModalDialogOptions = {
      viewContainerRef,
      fullscreen: false
    };

    return this._modalService.showModal(DatepickerModalComponent, options) as Promise<Date>;
  }
}
