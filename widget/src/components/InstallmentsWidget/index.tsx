import { useEffect, useState } from "react";
import type { CreditAgreement } from "../../types";

interface InstallmentProps {
  total: number;
}

const InstallmentsWidget = ({
  total,
}: InstallmentProps) => {
  const [data, setData] = useState<CreditAgreement[]>();
  const URL_ENV_VARIABLE = "http://localhost:8080";
  useEffect(() => {
    fetch(`${URL_ENV_VARIABLE}/credit_agreements?totalWithTax=${total}`)
      .then((res) => res.json())
      .then(setData);
  }, [total, URL_ENV_VARIABLE]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="sequra-widget">
      <h3>Pay in {data.length} installments</h3>
      {data.map((inst: CreditAgreement, i: number) => (
        <div key={i}>
          {inst.instalment_count}x {inst.instalment_amount.string}€ → Total{" "}
          {inst.instalment_total.string}€
        </div>
      ))}
    </div>
  );
};

export default InstallmentsWidget;
