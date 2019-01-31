import { take } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { StateDetailsRequest } from '../models/api-models/Company';
import { CompanyActions } from '../actions/company.actions';
import { ReplaySubject } from 'rxjs';

@Component({
  styles: [`
    .grey-bg {
      background-color: #f4f5f8;
      padding: 20px;
    }
  `],
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit, OnDestroy {
  public isPurchaseInvoice: boolean = false;
  public accountUniqueName: string;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private companyActions: CompanyActions,
    public route: ActivatedRoute
  ) {
  }

  public ngOnInit() {
    let companyUniqueName = null;
    this.store.select(c => c.session.companyUniqueName).pipe(take(1)).subscribe(s => companyUniqueName = s);
    let stateDetailsRequest = new StateDetailsRequest();
    stateDetailsRequest.companyUniqueName = companyUniqueName;
    stateDetailsRequest.lastState = 'sales';
    this.store.dispatch(this.companyActions.SetStateDetails(stateDetailsRequest));

    this.isPurchaseInvoice = this.router.routerState.snapshot.url.includes('purchase');

    this.route.params.subscribe(parmas => {
      if (parmas['accUniqueName']) {
        this.accountUniqueName = parmas['accUniqueName'];
      }
    });
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
