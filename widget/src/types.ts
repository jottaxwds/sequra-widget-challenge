export interface EventPayload {
  event: string;
  timestamp?: string | number;
  context?: {
    [key: string]: string | number | undefined;
  }
}

export interface ApiError {
  error: string;
  status?: number;
}

declare global {
  interface Window {
    jQuery?: {
      (selector: string | Element): {
        on: (events: string, handler: () => void) => void;
      };
    };
  }
}

export interface CreditAgreement {
  instalment_count: number;
  total_with_tax: {
      value: number;
      string: string;
  };
  instalment_amount: {
      value: number;
      string: string;
  };
  instalment_fee: {
      value: number;
      string: string;
  };
  instalment_total: {
      value: number;
      string: string;
  };
  grand_total: {
      value: number;
      string: string;
  };
  cost_of_credit: {
      value: number;
      string: string;
  };
  cost_of_credit_pct: {
      value: number;
      string: string;
  };
  apr: {
      value: number;
      string: string;
  };
  max_financed_amount: {
      value: number;
      string: string;
  };
}