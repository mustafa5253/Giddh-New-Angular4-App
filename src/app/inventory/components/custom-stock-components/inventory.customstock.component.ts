import { Observable, of as observableOf, ReplaySubject } from 'rxjs';

import { find, take, takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/roots';
import { Store } from '@ngrx/store';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LoginActions } from '../services/actions/login.action';
import { StockUnitRequest } from '../../../models/api-models/Inventory';
import { CustomStockUnitAction } from '../../../actions/inventory/customStockUnit.actions';
import * as  _ from '../../../lodash-optimized';
import { InventoryAction } from '../../../actions/inventory/inventory.actions';
import { SidebarAction } from '../../../actions/inventory/sidebar.actions';
import { StockUnits } from './stock-unit';
import { SettingsProfileActions } from '../../../actions/settings/profile/settings.profile.action';
import { IOption } from '../../../theme/ng-virtual-select/sh-options.interface';
import { IForceClear } from 'app/models/api-models/Sales';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { uniqueNameInvalidStringReplace } from '../../../shared/helpers/helperFunctions';

@Component({
  selector: 'inventory-custom-stock',  // <home></home>
  templateUrl: './inventory.customstock.component.html',
  styles: [`
  .square-switch input[type="checkbox"]:checked~label {
    background: initial;
    color: initial;
  }
  .square-switch img {
    top: -1px;
    position: relative;
  }
  .division {
    display: flex;
    align-items: center;
  }
  .division>div {
    display: inline-block;
    width: auto;
    padding: 0 7px;
  }
  .hr {
    border-bottom: 2px solid #ddd;
    margin: 3px 0;
  }
  `]
})
export class InventoryCustomStockComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public isAsideClose: boolean;

  public stockUnitsDropDown$: Observable<IOption[]>;
  public activeGroupUniqueName$: Observable<string>;
  public stockUnit$: Observable<StockUnitRequest[]>;
  public editMode: boolean;
  public editCode: string;
  public customUnitObj: StockUnitRequest;
  public createCustomStockInProcess$: Observable<boolean>;
  public updateCustomStockInProcess$: Observable<boolean>;
  public deleteCustomStockInProcessCode$: Observable<any[]>;
  public createCustomStockSuccess$: Observable<boolean>;
  public stockUnitsList = StockUnits;
  public companyProfile: any;
  public country: string;
  public selectedUnitName: string;
  public isIndia: boolean;
  public forceClear$: Observable<IForceClear> = observableOf({status: false});
  public isStockUnitCodeAvailable$: Observable<boolean>;
  public isDivide: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private customStockActions: CustomStockUnitAction, private inventoryAction: InventoryAction,
              private sidebarAction: SidebarAction, private settingsProfileActions: SettingsProfileActions) {
    this.customUnitObj = new StockUnitRequest();
    this.stockUnit$ = this.store.select(p => p.inventory.stockUnits).pipe(takeUntil(this.destroyed$));
    this.isStockUnitCodeAvailable$ = this.store.select(state => state.inventory.isStockUnitCodeAvailable).pipe(takeUntil(this.destroyed$));

    this.store.select(state => state.inventory.stockUnits).pipe(takeUntil(this.destroyed$)).subscribe(p => {
      if (p && p.length) {
        let units = p;
        let unitArr = units.map(unit => {
          return {label: `${unit.name} (${unit.code})`, value: unit.code};
        });
        this.stockUnitsDropDown$ = observableOf(unitArr);
      }
    });

    this.store.select(p => p.settings.profile).pipe(takeUntil(this.destroyed$)).subscribe((o) => {
      if (!_.isEmpty(o)) {
        this.companyProfile = _.cloneDeep(o);
        if (this.companyProfile.country) {
          this.country = this.companyProfile.country.toLocaleLowerCase();
          if (this.country && this.country === 'india') {
            this.isIndia = true;
          }
        } else {
          this.country = 'india';
          this.isIndia = true;
        }
      } else {
        this.store.dispatch(this.settingsProfileActions.GetProfileInfo());
      }
    });
    this.activeGroupUniqueName$ = this.store.select(s => s.inventory.activeGroupUniqueName).pipe(takeUntil(this.destroyed$));
    this.createCustomStockInProcess$ = this.store.select(s => s.inventory.createCustomStockInProcess).pipe(takeUntil(this.destroyed$));
    this.updateCustomStockInProcess$ = this.store.select(s => s.inventory.updateCustomStockInProcess).pipe(takeUntil(this.destroyed$));
    this.deleteCustomStockInProcessCode$ = this.store.select(s => s.inventory.deleteCustomStockInProcessCode).pipe(takeUntil(this.destroyed$));
    this.createCustomStockSuccess$ = this.store.select(s => s.inventory.createCustomStockSuccess).pipe(takeUntil(this.destroyed$));
  }

  public ngOnInit() {
    let activeGroup = null;
    this.activeGroupUniqueName$.pipe(take(1)).subscribe(a => activeGroup = a);
    if (activeGroup) {
      this.store.dispatch(this.sidebarAction.OpenGroup(activeGroup));
    }

    // this.store.dispatch(this.inventoryAction.resetActiveGroup());
    this.store.dispatch(this.inventoryAction.resetActiveStock());
    this.store.dispatch(this.customStockActions.GetStockUnit());
    // this.stockUnit$.subscribe(p => this.clearFields());

    this.createCustomStockSuccess$.subscribe((a) => {
      if (a) {
        this.clearFields();
        this.selectedUnitName = null;
      }
    });

    this.updateCustomStockInProcess$.subscribe((a) => {
      if (!a) {
        this.clearFields();
        this.selectedUnitName = null;
      }
    });
  }

  public saveUnit(): any {
    let customUnitObj = _.clone(this.customUnitObj);
    if (!this.editMode) {
      if (this.isIndia && this.selectedUnitName) {
        customUnitObj.name = _.cloneDeep(this.selectedUnitName);
      }
      if (this.isDivide) {
        customUnitObj.quantityPerUnit = 1 / _.cloneDeep(customUnitObj.quantityPerUnit);
        customUnitObj.quantityPerUnit = Number(customUnitObj.quantityPerUnit.toFixed(4));
      }
      this.store.dispatch(this.customStockActions.CreateStockUnit(_.cloneDeep(customUnitObj)));
    } else {
      if (this.isDivide) {
        customUnitObj.quantityPerUnit =  1 / _.cloneDeep(customUnitObj.quantityPerUnit);
        customUnitObj.quantityPerUnit = Number(customUnitObj.quantityPerUnit.toFixed(4));
      }

      this.store.dispatch(this.customStockActions.UpdateStockUnit(_.cloneDeep(customUnitObj), this.editCode));
      this.customUnitObj.name = null;
    }
  }

  public deleteUnit(code): any {
    this.store.dispatch(this.customStockActions.DeleteStockUnit(code));
  }

  public editUnit(item: StockUnitRequest) {
    this.customUnitObj = Object.assign({}, item);
    this.setUnitName(this.customUnitObj.name);
    if (this.customUnitObj.parentStockUnit) {
      this.customUnitObj.parentStockUnitCode = item.parentStockUnit.code;
    }
    this.editCode = item.code;
    this.editMode = true;
  }

  public clearFields() {
    this.customUnitObj = new StockUnitRequest();
    this.forceClear$ = observableOf({status: true});
    this.customUnitObj.parentStockUnitCode = null;
    this.editMode = false;
    this.editCode = '';
    this.isDivide = false;

  }

  public change(v) {
    this.stockUnit$.pipe(find(p => {
      let unit = p.find(q => q.code === v);
      if (unit !== undefined) {
        this.customUnitObj.parentStockUnit = unit;
        return true;
      }
    })).subscribe();
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    // this.clearFields();
  }

  public setUnitName(name) {
    let unit = this.stockUnitsList.filter((obj) => obj.value === name || obj.label === name);
    if (unit !== undefined && unit.length > 0) {
      this.customUnitObj.code = unit[0].value;
      this.customUnitObj.name = unit[0].value;
      this.selectedUnitName = unit[0].label;
      this.checkIfUnitIsExist();
    }
  }

  public ngOnChanges(changes) {
    if (this.isAsideClose) {
      this.clearFields();
    }
  }

  /**
   * clearUnit
   */
  public clearUnit() {
    setTimeout(() => {
      this.customUnitObj.code = '';
    }, 100);
  }

  /**
   * checkIfUnitIsExist
   */
  public checkIfUnitIsExist() {
    if (this.editMode) {
      return true;
    }
    let groupName = null;
    let val: string = this.customUnitObj.code;
    if (val) {
      val = uniqueNameInvalidStringReplace(val);
    }

    if (val) {
      this.store.dispatch(this.customStockActions.GetStockUnitByName(val));

      this.isStockUnitCodeAvailable$.pipe(takeUntil(this.destroyed$)).subscribe(a => {
        if (a !== null && a !== undefined) {
          if (a) {
            this.customUnitObj.code = val;
          } else {
            let num = 1;
            this.customUnitObj.code = val + num;
          }
        }
      });
    } else {
      this.customUnitObj.code = '';
    }
  }

  /**
   * noUnitFound
   */
  public noUnitFound(selectElem) {
    if (selectElem) {
      let val: string = selectElem.filter;
      this.customUnitObj.name = _.cloneDeep(val);
      this.selectedUnitName = '';
      if (!this.editMode && val) {
        val = uniqueNameInvalidStringReplace(val);
        this.customUnitObj.code = _.cloneDeep(val);
      }
    }
  }

  /**
   * changeType
   */
  public changeType(ev) {
    this.isDivide = ev;
  }

}
