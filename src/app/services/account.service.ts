import { Observable } from 'rxjs/Observable';
import { HttpWrapperService } from './httpWrapper.service';
import { Injectable, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { AccountMergeRequest, AccountRequest, AccountUnMergeRequest, AccountResponse, AccountMoveRequest, ShareAccountRequest, AccountSharedWithResponse, FlattenAccountsResponse, AccountsTaxHierarchyResponse } from '../models/api-models/Account';
import { ACCOUNTS_API } from './apiurls/account.api';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { UserDetails } from '../models/api-models/loginModels';
import { BaseResponse } from '../models/api-models/BaseResponse';
import { HandleCatch } from './catchManager/catchmanger';
import { APPLY_TAX_API } from './apiurls/applyTax.api';
import { ApplyTaxRequest } from '../models/api-models/ApplyTax';

@Injectable()
export class AccountService implements OnInit {

  private user: UserDetails;
  private companyUniqueName: string;
  constructor(private _http: HttpWrapperService, private store: Store<AppState>) {
  }

  public ngOnInit() {
    //
  }

  /**
   * Create Account Service
   */
  public CreateAccount(model: AccountRequest, groupUniqueName: string): Observable<BaseResponse<AccountResponse, AccountRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.post(ACCOUNTS_API.CREATE.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':groupUniqueName', encodeURIComponent(groupUniqueName)), model)
      .map((res) => {
        let data: BaseResponse<AccountResponse, AccountRequest> = res.json();
        data.request = model;
        data.queryString = { groupUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<AccountResponse, AccountRequest>(e, model, { groupUniqueName }));
  }

  public UpdateAccount(model: AccountRequest, accountName: string): Observable<BaseResponse<AccountResponse, AccountRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.put(ACCOUNTS_API.UPDATE.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountName', accountName), model)
      .map((res) => {
        let data: BaseResponse<AccountResponse, AccountRequest> = res.json();
        data.request = model;
        data.queryString = { accountName };
        return data;
      })
      .catch((e) => HandleCatch<AccountResponse, AccountRequest>(e));
  }

  public GetAccountDetails(accountUniqueName: string): Observable<BaseResponse<AccountResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(ACCOUNTS_API.DETAILS.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName)).map((res) => {
      let data: BaseResponse<AccountResponse, string> = res.json();
      data.queryString = { accountUniqueName };
      return data;
    }).catch((e) => HandleCatch<AccountResponse, string>(e));
  }

  public GetAccountUniqueName(accountUniqueName: string): Observable<BaseResponse<AccountResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(ACCOUNTS_API.DETAILS.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName)).map((res) => {
      let data: BaseResponse<AccountResponse, string> = res.json();
      data.queryString = { accountUniqueName };
      data.request = accountUniqueName;
      return data;
    }).catch((e) => HandleCatch<AccountResponse, string>(e));
  }

  public MergeAccount(model: AccountMergeRequest[], accountUniqueName: string): Observable<BaseResponse<string, AccountMergeRequest[]>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.put(ACCOUNTS_API.MERGE_ACCOUNT.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<string, AccountMergeRequest[]> = res.json();
        data.request = model;
        data.queryString = { accountUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<string, AccountMergeRequest[]>(e));
  }

  public UnmergeAccount(model: AccountUnMergeRequest, accountUniqueName: string): Observable<BaseResponse<string, AccountUnMergeRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.post(ACCOUNTS_API.UNMERGE_ACCOUNT.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<string, AccountUnMergeRequest> = res.json();
        data.request = model;
        data.queryString = { accountUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<string, AccountUnMergeRequest>(e));
  }

  public ApplyTax(model: ApplyTaxRequest): Observable<BaseResponse<string, ApplyTaxRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    let mod = [];
    mod.push(model);
    return this._http.post(APPLY_TAX_API.APPLY_TAX.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)), mod)
      .map((res) => {
        let data: BaseResponse<string, ApplyTaxRequest> = res.json();
        data.request = model;
        return data;
      })
      .catch((e) => HandleCatch<string, ApplyTaxRequest>(e));
  }
  public AccountMove(model: AccountMoveRequest, accountUniqueName: string): Observable<BaseResponse<string, AccountMoveRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.put(ACCOUNTS_API.MOVE.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<string, AccountMoveRequest> = res.json();
        data.request = model;
        data.queryString = { accountUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<string, AccountMoveRequest>(e));
  }
  public AccountShare(model: ShareAccountRequest, accountUniqueName: string): Observable<BaseResponse<string, ShareAccountRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.put(ACCOUNTS_API.SHARE.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName), model)
      .map((res) => {
        let data: BaseResponse<string, ShareAccountRequest> = res.json();
        data.request = model;
        data.queryString = { accountUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<string, ShareAccountRequest>(e));
  }
  public AccountUnshare(userEmail: string, accountUniqueName: string): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });

    return this._http.put(ACCOUNTS_API.UNSHARE.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName), { user: userEmail }).map((res) => {
      let data: BaseResponse<string, string> = res.json();
      data.request = userEmail;
      data.queryString = { accountUniqueName };
      return data;
    }).catch((e) => HandleCatch<string, string>(e));
  }
  public AccountShareWith(accountUniqueName: string): Observable<BaseResponse<AccountSharedWithResponse[], string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
        this.companyUniqueName = s.session.companyUniqueName;
      }
    });
    return this._http.get(ACCOUNTS_API.SHARED_WITH.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName))
      .map((res) => {
        let data: BaseResponse<AccountSharedWithResponse[], string> = res.json();
        data.request = '';
        data.queryString = { accountUniqueName };
        return data;
      })
      .catch((e) => HandleCatch<AccountSharedWithResponse[], string>(e));
  }
  public DeleteAccount(accountUniqueName: string): Observable<BaseResponse<string, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.delete(ACCOUNTS_API.DELETE_ACCOUNT.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName)).map((res) => {
      let data: BaseResponse<string, string> = res.json();
      data.request = accountUniqueName;
      data.queryString = { accountUniqueName };
      return data;
    }).catch((e) => HandleCatch<string, string>(e, accountUniqueName, { accountUniqueName }));
  }

  public GetFlattenAccounts(q?: string, page?: string, count?: string): Observable<BaseResponse<FlattenAccountsResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(ACCOUNTS_API.FLATTEN_ACCOUNTS.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':q', q || '').replace(':count', count || '').replace(':page', page || '')).map((res) => {
      let data: BaseResponse<FlattenAccountsResponse, string> = res.json();
      data.request = '';
      data.queryString = { q, page, count };
      return data;
    }).catch((e) => HandleCatch<FlattenAccountsResponse, string>(e));
  }

  public GetFlatternAccountsOfGroup(groupUniqueNames: { groupUniqueNames: string[] }, count?: any, q?: string, page?: any): Observable<BaseResponse<FlattenAccountsResponse, { groupUniqueNames: string[] }>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.post(ACCOUNTS_API.FLATTEN_ACCOUNTS_OF_GROUPS.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':count', count || 0).replace(':q', q || '').replace(':page', page || 1), groupUniqueNames).map((res) => {
      let data: BaseResponse<FlattenAccountsResponse, { groupUniqueNames: string[] }> = res.json();
      data.request = groupUniqueNames;
      data.queryString = { count, q, page };
      return data;
    }).catch((e) => HandleCatch<FlattenAccountsResponse, { groupUniqueNames: string[] }>(e));
  }

  public GetTaxHierarchy(accountUniqueName: string): Observable<BaseResponse<AccountsTaxHierarchyResponse, string>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(ACCOUNTS_API.TAX_HIERARCHY.replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName)).replace(':accountUniqueName', accountUniqueName)).map((res) => {
      let data: BaseResponse<AccountsTaxHierarchyResponse, string> = res.json();
      data.request = '';
      data.queryString = { accountUniqueName };
      return data;
    }).catch((e) => HandleCatch<AccountsTaxHierarchyResponse, string>(e));
  }
}
