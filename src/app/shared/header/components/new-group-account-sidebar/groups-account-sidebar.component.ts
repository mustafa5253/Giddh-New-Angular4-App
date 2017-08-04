import { GroupResponse } from '../../../../models/api-models/Group';
import { GroupsWithAccountsResponse } from '../../../../models/api-models/GroupsWithAccounts';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IGroupsWithAccounts } from '../../../../models/interfaces/groupsWithAccounts.interface';
import { Observable } from 'rxjs/Observable';
import { AppState } from '../../../../store/roots';
import { Store } from '@ngrx/store';
import { GroupWithAccountsAction } from '../../../../services/actions/groupwithaccounts.actions';
import { AccountsAction } from '../../../../services/actions/accounts.actions';
import { ColumnGroupsAccountVM, GroupAccountSidebarVM } from './VM';
import { IAccountsInfo } from '../../../../models/interfaces/accountInfo.interface';
import * as _ from 'lodash';

@Component({
  selector: 'groups-account-sidebar',
  templateUrl: './groups-account-sidebar.component.html',
})
export class GroupsAccountSidebarComponent implements OnInit, OnChanges {
  public mc: GroupAccountSidebarVM;
  @Output() public ScrollToRight: EventEmitter<boolean> = new EventEmitter(true);
  @Output() public columnsChanged: EventEmitter<GroupAccountSidebarVM> = new EventEmitter();
  @Input() public groups: GroupsWithAccountsResponse[];
  public _groups: GroupsWithAccountsResponse[];
  @Input() public activeGroup: Observable<GroupResponse>;
  @Input() public padLeft: number = 30;

  // tslint:disable-next-line:no-empty
  constructor(private store: Store<AppState>, private groupWithAccountsAction: GroupWithAccountsAction,
    private accountsAcction: AccountsAction) {
    this.mc = new GroupAccountSidebarVM();
    this.activeGroup = this.store.select(state => state.groupwithaccounts.activeGroup);
  }
  public ngOnChanges(changes: SimpleChanges) {
    if (changes['groups']) {
      this.resetData();
    }
  }
  // tslint:disable-next-line:no-empty
  public ngOnInit() {
    this.resetData();
    this.activeGroup.subscribe(a => this.resetData());
  }

  public resetData() {
    this._groups = _.cloneDeep(this.groups);
    this.mc.columns = [];
    this.mc.columns.push(new ColumnGroupsAccountVM(new GroupsWithAccountsResponse()));
    this.mc.columns[0].groups = [];
    if (this._groups) {
      for (let key of this._groups) {
        key.isOpen = false;
        this.mc.columns[0].groups.push(key);
      }
      let col = this.polulateColms(this.mc.columns[0].groups);
      if (col) {
        for (let key of this.mc.columns[0].groups) {
          if (key.uniqueName === col.uniqueName) {
            key.isOpen = true;
          }
        }
      }
    }
    this.columnsChanged.emit(this.mc);
  }
  public polulateColms(grps: IGroupsWithAccounts[]): ColumnGroupsAccountVM {
    let activeGroup = null;
    this.store.select(state => state.groupwithaccounts.activeGroup).take(1).subscribe(a => activeGroup = a);

    for (let grp of grps) {
      // if(activeGroup){
      if (activeGroup && grp.uniqueName === activeGroup.uniqueName) {
        let newCOL = new ColumnGroupsAccountVM(grp);
        newCOL.groups = [];
        if (grp.groups) {
          for (let key of grp.groups) {
            // key.isOpen = true;
            newCOL.groups.push(key);
          }
        }
        this.mc.columns.splice(1, 0, newCOL);
        return newCOL;
      } else {
        if (grp.groups) {
          let col = this.polulateColms(grp.groups);
          if (col) {
            let newCOL = new ColumnGroupsAccountVM(grp);
            newCOL.groups = [];
            newCOL.isOpen = false;
            for (let key of grp.groups) {
              if (key.uniqueName === col.uniqueName) {
                key.isOpen = true;
              } else {
                key.isOpen = false;
              }
              newCOL.groups.push(key);
            }
            this.mc.columns.splice(1, 0, newCOL);
            return newCOL;
          }
        }
      }
    }

  }

  public onGroupClick(item: IGroupsWithAccounts, currentIndex: number) {
    this.store.dispatch(this.groupWithAccountsAction.hideAddNewForm());
    this.store.dispatch(this.groupWithAccountsAction.getGroupDetails(item.uniqueName));
    this.store.dispatch(this.accountsAcction.resetActiveAccount());
    this.mc.selectedType = 'grp';
    this.mc.selectGroup(item, currentIndex);
    this.ScrollToRight.emit(true);
  }
  public onAccountClick(item: IAccountsInfo, currentIndex: number) {
    this.store.dispatch(this.groupWithAccountsAction.hideAddNewForm());
    this.store.dispatch(this.accountsAcction.getAccountDetails(item.uniqueName));
    this.mc.selectedType = 'acc';
    this.store.dispatch(this.groupWithAccountsAction.showEditAccountForm());
  }
  public ShowAddNewForm() {
    this.store.dispatch(this.groupWithAccountsAction.showAddNewForm());
    this.store.dispatch(this.accountsAcction.resetActiveAccount());
  }
}