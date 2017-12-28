import { GIDDH_DATE_FORMAT } from './../../shared/helpers/defaultDateFormat';
import { CreatedBy } from './../../models/api-models/Invoice';
import { IParticular } from './../../models/api-models/Ledger';
import { setTimeout } from 'timers';
import { VsForDirective } from './../../theme/ng2-vs-for/ng2-vs-for';
import { ToasterService } from './../../services/toaster.service';
import { KeyboardService } from './../keyboard.service';
import { BlankLedgerVM } from './../../ledger/ledger.vm';
import { LedgerActions } from './../../actions/ledger/ledger.actions';
import { IOption } from './../../theme/ng-select/option.interface';
import { AccountService } from './../../services/account.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/roots';
import { Component, OnInit, ViewChild, OnDestroy, ViewChildren, QueryList, transition } from '@angular/core';
import { Location } from '@angular/common';
import { createSelector } from 'reselect';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})

export class PurchaseComponent implements OnInit, OnDestroy {

  @ViewChildren(VsForDirective) public columnView: QueryList<VsForDirective>;

  public accounts$: Observable<IOption[]>;
  public accounts: IOption[] = [];
  public allAccounts: IOption[] = [];
  public showLedgerAccountList: boolean = false;
  public selectedInput: 'by' | 'to' = null;
  public totalCreditAmount: number = 0;
  public totalDebitAmount: number = 0;
  public showSubmitButtonBox: boolean = false;
  public moment = moment;
  public purchaseRequestObject: BlankLedgerVM = new BlankLedgerVM();

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private _accountService: AccountService,
    private _ledgerActions: LedgerActions,
    private store: Store<AppState>,
    private _keyboardService: KeyboardService,
    private _toaster: ToasterService) {
      this.purchaseRequestObject.voucherType = 'pur';
      this.purchaseRequestObject.entryDate = moment().format(GIDDH_DATE_FORMAT);
      this.purchaseRequestObject.transactions = [];
  }

  public ngOnInit() {
    this._accountService.GetFlattenAccounts('', '').takeUntil(this.destroyed$).subscribe(data => {
      if (data.status === 'success') {
        let accounts: IOption[] = [];
        data.body.results.map(d => {
          accounts.push({ label: `${d.name} (${d.uniqueName})`, value: d.uniqueName });
        });
        this.accounts = this.allAccounts = accounts;
      }
    });

    // this._keyboardService.keyInformation.subscribe((key: KeyboardEvent) => {
    //   console.log('Hello the key is :', key);
    // });

    this.store.select(p => p.ledger.ledgerCreateSuccess).takeUntil(this.destroyed$).subscribe((s: boolean) => {
      if (s) {
        this._toaster.successToast('Entry created successfully', 'Success');
        this.resetEntry();
        this.store.dispatch(this._ledgerActions.ResetLedger());
      }
    });
  }

  // public setAccount(acc: IOption) {
  //   // console.log('the selected acc is :', acc);
  //   this.showLedgerAccountList = false;
  //   if (this.selectedInput === 'by') {
  //     this.journalRequestObject.by = acc.label;
  //   } else if (this.selectedInput === 'to') {
  //     this.journalRequestObject.to = acc.label;
  //   }
  // }

  public searchInList(str: string) {
    let allData = _.cloneDeep(this.allAccounts);
    this.accounts = _.filter(allData, (o) => _.includes(o.label, str));
  }
  // public selectInputType(ev: KeyboardEvent) {
  //   if (ev.key === 'c') {
  //     this.selectedInput = 'to';
  //   } else if (ev.key === 'd') {
  //     this.selectedInput = 'by';
  //   } else {
  //     this.selectedInput = null;
  //   }
  // }

  // public detectEnterKey(ev: KeyboardEvent, inputAmount: number, selectedAccount: string) {
  //   let target: any = _.cloneDeep(ev.target);
  //   if (ev.keyCode === 13) {
  //     if (this.selectedInput === 'by') {
  //       this.journalRequestObject.transactions.push({
  //         type: 'debit',
  //         amount: Number(inputAmount),
  //         particular: selectedAccount
  //       });
  //       let debitTransactions = _.filter(this.journalRequestObject.transactions, (o) => o.type === 'debit');
  //       this.totalDebitAmount = _.sumBy(debitTransactions, (o) => o.amount);
  //     } else if (this.selectedInput === 'to') {
  //       this.journalRequestObject.transactions.push({
  //         type: 'credit',
  //         amount: Number(inputAmount),
  //         particular: selectedAccount
  //       });
  //       let creditTransactions = _.filter(this.journalRequestObject.transactions, (o) => o.type === 'credit');
  //       this.totalCreditAmount = _.sumBy(creditTransactions, (o) => o.amount);
  //     }

  //     this.selectedInput = null;
  //     this.journalRequestObject.by = this.journalRequestObject.to = null;
  //   }
  // }

  public detectEnterKeyOnNarration(ev: KeyboardEvent, submitBtnEle: HTMLButtonElement) {
    //
  }

  public createEntry() {
    //
  }

  public resetEntry() {
    this.purchaseRequestObject.description = null;
    this.purchaseRequestObject.transactions = [];
    this.selectedInput = null;
    this.showSubmitButtonBox = false;
    this.showLedgerAccountList = false;
    this.totalCreditAmount = 0;
    this.totalDebitAmount = 0;
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
