import React from "react";
import ReactDOM from "react-dom/client";
import InstallmentsWidget from "./components/InstallmentsWidget";
import type { Envs } from "./types";
import { calculateTotal, setupObservers } from "./helpers";

interface InitProps {
  environment?: Envs;
  priceSelector?: string;
  quantitySelector?: string;
}

function init(containerSelector: string, props: InitProps) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("SequraWidget: container not found");
    return;
  }

  const root = ReactDOM.createRoot(container);

  const getTotal = (): number => {
    return calculateTotal(props.priceSelector, props.quantitySelector);
  };

  const renderWidget = (total: number) => {
    root.render(
      <React.StrictMode>
        <InstallmentsWidget {...props} total={total} />
      </React.StrictMode>
    );
  };

  // Init
  let lastTotal = getTotal();
  renderWidget(lastTotal);


  const update = () => {
    const newTotal = getTotal();
    if (newTotal === lastTotal) {
      return;
    }
      lastTotal = newTotal;
      renderWidget(newTotal);
  };

  setupObservers(props.priceSelector, props.quantitySelector, update);

  console.info("SequraWidget initialized!", props);
}

export default { init };
