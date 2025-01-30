/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Sentry from "@sentry/react";

// MUI Import
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';

// Custom Import
import { AppDispatch, RootState } from '@ly_app/store';
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { getModules, loadModules, onDarkModeChanged } from '@ly_features/global';
import { AppsHeader } from '@ly_components/apps/AppsHeader/AppsHeader';
import { AppsContent } from '@ly_components/apps/AppsContent/AppsContent';
import { AppsUser } from '@ly_components/apps/AppsUser/AppsUser';
import { FormsChatbot } from '@ly_components/forms/FormsChatbot/FormsChatbot';
import { IModulesState } from '@ly_types/lyModules';
import { Div, Div_AppsLayout } from '@ly_components/styles/Div';


export function App() {
  // Redux dispatcher

  const dispatch = useDispatch<AppDispatch>()
  const modulesLoading = useSelector((state: RootState) => state.app.loading)
  const modules: IModulesState = useSelector(getModules);

  // Declare variables  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  let isSentryInitialized = false;

  // Use Effect
  useEffect(() => {
    setIsLoading(true);
    const init = async () => {

      dispatch(onDarkModeChanged(prefersDarkMode));

      switch (modulesLoading) {
        case "idle":
          await dispatch(loadModules());
          break;
        case "succeeded":
          setIsLoading(false);
          if (!isSentryInitialized && modules.sentry.enabled && modules.sentry.params) {
            // Parse the JSON string
            const parsedData = JSON.parse(modules.sentry.params);
            const url = parsedData.url;
            const replay = parsedData.replay === "true"; 

            Sentry.init({
              dsn: url,
              integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                  maskAllText: false,
                  blockAllMedia: false,
                  unblock: [".sentry-unblock, [data-sentry-unblock]"],
                  unmask: [".sentry-unmask, [data-sentry-unmask]"],
                }),
              ],
              beforeBreadcrumb(breadcrumb, hint) {
                // Filter out XHR breadcrumbs
                if (breadcrumb.category === "xhr") {
                  return null; // Discard the XHR breadcrumb
                }
                return breadcrumb; // Keep other breadcrumbs
              },
              // Tracing
              tracesSampleRate: replay ? 1.0 : 0.0, //  Capture 100% of the transactions
              tracePropagationTargets: ["localhost", /^https:\/\/nomana-it.sentry\.io\/api/],
              // Session Replay
              replaysSessionSampleRate: 0.0,
              replaysOnErrorSampleRate: 1.0,
              normalizeDepth: 10,

            });
            isSentryInitialized = true;
          }
          break;
      }

    }
    init();

  }, [dispatch, modulesLoading]);

  if (isLoading) {
    return (
      <Div>
        {GlobalSettings.loading}
      </Div>
    )
  }
  else
    return (
      <Div_AppsLayout>
        <AppsHeader />
        <AppsContent />
        <AppsUser />
        <FormsChatbot />
      </Div_AppsLayout>
    );
}
