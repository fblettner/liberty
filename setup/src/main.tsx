/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { App } from "@ly_app/app";
import React from "react"
import ReactDOM from "react-dom/client"
import { LYThemeProvider } from "./styles/themes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LYThemeProvider>
      <App />
    </LYThemeProvider>
  </React.StrictMode>,

)
