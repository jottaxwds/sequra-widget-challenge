import React from "react";
import ReactDOM from "react-dom/client";
import InstallmentsWidget from "./components/InstallmentsWidget";

export function init(containerSelector: string, props: { price: number }) {
  const el = document.querySelector(containerSelector);
  if (!el) return console.error("SequraWidget: container not found");

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <InstallmentsWidget {...props} />
    </React.StrictMode>
  );
}