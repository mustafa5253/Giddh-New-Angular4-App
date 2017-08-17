import {
  Component, Input, EventEmitter, Output, OnInit, OnChanges,
  SimpleChanges
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../../store/roots';
import { InvoiceActions } from '../../../../../../services/actions/invoice/invoice.actions';
import { InvoiceTemplatesService } from '../../../../../../services/invoice.templates.service';
@Component({
  selector: 'print-settings',
  templateUrl: 'print.settings.component.html'
})
export class PrintSettingsComponent implements OnInit {

  public top: string;
  public left: string;
  public bottom: string;
  public right: string;

  constructor( private store: Store<AppState>, private invoiceAction: InvoiceActions, private invoiceTemplatesService: InvoiceTemplatesService) {
  }
  public ngOnInit() {
    console.log('design-filters-container initialised');

  }

  public onPageMarginChange(value, margin) {
    if (margin === 'topMargin') {
      this.store.dispatch(this.invoiceAction.setTopPageMargin(value));
    }
    if (margin === 'leftMargin') {
      this.store.dispatch(this.invoiceAction.setLeftPageMargin(value));
    }
    if (margin === 'bottomMargin') {
      this.store.dispatch(this.invoiceAction.setBottomPageMargin(value));
    }
    if (margin === 'rightMargin') {
      this.store.dispatch(this.invoiceAction.setRightPageMargin(value));

    }
  }

}
