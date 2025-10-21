import React from "react";
import ReactDOM from "react-dom/client";
import InstallmentsWidget from "./components/InstallmentsWidget";
declare global {
  interface Window {
    SequraWidget: {
      init: (containerSelector: string, props: { price: number }) => void;
    };
  }
}

function init(containerSelector: string, props: { price: number }) {
  const el = document.querySelector(containerSelector);
  if (!el) return console.error("SequraWidget: container not found");

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <InstallmentsWidget {...props} />
    </React.StrictMode>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { init };
const SequraWidget = { init };
if (typeof window !== 'undefined') {
  window.SequraWidget = SequraWidget;
}
export default SequraWidget;