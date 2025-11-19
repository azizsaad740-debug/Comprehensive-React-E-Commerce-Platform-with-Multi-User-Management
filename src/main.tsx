import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./integrations/supabase/SessionContextProvider.tsx";
import SettingsInitializer from "./components/layout/SettingsInitializer.tsx";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsInitializer>
      <SessionContextProvider>
        <App />
      </SessionContextProvider>
    </SettingsInitializer>
  </React.StrictMode>
);