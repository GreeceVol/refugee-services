export class ServiceFunction {

  static getInfoFunction(): ServiceFunction {
    return new ServiceFunction(
      'info',
      'Info',
      'Shows the basic information of the cardholder',
      '\uf2c1' // fa-id-badge
    );
  }

  static getItemFunction(): ServiceFunction {
    return new ServiceFunction(
      'item',
      'Item',
      'Provide items to users, or show information about an item',
      '\uf0f4' // fa-coffee
    );
  }

  static getBuyFunction(): ServiceFunction {
    return new ServiceFunction(
      'buy',
      'Buy',
      'Buy products with credits',
      '\uf07a' // fa-shopping-cart
    );
  }

  static getQueueFunction(): ServiceFunction {
    return new ServiceFunction(
      'queue',
      'Queue',
      'Add user to queue',
      '\uf0c0' // fa-users
    );
  }

  private _isStrict: boolean;

  // Instantiation not allowed - Use one of the static objects instead
  protected constructor(
    private _name: string,
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
}
