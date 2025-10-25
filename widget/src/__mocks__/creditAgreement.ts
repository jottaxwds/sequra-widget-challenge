import type { CreditAgreement } from '../types';

export const mockCreditAgreement: CreditAgreement = {
  instalment_count: 3,
  total_with_tax: {
    value: 300,
    string: '€300.00',
  },
  instalment_amount: {
    value: 100,
    string: '€100.00',
  },
  instalment_fee: {
    value: 5,
    string: '€5.00',
  },
  instalment_total: {
    value: 315,
    string: '€315.00',
  },
  grand_total: {
    value: 315,
    string: '€315.00',
  },
  cost_of_credit: {
    value: 15,
    string: '€15.00',
  },
  cost_of_credit_pct: {
    value: 5,
    string: '5%',
  },
  apr: {
    value: 12.5,
    string: '12.5%',
  },
  max_financed_amount: {
    value: 1000,
    string: '€1000.00',
  },
};

export const mockCreditAgreementNoFees: CreditAgreement = {
  instalment_count: 3,
  total_with_tax: {
    value: 300,
    string: '€300.00',
  },
  instalment_amount: {
    value: 100,
    string: '€100.00',
  },
  instalment_fee: {
    value: 0,
    string: '€0.00',
  },
  instalment_total: {
    value: 300,
    string: '€300.00',
  },
  grand_total: {
    value: 300,
    string: '€300.00',
  },
  cost_of_credit: {
    value: 0,
    string: '€0.00',
  },
  cost_of_credit_pct: {
    value: 0,
    string: '0%',
  },
  apr: {
    value: 0,
    string: '0%',
  },
  max_financed_amount: {
    value: 1000,
    string: '€1000.00',
  },
};
