import { Configuration } from '../../app.constant';
const UNIVERSAL_URI_ELEDGER = Configuration.ApiUrl + 'company/:companyUniqueName/accounts/:accountUniqueName/eledgers';
export const ELEDGER_API = {
  // get call
  GET: UNIVERSAL_URI_ELEDGER,
  TRASH: UNIVERSAL_URI_ELEDGER + '/:transactionId',
  MAP: UNIVERSAL_URI_ELEDGER + '/map/:transactionId'
};