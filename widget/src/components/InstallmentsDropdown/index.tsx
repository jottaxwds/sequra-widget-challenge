import { trackInstallmentSelection, trackWidgetView } from "../../api/helpers";
import { events } from "../../constants";
import type { CreditAgreement } from "../../types";
import Dropdown from "../ui/Dropdown";

interface InstallmentsDropdownProps {
  instalments: CreditAgreement[];
  selectedInstalment: CreditAgreement;
  onSelectInstallment: (installment: CreditAgreement) => void;
}

const InstallmentsDropdown = ({
  instalments,
  selectedInstalment,
  onSelectInstallment,
}: InstallmentsDropdownProps) => {
  const installmentOptionLabel = (installment: CreditAgreement) =>
    `${installment.instalment_count} cuotas de ${installment.instalment_total.string}`;

  const instalmentOptions = instalments.map((installment) => ({
    label: installmentOptionLabel(installment),
    value: installment.instalment_count.toString(),
  }));

  const handleOnSelectInstalment = (value: string) => {
    const instalment = instalments.find(
      (instalment) => instalment.instalment_count.toString() === value
    );
    if (instalment) {
      trackInstallmentSelection(instalment.instalment_count, instalment.instalment_total.value);
      onSelectInstallment(instalment);
    }
  };

  const handleOnDropdownOpen = () => {
    trackWidgetView(events.dropdown_opened, selectedInstalment.total_with_tax.value);
  };

  return (
    <Dropdown
      options={instalmentOptions}
      value={selectedInstalment.instalment_count.toString()}
      onChange={handleOnSelectInstalment}
      onDropdownOpen={handleOnDropdownOpen}
    />
  );
};

export default InstallmentsDropdown;
