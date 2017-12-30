export class Api {

  static BASE_URL = 'https://greecevol.info/api';
  private static _ITEM_BASE_URL = Api.BASE_URL + '/item';
  private static _BUY_BASE_URL = Api.BASE_URL + '/buy';
  private static _QUEUE_BASE_URL = Api.BASE_URL + '/queue';

  static LOGIN_URL = Api.BASE_URL + '/vol/login';

  static LIST_URL = Api.BASE_URL + '/list';

  static INFO_URL = Api.BASE_URL + '/info';

  static ITEM_ADD_URL = Api._ITEM_BASE_URL + '/add';
  static ITEM_INFO_URL = Api._ITEM_BASE_URL + '/info';
  static ITEM_CORRECT_URL = Api._ITEM_BASE_URL + '/correct';

  static BUY_BUY_URL = Api._BUY_BASE_URL + '/buy';
  static BUY_INFO_URL = Api._BUY_BASE_URL + '/info';

  static QUEUE_ADD_URL = Api._QUEUE_BASE_URL + '/add';
  static QUEUE_INFO_URL = Api._QUEUE_BASE_URL + '/info';
  static QUEUE_CORRECT_URL = Api._QUEUE_BASE_URL + '/correct';
  static QUEUE_CHECK_URL = Api._QUEUE_BASE_URL + '/check';

}
