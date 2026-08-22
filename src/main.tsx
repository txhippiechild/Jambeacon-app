import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JamBeaconApp from "./App";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JamBeaconApp />
  </StrictMode>,
);
