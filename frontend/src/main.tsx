/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "@ly_app/store"
import { App } from "@ly_app/app"
import "@ly_translations/i18n";
import { DndProvider } from "react-dnd"
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LYThemeProvider } from "@ly_styles/theme"
import { AuthProvider } from "react-oidc-context";
import { ErrorBoundary } from '@sentry/react';
import { Div } from '@ly_components/styles/Div';
import { ClickProvider } from "@ly_components/context/ClickContext"
import { ZIndexProvider } from "@ly_components/context/ZIndex"

const oidcConfig = {
  authority: window.location.origin + "/oidc/realms/Liberty",
  client_id: "liberty-framework",
  redirect_uri: window.location.origin,
};


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <Provider store={store}>
        <LYThemeProvider>
          <DndProvider backend={HTML5Backend}>
            <ErrorBoundary fallback={<Div>An error has occurred</Div>}>
              <ClickProvider>
              <ZIndexProvider>
                <App />
                </ZIndexProvider>
              </ClickProvider>
            </ErrorBoundary>
          </DndProvider>
        </LYThemeProvider>
      </Provider>
    </AuthProvider>
  </React.StrictMode>,

)
