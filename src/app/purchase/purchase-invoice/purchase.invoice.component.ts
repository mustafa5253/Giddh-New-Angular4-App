import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BsDropdownConfig } from 'ngx-bootstrap';
import * as  moment from 'moment/moment';
import * as  _ from 'lodash';
import { IInvoicePurchaseResponse, PurchaseInvoiceService, ITaxResponse, GeneratePurchaseInvoiceRequest } from '../../services/purchase-invoice.service';
import { Observable } from 'rxjs/Rx';
import { PipeTransform, Pipe, OnInit, trigger, state, style, transition, animate, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/roots';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { InvoicePurchaseActions } from '../../services/actions/purchase-invoice/purchase-invoice.action';
import { ToasterService } from '../../services/toaster.service';
import { CompanyResponse } from '../../models/api-models/Company';
import { CompanyActions } from '../../services/actions/company.actions';
import { saveAs } from 'file-saver';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import { AccountService } from '../../services/account.service';
import { AccountRequest } from '../../models/api-models/Account';
import { StateList } from './state-list';

const otherFiltersOptions = [
  { name: 'GSTIN Empty', uniqueName: 'GSTIN Empty' },
  { name: 'GSTIN Filled', uniqueName: 'GSTIN Filled' },
  { name: 'Invoice Empty', uniqueName: 'Invoice Empty' },
  { name: 'Invoice Filled', uniqueName: 'Invoice Filled' }
];

const gstrOptions = [
  { name: 'GSTR1', uniqueName: 'GSTR1' },
  { name: 'GSTR2', uniqueName: 'GSTR2' }
];

const purchaseReportOptions = [
  { name: 'Credit Note', uniqueName: 'Credit Note' },
  { name: 'Debit Note', uniqueName: 'Debit Note' }
];

const fileGstrOptions = [
  { name: 'Download Sheet', uniqueName: 'Download Sheet' },
  { name: 'Use JIOGST API', uniqueName: 'Use JIOGST API' }
];

@Component({
  selector: 'invoice-purchase',
  templateUrl: './purchase.invoice.component.html',
  styleUrls: ['purchase.invoice.component.css'],
  providers: [{ provide: BsDropdownConfig, useValue: { autoClose: true } }],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in <=> out', animate('400ms ease-in-out')),
      // transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class PurchaseInvoiceComponent implements OnInit, OnDestroy {
  public allPurchaseInvoicesBackup: IInvoicePurchaseResponse[];
  public allPurchaseInvoices: IInvoicePurchaseResponse[] = [];
  public allTaxes: ITaxResponse[] = [];
  public selectedDateForGSTR1: string = '';
  public selectedEntryTypeValue: string = '';
  public moment = moment;
  public selectedGstrType: string;
  public showGSTR1DatePicker: boolean = false;
  public accountAsideMenuState: string = 'out';
  public dropdownHeading: string = 'Select taxes';
  public isSelectedAllTaxes: boolean = false;
  public purchaseInvoiceObject: IInvoicePurchaseResponse = new IInvoicePurchaseResponse();
  public purchaseInvoiceRequestObject: GeneratePurchaseInvoiceRequest = new GeneratePurchaseInvoiceRequest();

  public datePickerOptions: any = {
    locale: {
      applyClass: 'btn-green',
      applyLabel: 'Go',
      fromLabel: 'From',
      format: 'D-MMM-YY',
      toLabel: 'To',
      cancelLabel: 'Cancel',
      customRangeLabel: 'Custom range'
    },
    ranges: {
      'Last 1 Day': [
        moment().subtract(1, 'days'),
        moment()
      ],
      'Last 7 Days': [
        moment().subtract(6, 'days'),
        moment()
      ],
      'Last 30 Days': [
        moment().subtract(29, 'days'),
        moment()
      ],
      'Last 6 Months': [
        moment().subtract(6, 'months'),
        moment()
      ],
      'Last 1 Year': [
        moment().subtract(12, 'months'),
        moment()
      ]
    }
  };
  public otherFilters: any[] = otherFiltersOptions;
  public gstrOptions: any[] = gstrOptions;
  public purchaseReportOptions: any[] = purchaseReportOptions;
  public fileGstrOptions: any[] = fileGstrOptions;
  public activeCompanyUniqueName: string;
  public activeCompanyGstNumber: string;
  public companies: CompanyResponse[];
  public isDownloadingFileInProgress: boolean = false;
  public mainInput = {
    start: moment().subtract(12, 'month'),
    end: moment().subtract(6, 'month')
  };
  public singleDate: any;
  public timeCounter: number = 10; // Max number of seconds to wait
  public eventLog = '';
  public selectedRowIndex: number;
  public isReverseChargeSelected: boolean = false;
  public stateList = StateList;
  public generateInvoiceArr: IInvoicePurchaseResponse[] = [];
  public invoiceSelected: boolean = false;
  public editMode: boolean = false;

  private intervalId: any;
  private undoEntryTypeChange: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private router: Router,
    private location: Location,
    private store: Store<AppState>,
    private invoicePurchaseActions: InvoicePurchaseActions,
    private toasty: ToasterService,
    private companyActions: CompanyActions,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private accountService: AccountService
  ) {
    this.purchaseInvoiceObject.TaxList = [];
    this.purchaseInvoiceRequestObject.entryUniqueName = [];
    this.purchaseInvoiceRequestObject.taxes = [];
    this.selectedDateForGSTR1 = String(moment());
    this.store.select(p => p.session.companyUniqueName).takeUntil(this.destroyed$).subscribe((c) => {
      if (c) {
        this.activeCompanyUniqueName = _.cloneDeep(c);
      }
    });
    this.store.select(p => p.session.companies).takeUntil(this.destroyed$).subscribe((c) => {
      if (c.length) {
        let companies = this.companies = _.cloneDeep(c);
        if (this.activeCompanyUniqueName) {
          let activeCompany: any = companies.find((o: CompanyResponse) => o.uniqueName === this.activeCompanyUniqueName);
          if (activeCompany && activeCompany.gstDetails[0]) {
            this.activeCompanyGstNumber = activeCompany.gstDetails[0].gstNumber;
          } else {
            this.toasty.errorToast('GST number not found.');
          }
        }
      } else {
        this.store.dispatch(this.companyActions.RefreshCompanies());
      }
    });
  }

  public ngOnInit() {
    this.store.dispatch(this.invoicePurchaseActions.GetPurchaseInvoices());
    this.store.select(p => p.invoicePurchase).takeUntil(this.destroyed$).subscribe((o) => {
      if (o.purchaseInvoices && o.purchaseInvoices.length) {
        this.allPurchaseInvoices = _.cloneDeep(o.purchaseInvoices);
        this.allPurchaseInvoicesBackup = _.cloneDeep(o.purchaseInvoices);
      }
      this.isDownloadingFileInProgress = o.isDownloadingFile;
    });
    this.store.dispatch(this.invoicePurchaseActions.GetTaxesForThisCompany());
    this.store.select(p => p.invoicePurchase).takeUntil(this.destroyed$).subscribe((o) => {
      if (o.taxes && o.taxes.length) {
        this.allTaxes = _.cloneDeep(o.taxes);
      }
    });

  }

  public selectedDate(value: any, dateInput: any) {
    // console.log('value is :', value);
    // console.log('dateInput is :', dateInput);
    // dateInput.start = value.start;
    // dateInput.end = value.end;
  }

  /**
   * filterPurchaseInvoice
   */
  public filterPurchaseInvoice(searchString: string) {
    this.allPurchaseInvoices = _.cloneDeep(this.allPurchaseInvoicesBackup);

    if (searchString) {

      let isValidInput: boolean = true;
      let patt: RegExp;
      searchString = searchString.replace(/\\/g, '\\\\');

      try {
        patt = new RegExp(searchString);
      } catch (e) {
        isValidInput = false;
      }

      if (isValidInput) {
        let allPurchaseInvoices = _.cloneDeep(this.allPurchaseInvoices);

        allPurchaseInvoices = allPurchaseInvoices.filter((invoice: IInvoicePurchaseResponse) => {
          return (patt.test(invoice.account.gstIn) || patt.test(invoice.entryUniqueName) || patt.test(invoice.account.name) || patt.test(invoice.entryDate) || patt.test(invoice.invoiceNumber) || patt.test(invoice.particular));
        });

        this.allPurchaseInvoices = allPurchaseInvoices;
      }
    }

  }

  /**
   * sortInvoicesBy
   */
  public sortInvoicesBy(filedName: string) {
    let allPurchaseInvoices = _.cloneDeep(this.allPurchaseInvoices);
    allPurchaseInvoices = _.sortBy(allPurchaseInvoices, [filedName]);
    this.allPurchaseInvoices = allPurchaseInvoices;
  }

  /**
   * onSelectGstrOption
   */
  public onSelectGstrOption(gstrType) {
    this.selectedGstrType = gstrType;
  }

  /**
   * onUpdate
   */
  public onUpdate() {
    // if (this.selectedRowIndex > -1) {
    //   let data = _.cloneDeep(this.allPurchaseInvoices);
    //   let dataToSave = data[this.selectedRowIndex];
    //   this.store.dispatch(this.invoicePurchaseActions.UpdatePurchaseInvoice(dataToSave));
    // }
    if (this.generateInvoiceArr.length && this.generateInvoiceArr.length < 2) {
      let dataToSave = _.cloneDeep(this.generateInvoiceArr[0]);
      let tax = _.cloneDeep(this.generateInvoiceArr[0].taxes[1]);
      if (!tax) {
        this.toasty.errorToast('Minimum 1 Tax should be selected in Voucher No.' + dataToSave.voucherNo);
        return false;
      }
      dataToSave.taxes[0] = tax;
      dataToSave.taxes.splice(1, 1);
      if (dataToSave.taxes.length > 1) {
        this.toasty.errorToast('Only 1 Tax should be selected in Voucher No.' + dataToSave.voucherNo);
        return false;
      } else if (dataToSave.taxes.length < 1) {
        this.toasty.errorToast('Minimum 1 Tax should be selected in Voucher No.' + dataToSave.voucherNo);
        return false;
      }
      this.store.dispatch(this.invoicePurchaseActions.GeneratePurchaseInvoice(dataToSave));
    }

  }

  /**
   * onSelectRow
   */
  public onSelectRow(indx) {
    this.selectedRowIndex = indx;
  }

  public arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * onDownloadSheetGSTR1
   */
  public onDownloadSheetGSTR1(typeOfSheet: string) {
    if (this.selectedDateForGSTR1) {
      let check = moment(this.selectedDateForGSTR1, 'YYYY/MM/DD');
      let monthToSend = check.format('MM') + '-' + check.format('YYYY');
      if (this.activeCompanyGstNumber) {
        if (typeOfSheet === 'gstr1') {
          this.store.dispatch(this.invoicePurchaseActions.DownloadGSTR1Sheet(monthToSend, this.activeCompanyGstNumber));
        } else if (typeOfSheet === 'gstr1_error') {
          this.store.dispatch(this.invoicePurchaseActions.DownloadGSTR1ErrorSheet(monthToSend, this.activeCompanyGstNumber));
        }
      } else {
        this.toasty.errorToast('GST number not found.');
      }
    } else {
      this.toasty.errorToast('Please select month');
    }
  }

  public setCurrentMonth() {
    this.selectedDateForGSTR1 = String(moment());
  }

  public clearDate() {
    this.selectedDateForGSTR1 = '';
  }

  /**
   * onChangeEntryType
   */
  public onChangeEntryType(indx, value, accUniqName) {
    console.log(value);
    clearInterval(this.intervalId);
    this.timeCounter = 10;
    if (indx > -1 && (value === 'composite' || value === '')) {
      this.selectedRowIndex = indx;
      this.selectedEntryTypeValue = value;
      this.isReverseChargeSelected = false;

      this.intervalId = setInterval(() => {
        // console.log('running...');
        this.timeCounter--;
        this.checkForCounterValue(this.timeCounter);
      }, 1000);
    } else if (value === 'reverse charge') {
      this.isReverseChargeSelected = true;
      this.selectedRowIndex = indx;
      this.intervalId = setInterval(() => {
        this.timeCounter--;
        this.checkForCounterValue(this.timeCounter);
      }, 1000);
      // this.selectTax({ target: { checked: true } }, selectedTax);
    }
  }

  /**
   * checkForCounterValue
   */
  public checkForCounterValue(counterValue) {
    if (this.intervalId && (counterValue === 0 || this.undoEntryTypeChange) && this.intervalId._state === 'running') {
      clearInterval(this.intervalId);
      this.timeCounter = 10;
      if (!this.undoEntryTypeChange) {
        this.updateEntryType(this.selectedRowIndex, this.selectedEntryTypeValue);
      }
      this.undoEntryTypeChange = false;
    }
  }

  /**
   * onUndoEntryTypeChange
   */
  public onUndoEntryTypeChange(idx, itemObj) {
    this.undoEntryTypeChange = true;
    console.log(idx, itemObj);
    this.store.select(p => p.invoicePurchase).takeUntil(this.destroyed$).subscribe((o) => {
      if (o.purchaseInvoices) {
        if (this.allPurchaseInvoices[idx].invoiceNumber === itemObj.invoiceNumber) {
          this.allPurchaseInvoices[idx].entryType = _.cloneDeep(o.purchaseInvoices[idx].entryType);
          this.selectedRowIndex = idx;
          if (this.allPurchaseInvoices[idx].entryType !== 'reverse charge') {
            this.isReverseChargeSelected = false;
          }
        }
      }
    });
  }

  /**
   * updateEntryType
   */
  public updateEntryType(indx, value) {
    if (indx > -1 && (value === 'composite' || value === '')) {
      let account: AccountRequest = new AccountRequest();
      let isComposite: boolean;
      if (value === 'composite') {
        isComposite = true;
      } else if (value === '') {
        isComposite = false;
      }
      let data = _.cloneDeep(this.allPurchaseInvoices);
      let selectedRow = data[indx];
      let selectedAccName = selectedRow.account.uniqueName;
      this.accountService.GetAccountDetails(selectedAccName).subscribe((accDetails) => {
        let accountData: any = _.cloneDeep(accDetails.body);
        account.name = accountData.name;
        account.uniqueName = accountData.uniqueName;
        account.hsnNumber = accountData.hsnNumber;
        account.city = accountData.city;
        account.pincode = accountData.pincode;
        account.country = accountData.country;
        account.sacNumber = accountData.sacNumber;
        account.stateCode = accountData.stateCode;
        account.isComposite = isComposite;
        this.accountService.UpdateAccount(account, selectedAccName).subscribe((res) => {
          if (res.status === 'success') {
            this.toasty.successToast('Entry type changed successfully.');
          } else {
            this.toasty.errorToast(res.message, res.code);
          }
        });
      });
    }
  }

  /**
   * toggleSettingAsidePane
   */
  public toggleSettingAsidePane(event): void {
    if (event) {
      event.preventDefault();
    }
    this.accountAsideMenuState = this.accountAsideMenuState === 'out' ? 'in' : 'out';
  }
  /**
  * SelectAllTaxes
  */
  public selectAllTaxes(event) {
    if (event.target.checked) {
      this.purchaseInvoiceObject.isAllTaxSelected = true;
      this.allTaxes.forEach((tax: ITaxResponse) => tax.isSelected = true);
      this.purchaseInvoiceObject.TaxList = _.clone(this.allTaxes);
    } else {
      this.isSelectedAllTaxes = false;
      this.allTaxes.forEach((tax: ITaxResponse) => tax.isSelected = false);
      this.purchaseInvoiceObject.TaxList = _.clone(this.allTaxes);
    }
  }

  /**
  * KeepCountofSelectedOptions
  */
  public makeCount() {
    let count: number = 0;
    let purchaseInvoiceObject = _.cloneDeep(this.purchaseInvoiceObject);
    purchaseInvoiceObject.TaxList.forEach((tax: ITaxResponse) => {
      if (tax.isSelected) {
        count += 1;
      }
    });
    this.purchaseInvoiceObject = _.cloneDeep(purchaseInvoiceObject);
    return count;
  }
  /**
  * selectTaxOption
  */
  public selectTax(event, tax, idx) {
    if (event.target.checked) {
      console.log(tax);
      this.allPurchaseInvoices[idx].taxes[1] = tax.uniqueName;
      // this.allPurchaseInvoices[idx].taxes[0] = tax.uniqueName;
      console.log(this.allPurchaseInvoices[idx]);
    } else {
      event.preventDefault();
      this.toasty.errorToast('Minimun 1 tax should be selected.');
      return;
    }
    // if (event.target.checked) {
    //   let purchaseInvoiceObject = _.cloneDeep(this.purchaseInvoiceObject);
    //   purchaseInvoiceObject.TaxList[0] = tax;
    //   $('.invoiceTax').prop('checked', false);
    //   $(elem).prop('checked', true);
    // } else {
    //   $(elem).prop('checked', true);
    //   this.toasty.errorToast('Minimun 1 tax should be selected.');
    //   return;
    // }

    // if (event.target.checked) {
    //   let purchaseInvoiceObject = _.cloneDeep(this.purchaseInvoiceObject);
    //   // purchaseInvoiceObject.TaxList.push(tax);
    //   purchaseInvoiceObject.TaxList[0] = tax;
    //   if (this.makeCount() === purchaseInvoiceObject.TaxList.length) {
    //     purchaseInvoiceObject.isAllTaxSelected = true;
    //     this.purchaseInvoiceObject = _.cloneDeep(purchaseInvoiceObject);
    //   }
    //   this.purchaseInvoiceObject = _.cloneDeep(purchaseInvoiceObject);
    // } else {
    //   let purchaseInvoiceObject = _.cloneDeep(this.purchaseInvoiceObject);
    //   if (this.makeCount() === purchaseInvoiceObject.TaxList.length) {
    //     let purchaseInvoiceObj = _.cloneDeep(this.purchaseInvoiceObject);
    //     purchaseInvoiceObj.isAllTaxSelected = false;
    //     // purchaseInvoiceObject.TaxList.pop();
    //     this.purchaseInvoiceObject = _.cloneDeep(purchaseInvoiceObject);
    //   }
    //   this.purchaseInvoiceObject = _.cloneDeep(purchaseInvoiceObject);
    // }
  }

  /**
  * toggle dropdown heading
  */
  public onDDShown() {
    this.dropdownHeading = 'Selected Taxes';
  }

  /**
  * toggle dropdown heading
  */
  public onDDHidden(uniqueName: string, accountUniqueName: string) {
    let taxUniqueNames: string[] = [];
    this.dropdownHeading = 'Select Taxes';
    let purchaseInvoiceRequestObject = _.cloneDeep(this.purchaseInvoiceRequestObject);
    let purchaseInvoiceObject = _.cloneDeep(this.purchaseInvoiceObject);
    purchaseInvoiceRequestObject.entryUniqueName.push(uniqueName);
    purchaseInvoiceRequestObject.taxes = purchaseInvoiceObject.TaxList;
    for (let tax of purchaseInvoiceRequestObject.taxes) {
      taxUniqueNames.push(tax.uniqueName);
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    // Call the Update Entry Type API
    // If user change the page and counter is running...
    if (this.intervalId && this.intervalId._state === 'running') {
      this.updateEntryType(this.selectedRowIndex, this.selectedEntryTypeValue);
    }
  }

  /**
   * generateInvoice
   */
  public generateInvoice(item, event) {
    if (event.target.checked) {
      this.generateInvoiceArr[0] = item; // temporary fix for single invoice generate
      this.invoiceSelected = true;
    } else {
      _.remove(this.generateInvoiceArr, (obj) => obj.entryUniqueName === item.entryUniqueName);
      this.invoiceSelected = false;
    }
    console.log(this.generateInvoiceArr);
  }

  /**
   * editRow
   */
  public editRow(idx) {
    this.selectedRowIndex = idx;
    this.editMode = true;
    console.log(idx);
  }

  /**
   * updateEntry
   */
  public updateEntry(invoiceObj) {
    console.log(invoiceObj);
    let invoice = _.cloneDeep(invoiceObj);
    if (invoice.invoiceNumber) {
      let dataToSave = {
        accountUniqueName: invoice.account.uniqueName,
        voucherNo: invoice.invoiceNumber,
        ledgerUniqname: invoice.entryUniqueName
      };
      this.store.dispatch(this.invoicePurchaseActions.UpdatePurchaseEntry(dataToSave));
    }
    this.editMode = false;
    this.selectedRowIndex = null;
  }

  /**
   * COMMENTED DUE TO PHASE-2
   * validateGstin
   */
  // public validateGstin(val, idx) {
  //   if (val && val.length === 15) {
  //     let code = val.substr(0, 2);
  //     console.log(code);
  //     let Gststate = this.stateList.filter((obj) => obj.code === code);
  //     if (_.isEmpty(Gststate)) {
  //       this.toasty.errorToast(val + ' Invalid GSTIN Number.');
  //     }
  //     console.log(Gststate);
  //   } else if (val) {
  //     this.toasty.errorToast(val + ' Invalid GSTIN Number.');
  //     console.log(idx);
  //   }
  // }

}
