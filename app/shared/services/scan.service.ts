import { Injectable, ViewContainerRef } from '@angular/core';
import { BarcodeScanner, ScanResult } from 'nativescript-barcodescanner';
import { Observer } from 'rxjs';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import * as dialogs from 'ui/dialogs';

import { Api } from '../constants/api.constants';
import { Service } from '../models/service';
import { ServiceAction, ServiceActionName } from '../models/service-action';
import { ServiceFunction, ServiceFunctionName } from '../models/service-function';
import { User } from '../models/user';
import { DialogService } from '../services/dialog.service';
import { NetworkService } from '../services/network.service';

export interface IScanParams {
  service: Service;
  serviceFunction: ServiceFunction;
  serviceAction: ServiceAction;
  userHash: string;
  inputValue?: Date | number;
  force?: boolean;
}

export enum ScanError {
  INVALID_SERVICE = 'Invalid service',
  INVALID_SERVICE_FUNCTION = 'Invalid service function',
  INVALID_SERVICE_ACTION = 'Invalid service action',
  INVALID_ADDITIONAL_INPUT = 'The selected action requires user input',
  INVALID_QR_CODE = 'The scanned QR code is invalid',
  QR_CODE_REQUIRED = 'QR code missing',
  QUEUE_ADD_DATE_REQUIRED = 'Date is required to add users to the queue',
  BUY_BUY_PRICE_REQUIRED = 'The price of the product is required'
}

@Injectable()
export class ScanService {

  private _barcodeScanner: BarcodeScanner;

  constructor(
    private _dialogService: DialogService,
    private _networkService: NetworkService
  ) {
    this._barcodeScanner = new BarcodeScanner();
  }

  performScanAction(service: Service, serviceFunction: ServiceFunction, serviceAction: ServiceAction | null, inputValue?: Date | number, userHash?: string): Observable<IScanParams> {

    if (!service) {
      return Observable.throw(ScanError.INVALID_SERVICE);
    }

    if (!serviceFunction) {
      return Observable.throw(ScanError.INVALID_SERVICE_FUNCTION);
    }

    if (inputValue == null && this._needsAdditionalInput(service, serviceFunction, serviceAction)) {
      return Observable.throw(ScanError.INVALID_ADDITIONAL_INPUT);
    }

    if (!userHash) {
      return Observable.throw(ScanError.QR_CODE_REQUIRED);
    }

    const params: IScanParams = {
      service,
      serviceFunction,
      serviceAction,
      inputValue,
      userHash,
      force: false
    };

    return new Observable((observer: Observer<IScanParams>) => {
      const sendParamsAndCompleteObserver: (value: IScanParams) => void = (loopModeParams: IScanParams) => {
        observer.next(loopModeParams);
        observer.complete();
      };

      this._performActionRequest(params)
        .delay(200)
        .subscribe(
        (resp: any) => {
          this._handleSuccessResponse(params, resp).then(sendParamsAndCompleteObserver);
        },
        (err: any) => {
          new Promise((resolve: any) => setTimeout(resolve, 200))
            .then(() => this._handleErrorResponse(params, err))
            .then(sendParamsAndCompleteObserver);
        }
        );
    });
  }

  requestAdditionalInput(service: Service, serviceFunction: ServiceFunction, serviceAction: ServiceAction, viewContainerRef: ViewContainerRef): Promise<Date | number> {
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
        }
      }

      return inputPromise.then((addlInput: Date | number) => {
        if (serviceFunction.name === ServiceFunctionName.QUEUE && !(addlInput instanceof Date)) {
          throw new Error(ScanError.QUEUE_ADD_DATE_REQUIRED);
        } else if (serviceFunction.name === ServiceFunctionName.BUY && (Number.isNaN(addlInput as number) || typeof addlInput !== 'number')) {
          throw new Error(ScanError.BUY_BUY_PRICE_REQUIRED);
        }

        return addlInput;
      }).catch((err: any) => {
        if (err && err.message) {
          switch (err.message) {
            case ScanError.QUEUE_ADD_DATE_REQUIRED:
            case ScanError.BUY_BUY_PRICE_REQUIRED:
              return dialogs.alert({
                title: ScanError.QUEUE_ADD_DATE_REQUIRED ? 'Date required' : 'Price required',
                message: err.message,
                okButtonText: 'OK'
              }).then(() => {
                throw err;
              });
          }
        }
      });
    }
  }

  showScanner(service: Service, serviceFunction: ServiceFunction, serviceAction: ServiceAction | null): Promise<string> {
    return this._barcodeScanner.scan({
      formats: 'QR_CODE',
      beepOnScan: true,
      showTorchButton: true,
      preferFrontCamera: false,
      reportDuplicates: true,
      resultDisplayDuration: 0,
      message: `${service.serviceName} (${serviceFunction.title}` + (serviceAction ? ` - ${serviceAction.name} mode)` : ` mode)`)
    }).then((res: ScanResult) => {
      const userHash = res && res.text;
      if (!userHash) {
        throw new Error(ScanError.INVALID_QR_CODE);
      }

      return userHash;
    });
  }

  private _needsAdditionalInput(service: Service, func: ServiceFunction, action: ServiceAction) {
    const isQueueAndHasTimeSlot = service.hasTimeSlot && func.name === ServiceFunctionName.QUEUE && action.name === ServiceActionName.ADD;
    const isBuy = func.name === ServiceFunctionName.BUY && action.name === ServiceActionName.BUY;

    return isQueueAndHasTimeSlot || isBuy;
  }

  private _performActionRequest(params: IScanParams) {
    const { service, serviceFunction, serviceAction, inputValue, userHash, force } = params;
    const actionURL = `${this._getURL(service, serviceFunction, serviceAction)}/services/${service.ID}/users/${userHash}${!!force ? '/?option=force' : ''}`;

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

    return this._networkService.authPost(actionURL, body);
  }

  private _handleSuccessResponse(params: IScanParams, resp: any): Promise<IScanParams | null> {
    const { service, serviceFunction, serviceAction, inputValue, userHash } = params;
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
            break;

          case ServiceActionName.CHECK:
            successPromise = dialogs.confirm({
              title: 'Check success',
              message: resp.message,
              okButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            });
            break;
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

      case ServiceFunctionName.BUY:
        switch (serviceAction.name) {
          case ServiceActionName.INFO:
            successPromise = dialogs.alert({
              title: 'Credits Info',
              message: resp.message,
              okButtonText: 'OK'
            });
            break;

          case ServiceActionName.BUY:
            successPromise = dialogs.confirm({
              title: 'Buy (success)',
              message: `${resp.message}\nRemaining credits: ${resp.remainingCredits}`,
              okButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            });
        }
        break;

      case ServiceFunctionName.ITEM:
        switch (serviceAction.name) {
          case ServiceActionName.INFO:
            successPromise = dialogs.alert({
              title: 'User info for item',
              message: `${resp.message}`,
              okButtonText: 'OK'
            });
            break;

          case ServiceActionName.ADD:
            successPromise = dialogs.confirm({
              title: 'Add item',
              message: `${resp.message}`,
              okButtonText: 'Continue',
              cancelButtonText: 'Cancel'
            });
            break;

          case ServiceActionName.CORRECT:
            successPromise = dialogs.alert({
              title: 'Correct item (success)',
              message: resp.message,
              okButtonText: 'OK'
            });
        }
        break;

      default:
        successPromise = dialogs.alert({
          title: 'Success',
          message: `This function is not yet implemented. The HTTP success message (if any) is ${resp.message}\n\n\nFull JSON response:\n${JSON.stringify(resp, null, 2)}`
        });
    }

    return successPromise.then((shouldContinue: boolean) => {
      if (!shouldContinue || !serviceAction) {
        return null;
      }

      const loopModeParams: IScanParams = {
        service,
        serviceFunction,
        serviceAction,
        inputValue,
        userHash: null
      };

      if (serviceAction.name === ServiceActionName.BUY) {
        loopModeParams.inputValue = null;
      }

      return loopModeParams;
    });
  }

  private _handleErrorResponse(params: IScanParams, err: any): Promise<IScanParams | null | void> {
    const { service, serviceFunction, serviceAction, inputValue, userHash } = params;
    let body;
    try {
      body = err.status < 500 ? err.json() : null;
    } catch (ex) {
      body = null;
    }

    const defaultLoopParams: IScanParams = {
      service,
      serviceFunction,
      serviceAction,
      inputValue,
      userHash: null
    };

    const continueWithDefaultLoopParams = (shouldContinue: boolean) => shouldContinue && defaultLoopParams;

    switch (serviceFunction.name) {
      case ServiceFunctionName.QUEUE:
        switch (serviceAction.name) {
          case ServiceActionName.ADD:
            switch (err.status) {
              case 500:
                return this._showGenericErrorAlert();

              default:
                return dialogs.confirm({
                  title: 'Add to queue',
                  message: body.message,
                  okButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then(continueWithDefaultLoopParams);
            }

          case ServiceActionName.INFO:
            switch (err.status) {
              case 404:
                return dialogs.confirm({
                  title: 'Not in queue',
                  message: 'The user is not in the queue',
                  okButtonText: 'Add to queue',
                  cancelButtonText: 'OK',
                  neutralButtonText: 'Cancel'
                }).then((shouldAddToQueue: boolean) => {
                  if (shouldAddToQueue) {
                    return {
                      service,
                      serviceFunction,
                      serviceAction: ServiceAction.QUEUE_ADD_ACTION,
                      inputValue,
                      userHash
                    };
                  }

                  return null;
                });
            }
            break;

          case ServiceActionName.CHECK:
            switch (err.status) {
              case 403:
                return dialogs.confirm({
                  title: 'Not in queue',
                  message: 'The user is not in the queue',
                  okButtonText: 'Add to queue',
                  cancelButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then((shouldAddToQueue: boolean) => {
                  if (shouldAddToQueue) {
                    return {
                      service,
                      serviceFunction,
                      serviceAction: ServiceAction.QUEUE_ADD_ACTION,
                      inputValue,
                      userHash
                    };
                  } else if (shouldAddToQueue === false) {
                    return defaultLoopParams;
                  }
                });

              case 410:
                return dialogs.confirm({
                  title: 'Queue check failed',
                  message: body.message,
                  okButtonText: 'Continue',
                  neutralButtonText: 'Cancel'
                }).then(continueWithDefaultLoopParams);
            }
            break;

          case ServiceActionName.CORRECT:
            switch (err.status) {
              case 404:
                return dialogs.alert({
                  title: 'Correct error',
                  message: 'User not found in queue. Nothing to correct!',
                  okButtonText: 'OK'
                });
            }
            break;
        }
        break;

      case ServiceFunctionName.BUY:
        switch (serviceAction.name) {
          case ServiceActionName.BUY:
            switch (err.status) {
              case 404:
                return dialogs.alert({
                  title: 'Buy error',
                  message: `${body.message}\nAvailable credits: ${body.availableCredits}`,
                  okButtonText: 'OK'
                });

              default:
                return dialogs.alert({
                  title: 'Buy error',
                  message: `Unable to complete purchase of item. Possibly insufficient credits?\n${body ? body.message : ''}`,
                  okButtonText: 'OK'
                });
            }

          case ServiceActionName.INFO:
            return dialogs.alert({
              title: 'Credits info error',
              message: body.message,
              okButtonText: 'OK'
            });
        }
        break;

      case ServiceFunctionName.ITEM:
        switch (serviceAction.name) {
          case ServiceActionName.ADD:
            return dialogs.alert({
              title: 'Add item error',
              message: body.message,
              okButtonText: 'OK'
            });

          case ServiceActionName.CORRECT:
            return dialogs.alert({
              title: 'Correct item error',
              message: body.message,
              okButtonText: 'OK'
            });
        }
        break;

      default:
        return dialogs.alert({
          title: 'Error (not implemented)',
          message: `Error handling for this function is not yet implemented. The error message (if any) is ${(body && body.message) || ''}\n\n\nFull JSON response:\n${JSON.stringify(body, null, 2)}`,
          okButtonText: 'OK'
        });
    }
  }

  private _showGenericErrorAlert(err?: { message?: string }) {
    return dialogs.alert({
      title: 'Error',
      message: `Error completing that action. Please try again later${err && err.message ? `\n${err.message}` : ''}`,
      okButtonText: 'OK'
    });
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
