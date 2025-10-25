import React from "react";
import ReactDOM from "react-dom/client";
import InstallmentsWidget from "./components/InstallmentsWidget";
import "./index.css";

const SAMPLE_TOTALS = [
  { label: "Nothing", value: 0 },
  { label: "€50", value: 50 },
  { label: "€100", value: 100 },
  { label: "€250", value: 250 },
  { label: "€500", value: 500 },
  { label: "€1000", value: 1000 },
];

// eslint-disable-next-line react-refresh/only-export-components
function DevApp() {
  const [selectedTotal, setSelectedTotal] = React.useState(250);

  return (
    <div>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Test with different totals:
        </label>
        <select
          value={selectedTotal}
          onChange={(e) => setSelectedTotal(Number(e.target.value))}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        >
          {SAMPLE_TOTALS.map((total) => (
            <option key={total.value} value={total.value}>
              {total.label}
            </option>
          ))}
        </select>
      </div>

      <InstallmentsWidget total={selectedTotal} />
    </div>
  );
}

const container = document.getElementById("sequra-widget-dev");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <DevApp />
    </React.StrictMode>
  );
} else {
  console.error("Development container not found");
}
