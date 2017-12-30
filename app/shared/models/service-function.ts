import { ServiceAction } from './service-action';

export enum ServiceFunctionName {
  INFO = 'info',
  ITEM = 'item',
  BUY = 'buy',
  QUEUE = 'queue'
}

export class ServiceFunction {

  static getInfoFunction(): ServiceFunction {
    return new ServiceFunction(
      ServiceFunctionName.INFO,
      'Info',
      'Shows the basic information of the cardholder',
      '\uf2c1' // fa-id-badge
    );
  }

  static getItemFunction(): ServiceFunction {
    return new ServiceFunction(
      ServiceFunctionName.ITEM,
      'Item',
      'Provide items to users, or show information about an item',
      '\uf0f4' // fa-coffee
    );
  }

  static getBuyFunction(): ServiceFunction {
    return new ServiceFunction(
      ServiceFunctionName.BUY,
      'Buy',
      'Buy products with credits',
      '\uf07a' // fa-shopping-cart
    );
  }

  static getQueueFunction(): ServiceFunction {
    return new ServiceFunction(
      ServiceFunctionName.QUEUE,
      'Queue',
      'Add user to queue',
      '\uf0c0' // fa-users
    );
  }

  private _isStrict: boolean;

  // Instantiation not allowed - Use one of the static objects instead
  protected constructor(
    private _name: ServiceFunctionName,
    private _title: string,
    private _description: string,
    private _iconCode: string
  ) { }

  get iconCode(): string {
    return this._iconCode;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get name(): string {
    return this._name;
  }

  setStrictMode(isStrict: boolean): ServiceFunction {
    this._isStrict = isStrict;

    return this;
  }

  isStrictModeEnabled(): boolean {
    return this._isStrict;
  }

  getServiceActions(): ServiceAction[] {
    switch (this._name) {
      case ServiceFunctionName.BUY:
        return ServiceAction.getBuyActions();
      case ServiceFunctionName.ITEM:
        return ServiceAction.getItemActions();
      case ServiceFunctionName.QUEUE:
        return ServiceAction.getQueueActions();
      case ServiceFunctionName.INFO:
        throw new Error('Info service-function does not have service-actions');
      default:
        throw new Error('Invalid service-function');
    }
  }
}
