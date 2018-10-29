/**
 * Created by kunalsaxena on 9/1/17.
 */
import { Component, OnInit } from '@angular/core';
import { CompanyActions } from '../actions/company.actions';
import { AppState } from '../store/roots';
import { Store } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { StateDetailsRequest, CompanyResponse } from '../models/api-models/Company';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { Observable, of, ReplaySubject } from 'rxjs';
import { GstReconcileActions } from 'app/actions/gst-reconcile/GstReconcile.actions';
import { TransactionCounts } from 'app/store/GstR/GstR.reducer';

@Component({
  templateUrl: './gst.component.html',
  styleUrls: ['./gst.component.css']
})
export class GstComponent implements OnInit {
  public showCalendar: boolean = false;
  public currentPeriod: string = null;
  public period: any = null;
  public gstR1TotalTransactions$: Observable<number> = of(0);
  public gstR2TotalTransactions$: Observable<number> = of(0);
  public activeCompanyUniqueName: string = '';
  public companies: CompanyResponse[] = [];
  public activeCompanyGstNumber = '';
  public gstAuthenticated$: Observable<boolean>;
  public gstTransactionCounts$: Observable<TransactionCounts[]> = of([]);

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private _companyActions: CompanyActions, private _route: Router, private _gstAction: GstReconcileActions) {
    this.periodChanged(new Date());
    this.gstR1TotalTransactions$ = this.store.select(p => p.gstR.gstR1TotalTransactions).pipe(takeUntil(this.destroyed$));
    this.gstR2TotalTransactions$ = this.store.select(p => p.gstR.gstR2TotalTransactions).pipe(takeUntil(this.destroyed$));
    this.gstAuthenticated$ = this.store.select(p => p.gstReconcile.gstAuthenticated).pipe(takeUntil(this.destroyed$));
    this.gstTransactionCounts$ = this.store.select(p => p.gstR.transactionCounts).pipe(takeUntil(this.destroyed$));
    this.store.select(p => p.session.companyUniqueName).pipe(takeUntil(this.destroyed$)).subscribe((c) => {
        if (c) {
          this.activeCompanyUniqueName = _.cloneDeep(c);
        }
      });
      this.store.select(p => p.session.companies).pipe(take(1)).subscribe((c) => {
        if (c.length) {
          let companies = this.companies = _.cloneDeep(c);
          if (this.activeCompanyUniqueName) {
            let activeCompany: any = companies.find((o: CompanyResponse) => o.uniqueName === this.activeCompanyUniqueName);
            if (activeCompany && activeCompany.gstDetails[0]) {
              this.activeCompanyGstNumber = activeCompany.gstDetails[0].gstNumber;
              console.log('activeCompanyGstNumber', this.activeCompanyGstNumber);
              this.store.dispatch(this._gstAction.SetActiveCompanyGstin(this.activeCompanyGstNumber));
            } else {
              // this.toasty.errorToast('GST number not found.');
            }
          }
        } else {
          this.store.dispatch(this._companyActions.RefreshCompanies());
        }
      });
    //
  }
  public ngOnInit(): void {
    let companyUniqueName = null;
    this.store.select(c => c.session.companyUniqueName).pipe(take(1)).subscribe(s => companyUniqueName = s);
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = companyUniqueName;
    stateDetailsRequest.lastState = 'gst';

    this.store.dispatch(this._companyActions.SetStateDetails(stateDetailsRequest));

    this.gstAuthenticated$.subscribe(s => {
      if (s) {
        this.store.dispatch(this._gstAction.GetTransactionsCount(moment(this.currentPeriod).format('MM-YYYY'), this.activeCompanyGstNumber));
      }
    });
  }

  /**
   * periodChanged
   */
  public periodChanged(ev) {
    this.currentPeriod = moment(ev).format('MMMM-YYYY');
    this.showCalendar = false;
  }

  /**
   * fileNow
   */
  public fileNow(type) {
      //
  }

  /**
   * navigateToOverview
   */
  public navigateToOverview(type) {
    this._route.navigate(['pages', 'gstfiling', 'filing-return', type, moment(this.currentPeriod).format('MM-YYYY')]);
  }

}
