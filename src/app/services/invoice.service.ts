import { Observable } from 'rxjs/Observable';
import { HttpWrapperService } from './httpWrapper.service';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { UserDetails } from '../models/api-models/loginModels';
import { BaseResponse } from '../models/api-models/BaseResponse';
import { HandleCatch } from './catchManager/catchmanger';
import { INVOICE_API } from './apiurls/invoice.api';
import { CommonPaginatedRequest, IGetAllInvoicesResponse, GetAllLedgersForInvoiceResponse, InvoiceFilterClass, GenerateBulkInvoiceRequest, PreviewInvoiceRequest, ActionOnInvoiceRequest, GetInvoiceTemplateDetailsResponse, InvoiceTemplateDetailsResponse, GenerateInvoiceRequestClass, PreviewInvoiceResponseClass } from '../models/api-models/Invoice';
import { InvoiceSetting } from '../models/interfaces/invoice.setting.interface';
import { RazorPayDetailsResponse } from '../models/api-models/SettingsIntegraion';
import * as _ from 'lodash';

@Injectable()
export class InvoiceService {

  private user: UserDetails;
  private companyUniqueName: string;

  constructor(private _http: HttpWrapperService, private store: Store<AppState>) {
  }

  /**
   * get INVOICES
   * URL:: company/:companyUniqueName/invoices?from=&to=
   */
  public GetAllInvoices(model: CommonPaginatedRequest): Observable<BaseResponse<IGetAllInvoicesResponse, CommonPaginatedRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    // create url conditionally
    let url = this.createQueryString(INVOICE_API.GET_ALL_INVOICES, model);

    return this._http.get(url.replace(':companyUniqueName', this.companyUniqueName))
      .map((res) => {
        let data: BaseResponse<IGetAllInvoicesResponse, CommonPaginatedRequest> = res.json();
        data.request = model;
        data.queryString = { model };
        return data;
      })
      .catch((e) => HandleCatch<IGetAllInvoicesResponse, CommonPaginatedRequest>(e, ''));
  }

  /*
  * get all Ledgers for Invoice
  */

  public GetAllLedgersForInvoice(reqObj: CommonPaginatedRequest, model: InvoiceFilterClass): Observable<BaseResponse<GetAllLedgersForInvoiceResponse, CommonPaginatedRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    // create url conditionally
    let url = this.createQueryString(INVOICE_API.GET_ALL_LEDGERS_FOR_INVOICE, reqObj);
    return this._http.post(url.replace(':companyUniqueName', this.companyUniqueName), model)
      .map((res) => {
        let data: BaseResponse<GetAllLedgersForInvoiceResponse, CommonPaginatedRequest> = res.json();
        data.request = model;
        data.queryString = { reqObj };
        return data;
      })
      .catch((e) => HandleCatch<GetAllLedgersForInvoiceResponse, CommonPaginatedRequest>(e, reqObj, model));
  }

  /*
  * get url ready with querystring params
  * pass url and model obj
  */

  public createQueryString(str, model) {
    let url = str;
    if ((model.from)) {
      url = url + 'from=' + model.from + '&';
    }
    if ((model.to)) {
      url = url + 'to=' + model.to + '&';
    }
    if ((model.page)) {
      url = url + 'page=' + model.page + '&';
    }
    if ((model.count)) {
      url = url + 'count=' + model.count;
    }
    return url;
  }

  /*
  * Generate Bulk Invoice
  * method: 'POST'
  * url: '/company/:companyUniqueName/invoices/bulk-generate?combined=:combined'
  */

  public GenerateBulkInvoice(reqObj: { combined: boolean }, model: GenerateBulkInvoiceRequest[]): Observable<BaseResponse<string, GenerateBulkInvoiceRequest[]>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    // create url
    let url = INVOICE_API.GENERATE_BULK_INVOICE + '=' + reqObj.combined;
    return this._http.post(url.replace(':companyUniqueName', this.companyUniqueName), model)
      .map((res) => {
        let data: BaseResponse<string, GenerateBulkInvoiceRequest[]> = res.json();
        data.request = model;
        data.queryString = { reqObj };
        return data;
      })
      .catch((e) => HandleCatch<string, GenerateBulkInvoiceRequest[]>(e, reqObj, model));
  }

  /*
  * Preview Invoice
  * method: 'POST'
  * url: '/company/:companyUniqueName/accounts/:accountUniqueName/invoices/preview'
  */

  public PreviewInvoice(accountUniqueName: string, model: PreviewInvoiceRequest): Observable<BaseResponse<PreviewInvoiceResponseClass, PreviewInvoiceRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.post(INVOICE_API.PREVIEW_INVOICE.replace(':companyUniqueName', this.companyUniqueName).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<PreviewInvoiceResponseClass, PreviewInvoiceRequest> = res.json();
        data.request = model;
        return data;
      })
      .catch((e) => HandleCatch<PreviewInvoiceResponseClass, PreviewInvoiceRequest>(e, model));
  }

  /**
   * Generate Invoice
   */
  public GenerateInvoice(accountUniqueName: string, model: GenerateInvoiceRequestClass): Observable<BaseResponse<GenerateInvoiceRequestClass, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.post(INVOICE_API.GENERATE_INVOICE.replace(':companyUniqueName', this.companyUniqueName).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<GenerateInvoiceRequestClass, string> = res.json();
        data.request = '';
        return data;
      })
      .catch((e) => HandleCatch<GenerateInvoiceRequestClass, string>(e, model));
  }

  /**
   * get template by uniquename
   * URL:: company/:companyUniqueName/templates-v2/templateUniqueName
   */
  public GetInvoiceTemplateDetails(templateUniqueName: string): Observable<BaseResponse<InvoiceTemplateDetailsResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(INVOICE_API.GET_INVOICE_TEMPLATE_DETAILS.replace(':companyUniqueName', this.companyUniqueName).replace(':templateUniqueName', templateUniqueName))
      .map((res) => {
        let data: BaseResponse<InvoiceTemplateDetailsResponse, string> = res.json();
        data.request = templateUniqueName;
        data.queryString = { templateUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<InvoiceTemplateDetailsResponse, string>(e, templateUniqueName));
  }

  /**
   * Delete invoice
   * URL:: company/:companyUniqueName/invoices/:invoiceUniqueName
   */
  public DeleteInvoice(invoiceNumber: string): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.delete(INVOICE_API.DELETE_INVOICE.replace(':companyUniqueName', this.companyUniqueName).replace(':invoiceNumber', invoiceNumber))
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.request = invoiceNumber;
        data.queryString = { invoiceNumber };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e, invoiceNumber));
  }

  /**
   * Perform Action On Invoice
   * URL:: company/:companyUniqueName/invoices/:invoiceUniqueName
   */
  public PerformActionOnInvoice(invoiceUniqueName: string, action: { action: string, amount?: number }): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.post(INVOICE_API.ACTION_ON_INVOICE.replace(':companyUniqueName', this.companyUniqueName).replace(':invoiceUniqueName', invoiceUniqueName), action)
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.request = invoiceUniqueName;
        data.queryString = { invoiceUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e, invoiceUniqueName));
  }

  /**
   * get invoice setting
   * URL:: company/:companyUniqueName/settings
   */
  public GetInvoiceSetting(): Observable<BaseResponse<InvoiceSetting, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(INVOICE_API.SETTING_INVOICE.replace(':companyUniqueName', this.companyUniqueName))
      .map((res) => {
        let data: BaseResponse<InvoiceSetting, string> = res.json();
        return data;
      })
      .catch((e) => HandleCatch<InvoiceSetting, string>(e));
  }

  /**
   * delete invoice webhook
   * URL:: company/:companyUniqueName/settings/webhooks/:webhookUniqueName
   */
  public DeleteInvoiceWebhook(uniquename): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.delete(INVOICE_API.DELETE_WEBHOOK.replace(':companyUniqueName', this.companyUniqueName).replace(':webhookUniquename', uniquename))
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.queryString = { uniquename };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
   * update invoice emailId
   * URL:: company/:companyUniqueName/invoice-setting
   */
  public UpdateInvoiceEmail(emailId): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.put(INVOICE_API.UPDATE_INVOICE_EMAIL.replace(':companyUniqueName', this.companyUniqueName), { emailAddress: emailId })
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.queryString = { emailId };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
 * Save Invoice Webhook
 * URL:: company/:companyUniqueName/settings/webhooks
 */
  public SaveInvoiceWebhook(webhook): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.post(INVOICE_API.SAVE_INVOICE_WEBHOOK.replace(':companyUniqueName', this.companyUniqueName), webhook)
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.queryString = { webhook };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
   * Update Invoice Setting
   * URL:: company/:companyUniqueName/settings/
   */
  public UpdateInvoiceSetting(form): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.put(INVOICE_API.SETTING_INVOICE.replace(':companyUniqueName', this.companyUniqueName), form)
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        data.queryString = { form };
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
   * Get razorPay details
   * URL:: company/:companyUniqueName/razorpay
   */
  public GetRazorPayDetail(): Observable<BaseResponse<RazorPayDetailsResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(INVOICE_API.GET_RAZORPAY_DETAIL.replace(':companyUniqueName', this.companyUniqueName))
      .map((res) => {
        let data: BaseResponse<RazorPayDetailsResponse, string> = res.json();
        return data;
      })
      .catch((e) => HandleCatch<RazorPayDetailsResponse, string>(e));
  }

  /**
   * Update razorPay details
   * URL:: company/:companyUniqueName/razorpay
   */
  public UpdateRazorPayDetail(form): Observable<BaseResponse<RazorPayDetailsResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
      let newForm = _.cloneDeep(form);
      newForm.companyName = s.session.companyUniqueName;
      form = _.cloneDeep(newForm);
    });
    return this._http.post(INVOICE_API.GET_RAZORPAY_DETAIL.replace(':companyUniqueName', this.companyUniqueName), form)
      .map((res) => {
        let data: BaseResponse<RazorPayDetailsResponse, string> = res.json();
        data.queryString = { form };
        return data;
      })
      .catch((e) => HandleCatch<RazorPayDetailsResponse, string>(e));
  }

  /**
   * Delete razorPay details
   * URL:: company/:companyUniqueName/razorpay
   */
  public DeleteRazorPayDetail(): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.delete(INVOICE_API.GET_RAZORPAY_DETAIL.replace(':companyUniqueName', this.companyUniqueName))
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
   * Delete Invoice emailID
   * URL:: company/:companyUniqueName/razorpay
   */
  public DeleteInvoiceEmail(emailId): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.put(INVOICE_API.UPDATE_INVOICE_EMAIL.replace(':companyUniqueName', this.companyUniqueName), { emailAddress: emailId })
      .map((res) => {
        let data: BaseResponse<string, string> = res.json();
        return data;
      })
      .catch((e) => HandleCatch<string, string>(e));
  }

  /**
   * Save razorPay details
   * URL:: company/:companyUniqueName/razorpay
   */
  public SaveRazorPayDetail(form): Observable<BaseResponse<RazorPayDetailsResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
      let newForm = _.cloneDeep(form);
      newForm.companyName = s.session.companyUniqueName;
      form = _.cloneDeep(newForm);
    });
    return this._http.put(INVOICE_API.GET_RAZORPAY_DETAIL.replace(':companyUniqueName', this.companyUniqueName), form)
      .map((res) => {
        let data: BaseResponse<RazorPayDetailsResponse, string> = res.json();
        data.queryString = { form };
        return data;
      })
      .catch((e) => HandleCatch<RazorPayDetailsResponse, string>(e));
  }

}