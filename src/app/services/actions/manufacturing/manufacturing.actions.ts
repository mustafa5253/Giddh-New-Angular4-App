import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { BaseResponse } from '../../../models/api-models/BaseResponse';
import { ManufacturingService } from '../../manufacturing.service';
import { AppState } from '../../../store/roots';
import { MANUFACTURING_ACTIONS } from './manufacturing.const';
import { IManufacturingUnqItemObj, ICommonResponseOfManufactureItem, IManufacturingItemRequest, IMfStockSearchRequest } from '../../../models/interfaces/manufacturing.interface';
import { ToasterService } from '../../toaster.service';
import { Router } from '@angular/router';
import { StocksResponse } from '../../../models/api-models/Inventory';

@Injectable()
export class ManufacturingActions {
  // GET MF Report
  @Effect()
  private GetMfReport$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.MF_REPORT)
    .switchMap(action => this._manufacturingService.GetMfReport(action.payload))
    .map(response => {
      return this.GetMfReportResponse(response);
    });

  @Effect()
  private GetMfReportResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.MF_REPORT_RESPONSE)
    .map(response => {
      let data: BaseResponse<ICommonResponseOfManufactureItem, ICommonResponseOfManufactureItem> = response.payload;
      if (data.status === 'error') {
        this._toasty.errorToast(data.message, data.code);
      }
      return { type : ''};
    });

  // GET STOCK WITH RATE
  @Effect()
  private GetStockWithRate$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.GET_STOCK_WITH_RATE)
    .switchMap(action => this._manufacturingService.GetStockWithRate(action.payload))
    .map(response => {
      return this.GetStockWithRateResponse(response);
    });

  @Effect()
  private GetStockWithRateResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.GET_STOCK_WITH_RATE_RESPONSE)
    .map(response => {
      let data: BaseResponse<ICommonResponseOfManufactureItem, ICommonResponseOfManufactureItem> = response.payload;
      if (data.status === 'error') {
        this._toasty.errorToast(data.message, data.code);
      }
      return { type : ''};
    });

  // GET MANUFACTURING ITEM DETAIL
  @Effect()
  private GetMFItemDetail$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.GET_MF_ITEM_DETAILS)
    .switchMap(action => this._manufacturingService.GetManufacturingItem(action.payload))
    .map(response => {
      return this.GetMfItemDetailsResponse(response);
    });

  @Effect()
  private GetMFItemDetailResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.GET_MF_ITEM_DETAILS_RESPONSE)
    .map(response => {
      return { type : ''};
    });

  // CREATE MANUFACTURING ITEM
  @Effect()
  private CreateMFItem$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.CREATE_MF_ITEM)
    .switchMap(action => {
      return this._manufacturingService.CreateManufacturingItem(action.payload, action.payload.stockUniqueName)
        .map(response => this.CreateMfItemResponse(response));
    });

  @Effect()
  private CreateMFItemResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.CREATE_MF_ITEM_RESPONSE)
    .map(response => {
      let data: BaseResponse<ICommonResponseOfManufactureItem, ICommonResponseOfManufactureItem> = response.payload;
      if (data.status === 'error') {
        this._toasty.errorToast(data.message, data.code);
      } else {
        this._toasty.successToast('Manufacturing Entry Created Successfully');
        this._router.navigate(['/pages', 'manufacturing', 'report']);
      }
      return { type: '' };
    });

  // UPDATE MANUFACTURING ITEM
  @Effect()
  private UpdateMFItem$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.UPDATE_MF_ITEM)
    .switchMap(action => {
      return this._manufacturingService.UpdateManufacturingItem(action.payload, { stockUniqueName: action.payload.stockUniqueName, manufacturingUniqueName: action.payload.uniqueName })
        .map(response => this.UpdateMfItemResponse(response));
    });

  @Effect()
  private UpdateMFItemResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.UPDATE_MF_ITEM_RESPONSE)
    .map(response => {
      let data: BaseResponse<ICommonResponseOfManufactureItem, ICommonResponseOfManufactureItem> = response.payload;
      if (data.status === 'error') {
        this._toasty.errorToast(data.message, data.code);
      } else {
        this._toasty.successToast('Manufacturing Entry Updated Successfully');
        this._router.navigate(['/pages', 'manufacturing', 'report']);
      }
      return { type: '' };
    });

  // DELETE MANUFACTURING ITEM
  @Effect()
  private DeleteMFItem$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.DELETE_MF_ITEM)
    .switchMap(action => {
      return this._manufacturingService.DeleteManufacturingItem(action.payload) // Check here the parameter
        .map(response => this.DeleteMfItemResponse(response));
    });

  @Effect()
  private DeleteMFItemResponse$: Observable<Action> = this.action$
    .ofType(MANUFACTURING_ACTIONS.DELETE_MF_ITEM_RESPONSE)
    .map(response => {
      let data: BaseResponse<ICommonResponseOfManufactureItem, ICommonResponseOfManufactureItem> = response.payload;
      if (data.status === 'error') {
        this._toasty.errorToast(data.message, data.code);
      } else {
        this._toasty.successToast('Manufacturing Entry Deleted Successfully');
        this._router.navigate(['/pages', 'manufacturing', 'report']);
      }
      return { type: '' };
    });

  constructor(
    private action$: Actions,
    private _manufacturingService: ManufacturingService,
    private _toasty: ToasterService,
    private _router: Router
) {}

  public GetStockWithRate(value: string): Action {
    return {
      type: MANUFACTURING_ACTIONS.GET_STOCK_WITH_RATE,
      payload: { stockUniqueName: value }
    };
  }

  public GetStockWithRateResponse(value: BaseResponse<ICommonResponseOfManufactureItem, string>): Action {
    return {
      type: MANUFACTURING_ACTIONS.GET_STOCK_WITH_RATE_RESPONSE,
      payload: value
    };
  }

  public GetMfReport(value: IMfStockSearchRequest): Action {
    return {
      type: MANUFACTURING_ACTIONS.MF_REPORT,
      payload: value
    };
  }

  public GetMfReportResponse(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.MF_REPORT_RESPONSE,
      payload: value
    };
  }

  public GetMfItemDetails(): Action {
    return {
      type: MANUFACTURING_ACTIONS.GET_MF_ITEM_DETAILS
    };
  }

  public GetMfItemDetailsResponse(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.GET_MF_ITEM_DETAILS_RESPONSE,
      payload: value
    };
  }

  public CreateMfItem(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.CREATE_MF_ITEM,
      payload: value
    };
  }

  public CreateMfItemResponse(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.CREATE_MF_ITEM_RESPONSE,
      payload: value
    };
  }

  public UpdateMfItem(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.UPDATE_MF_ITEM,
      payload: value
    };
  }

  public UpdateMfItemResponse(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.UPDATE_MF_ITEM_RESPONSE,
      payload: value
    };
  }

  public DeleteMfItem(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.DELETE_MF_ITEM,
      payload: value
    };
  }

  public DeleteMfItemResponse(value): Action {
    return {
      type: MANUFACTURING_ACTIONS.DELETE_MF_ITEM_RESPONSE,
      payload: value
    };
  }

  public SetMFItemUniqueNameInStore(value: string): Action {
    return {
      type: MANUFACTURING_ACTIONS.SET_MF_ITEM_UNIQUENAME_IN_STORE,
      payload: value
    };
  }

  public RemoveMFItemUniqueNameFomStore(): Action {
    return {
      type: MANUFACTURING_ACTIONS.REMOVE_MF_ITEM_UNIQUENAME_FROM_STORE
    };
  }
}
