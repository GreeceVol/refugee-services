import { DayOfWeek } from './day-of-week';
import { FrequencyUnit } from './frequency-unit';
import { ServiceFunction } from './service-function';

export class Service {
  ID: number;
  organisationID: number;
  serviceName: string;
  description: string;

  hasAdd: boolean;
  hasAddStrict: boolean;
  hasQueue: boolean;
  hasQueueStrict: boolean;
  hasBuy: boolean;
  hasTimeSlot: boolean;

  freqItems: number;
  freqAmount: number;
  freqUnit: FrequencyUnit;
  freqFirstDayOfWeek: DayOfWeek;

  timeSlotFrequency: number;
  timeSlotsPerDay: number;
  timeSlotGrace: number;

  currencyGroup: string;

  constructor(obj: any) {
    if (!obj) {
      return;
    }

    if (obj.hasOwnProperty('ID')) {
      this.ID = obj.ID;
    }

    if (obj.hasOwnProperty('organisationID')) {
      this.organisationID = obj.organisationID;
    }

    if (obj.hasOwnProperty('serviceName')) {
      this.serviceName = obj.serviceName;
    }

    if (obj.hasOwnProperty('description')) {
      this.description = obj.description;
    }

    if (obj.hasOwnProperty('hasAdd')) {
      this.hasAdd = obj.hasAdd;
    }

    if (obj.hasOwnProperty('hasAddStrict')) {
      this.hasAddStrict = obj.hasAddStrict;
    }

    if (obj.hasOwnProperty('hasQueue')) {
      this.hasQueue = obj.hasQueue;
    }

    if (obj.hasOwnProperty('hasQueueStrict')) {
      this.hasQueueStrict = obj.hasQueueStrict;
    }

    if (obj.hasOwnProperty('hasBuy')) {
      this.hasBuy = obj.hasBuy;
    }

    if (obj.hasOwnProperty('hasTimeSlot')) {
      this.hasTimeSlot = obj.hasTimeSlot;
    }

    if (obj.hasOwnProperty('freqItems')) {
      this.freqItems = obj.freqItems;
    }

    if (obj.hasOwnProperty('freqAmount')) {
      this.freqAmount = obj.freqAmount;
    }

    if (obj.hasOwnProperty('freqUnit')) {
      this.freqUnit = obj.freqUnit;
    }

    if (obj.hasOwnProperty('freqFirstDayOfWeek')) {
      this.freqFirstDayOfWeek = obj.freqFirstDayOfWeek;
    }

    if (obj.hasOwnProperty('timeSlotFrequency')) {
      this.timeSlotFrequency = obj.timeSlotFrequency;
    }

    if (obj.hasOwnProperty('timeSlotsPerDay')) {
      this.timeSlotsPerDay = obj.timeSlotsPerDay;
    }

    if (obj.hasOwnProperty('timeSlotGrace')) {
      this.timeSlotGrace = obj.timeSlotGrace;
    }

    if (obj.hasOwnProperty('currencyGroup')) {
      this.currencyGroup = obj.currencyGroup;
    }
  }

  getServiceFunctions(): ServiceFunction[] {
    const serviceFunctions: ServiceFunction[] = [];

    if (this.hasAdd) {
      const itemFunction = ServiceFunction
        .getItemFunction()
        .setStrictMode(!!this.hasAddStrict);
      serviceFunctions.push(itemFunction);
    }

    if (this.hasBuy) {
      serviceFunctions.push(ServiceFunction.getBuyFunction());
    }

    if (this.hasQueue) {
      const queueFunction = ServiceFunction
        .getQueueFunction()
        .setStrictMode(!!this.hasQueueStrict);
      serviceFunctions.push(queueFunction);
    }

    return serviceFunctions;
  }
}
