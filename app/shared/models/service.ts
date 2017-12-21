import { DayOfWeek } from './day-of-week';
import { FrequencyUnit } from './frequency-unit';

export class Service {
  ID: string;
  organisationID: string;
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
}
