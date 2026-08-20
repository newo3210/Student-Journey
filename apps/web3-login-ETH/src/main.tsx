//Mariano Montini ('bosque', 'bosquestudio')
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Providers } from "./components/Providers";
import App from "./App";
import "./index.css";

// App bootstrap - React root with Thirdweb providers.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
