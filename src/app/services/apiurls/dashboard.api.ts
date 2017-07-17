import { Configuration } from '../../app.constant';

export const DASHBOARD_API = {
  DASHBOARD: Configuration.ApiUrl + 'company/:companyUniqueName/dashboard?fromDate=:fromDate&toDate=:toDate&interval=:interval&refresh=refresh', // get call
  GROUP_HISTORY: Configuration.ApiUrl + 'company/:companyUniqueName/group-history?fromDate=:fromDate&toDate=:toDate&interval=:interval&refresh=refresh', // post call
  CLOSING_BALANCE: Configuration.ApiUrl + '/company/:companyUniqueName/groups/:groupUniqueName/closing-balance?fromDate=:fromDate&toDate=:toDate&refresh=:refresh' // get call
};
