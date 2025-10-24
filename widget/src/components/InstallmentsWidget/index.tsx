import { useEffect, useState, useCallback } from "react";
import type { CreditAgreement } from "../../types";
import { events } from "../../constants";
import {
  getSortedInstallmentOptions,
  trackError,
  trackInstallmentSelection,
  trackWidgetView,
} from "../../api/helpers";
import LoadingSpinner from "../ui/LoadingSpinner";
import InstallmentsDropdown from "../InstallmentsDropdown";
import HeadLine from "../HeadLine";

interface InstallmentProps {
  total?: number;
}

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
    const inCentsTotalAmount = totalAmount * 100;
    setLoading(true);
    setError(false);

    try {
      const agreements = await getSortedInstallmentOptions(inCentsTotalAmount);
      setData(agreements);
      trackWidgetView(events.credit_agreement_fetch_success, inCentsTotalAmount);
      if (!agreements.length) {
        trackError(events.credit_agreement_fetch_no_instalments_response, "No instalments found", { totalAmount: inCentsTotalAmount });
        return;
      }
      setSelectedInstalment(agreements[0]);
      trackInstallmentSelection(
        agreements[0].instalment_count,
        agreements[0].instalment_total.value
      );
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
    trackWidgetView(events.widget_init, 0);
  }, []);

  useEffect(() => {
    if (!total) {
      setData([]);
      return;
    }
    fetchCreditAgreements(total);
  }, [total, fetchCreditAgreements]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div>
        No pudimos obtener las opciones de pago flexible en este momento. Por
        favor, inténtalo de nuevo más tarde.
      </div>
    );
  if (total === 0 || !total || !data || data.length === 0)
    return <div>Pago flexible no disponible para este producto.</div>;

  return (
    <div id="sequra-widget" className="w-full mx-auto bg-white">
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
