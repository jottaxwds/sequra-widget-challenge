import { useState } from "react";
import type { CreditAgreement } from "../../types";
import MoreInfoDialog from "../MoreInfoDialog";
import { trackWidgetView } from "../../api/helpers";
import { events } from "../../constants";

interface HeadlineProps {
  selectedInstalment: CreditAgreement;
}
const Headline = ({
  selectedInstalment,
}: HeadlineProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOnMoreInfoClick = () => {
    setIsDialogOpen(true);
    trackWidgetView(events.more_info_clicked, selectedInstalment.total_with_tax.value);
  };

  return (
    <div className="flex justify-between items-center w-full text-base font-medium mb-3">
      <span>Págalo en:</span>
      <button
        type="button"
        className="text-black text-sm font-normal bg-transparent border-none p-0 m-0 leading-normal cursor-pointer hover:underline focus:underline"
        tabIndex={0}
        onClick={handleOnMoreInfoClick}
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