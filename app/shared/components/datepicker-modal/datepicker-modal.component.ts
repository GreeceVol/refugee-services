import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { DatePicker } from 'ui/date-picker';
import { Page } from 'ui/page';

export interface IDatepickerModalContext {
  currentDate: Date;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
}

@Component({
  selector: 'DatePickerModal',
  moduleId: module.id,
  templateUrl: './datepicker-modal.component.html',
  styleUrls: ['./datepicker-modal.component.css']
})
export class DatepickerModalComponent implements OnInit {

  private _currentdate: Date;
  private _context: IDatepickerModalContext;

  constructor(
    private _params: ModalDialogParams,
    private _page: Page
  ) {
    this._context = _params.context;
    this._currentdate = (this._context && this._context.currentDate) || new Date();

    this._page.on('unloaded', () => {
      // using the unloaded event to close the modal when there is user interaction
      // e.g. user taps outside the modal page
      this._params.closeCallback();
    });
  }

  ngOnInit() {
    const datePicker: DatePicker = <DatePicker>this._page.getViewById<DatePicker>('datePicker');
    datePicker.year = this._currentdate.getFullYear();
    datePicker.month = this._currentdate.getMonth() + 1;
    datePicker.day = this._currentdate.getDate();
    datePicker.minDate = (this._context && this._context.minDate) || new Date();
    if (this._context && this._context.maxDate) {
      datePicker.maxDate = this._context.maxDate;
    }
  }

  get title(): string {
    return (this._context && this._context.title) || 'Choose a date';
  }

  submit() {
    const datePicker: DatePicker = <DatePicker>this._page.getViewById<DatePicker>('datePicker');
    this._params.closeCallback(datePicker.date);
  }
}
