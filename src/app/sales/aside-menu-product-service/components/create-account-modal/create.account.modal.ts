import * as _ from 'lodash';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AccountsAction } from '../../../../services/actions/accounts.actions';
import { AppState } from '../../../../store/roots';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AccountRequestV2 } from '../../../../models/api-models/Account';
import { ReplaySubject } from 'rxjs/Rx';
import { digitsOnly } from '../../../../shared/helpers/customValidationHelper';
import { uniqueNameInvalidStringReplace } from '../../../../shared/helpers/helperFunctions';
import { IOption } from '../../../../shared/theme/index';
import { SalesActions } from '../../../../services/actions/sales/sales.action';

export const PURCHASE_GROUPS = ['operatingcost']; // purchases
export const SALES_GROUPS = ['revenuefromoperations']; // sales

@Component({
  selector: 'create-account-modal',
  templateUrl: 'create.account.modal.html',
  styles: [`
    .form-group label{
      margin-bottom:5px;
    }
  `]
})

export class CreateAccountModalComponent implements OnInit, OnDestroy {

  @Input() public gType: string;
  @Output() public actionFired: EventEmitter<any> = new EventEmitter();

  // public
  public addAcForm: FormGroup;
  public isAccountNameAvailable$: Observable<boolean>;
  public flatGroupsList$: Observable<IOption[]>;
  public selectedGroup: string = null;
  public createAccountInProcess$: Observable<boolean>;
  public createAccountIsSuccess$: Observable<boolean>;

  // private
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private _fb: FormBuilder,
    private _store: Store<AppState>,
    private _salesActions: SalesActions,
    private _accountsAction: AccountsAction
  ) {
    this.isAccountNameAvailable$ = this._store.select(state => state.groupwithaccounts.isAccountNameAvailable).takeUntil(this.destroyed$);
    this.createAccountInProcess$ = this._store.select(state => state.groupwithaccounts.createAccountInProcess).takeUntil(this.destroyed$);
    this.createAccountIsSuccess$ = this._store.select(state => state.groupwithaccounts.createAccountIsSuccess).takeUntil(this.destroyed$);
  }
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  public ngOnInit(): void {

    // init ac form
    this.initAcForm();

    // utility to enable disable HSN/SAC
    this.addAcForm.get('hsnOrSac').valueChanges.subscribe(a => {
      const hsn: AbstractControl = this.addAcForm.get('hsnNumber');
      const sac: AbstractControl = this.addAcForm.get('sacNumber');
      if (a === 'hsn') {
        // hsn.reset();
        sac.reset();
        hsn.enable();
        sac.disable();
      } else {
        // sac.reset();
        hsn.reset();
        sac.enable();
        hsn.disable();
      }
    });

    // listen for add account success
    this.createAccountIsSuccess$.takeUntil(this.destroyed$).subscribe((o) => {
      if (o) {
        this.addAcFormReset();
        this.closeCreateAcModal();
        if (this.gType === 'Sales') {
          this._store.dispatch(this._salesActions.getFlattenAcOfSales({groupUniqueNames: ['sales']}));
        } else if (this.gType === 'Purchase') {
          this._store.dispatch(this._salesActions.getFlattenAcOfPurchase({groupUniqueNames: ['purchases']}));
        }
      }
    });

  }

  public initAcForm(): void {
    this.addAcForm = this._fb.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      uniqueName: [null, [Validators.required]],
      openingBalanceType: ['CREDIT'],
      openingBalance: [0, Validators.compose([digitsOnly])],
      hsnOrSac: [null],
      hsnNumber: [{ value: null, disabled: false }],
      sacNumber: [{ value: null, disabled: false }]
    });
  }

  public generateUniqueName() {
    let val: string = this.addAcForm.controls['name'].value;
    val = uniqueNameInvalidStringReplace(val);
    if (val) {
      this._store.dispatch(this._accountsAction.getAccountUniqueName(val));
      this.isAccountNameAvailable$.subscribe(a => {
        if (a) {
          this.addAcForm.patchValue({ uniqueName: val });
        } else {
          let num = 1;
          this.addAcForm.patchValue({ uniqueName: val + num });
        }
      });
    }else {
      this.addAcForm.patchValue({ uniqueName: null });
    }

  }

  public addAcFormSubmit() {
    let formObj = this.addAcForm.value;
    if (this.gType === 'Sales') {
      this.selectedGroup = 'sales';
    } else if (this.gType === 'Purchase') {
      this.selectedGroup =  'purchases';
    }
    this._store.dispatch(this._accountsAction.createAccountV2(this.selectedGroup, formObj));
  }

  public addAcFormReset() {
    this.addAcForm.reset();
    this.closeCreateAcModal();
  }

  public closeCreateAcModal() {
    this.addAcForm.reset();
    this.actionFired.emit();
  }
}