import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./integrations/supabase/SessionContextProvider.tsx";
import SettingsInitializer from "./components/layout/SettingsInitializer.tsx";
import React from "react";
import { ThemeProvider } from "./components/layout/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsInitializer>
      <SessionContextProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </SessionContextProvider>
    </SettingsInitializer>
  </React.StrictMode>
);