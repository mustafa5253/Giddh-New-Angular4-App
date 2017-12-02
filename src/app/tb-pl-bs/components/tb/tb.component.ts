import { Store } from '@ngrx/store';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import * as _ from '../../../lodash-optimized';
import { CompanyResponse } from '../../../models/api-models/Company';
import { AppState } from '../../../store/roots';
import { TBPlBsActions } from '../../../actions/tl-pl.actions';
import { AccountDetails, TrialBalanceRequest } from '../../../models/api-models/tb-pl-bs';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { TbGridComponent } from './tb-grid/tb-grid.component';
import { createSelector } from 'reselect';
import { ChildGroup, Account } from '../../../models/api-models/Search';

@Component({
  selector: 'tb',
  template: `
    <tb-pl-bs-filter
      #filter
      [selectedCompany]="selectedCompany"
      [showLoader]="showLoader | async"
      [showLabels]="true"
      (onPropertyChanged)="filterData($event)"
      (expandAll)="expandAll = $event"
      (tbExportCsvEvent)="exportCsv($event)"
      (tbExportPdfEvent)="exportPdf($event)"
      (tbExportXLSEvent)="exportXLS($event)"
      [tbExportCsv]="true"
      [tbExportPdf]="true"
      [tbExportXLS]="true"
    ></tb-pl-bs-filter>
    <div *ngIf="(showLoader | async)">
      <!-- loader -->
      <div class="loader" >
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
       <h1>loading ledger</h1>
      </div>
    </div>
    <div *ngIf="(data$ | async) && !(showLoader | async)">
      <tb-grid #tbGrid
      [search]="filter.search"
        [expandAll]="expandAll"
        [data$]="data$  | async"
      ></tb-grid>
    </div>
  `
})
export class TbComponent implements OnInit, AfterViewInit, OnDestroy {
  public showLoader: Observable<boolean>;
  public data$: Observable<AccountDetails>;
  public request: TrialBalanceRequest;
  public expandAll: boolean;
  @ViewChild('tbGrid') public tbGrid: TbGridComponent;
  public get selectedCompany(): CompanyResponse {
    return this._selectedCompany;
  }

  // set company and fetch data...
  @Input()
  public set selectedCompany(value: CompanyResponse) {
    this._selectedCompany = value;
    if (value) {
      this.request = {
        refresh: false,
        from: value.activeFinancialYear.financialYearStarts,
        to: this.selectedCompany.activeFinancialYear.financialYearEnds
      };
      this.filterData(this.request);
    }
  }

  private _selectedCompany: CompanyResponse;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private cd: ChangeDetectorRef, public tlPlActions: TBPlBsActions) {
    this.showLoader = this.store.select(p => p.tlPl.tb.showLoader).takeUntil(this.destroyed$);
  }

  public ngOnInit() {
    this.data$ = this.store.select(createSelector((p: AppState) => p.tlPl.tb.data, (p: AccountDetails) => {
      let d = _.cloneDeep(p) as AccountDetails;
      if (d) {
        this.InitData(d.groupDetails);
        d.groupDetails.forEach(g => { g.isVisible = true; g.isCreated = true; });
      }
      return d;
    })).takeUntil(this.destroyed$);
    this.data$.subscribe(p => { this.cd.markForCheck(); });
    // console.log('hello Tb Component');
  }
  public InitData(d: ChildGroup[]) {
    _.each(d, (grp: ChildGroup) => {
      grp.isVisible = false;
      grp.isCreated = false;
      grp.isIncludedInSearch = true;
      _.each(grp.accounts, (acc: Account) => {
        acc.isIncludedInSearch = true;
        acc.isCreated = false;
        acc.isVisible = false;
      });
      if (grp.childGroups) {
        this.InitData(grp.childGroups);
      }
    });
  }
  public ngAfterViewInit() {
    this.cd.detectChanges();
  }

  public filterData(request: TrialBalanceRequest) {
    this.store.dispatch(this.tlPlActions.GetTrialBalance(_.cloneDeep(request)));
  }

  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  public exportCsv($event) {
    //
  }
  public exportPdf($event) {
    //
  }
  public exportXLS($event) {
    //
  }
}
