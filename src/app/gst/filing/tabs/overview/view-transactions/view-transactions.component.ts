import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { GstReconcileActions } from 'app/actions/gst-reconcile/GstReconcile.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { Observable, ReplaySubject, of } from 'rxjs';
import { TransactionSummary } from 'app/store/GstR/GstR.reducer';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceActions } from 'app/actions/invoice/invoice.actions';
import { DownloadOrSendInvoiceOnMailComponent } from 'app/invoice/preview/models/download-or-send-mail/download-or-send-mail.component';
import { ElementViewContainerRef } from 'app/shared/helpers/directives/elementViewChild/element.viewchild.directive';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { InvoiceReceiptActions } from 'app/actions/invoice/receipt/receipt.actions';

export const Gstr1TransactionType = [
  {label: 'Invoices', value: 'invoices'},
  {label: 'Credit Notes', value: 'credit-notes'},
  {label: 'Advance Payments', value: 'advance-payments'},
  // {label: 'Refund Vouchers', value: 'refund-vouchers'},
  {label: 'Debit Notes', value: 'debit-notes'},
];

export const Gstr2TransactionType = [
  {label: 'Bills / Expenses', value: 'billsAndExpenses'},
  {label: 'Credit / Debit Notes', value: 'crdr'},
];

export const InvoiceType = [
  {label: 'All', value: 'all'},
  {label: 'B2B', value: 'b2b'},
  {label: 'B2CL', value: 'b2cl'},
  {label: 'B2CS', value: 'b2cs'},
  {label: 'Export', value: 'export'},
  {label: 'Nil', value: 'nil'},
];

export const Gstr2InvoiceType = [
  {label: 'All', value: 'all'},
  {label: 'B2B', value: 'b2b'},
  {label: 'B2BUR', value: 'b2bur'},
  {label: 'IMP', value: 'imp'},
  {label: 'IMPS', value: 'imps'},
  {label: 'Nil', value: 'nil'},
];

export const Entitytype = [
  {label: 'All', value: 'all'},
  {label: 'Registered', value: 'registered'},
  {label: 'Unregistered', value: 'unregistered'},
];

export const Status = [
  {label: 'All', value: 'all'},
  {label: 'Uploaded', value: 'uploaded'},
  {label: 'Unuploaded', value: 'unuploaded'},
];

export const filterTransaction = {
  entityType: '',
  type: '',
  status: '',
  page: 1,
  count: 20
};

@Component({
  selector: 'view-transactions',
  templateUrl: './view-transactions.component.html',
  styleUrls: ['view-transactions.component.css'],
})

export class ViewTransactionsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public currentPeriod: any = null;
  @Input() public selectedGst: string = null;
  @Input() public activeCompanyGstNumber: string = null;
  @Input() public isTransactionSummary: boolean;
  // @Input() public filterParam = filterTransaction;

  @ViewChild('downloadOrSendMailModel') public downloadOrSendMailModel: ModalDirective;
  @ViewChild('downloadOrSendMailComponent') public downloadOrSendMailComponent: ElementViewContainerRef;
  @ViewChild('invoiceGenerateModel') public invoiceGenerateModel: ModalDirective;

  public viewTransaction$: Observable<TransactionSummary> = of(null);
  public gstr1entityType = Gstr1TransactionType;
  public invoiceType = InvoiceType;
  public otherEntityType = Entitytype;
  public gstr2InvoiceType = Gstr2InvoiceType;
  public status = Status;
  public selectedEntityType: string = '';
  public companyGst$: Observable<string> = of('');
  public gstr2entityType = Gstr2TransactionType;
  public filterParam = filterTransaction;
  public imgPath: string = '';
  public modalRef: BsModalRef;
  public modalConfig = {
    animated: true,
    keyboard: false,
    backdrop: 'static',
    ignoreBackdropClick: true
  };
  public viewTransactionInProgress$: Observable<boolean> = of(null);
  public transactionsFilter$: Observable<any> = of(null);
  public selectedFilter: any = filterTransaction;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private gstAction: GstReconcileActions, private _store: Store<AppState>, private _route: Router, private activatedRoute: ActivatedRoute, private invoiceActions: InvoiceActions, private componentFactoryResolver: ComponentFactoryResolver, private modalService: BsModalService, private invoiceReceiptActions: InvoiceReceiptActions) {
    this.viewTransaction$ = this._store.select(p => p.gstR.viewTransactionData).pipe(takeUntil(this.destroyed$));
    this.companyGst$ = this._store.select(p => p.gstR.activeCompanyGst).pipe(takeUntil(this.destroyed$));
    this.viewTransactionInProgress$ = this._store.select(p => p.gstR.viewTransactionInProgress).pipe(takeUntil(this.destroyed$));
    this.transactionsFilter$ = this._store.select(p => p.gstR.gstTransactionsFilter).pipe(take(1));
  }

  public ngOnInit() {
    this.imgPath = isElectron ? 'assets/images/gst/' : AppUrl + APP_FOLDER + 'assets/images/gst/';
    this.filterParam['from'] = this.currentPeriod.from;
    this.filterParam['to'] = this.currentPeriod.to;
    this.filterParam['gstin'] = this.activeCompanyGstNumber;

    this.activatedRoute.firstChild.queryParams.subscribe(params => {
      this.filterParam['entityType'] = params.entityType;
      this.filterParam['type'] = params.type;
      this.filterParam['status'] = params.status;
      this.viewFilteredTxn('page', 1);
    });

  }

  public viewFilteredTxn(filter, val) {
    this.filterParam[filter] = val;
    if (filter === 'entityType') {
      this.filterParam.type = 'all';
      this.filterParam.status = 'all';
    }
    this._store.dispatch(this.gstAction.GetSummaryTransaction(this.selectedGst, this.filterParam));
    this.mapFilters();
  }

  public goBack() {
    this._route.navigate(['pages', 'gstfiling', 'filing-return'], { queryParams: {return_type: this.selectedGst, from: this.currentPeriod.from, to: this.currentPeriod.to }});
 }

  public pageChanged(event) {
    this.viewFilteredTxn('page', event.page);
  }

  public onSelectInvoice(invoice) {
    let downloadVoucherRequestObject = {
      voucherNumber: [invoice.voucherNumber],
      voucherType: invoice.voucherType,
      accountUniqueName: invoice.account.uniqueName
    };
    this._store.dispatch(this.invoiceReceiptActions.VoucherPreview(downloadVoucherRequestObject, downloadVoucherRequestObject.accountUniqueName));
    // this.store.dispatch(this.invoiceActions.PreviewOfGeneratedInvoice(invoice.account.uniqueName, invoice.voucherNumber));
    this.loadDownloadOrSendMailComponent();
    this.downloadOrSendMailModel.show();
  }

  public loadDownloadOrSendMailComponent() {
    let transactionData = null;
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(DownloadOrSendInvoiceOnMailComponent);
    let viewContainerRef = this.downloadOrSendMailComponent.viewContainerRef;
    viewContainerRef.remove();

    let componentInstanceView = componentFactory.create(viewContainerRef.parentInjector);
    viewContainerRef.insert(componentInstanceView.hostView);

    let componentInstance = componentInstanceView.instance as DownloadOrSendInvoiceOnMailComponent;
    componentInstance.closeModelEvent.subscribe(e => this.closeDownloadOrSendMailPopup(e));
  }

  public closeDownloadOrSendMailPopup(userResponse: { action: string }) {
    this.downloadOrSendMailModel.hide();
    if (userResponse.action === 'update') {
      this._store.dispatch(this.invoiceActions.VisitToInvoiceFromPreview());
      this.invoiceGenerateModel.show();
    } else if (userResponse.action === 'closed') {
      this._store.dispatch(this.invoiceActions.ResetInvoiceData());
    }
  }

  public closeInvoiceModel(e) {
    this.invoiceGenerateModel.hide();
    setTimeout(() => {
      this._store.dispatch(this.invoiceActions.ResetInvoiceData());
    }, 2000);
  }

  public mapFilters() {
    let filters = _.cloneDeep(this.filterParam);
    if (this.selectedGst === 'gstr1') {
      let selected = _.find(Gstr1TransactionType, o =>  o.value === filters.entityType);
      if (selected) {
        this.selectedFilter.entityType = selected.label;
      }
    } else {
      let selected = _.find(Gstr2TransactionType, o =>  o.value === filters.entityType);
      if (selected) {
        this.selectedFilter.entityType = selected.label;
      }
    }

    if (this.filterParam.status) {
      let selected = _.find(Status, o =>  o.value === filters.status);
      if (selected) {
        this.selectedFilter.status = selected.label;
      }
    }

    if (this.filterParam.type) {
      let selected;
      if (this.selectedGst === 'gstr1') {
        selected = _.find(InvoiceType, o =>  o.value === filters.type);
        } else {
        selected = _.find(Gstr2InvoiceType, o =>  o.value === filters.type);
      }
      if (selected) {
        this.selectedFilter.type = selected.label;
      }
    }
    return this.filterParam = _.cloneDeep(filters);

  }

  public ngOnChanges(s: SimpleChanges) {
    //
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
  }
}
