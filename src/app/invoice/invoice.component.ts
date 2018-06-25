import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { CompanyActions } from '../actions/company.actions';
import { StateDetailsRequest } from '../models/api-models/Company';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Component({
  styles: [`
    .invoice-bg {
      padding-top: 15px;
    }

    .invoice-nav.navbar-nav > li > a {
      padding: 6px 30px;
      font-size: 14px;
      color: #333;
      background-color: #e6e6e6
    }

    .invoice-nav.navbar-nav > li > a:hover {
      background-color: #ff5f00;
      color: #fff;
    }

    .invoice-nav.navbar-nav > li > a.active {
      background-color: #fff;
      color: #ff5f00;
    }

    .navbar {
      min-height: auto;
      margin-bottom: 10px;
    }
  `],
  templateUrl: './invoice.component.html'
})
export class InvoiceComponent implements OnInit, OnDestroy {
  public isRecurringSelected: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private store: Store<AppState>,
              private companyActions: CompanyActions,
              private router: Router
  ) {
    //
  }

  public ngOnInit() {
    let companyUniqueName = null;
    this.store.select(c => c.session.companyUniqueName).take(1).subscribe(s => companyUniqueName = s);
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = companyUniqueName;
    stateDetailsRequest.lastState = 'invoice';

    this.store.dispatch(this.companyActions.SetStateDetails(stateDetailsRequest));
    this.router.events.takeUntil(this.destroyed$).subscribe((event: any) => {
      // console.log('router.event');
      if (event && event.url && event.url.includes('recurring')) {
        this.isRecurringSelected = true;
      } else {
        this.isRecurringSelected = false;
      }
    });
    if (this.router.routerState.snapshot.url.includes('recurring')) {
      this.isRecurringSelected = true;
    }
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
