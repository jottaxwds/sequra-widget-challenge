import type { CreditAgreement } from "../../types";

interface MoreInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInstalment: CreditAgreement;
}

const MoreInfoDialog = ({ isOpen, onClose, selectedInstalment }: MoreInfoDialogProps) => {
  console.log(isOpen, onClose, selectedInstalment);
  return (
    <div>
      <h1>More Info</h1>
    </div>
  );
};

export default MoreInfoDialog;
