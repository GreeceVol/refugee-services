export enum ServiceActionName {
  ADD = 'add',
  INFO = 'info',
  CORRECT = 'correct',
  CHECK = 'check',
  LIST = 'list',
  BUY = 'buy'
}

export class ServiceAction {

  static QUEUE_ADD_ACTION = new ServiceAction(ServiceActionName.ADD, 'Add to queue');
  static QUEUE_INFO_ACTION = new ServiceAction(ServiceActionName.INFO, 'Show info of user in queue');
  static QUEUE_CORRECT_ACTION = new ServiceAction(ServiceActionName.CORRECT, 'Correct/remove from queue');
  static QUEUE_CHECK_ACTION = new ServiceAction(ServiceActionName.CHECK, 'Check if user has access to queue');
  static QUEUE_LIST_ACTION = new ServiceAction(ServiceActionName.LIST, 'List users in queue');

  static BUY_BUY_ACTION = new ServiceAction(ServiceActionName.BUY, 'Buy with credits');
  static BUY_INFO_ACTION = new ServiceAction(ServiceActionName.INFO, 'Show available credits');

  static ITEM_ADD_ACTION = new ServiceAction(ServiceActionName.ADD, 'Get item(s) from service');
  static ITEM_INFO_ACTION = new ServiceAction(ServiceActionName.INFO, 'Show user info for items');
  static ITEM_CORRECT_ACTION = new ServiceAction(ServiceActionName.CORRECT, 'Correct last item');

  static getQueueActions(): ServiceAction[] {
    return [
      ServiceAction.QUEUE_ADD_ACTION,
      ServiceAction.QUEUE_INFO_ACTION,
      ServiceAction.QUEUE_CORRECT_ACTION,
      ServiceAction.QUEUE_CHECK_ACTION,
      ServiceAction.QUEUE_LIST_ACTION
    ];
  }

  static getBuyActions(): ServiceAction[] {
    return [
      ServiceAction.BUY_BUY_ACTION,
      ServiceAction.BUY_INFO_ACTION
    ];
  }

  static getItemActions(): ServiceAction[] {
    return [
      ServiceAction.ITEM_ADD_ACTION,
      ServiceAction.ITEM_INFO_ACTION,
      ServiceAction.ITEM_CORRECT_ACTION
    ];
  }

  // Instantiation not allowed - Use one of the static objects instead
  private constructor(
    private _name: ServiceActionName,
    private _title: string
  ) { }

  get title(): string {
    return this._title;
  }

  get name(): string {
    return this._name;
  }

}
