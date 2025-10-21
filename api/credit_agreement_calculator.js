exports.calculate = totalWithTax => {
  const instalmentsCount = totalWithTax % 2 == 0 ? [3, 6] : [3, 6, 12];

  return instalmentsCount.map(count =>
    calculateCreditAgreement(totalWithTax, count)
  );
};

const APR = 2500;
const MAX_FINANCED_AMOUNT = 200000;

const calculateCreditAgreement = (totalWithTax, instalmentCount) => ({
  instalment_count: instalmentCount,
  total_with_tax: {
    value: totalWithTax,
    string: centsToMoney(totalWithTax)
  },
  instalment_amount: {
    value: instalment_amount(totalWithTax, instalmentCount),
    string: centsToMoney(instalment_amount(totalWithTax, instalmentCount))
  },
  instalment_fee: {
    value: instalment_fee(totalWithTax),
    string: centsToMoney(instalment_fee(totalWithTax))
  },
  instalment_total: {
    value: instalment_total(totalWithTax, instalmentCount),
    string: centsToMoney(instalment_total(totalWithTax, instalmentCount))
  },
  grand_total: {
    value: grand_total(totalWithTax, instalmentCount),
    string: centsToMoney(grand_total(totalWithTax, instalmentCount))
  },
  cost_of_credit: {
    value: cost_of_credit(totalWithTax, instalmentCount),
    string: centsToMoney(cost_of_credit(totalWithTax, instalmentCount))
  },
  cost_of_credit_pct: {
    value: cost_of_credit_pct(totalWithTax, instalmentCount),
    string: numberToPercentage(
      cost_of_credit_pct(totalWithTax, instalmentCount)
    )
  },
  cost_of_credit_pct: { value: 600, string: "6,00 %" },
  apr: { value: APR, string: numberToPercentage(APR) },
  max_financed_amount: {
    value: MAX_FINANCED_AMOUNT,
    string: centsToMoney(MAX_FINANCED_AMOUNT)
  }
});

const instalment_amount = (totalWithTax, instalmentCount) =>
  parseInt(totalWithTax / instalmentCount, 10);

const instalment_fee = totalWithTax => (totalWithTax > 40000 ? 750 : 500);

const instalment_total = (totalWithTax, instalmentCount) =>
  instalment_amount(totalWithTax, instalmentCount) +
  instalment_fee(totalWithTax);

const grand_total = (totalWithTax, instalmentCount) =>
  totalWithTax + cost_of_credit(totalWithTax, instalmentCount);

const cost_of_credit = (totalWithTax, instalmentCount) =>
  instalment_fee(totalWithTax) * instalmentCount;

const cost_of_credit_pct = (totalWithTax, instalmentCount) =>
  (
    cost_of_credit(totalWithTax, instalmentCount) *
    10000.0 /
    totalWithTax
  ).toFixed(2) * 100;

const centsToMoney = amount => `${commaSeparatedFloat(amount / 100.0)} €`;

const numberToPercentage = number => `${commaSeparatedFloat(number / 100.0)} %`;

const commaSeparatedFloat = float => float.toString().replace(".", ",");
