import { INameUniqueName } from '../../../models/interfaces/nameUniqueName.interface';
import { IFlattenGroupsAccountsDetail } from '../../../models/interfaces/flattenGroupsAccountsDetail.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Options } from 'highcharts';
import { ActiveFinancialYear, ComapnyResponse } from '../../../models/api-models/Company';
import { Observable } from 'rxjs/Observable';
import { ICbAccount, IChildGroups, IRevenueChartClosingBalanceResponse } from '../../../models/interfaces/dashboard.interface';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HomeActions } from '../../../services/actions/home/home.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/roots';
import moment from 'moment';
import * as _ from 'lodash';
import { AccountChartDataLastCurrentYear } from '../../../models/view-models/AccountChartDataLastCurrentYear';

@Component({
  selector: 'revenue-chart',
  templateUrl: 'revenue-chart.component.html'
})

export class RevenueChartComponent implements OnInit, OnDestroy {
  public options: Options;
  public activeFinancialYear: ActiveFinancialYear;
  public lastFinancialYear: ActiveFinancialYear;
  public companies$: Observable<ComapnyResponse[]>;
  public activeCompanyUniqueName$: Observable<string>;
  public revenueChartData$: Observable<IRevenueChartClosingBalanceResponse>;
  public accountStrings: AccountChartDataLastCurrentYear[] = [];
  public activeYearAccounts: ICbAccount[] = [];
  public lastYearAccounts: ICbAccount[] = [];
  public activeYearAccountsRanks: number[] = [];
  public lastYearAccountsRanks: number[] = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private _homeActions: HomeActions) {
    this.revenueChartData$ = this.store.select(p => p.home.revenueChart).takeUntil(this.destroyed$);
    this.activeCompanyUniqueName$ = this.store.select(p => p.session.companyUniqueName).takeUntil(this.destroyed$);
    this.companies$ = this.store.select(p => p.company.companies).takeUntil(this.destroyed$);
  }

  public ngOnInit() {
    this.companies$.subscribe(c => {
      if (c) {
        let activeCmpUniqueName = '';
        let financialYears = [];
        this.activeCompanyUniqueName$.take(1).subscribe(a => {
          activeCmpUniqueName = a;
          this.activeFinancialYear = c.find(p => p.uniqueName === a).activeFinancialYear;
        });
        if (this.activeFinancialYear) {
          for (let cmp of c) {
            if (cmp.uniqueName === activeCmpUniqueName) {
              if (cmp.financialYears.length > 1) {
                financialYears = cmp.financialYears.filter(cm => cm.uniqueName !== this.activeFinancialYear.uniqueName);
                financialYears = _.orderBy(financialYears, (it) => {
                  return moment(it.financialYearStarts, 'DD-MM-YYYY');
                }, 'desc');
                this.lastFinancialYear = financialYears[0];
              }
            }
          }
          this.refreshData();
        }
      }
    });

    this.revenueChartData$.subscribe(rvn => {
      if (rvn) {
        if (rvn.revenuefromoperationsActiveyear && rvn.otherincomeActiveyear) {
          let revenuefromoperationsAccounts = [].concat.apply([], this.flattenGroup([rvn.revenuefromoperationsActiveyear] as IChildGroups[]).map((p: IChildGroups) => p.accounts));
          let otherincomeAccounts = [].concat.apply([], this.flattenGroup([rvn.otherincomeActiveyear] as IChildGroups[]).map((p: IChildGroups) => p.accounts));
          let accounts = _.unionBy(revenuefromoperationsAccounts as ICbAccount[], otherincomeAccounts as ICbAccount[]) as ICbAccount[];
          this.activeYearAccounts = accounts;
        }

        if (rvn.revenuefromoperationsLastyear && rvn.otherincomeLastyear) {
          let revenuefromoperationsAccounts = [].concat.apply([], this.flattenGroup([rvn.revenuefromoperationsLastyear] as IChildGroups[]).map((p: IChildGroups) => p.accounts));
          let otherincomeAccounts = [].concat.apply([], this.flattenGroup([rvn.otherincomeLastyear] as IChildGroups[]).map((p: IChildGroups) => p.accounts));
          let lastAccounts = _.unionBy(revenuefromoperationsAccounts as ICbAccount[], otherincomeAccounts as ICbAccount[]) as ICbAccount[];
          this.lastYearAccounts = lastAccounts;
        }
      }
      this.generateCharts();
    });
  }
  public flattenGroup(tree: IChildGroups[]) {
    return _.flattenDeep(this.recurse(tree));
  }
  public recurse(nodes: IChildGroups[]) {
    return _.map(nodes, (node: IChildGroups) => {
      return [
        node,
        this.recurse(node.childGroups)
      ];
    });
  }
  public refreshData() {
    this.store.dispatch(this._homeActions.getRevenueChartDataOfActiveYear(this.activeFinancialYear.financialYearStarts, this.activeFinancialYear.financialYearEnds));

    if (this.lastFinancialYear) {
      this.store.dispatch(this._homeActions.getRevenueChartDataOfLastYear(this.lastFinancialYear.financialYearStarts, this.lastFinancialYear.financialYearEnds));
    }
  }

  public generateCharts() {
    this.accountStrings = _.uniqBy(this.generateActiveYearString().concat(this.generateLastYearString()), 'uniqueName');
    this.accountStrings.forEach((ac) => {
      ac.activeYear = 0;
      ac.lastYear = 0;
      let index = -1;
      index = _.findIndex(this.activeYearAccounts, (p) => p.uniqueName === ac.uniqueName);
      if (index !== -1) {
        ac.activeYear = this.activeYearAccounts[index].closingBalance.amount;
      }
      index = -1;
      index = _.findIndex(this.lastYearAccounts, (p) => p.uniqueName === ac.uniqueName);
      if (index !== -1) {
        ac.lastYear = this.lastYearAccounts[index].closingBalance.amount;
      }
    });

    this.accountStrings = _.filter(this.accountStrings, (a) => {
      return !(a.activeYear === 0 && a.lastYear === 0);
    });
    this.activeYearAccountsRanks = this.accountStrings.map(p => p.activeYear);
    this.lastYearAccountsRanks = this.accountStrings.map(p => p.lastYear);

    this.options = {
      chart: {
        type: 'column',
        height: '320px'
      },
      title: {
        text: ''
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: this.accountStrings.map(p => p.name),
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Rainfall (mm)'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} rs</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [{
        name: `This Year`,
        data: this.activeYearAccountsRanks

      }, {
        name: `Last Year`,
        data: this.lastYearAccountsRanks

      }]
    };
  }

  public generateActiveYearString(): INameUniqueName[] {
    let activeStrings: INameUniqueName[] = [];
    this.activeYearAccounts.map(acc => {
      activeStrings.push({ uniqueName: acc.uniqueName, name: acc.name });
    });
    return activeStrings;
  }

  public generateLastYearString(): INameUniqueName[] {
    let lastStrings: INameUniqueName[] = [];
    this.lastYearAccounts.map(acc => {
      lastStrings.push({ uniqueName: acc.uniqueName, name: acc.name });
    });
    return lastStrings;
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}