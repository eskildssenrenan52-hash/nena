import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EternalRealms from "@/components/EternalRealms";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <EternalRealms />
  </StrictMode>,
);
