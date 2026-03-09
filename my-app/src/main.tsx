import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import PgLedgerPage from "./pg_components/PgLedgerPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pgledger" element={<PgLedgerPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
