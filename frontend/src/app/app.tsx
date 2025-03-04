/*
 * Copyright (c) 2025 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { useThemeConfig } from '@ly_styles/theme';
import { AppsContent, LYThemeProvider, useAppContext } from '@nomana-it/liberty-core';


export function App() {
  const { userProperties, appsProperties, modulesProperties } = useAppContext();

  const { theme } = useThemeConfig({
    appsProperties,
    userProperties,
    modulesProperties,
  });

  return (
    <LYThemeProvider customTheme={theme}>
        <AppsContent />
    </LYThemeProvider>

  );
}

