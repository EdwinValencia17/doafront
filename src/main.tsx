// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import AppRoot from "@/AppRoot";
import { LoaderProvider } from "@/ui/LoaderProvider";

import "@/styles/login.css";
import "@/styles/loader.css";
import "@/styles/tokens.css";
import "@/styles/soft-tag.css";
import "@/styles/sidebarglobalcss.css"
import "@/styles/dialogs.css"

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <LoaderProvider>
        <AppRoot />
      </LoaderProvider>
    </PrimeReactProvider>
  </React.StrictMode>
);
