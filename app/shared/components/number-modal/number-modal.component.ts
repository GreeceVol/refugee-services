import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { Page } from 'ui/page';

export interface INumberModalContext {
  title?: string;
}

@Component({
  selector: 'NumberModal',
  moduleId: module.id,
  templateUrl: './number-modal.component.html',
  styleUrls: ['./number-modal.component.css']
})
export class NumberModalComponent {

  private _context: INumberModalContext;

  constructor(
    private _params: ModalDialogParams,
    private _page: Page
  ) {
    this._context = _params.context;

    this._page.on('unloaded', () => {
      // using the unloaded event to close the modal when there is user interaction
      // e.g. user taps outside the modal page
      this._params.closeCallback();
    });
  }

  get title(): string {
    return (this._context && this._context.title) || 'Enter a number';
  }

  submit(inputValue: string) {
    this._params.closeCallback(inputValue);
  }
}
