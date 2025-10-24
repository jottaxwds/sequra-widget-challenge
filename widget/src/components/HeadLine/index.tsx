import { useState } from "react";
import type { CreditAgreement } from "../../types";
import MoreInfoDialog from "../MoreInfoDialog";

interface HeadlineProps {
  selectedInstalment: CreditAgreement;
}
const Headline = ({
  selectedInstalment,
}: HeadlineProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className="flex justify-between items-center w-full text-base font-medium">
      <span>Págalo en:</span>
      <button
        type="button"
        className="text-black text-sm font-normal bg-transparent border-none p-0 m-0 leading-normal cursor-pointer hover:underline focus:underline"
        tabIndex={0}
        onClick={() => setIsDialogOpen(true)}
        style={{
          appearance: "none",
          boxShadow: "none",
          outline: "none",
          background: "none",
          border: "none",
        }}
      >
        Más info
      </button>
      <MoreInfoDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} selectedInstalment={selectedInstalment} />
    </div>
  );
};

export default Headline;