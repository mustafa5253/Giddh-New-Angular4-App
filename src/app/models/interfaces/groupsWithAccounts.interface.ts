import { INameUniqueName } from '../api-models/Inventory';
import { IAccountsInfo } from './accountInfo.interface';

export interface IGroupsWithAccounts extends INameUniqueName {
  synonyms: string;
  accounts: IAccountsInfo[];
  category: string;
  groups: IGroupsWithAccounts[];

  isActive: boolean;
  isOpen: boolean;
  isVisible: boolean;
}
