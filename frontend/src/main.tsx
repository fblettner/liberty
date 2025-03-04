/*
 * Copyright (c) 2025 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "@ly_app/app"
import { AppProvider, Div, ErrorBoundary, TranslationProvider } from '@nomana-it/liberty-core'
import { AuthProvider, useAuth as oidcUseAuth } from "react-oidc-context";

const oidcConfig = {
  authority: window.location.origin + "/oidc/realms/Liberty",
  client_id: "liberty-framework",
  redirect_uri: window.location.origin,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <AppProvider useAuth={oidcUseAuth}>
        <ErrorBoundary fallback={<Div>An error has occurred</Div>}>
          <TranslationProvider>
            <App />
          </TranslationProvider>
        </ErrorBoundary>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>,

)
