import { Injectable, ViewContainerRef } from '@angular/core';
import { BarcodeScanner, ScanResult } from 'nativescript-barcodescanner';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/zip';
import { Observable } from 'rxjs/Observable';
import * as dialogs from 'ui/dialogs';

import { Api } from '../constants/api.constants';
import { Service } from '../models/service';
import { ServiceAction, ServiceActionName } from '../models/service-action';
import { ServiceFunction, ServiceFunctionName } from '../models/service-function';
import { User } from '../models/user';
import { DialogService } from '../services/dialog.service';
import { NetworkService } from '../services/network.service';

interface IScanParams {
  service: Service;
  serviceFunction: ServiceFunction;
  serviceAction: ServiceAction;
  userHash: string;
  viewContainerRef: ViewContainerRef;
  inputValue?: Date | number;
  force?: boolean;
}

export enum ScanError {
  INVALID_SERVICE = 'Invalid service',
  INVALID_SERVICE_FUNCTION = 'Invalid service function',
  INVALID_SERVICE_ACTION = 'Invalid service action',
  INVALID_ADDITIONAL_INPUT_REQUEST = 'The selected action does not require additional user input',
  QUEUE_ADD_DATE_REQUIRED = 'Date is required to add users to the queue',
  BUY_BUY_PRICE_REQUIRED = 'The price of the product is required'
}

@Injectable()
export class ScanService {

  constructor(
    private _dialogService: DialogService,
    private _barcodeScanner: BarcodeScanner,
    private _networkService: NetworkService
  ) { }
  startScan(service: Service, serviceFunction: ServiceFunction, viewContainerRef: ViewContainerRef, servAction?: ServiceAction, inpValue?: Date | number, userHash?: string) {

    if (!service) {
      throw new Error(ScanError.INVALID_SERVICE);
    }

    if (!serviceFunction) {
      throw new Error(ScanError.INVALID_SERVICE_FUNCTION);
    }

    (servAction ? Promise.resolve(servAction) : this._chooseServiceAction(serviceFunction))
      .then((serviceAction: ServiceAction) => {
        return (inpValue ? Promise.resolve(inpValue) : this._requestAdditionalInput(service, serviceFunction, serviceAction, viewContainerRef))
          .then(
          (inputValue: Date | number): IScanParams => ({
            service,
            serviceFunction,
            serviceAction,
            inputValue,
            viewContainerRef,
            userHash: userHash || null,
            force: false
          }),
          (err: any) => {
            if (err && err.message) {
              switch (err.message) {
                case ScanError.INVALID_ADDITIONAL_INPUT_REQUEST:
                  return dialogs.alert({
                    title: 'Error',
                    message: 'The selected action does not require additional user input',
                    okButtonText: 'OK'
                  }).then(() => err);
                case ScanError.QUEUE_ADD_DATE_REQUIRED:
                case ScanError.BUY_BUY_PRICE_REQUIRED:
                  return dialogs.alert({
                    title: ScanError.QUEUE_ADD_DATE_REQUIRED ? 'Date required' : 'Price required',
                    message: err.message,
                    okButtonText: 'OK'
                  }).then(() => err);
              }
            }
          }
          );
      })
      .then((params: IScanParams) => params.userHash ? this._performActionRequest(params) : this._showScanner(params));
  }

  private _chooseServiceAction(serviceFunction: ServiceFunction): Promise<ServiceAction> {
    if (serviceFunction.name === ServiceFunctionName.INFO) {
      return Promise.resolve(null);
    }

    const serviceActions = serviceFunction.getServiceActions();

    return this._dialogService.showActionDialog({
      title: serviceFunction.title,
      message: `Choose ${serviceFunction.title} action`,
      cancelButtonText: 'Cancel',
      actions: serviceActions.map((it: ServiceAction) => it.title)
    }).then((selectedTitle: string): ServiceAction => {
      if (!selectedTitle || selectedTitle === 'Cancel') {
        throw new Error(ScanError.INVALID_SERVICE_ACTION);
      }

      const selectedServiceAction = serviceActions.find((action: ServiceAction) => action.title === selectedTitle);

      return selectedServiceAction;
    });
  }

  private _needsAdditionalInput(service: Service, func: ServiceFunction, action: ServiceAction) {
    const isQueueAndHasTimeSlot = service.hasTimeSlot && func.name === ServiceFunctionName.QUEUE && action.name === ServiceActionName.ADD;
    const isBuy = func.name === ServiceFunctionName.BUY && action.name === ServiceActionName.BUY;

    return isQueueAndHasTimeSlot || isBuy;
  }

  private _requestAdditionalInput(service: Service, serviceFunction: ServiceFunction, serviceAction: ServiceAction, viewContainerRef: ViewContainerRef): Promise<Date | number> {
    {
      const needsAdditionalInput = this._needsAdditionalInput(service, serviceFunction, serviceAction);
      if (!needsAdditionalInput) {
        return Promise.resolve(null);
      }

      let inputPromise: Promise<Date | number>;
      if (needsAdditionalInput) {
        switch (serviceFunction.name) {
          case ServiceFunctionName.QUEUE:
            inputPromise = this._dialogService.showDatePromptDialog(viewContainerRef);
            break;

          case ServiceFunctionName.BUY:
            inputPromise = this._dialogService.showNumericPromptDialog(viewContainerRef);
            break;

          default:
            throw new Error(ScanError.INVALID_ADDITIONAL_INPUT_REQUEST);
        }
      }

      return inputPromise.then((addlInput: Date | number) => {
        if (serviceFunction.name === ServiceFunctionName.QUEUE && !(addlInput instanceof Date)) {
          throw new Error(ScanError.QUEUE_ADD_DATE_REQUIRED);
        } else if (serviceFunction.name === ServiceFunctionName.BUY && (typeof addlInput !== 'number')) {
          throw new Error(ScanError.BUY_BUY_PRICE_REQUIRED);
        }

        return addlInput;
      });
    }
  }

  private _showScanner(params: IScanParams): void {
    this._barcodeScanner.scan({
      formats: 'QR_CODE',
      beepOnScan: true,
      showTorchButton: true,
      preferFrontCamera: false,
      continuousScanCallback: (res: ScanResult) => this._processScan({
        service: params.service,
        serviceFunction: params.serviceFunction,
        serviceAction: params.serviceAction,
        inputValue: params.inputValue,
        viewContainerRef: params.viewContainerRef,
        userHash: res && res.text ? res.text : null
      }),
      reportDuplicates: true,
      message: `${params.service.serviceName} (${params.serviceFunction.title}` + (params.serviceAction ? ` - ${params.serviceAction.name} mode)` : ` mode)`)
    });
  }

  private _processScan(params: IScanParams): void {
    const { service, serviceFunction, viewContainerRef, serviceAction, inputValue, userHash } = params;
    if (!userHash) {
      dialogs.confirm({
        title: 'Invalid QR code',
        message: 'The scanned QR code is invalid',
        okButtonText: 'Scan another',
        neutralButtonText: 'Cancel'
      }).then((shouldContinue: boolean) => {
        if (shouldContinue) {
          this.startScan(service, serviceFunction, viewContainerRef, serviceAction, inputValue);
        }
      });

      return;
    }

    this._performActionRequest(params);
  }

  private _performActionRequest(params: IScanParams) {
    const { service, serviceFunction, serviceAction, inputValue, userHash, force } = params;
    const actionURL = `${this._getURL(service, serviceFunction, serviceAction)}/services/${service.ID}/users/${userHash}${!!force ? '/?option=force' : ''}`;

    // Observable.from expects the promise to be resolved with a value to work correctly
    // Since barcodeScanner.stop() resolves with null, a non-null value (never used) is returned.
    const stopScannerPromise = this._barcodeScanner.stop().then(() => actionURL);

    let body = null;
    if (this._needsAdditionalInput(service, serviceFunction, serviceAction)) {
      switch (serviceFunction.name) {
        case ServiceFunctionName.QUEUE:
          const inputDate = inputValue as Date;
          body = {
            date: `${inputDate.getFullYear()}-${inputDate.getMonth() + 1}-${inputDate.getDay()}`
          };
          break;

        case ServiceFunctionName.BUY:
          body = {
            price: inputValue as number
          };
          break;

      }
    }

    return Observable.zip(
      Observable.from(stopScannerPromise), this._networkService.authPost(actionURL, body)
    )
      .subscribe(
      (resp: any[]) => this._handleSuccessResponse(params, resp[1]),
      (err: any) => this._handleErrorResponse(params, err)
      );
  }

  private _handleSuccessResponse(params: IScanParams, resp: any) {
    const { service, serviceFunction, serviceAction, inputValue, userHash, viewContainerRef } = params;
    let successPromise = Promise.resolve(null);
    switch (serviceFunction.name) {
      case ServiceFunctionName.QUEUE:
        switch (serviceAction.name) {
          case ServiceActionName.ADD:
            successPromise = dialogs.confirm({
              title: 'Added to queue',
              message: resp.message,
              okButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            });
            break;

          case ServiceActionName.INFO:
            successPromise = dialogs.confirm({
              title: 'Queue Info',
              message: resp.message,
              okButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            });
            break;

          case ServiceActionName.CORRECT:
            successPromise = this._barcodeScanner.stop().then(() => {
              return dialogs.alert({
                title: 'Correct queue',
                message: resp.message,
                okButtonText: 'Continue'
              });
            });
        }
        break;

      case ServiceFunctionName.INFO:
        const user = new User(resp);
        const strParts: string[] = [];

        strParts.push(`Name: ${user.name || 'Unknown'}`);

        if (user.country) {
          strParts.push(`Country: ${user.country}`);
        }
        if (user.gender) {
          strParts.push(`Gender: ${user.gender}`);
        }

        if (user.hash) {
          strParts.push(`Hash: ${user.hash}`);
        }

        successPromise = dialogs.confirm({
          title: 'User Info',
          message: strParts.join('\n'),
          okButtonText: 'Continue',
          cancelButtonText: 'Cancel'
        });
        break;

      default:
        successPromise = dialogs.alert({
          title: 'Success (not implemented)',
          message: `This function is not yet implemented. The HTTP success message (if any) is ${resp.message}\n\n\nFull JSON response:\n${JSON.stringify(resp, null, 2)}`
        });
    }

    successPromise.then((shouldContinue: boolean) => {
      if (shouldContinue && (!serviceAction || (serviceAction.name !== ServiceActionName.CORRECT))) {
        this._showScanner(params);
      }
    });
  }

  private _handleErrorResponse(params: IScanParams, err: any) {
    const { service, serviceFunction, serviceAction, inputValue, userHash, viewContainerRef } = params;
    const body = err.json();
    switch (serviceFunction.name) {
      case ServiceFunctionName.QUEUE:
        switch (serviceAction.name) {
          case ServiceActionName.ADD:
            switch (err.status) {
              case 403:
                dialogs.confirm({
                  title: 'Already in queue',
                  message: body.message,
                  okButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then((shouldContinue: boolean) => {
                  if (shouldContinue) {
                    this.startScan(service, serviceFunction, viewContainerRef, serviceAction, inputValue);
                  }
                });
                break;

              case 404:
                dialogs.confirm({
                  title: 'Not found',
                  message: body.message,
                  okButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then((shouldContinue: boolean) => {
                  if (shouldContinue) {
                    this.startScan(service, serviceFunction, viewContainerRef, serviceAction, inputValue);
                  }
                });
                break;

              default:
                dialogs.alert({
                  title: 'Not implemented',
                  message: `Error handling for this function is not yet implemented. The error message (if any) is ${body.message}`
                });
            }
            break;

          case ServiceActionName.INFO:
            switch (err.status) {
              case 404:
                dialogs.confirm({
                  title: 'Not in queue',
                  message: 'The user is not in the queue',
                  okButtonText: 'Add to queue',
                  cancelButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then((shouldAddToQueue: boolean) => {
                  if (shouldAddToQueue) {
                    this.startScan(service, serviceFunction, viewContainerRef, ServiceAction.QUEUE_ADD_ACTION, inputValue, userHash);
                  } else if (shouldAddToQueue === false) {
                    this._showScanner(params);
                  }
                });
                break;

              default:
                dialogs.alert({
                  title: 'Not implemented',
                  message: `Error handling for this function is not yet implemented. The error message (if any) is ${body.message}`
                });
            }
            break;

          default:
            dialogs.alert({
              title: 'Not implemented',
              message: `Error handling for this function is not yet implemented. The error message (if any) is ${body.message}`
            });
        }
        break;

      default:
        dialogs.alert({
          title: 'Error (not implemented)',
          message: `Error handling for this function is not yet implemented. The error message (if any) is ${body.message}\n\n\nFull JSON response:\n${JSON.stringify(body, null, 2)}`
        });
    }
  }

  private _getURL(service: Service, serviceFunction: ServiceFunction, action: ServiceAction): string {
    switch (serviceFunction.name) {
      case ServiceFunctionName.INFO:
        return Api.INFO_URL;
      case ServiceFunctionName.ITEM:
        switch (action.name) {
          case ServiceActionName.ADD:
            return Api.ITEM_ADD_URL;
          case ServiceActionName.INFO:
            return Api.ITEM_INFO_URL;
          case ServiceActionName.CORRECT:
            return Api.ITEM_CORRECT_URL;
          default:
            throw new Error(`Unsupported/invalid service action name "${action.name}" for service function "${serviceFunction.name}"`);
        }
      case ServiceFunctionName.BUY:
        switch (action.name) {
          case ServiceActionName.BUY:
            return Api.BUY_BUY_URL;
          case ServiceActionName.INFO:
            return Api.BUY_INFO_URL;
          default:
            throw new Error(`Unsupported/invalid service action name "${action.name}" for service function "${serviceFunction.name}"`);
        }
      case ServiceFunctionName.QUEUE:
        switch (action.name) {
          case ServiceActionName.ADD:
            return Api.QUEUE_ADD_URL;
          case ServiceActionName.INFO:
            return Api.QUEUE_INFO_URL;
          case ServiceActionName.CORRECT:
            return Api.QUEUE_CORRECT_URL;
          case ServiceActionName.CHECK:
            return Api.QUEUE_CHECK_URL;
          default:
            throw new Error(`Unsupported/invalid service action name "${action.name}" for service function "${serviceFunction.name}"`);
        }
      default:
        throw new Error(`Unsupported/invalid service function: "${serviceFunction.name}"`);
    }
  }
}
