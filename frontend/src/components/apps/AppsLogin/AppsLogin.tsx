/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { t } from "i18next";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "react-oidc-context";
import Cookies from "js-cookie";

// Custom Import
import { LoadingIndicator } from "@ly_components/common/LoadingIndicator";
import { IAppsProps, EApplications, ESessionMode } from "@ly_types/lyApplications";
import { AppDispatch } from "@ly_app/store";
import { getModules } from "@ly_features/global";
import { getApplications, connectApplication, validateLogin } from "@ly_components/apps/AppsLogin/utils/loginUtils";
import Logger from "@ly_services/lyLogging";
import { lyConnectApplications } from "@ly_services/lyApplications";
import { ToolsQuery } from "@ly_services/lyQuery";
import { LYLogoIcon } from "@ly_styles/icons";
import { ResultStatus } from "@ly_types/lyQuery";
import { ESeverity, IErrorState } from "@ly_utils/commonUtils";
import { Div_AppsLogin, Div_Login } from "@ly_components/styles/Div";
import { Paper_Login } from "@ly_components/styles/Paper";
import { Form_Login } from "@ly_components/styles/Form";
import { Button_Login } from "@ly_components/styles/Button";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { Input_White } from "@ly_components/styles/Input";
import { GridContainer, GridItem } from "@ly_components/common/Grid";
import { Card_AppsLogin } from "@ly_components/styles/Card";
import { CardActionArea, CardContent, CardHeader } from "@ly_components/common/Card";

export const AppsLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modules = useSelector(getModules);
  const auth = useAuth();

  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [application, setApplication] = useState<IAppsProps | null>(null);
  const [appsDP, setAppsDP] = useState<Array<IAppsProps>>([]);
  const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });


  // Fetch applications on load
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedApplicationId = Cookies.get("applicationId");
        const apps = await getApplications(setIsLoading, setAppsDP, modules, "");

        if (savedApplicationId) {
          const savedApp = apps.items.find(
            (app: { [x: string]: number; }) => app[EApplications.id] === parseInt(savedApplicationId)
          );
          if (savedApp) setApplication(savedApp);
        }
      } catch (error) {
        const logger = new Logger({
          transactionName: "AppsLogin.initialize",
          modulesProperties: modules,
          data: error,
        });
        logger.logException("Login: Failed to fetch applications");
      }
    };
    initialize();
  }, [modules]);

  // Handle application selection
  const handleApplicationSelect = useCallback((app: IAppsProps) => {
    setApplication(app);
  }, []);

  // Handle login form submission
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const login = formData.get("user") as string;
      const password = formData.get("password") as string;

      try {
        if (!auth.isAuthenticated && !modules.login.enabled) {
          setErrorState({ open: true, message: t("login.authRequired"), severity: ESeverity.error });
          auth.signinPopup();
          return;
        }

        if (!application) {
          setErrorState({ open: true, message: t("login.applicationError"), severity: ESeverity.error });
          return;
        }
        let password_encrypted = modules.login.enabled ? await ToolsQuery.encrypt(password, modules) : "";
        const token = await ToolsQuery.token(
          modules.login.enabled ? login : auth.user?.profile.preferred_username!,
          password_encrypted,
          application[EApplications.pool],
          ESessionMode.session,
          modules,
          modules.login.enabled ? "database" : "oidc"
        );

        if (!validateLogin(token, setErrorState)) return;

        const result = await ToolsQuery.user({
          user: modules.login.enabled ? login : auth.user?.profile.preferred_username!,
          pool: application[EApplications.pool],
          sessionMode: ESessionMode.session,
          modulesProperties: modules,
          jwt_token: token.access_token
        });

        if (result.status === ResultStatus.success) {
          let userProperties = result.items[0];
          connectApplication(userProperties, dispatch, application, auth, modules, token.access_token);
        } else {
          const errorMessage = result.status === "loginerror"
            ? t("login.loginError")
            : t("login.passwordError");
          setErrorState({ open: true, message: errorMessage, severity: ESeverity.error });
        }


      } catch (error) {
        const logger = new Logger({
          transactionName: "AppsLogin.handleSubmit",
          modulesProperties: modules,
          data: error,
        });
        logger.logException("Login: Validate and connect application");
        setErrorState({ open: true, message: "Unexpected error occurred", severity: ESeverity.error });
      }
    },
    [auth, application, modules, dispatch, setErrorState]
  );

  // Memoize apps for optimization
  const memoizedAppsDP = useMemo(() => appsDP, [appsDP]);

  const onCloseError = () => {
    setErrorState({ open: false, message: '' });
  }

  // Show loading indicator while fetching data
  if (isLoading) return <LoadingIndicator />;


  return (
    <Div_Login>
      <Paper_Login elevation={3}>
        <LYLogoIcon width="75px" height="75px" />
        <Form_Login noValidate onSubmit={handleSubmit}>
          <AlertMessage
            open={errorState.open}
            severity={errorState.severity}
            message={errorState.message}
            onClose={onCloseError}
          />
          {modules.login && modules.login.enabled && (
            <Fragment>
              <Div_AppsLogin>
                <Input_White
                  variant="standard"
                  required
                  fullWidth
                  id="userid"
                  label={t("login.userid")}
                  name="user"
                  autoComplete="user"
                  autoFocus
                />
              </Div_AppsLogin>
              <Div_AppsLogin>
                <Input_White
                  variant="standard"
                  required
                  fullWidth
                  name="password"
                  label={t("login.password")}
                  type="password"
                  id="password"
                  autoComplete="off"
                />
              </Div_AppsLogin>
            </Fragment>
          )}
          <GridContainer spacing={2} py={2} px={1} columns={{ xs: 1, sm: 2 }}>
            {memoizedAppsDP.map((app) => (
              <GridItem key={app[EApplications.id]}>
                <Card_AppsLogin
                  isSelected={application === app}
                >
                  <CardActionArea onClick={() => handleApplicationSelect(app)} >
                    <CardHeader title={app[EApplications.name]} />
                    <CardContent>
                      {app[EApplications.description]}
                    </CardContent>
                  </CardActionArea>
                </Card_AppsLogin>
              </GridItem>
            ))}
          </GridContainer>
          <Button_Login type="submit" fullWidth variant="contained">
            {t("login.loginButton")}
          </Button_Login>
        </Form_Login>
      </Paper_Login>
    </Div_Login>
  );
};