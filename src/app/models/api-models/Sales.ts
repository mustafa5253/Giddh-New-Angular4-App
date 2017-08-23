/**
 * draw invoice on ui and api model related class and interface
*/
class CompanyClass {
  public name: string;
  public data: any[];
}

class SignatureClass {
  public name: string;
  public data: string;
  public path: string;
}

class InvoiceDetailsClass {
  public invoiceNumber: string;
  public invoiceDate: string;
  public dueDate: string;
}

class GstDetailsClass {
  public gstNumber?: any;
  public address: string[];
  public stateCode?: any;
  public panNumber?: any;
}

class AccountClass {
  public name: string;
  public uniqueName: string;
  public data: string[];
  public attentionTo: string;
  public email: string;
  public mobileNumber?: any;
  public billingDetails: GstDetailsClass;
  public shippingDetails: GstDetailsClass;
  constructor() {
    this.billingDetails = new GstDetailsClass();
    this.shippingDetails = new GstDetailsClass();
  }
}

class ICommonItemOfTransaction {
  public amount: number;
  public accountUniqueName: string;
  public accountName: string;
}

class ITransaction extends ICommonItemOfTransaction {
  public discount: any[];
  public description: string;
}

class IRoundOff {
  public transaction: ITransaction;
  public uniqueName: string;
  public isTransaction: boolean;
  public balanceType: string;
}

class IEntry {
  public uniqueName: string;
  public transactions: ITransaction[];
}

class ITotaltaxBreakdown {
  public amount: number;
  public visibleTaxRate: number;
  public accountName: string;
  public accountUniqueName: string;
  public hasError: boolean;
  public taxRate: number;
  public errorMessage: string;
}

class CountryClass {
  public countryName: string;
  public countryCode: string;
}

export class InvoiceFormClass {
  public logo: string;
  public company: CompanyClass;
  public customerName: string;
  public account: AccountClass;
  public signature: SignatureClass;
  public templateUniqueName: string;
  public roundOff: IRoundOff;
  public balanceStatus: string;
  public balanceStatusSealPath: string;
  public commonDiscounts: any[];
  public entries: IEntry[];
  public totalTaxableValue: number;
  public grandTotal: number;
  public totalInWords?: any;
  public subTotal: number;
  public totalDiscount: number;
  public totaltaxBreakdown: ITotaltaxBreakdown[];
  public totalTax?: any;
  public invoiceDetails: InvoiceDetailsClass;
  public other?: any;
  public country: CountryClass;
  constructor() {
    this.invoiceDetails = new InvoiceDetailsClass();
    this.totaltaxBreakdown = [new ITotaltaxBreakdown()];
    this.entries = [new IEntry ()];
    this.commonDiscounts = [];
    this.roundOff = new IRoundOff();
    this.company = new CompanyClass();
    this.account = new AccountClass();
    this.signature = new SignatureClass();
    this.country = new CountryClass();
  }
}
/**
 * end draw invoice on ui and api model related class and interface
*/
