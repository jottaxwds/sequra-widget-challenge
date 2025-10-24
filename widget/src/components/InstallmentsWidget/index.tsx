import { useEffect, useState, useCallback } from "react";
import type { CreditAgreement } from "../../types";
import { getCreditAgreement } from "../../api/api";
import { events } from "../../constants";
import { trackError } from "../../api/helpers";
import LoadingSpinner from "../ui/LoadingSpinner";
import InstallmentsDropdown from "../InstallmentsDropdown";
import HeadLine from "../HeadLine";

interface InstallmentProps {
  total?: number;
}

const sortInstalments = (instalments: CreditAgreement[]) => instalments.sort((a, b) => a.instalment_count - b.instalment_count);

const InstallmentsWidget = ({ total }: InstallmentProps) => {
  const [data, setData] = useState<CreditAgreement[]>();
  const [loading, setLoading] = useState(false);
  const [selectedInstalment, setSelectedInstalment] =
    useState<CreditAgreement>();
  const [error, setError] = useState<boolean>(false);

  const handleOnSelectInstalment = (instalment: CreditAgreement) => {
    setSelectedInstalment(instalment);
  };

  const fetchCreditAgreements = useCallback(async (totalAmount: number) => {
    if (!totalAmount || totalAmount <= 0) return;

    setLoading(true);
    setError(false);

    try {
      const agreements = await getCreditAgreement(totalAmount * 100);
      setData(agreements.length ? sortInstalments(agreements) : []);
    } catch (err: unknown) {
      console.error("Error fetching credit agreements:", err);
      setError(true);
      trackError(events.credit_agreement_fetch_failed, (err as Error).message, {
        totalAmount,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!total) {
      setData([]);
      return;
    }
    fetchCreditAgreements(total);
  }, [total, fetchCreditAgreements]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (total === 0 || !total || !data || data.length === 0)
    return <div>Pago flexible no disponible para este producto.</div>;

  return (
    <div id="sequra-widget" className="max-w-md mx-auto bg-white">
      <HeadLine selectedInstalment={selectedInstalment || data[0]} />
      <InstallmentsDropdown
        instalments={data}
        selectedInstalment={selectedInstalment || data[0]}
        onSelectInstallment={handleOnSelectInstalment}
      />
    </div>
  );
};

export default InstallmentsWidget;
