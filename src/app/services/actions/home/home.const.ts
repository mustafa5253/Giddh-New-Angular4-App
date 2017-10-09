export const HOME = {
  EXPENSES_CHART: {
    GET_EXPENSES_CHART_DATA_ACTIVE_YEAR: 'GET_EXPENSES_CHART_DATA_ACTIVE_YEAR',
    GET_EXPENSES_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_EXPENSES_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_EXPENSES_CHART_DATA_ACTIVE_YEAR_ERROR_RESPONSE: 'GET_EXPENSES_CHART_DATA_ACTIVE_YEAR_ERROR_RESPONSE',
    GET_EXPENSES_CHART_DATA_LAST_YEAR: 'GET_EXPENSES_CHART_DATA_LAST_YEAR',
    GET_EXPENSES_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_EXPENSES_CHART_DATA_LAST_YEAR_RESPONSE',
    GET_EXPENSES_CHART_DATA_LAST_YEAR_ERROR_RESPONSE: 'GET_EXPENSES_CHART_DATA_LAST_YEAR_ERROR_RESPONSE'
  },
  REVENUE_CHART: {
    GET_REVENUE_CHART_DATA_ACTIVE_YEAR: 'GET_REVENUE_CHART_DATA_ACTIVE_YEAR',
    GET_REVENUE_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_REVENUE_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_REVENUE_CHART_DATA_ACTIVE_YEAR_ERROR_RESPONSE: 'GET_REVENUE_CHART_DATA_ACTIVE_YEAR_ERROR_RESPONSE',
    GET_REVENUE_CHART_DATA_LAST_YEAR: 'GET_REVENUE_CHART_DATA_LAST_YEAR',
    GET_REVENUE_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_REVENUE_CHART_DATA_LAST_YEAR_RESPONSE',
  },
  COMPARISION_CHART: {
    GET_PAGEINIT_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_PAGEINIT_CHART_DATA_LAST_YEAR_RESPONSE',
    GET_PAGEINIT_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_PAGEINIT_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_COMPARISION_CHART_DATA_ACTIVE_YEAR: 'GET_COMPARISION_CHART_DATA_ACTIVE_YEAR',
    GET_COMPARISION_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_COMPARISION_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_COMPARISION_CHART_DATA_LAST_YEAR: 'GET_COMPARISION_CHART_DATA_LAST_YEAR',
    GET_COMPARISION_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_COMPARISION_CHART_DATA_LAST_YEAR_RESPONSE',
    GET_HISTORY_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_HISTORY_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_HISTORY_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_HISTORY_CHART_DATA_LAST_YEAR_RESPONSE',
    GET_NETWORTH_CHART_DATA_ACTIVE_YEAR_RESPONSE: 'GET_NETWORTH_CHART_DATA_ACTIVE_YEAR_RESPONSE',
    GET_NETWORTH_CHART_DATA_LAST_YEAR_RESPONSE: 'GET_NETWORTH_CHART_DATA_LAST_YEAR_RESPONSE',
  },
  NETWORTH_CHART: {
    GET_NETWORTH_CHART_DATA_ACTIVE_YEAR: 'GET_NETWORTH_CHART_DATA_ACTIVE_YEAR'
  },
  BANK_ACCOUNTS: {
    GET_BANK_ACCOUNTS: 'GET_BANK_ACCOUNTS',
    GET_BANK_ACCOUNTS_RESPONSE: 'GET_BANK_ACCOUNTS_RESPONSE',
    REFRESH_BANK_ACCOUNT: 'REFRESH_BANK_ACCOUNTS',
    REFRESH_BANK_ACCOUNT_RESPONSE: 'REFRESH_BANK_ACCOUNTS_RESPONSE',
    RESET_REFRESH_BANK_ACCOUNT_RESPONSE: 'RESET_REFRESH_BANK_ACCOUNTS_RESPONSE',
    RECONNECT_BANK_ACCOUNT: 'RECONNECT_BANK_ACCOUNT',
    RESET_RECONNECT_BANK_ACCOUNT: 'RESET_RECONNECT_BANK_ACCOUNT',
    RECONNECT_BANK_ACCOUNT_RESPONSE: 'RECONNECT_BANK_ACCOUNT_RESPONSE',
    REST_BANKACCOUNT: 'REST_BANKACCOUNT'
  },
  RESET_HOME_STATE: 'RESET_HOME_STATE'
};

export enum CHART_CALLED_FROM {
  PAGEINIT,
  HISTORY,
  COMPARISION,
  NETWORTH
}

export enum API_TO_CALL {
  REVENUE,
  EXPENCE,
  PL,
  LY
}
