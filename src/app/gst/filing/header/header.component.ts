import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ToasterService } from 'app/services/toaster.service';
import { GstReconcileActions } from 'app/actions/gst-reconcile/GstReconcile.actions';
import { Observable, ReplaySubject, of } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { AlertConfig } from 'ngx-bootstrap/alert';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InvoicePurchaseActions } from 'app/actions/purchase-invoice/purchase-invoice.action';
import * as moment from 'moment/moment';

@Component({
  selector: 'filing-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.css'],
  providers: [
    {
      provide: BsDropdownConfig, useValue: {autoClose: true},
    },
    {
      provide: AlertConfig, useValue: {}
    }
  ],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in <=> out', animate('400ms ease-in-out')),
    ])
  ]
})
export class FilingHeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public currentPeriod: any = null;
  @Input() public selectedGst: string = null;
  @Input() public showTaxPro: boolean = false;
  @Input() public isMonthSelected: boolean = false;
  @Input() public fileReturn: {} = { isAuthenticate: false };

  public reconcileIsActive: boolean = false;
  public gstAuthenticated$: Observable<boolean>;
  public GstAsidePaneState: string = 'out';
  public selectedService: string;
  public companyGst$: Observable<string> = of('');
  public activeCompanyGstNumber: string = '';
  public moment = moment;
  public imgPath: string = '';
  public gstAuthenticated: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private _toasty: ToasterService,
    private _reconcileAction: GstReconcileActions,
    private _invoicePurchaseActions: InvoicePurchaseActions
  ) {
    this.gstAuthenticated$ = this.store.select(p => p.gstReconcile.gstAuthenticated).pipe(take(1));
    this.companyGst$ = this.store.select(p => p.gstR.activeCompanyGst).pipe(takeUntil(this.destroyed$));
  }

  public ngOnInit() {
    this.imgPath = isElectron ? 'assets/images/gst/' : AppUrl + APP_FOLDER + 'assets/images/gst/';
    this.companyGst$.subscribe(a => {
      if (a) {
        this.activeCompanyGstNumber = a;
      }
    });

    this.gstAuthenticated$.subscribe((a) => {
        this.gstAuthenticated = a;
    });
    //
  }

  /**
   * pullFromGstIn
   */
  public pullFromGstIn(ev) {
    this.toggleSettingAsidePane(ev, 'TAX_PRO');
  }

  /**
   * ngOnChanges
   */
  public ngOnChanges(s: SimpleChanges) {
    if (s && s.selectedGst && s.selectedGst.currentValue === 'gstr2') {
      if (!this.gstAuthenticated && this.selectedGst === 'gstr2') {
        this.toggleSettingAsidePane(null, 'RECONCILE');
      }
    }

    if (s && s.currentPeriod && s.currentPeriod.currentValue) {
      let date = {
        startDate: moment(this.currentPeriod.from, 'DD-MM-YYYY').startOf('month').format('DD-MM-YYYY'),
        endDate: moment(this.currentPeriod.to, 'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY')
      };
      if (date.startDate === this.currentPeriod.from && date.endDate === this.currentPeriod.to) {
        this.isMonthSelected = true;
      } else {
        this.isMonthSelected = false;
      }
    }

    if (s && s.fileReturn && s.fileReturn.currentValue.isAuthenticate) {
        if (this.gstAuthenticated) {
          this.fileGstReturn('TAX_PRO');
        } else {
          this.toggleSettingAsidePane(null, 'TAX_PRO');
        }
    }
  }

  /**
   * toggleSettingAsidePane
   */
  public toggleSettingAsidePane(event, selectedService?: 'JIO_GST' | 'TAX_PRO' | 'RECONCILE'): void {
    if (event) {
      event.preventDefault();
    }

    if (selectedService === 'RECONCILE') {
      let checkIsAuthenticated;
      this.gstAuthenticated$.pipe(take(1)).subscribe(auth => checkIsAuthenticated = auth);
    }
    this.selectedService = selectedService;
    this.GstAsidePaneState = this.GstAsidePaneState === 'out' ? 'in' : 'out';
  }

  /**
   * onDownloadSheetGSTR
   */
  public onDownloadSheetGSTR(typeOfSheet: string) {
      if (this.activeCompanyGstNumber) {
        if (typeOfSheet === 'gstr1-excel-export' || typeOfSheet === 'gstr2-excel-export') {
          this.store.dispatch(this._invoicePurchaseActions.DownloadGSTR1Sheet(this.currentPeriod, this.activeCompanyGstNumber, typeOfSheet, this.selectedGst.toLocaleUpperCase() ));
        } else if (typeOfSheet === 'gstr1-error-export' || typeOfSheet === 'gstr2-error-export') {
          this.store.dispatch(this._invoicePurchaseActions.DownloadGSTR1ErrorSheet(this.currentPeriod, this.activeCompanyGstNumber, typeOfSheet, this.selectedGst.toLocaleUpperCase()));
        }
      } else {
        this._toasty.errorToast('GST number not found.');
      }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public fileGstReturn(Via: 'JIO_GST' | 'TAX_PRO') {
    if (this.activeCompanyGstNumber) {
      this.store.dispatch(this._invoicePurchaseActions.FileJioGstReturn(this.currentPeriod, this.activeCompanyGstNumber, Via));
    } else {
      this._toasty.errorToast('GST number not found.');
    }
  }
}
