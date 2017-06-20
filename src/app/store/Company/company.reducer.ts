import { CompanyActions } from './../../services/actions';
import { Action, ActionReducer } from '@ngrx/store';
import { Company } from '../../models/api-models/Company';

/**
 * Keeping Track of the CompanyState
 */
export interface CurrentCompanyState {
  company?: Company;
}

/**
 * Setting the InitialState for this Reducer's Store
 */
const initialState: CurrentCompanyState = {
  company: null
};

export const CompanyReducer: ActionReducer<CurrentCompanyState> = (state: CurrentCompanyState = initialState, action: Action) => {

  console.log(state);

  switch (action.type) {
    case CompanyActions.CREATE_COMPANY:
      return Object.assign({}, state, {
        isLoginWithEmailInProcess: false
      });
    default:
      return state;
  }
};