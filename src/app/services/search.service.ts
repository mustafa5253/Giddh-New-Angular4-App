import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpWrapperService } from './httpWrapper.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../store/roots';
import { Observable } from 'rxjs/Observable';
import { BaseResponse } from '../models/api-models/BaseResponse';
import { UserDetails } from '../models/api-models/loginModels';
import { SEARCH_API } from './apiurls/search.api';
import { SearchRequest, SearchResponse } from '../models/api-models/Search';
import { ErrorHandler } from './catchManager/catchmanger';

@Injectable()
export class SearchService {
  private companyUniqueName: string;
  private user: UserDetails;

  constructor(private errorHandler: ErrorHandler, public _http: HttpWrapperService, public _router: Router, private store: Store<AppState>) {
  }

  /**
   * get GetStocksReport
   */
  public Search(request: SearchRequest): Observable<BaseResponse<SearchResponse[], SearchRequest>> {
    this.store.take(1).subscribe(s => {
      if (s.session.user) {
        this.user = s.session.user.user;
      }
      this.companyUniqueName = s.session.companyUniqueName;
    });
    return this._http.get(SEARCH_API.SEARCH
      .replace(':companyUniqueName', encodeURIComponent(this.companyUniqueName))
      .replace(':groupName', encodeURIComponent(request.groupName)),
      { from: request.fromDate, to: request.toDate, refresh: request.refresh })
      .map((res) => {
        return res.json();
      })
      .catch((e) => this.errorHandler.HandleCatch<SearchResponse[], SearchRequest>(e));
  }

}
