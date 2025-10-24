import { useEffect, useState, useCallback } from "react";
import type { CreditAgreement } from "../../types";
import { getCreditAgreement } from "../../api/api";
import { events } from "../../constants";
import { trackError } from "../../api/helpers";

interface InstallmentProps {
  total: number;
}

const InstallmentsWidget = ({ total }: InstallmentProps) => {
  const [data, setData] = useState<CreditAgreement[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const fetchCreditAgreements = useCallback(async (totalAmount: number) => {
    if (!totalAmount || totalAmount <= 0) return;

    setLoading(true);
    setError(false);

    try {
      const agreements = await getCreditAgreement(totalAmount);
      setData(agreements);
    } catch (err: unknown) {
      console.error("Error fetching credit agreements:", err);
      setError(true);
      trackError(events.credit_agreement_fetch_error, (err as Error).message, { totalAmount });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditAgreements(total);
  }, [total, fetchCreditAgreements]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0)
    return <div>Pago flexible no disponible para este producto.</div>;

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
