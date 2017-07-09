import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/roots';
import { InventoryAction } from '../../../services/actions/inventory/inventory.actions';
import { StockGroupResponse } from '../../../models/api-models/Inventory';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Component({
  selector: 'inventory-header',
  styles: [`
  `],
  template: `
  <div class="stock-bar" style="border-bottom:none;">
  <div class="top_row clearfix">
    <div class="pull-right">
      <button [routerLink]="['custom-stock']" type="button" class="btn btn-primary mrL1">Custom Stock Unit</button>
      <button type="button" class="btn btn-primary mrL1" (click)="goToAddGroup()">Add Group</button>
      <button type="button" *ngIf="activeGroupName$ | async" class="btn btn-primary mrL1" (click)="goToAddStock()">Add Stock</button>
    </div>
  </div>
</div>
  `
})
export class InventoryHearderComponent implements  OnDestroy, OnInit {
  public activeGroupName$: Observable<string>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private router: Router, private store: Store<AppState>, private inventoryAction: InventoryAction) {
  }
  public ngOnInit() {
    // get activeGroup
    this.activeGroupName$ = this.store.select(s => s.inventory.activeGroupUniqueName).takeUntil(this.destroyed$);
  }

  public goToAddGroup() {
    this.store.dispatch(this.inventoryAction.resetActiveGroup());
    this.router.navigate(['/pages', 'inventory', 'add-group']);
  }
  public goToAddStock() {
    this.store.dispatch(this.inventoryAction.resetActiveStock());
    let groupName = null;
    this.activeGroupName$.take(1).subscribe(s => groupName = s);
    this.router.navigate(['/pages', 'inventory', 'add-group', groupName, 'add-stock']);
  }
  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}