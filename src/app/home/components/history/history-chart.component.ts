import { Component, OnInit } from '@angular/core';
import { Options } from 'highcharts';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { IComparisionChartResponse } from '../../../models/interfaces/dashboard.interface';
import { Observable } from 'rxjs/Observable';
import { ActiveFinancialYear, ComapnyResponse } from '../../../models/api-models/Company';
import { HomeActions } from '../../../services/actions/home/home.actions';
import { AppState } from '../../../store/roots';
import { Store } from '@ngrx/store';
import { isNullOrUndefined } from 'util';
import * as  moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'history-chart',
  templateUrl: 'history-chart.component.html'
})

export class HistoryChartComponent implements OnInit {
  public options: Options;
  public activeFinancialYear: ActiveFinancialYear;
  public lastFinancialYear: ActiveFinancialYear;
  public companies$: Observable<ComapnyResponse[]>;
  public activeCompanyUniqueName$: Observable<string>;
  public comparisionChartData$: Observable<IComparisionChartResponse>;
  public requestInFlight = true;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private monthArray = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  private expenseData = [];
  private expenseDataLY = [];
  private revenueData = [];
  private revenueDataLY = [];
  private profitLossData = [];
  private profitLossDataLY = [];

  constructor(private store: Store<AppState>, private _homeActions: HomeActions) {
//
    this.activeCompanyUniqueName$ = this.store.select(p => p.session.companyUniqueName).takeUntil(this.destroyed$);
    this.companies$ = this.store.select(p => p.company.companies).takeUntil(this.destroyed$);
    this.comparisionChartData$ = this.store.select(p => p.home.comparisionChart).takeUntil(this.destroyed$);
  }

  public fetchChartData() {
    this.requestInFlight = true;
    this.expenseData = [];
    this.store.dispatch(this._homeActions.getComparisionChartDataOfActiveYear(
      this.activeFinancialYear.financialYearStarts,
      this.activeFinancialYear.financialYearEnds, false));

    this.store.dispatch(this._homeActions.getComparisionChartDataOfLastYear(
      this.lastFinancialYear.financialYearStarts,
      this.lastFinancialYear.financialYearEnds, false));

  }

  public generateCharts() {
    this.options = {
      title: {
        text: ''
      },
      yAxis: {
        title: {
          text: ''
        }
      },
      xAxis: {
        categories: this.monthArray
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { color: '#333333', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }
      },
      series: [{
        name: 'Expense',
        data: this.expenseData
      }, {
        name: 'Revenue',
        data: this.revenueData
      }, {
        name: 'Profit/Loss',
        data: this.profitLossData
      }, {
        name: 'LY Expense',
        data: this.expenseDataLY
      }, {
        name: 'LY Revenue',
        data: this.revenueDataLY
      }, {
        name: 'LY Profit/Loss',
        data: this.profitLossDataLY
      }]
    };
  }

  public ngOnInit() {
    //
    this.comparisionChartData$
      .skipWhile(p => (isNullOrUndefined(p) || isNullOrUndefined(p.ProfitLossActiveYear) || isNullOrUndefined(p.revenueLastYear) || isNullOrUndefined(p.revenueActiveYear)))
      .distinctUntilChanged((p, q) => p.ExpensesActiveYearly === this.expenseData)
      .subscribe(p => {
        this.expenseData = (p.ExpensesActiveYearly);
        this.expenseDataLY = (p.ExpensesLastYearYearly);
        this.revenueData = (p.revenueActiveYearYearly);
        this.revenueDataLY = (p.revenueLastYearYearly);
        this.profitLossData = p.ProfitLossActiveYearYearly;
        this.generateCharts();
        this.requestInFlight = false;
      });
    this.companies$.subscribe(c => {
      if (c) {
        let activeCompany: ComapnyResponse;
        let activeCmpUniqueName = '';
        let financialYears = [];
        this.activeCompanyUniqueName$.take(1).subscribe(a => {
          activeCmpUniqueName = a;
          activeCompany = c.find(p => p.uniqueName === a);
          this.activeFinancialYear = activeCompany.activeFinancialYear;
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
        }
        // this.fetchChartData();
      }
    });


  }
}