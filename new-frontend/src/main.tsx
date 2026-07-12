import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";

import "./styles.css";
import App from "./App";
import { AppProviders } from "./providers/AppProviders";

// Some web3 libs expect a global Buffer in the browser.
const g = window as unknown as { Buffer?: typeof Buffer };
if (typeof window !== "undefined" && !g.Buffer) {
  g.Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
