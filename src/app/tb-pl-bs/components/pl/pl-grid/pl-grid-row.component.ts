import { ChangeDetectionStrategy, Component, Input, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { ChildGroup } from '../../../../models/api-models/Search';

@Component({
  selector: '[pl-grid-row]',  // <home></home>
  template: `
    <div class="pl-grid-row" [trial-accordion]="groupDetail" *ngIf="groupDetail.groupName && (groupDetail.isVisible || groupDetail.isCreated)" [ngClass]="{'isHidden': !groupDetail.isVisible }">
      <div class="col-xs-4  group" [innerHTML]="groupDetail.groupName | highlight:search" [ngStyle]="{'padding-left': padding+'px'}"></div>
      <div class="col-xs-3  bdrL group text-right pull-right" *ngIf="!groupDetail.level1">
      <!-- {{groupDetail.closingBalance | recType}} -->
        <span> {{groupDetail.closingBalance.amount | number:'1.2-2'}} </span>
      </div>
      <div class="col-xs-3  bdrL group text-right pull-right pd1" *ngIf="groupDetail.level1">&nbsp;</div>
<!--    <div class="col-xs-2  bdrL group text-right"> <span>{{groupDetail.forwardedBalance.amount | number:'1.2-2'}}{{groupDetail.forwardedBalance | recType}} </span></div> -->
    </div>
    <ng-container *ngFor="let account of groupDetail.accounts">
      <section class=" row-2  pl-grid-row" [ngClass]="{'isHidden': !account.isVisible }" *ngIf="account.isVisible || account.isCreated">
        <div class="" *ngIf="account.name && (account.closingBalance.amount !== 0 || account.openingBalance.amount !== 0)">
          <div class="col-xs-4" [ngStyle]="{'padding-left': (padding+20)+'px'}" [innerHTML]="account.name | lowercase  | highlight:search"  ></div>
          <div class="col-xs-3 bdrL text-left pull-right">
          <!-- {{account.closingBalance | recType}} -->
            <span class="mrL3">{{account.closingBalance.amount | number:'1.2-2'}}</span>
          </div>
          <!-- <div class="col-xs-2 bdrL text-left"><span>{{account.openingBalance.amount | number:'1.2-2'}}{{account.openingBalance | recType}}</span></div> -->
        </div>
      </section>
    </ng-container>
    <ng-content></ng-content>
  `,
})
export class PlGridRowComponent implements OnInit, OnChanges {
  @Input() public groupDetail: ChildGroup;
  @Input() public search: string;
  @Input() public padding: string;
  @Input() public incomeStatement: any;
  constructor(private cd: ChangeDetectorRef) {
    //
  }
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.groupDetail && !changes.groupDetail.firstChange && changes.groupDetail.currentValue !== changes.groupDetail.previousValue) {
      this.cd.detectChanges();
    }
    if (changes.search && !changes.search.firstChange && changes.search.currentValue !== changes.search.previousValue) {
      this.cd.detectChanges();
    }
  }
  public ngOnInit() {
    //
  }
}
