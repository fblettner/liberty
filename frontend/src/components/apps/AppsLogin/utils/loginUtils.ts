/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Dispatch, SetStateAction } from 'react';
import { t } from 'i18next';
import Cookies from 'js-cookie';
import i18n from '@ly_translations/i18n';

// Custom Import
import { lyGetApplications } from '@ly_services/lyApplications';
import { GlobalSettings, UIDisplayMode } from "@ly_utils/GlobalSettings";
import { AppDispatch } from '@ly_app/store';
import { onAppsPropertiesChanged, onUserPropertiesChanged, onDarkModeChanged } from '@ly_features/global';
import { EUsers, IUsersProps } from '@ly_types/lyUsers';
import { IAppsProps, EApplications, ESessionMode } from '@ly_types/lyApplications';
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from '@ly_types/lyModules';
import { ResultStatus } from '@ly_types/lyQuery';
import { AuthContextProps } from 'react-oidc-context';
import { ESeverity, IErrorState } from '@ly_utils/commonUtils';

export const validateLogin = (
    token: any,
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>
) => {
    if (token.message === 'loginError') {
        setErrorState({ open: true, message: t("login.loginError"), severity: ESeverity.error });
        return false;
    }
    if  (token.message === 'passwordError') {
        setErrorState({ open: true, message: t("login.passwordError"), severity: ESeverity.error });
        return false;
    }
    return true;
};


export const getApplications = async (
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setAppsDP: React.Dispatch<React.SetStateAction<IAppsProps[]>>,
    modulesProperties: IModulesProps,
    jwt_token: string
  ) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const results = await lyGetApplications({
        pool: GlobalSettings.getDefaultPool, 
        modulesProperties: modulesProperties,
        jwt_token: jwt_token
      });
      if (results.status === ResultStatus.error) {
        const logger = new Logger({
            transactionName: "loginUtils.getApplications",
            modulesProperties: modulesProperties,
            data: results
          });
          logger.logException("Login: Failed to fetch applications");
      }
      setAppsDP(results.items);
      return results
    } catch (error) {
        const logger = new Logger({
            transactionName: "loginUtils.getApplications",
            modulesProperties: modulesProperties,
            data: error
          });
          logger.logException("Login: Failed to fetch applications");
      setAppsDP([]); // Optionally set it to an empty array if there's an error
    } finally {
      setIsLoading(false);
    }
  };


// Simplified connectApplication without additional arguments
export const connectApplication = (
    user: IUsersProps,
    dispatch: AppDispatch,
    application: IAppsProps,
    auth: AuthContextProps,
    modules: IModulesProps,
    jwt_token: string
) => {
 
    const userProperties: IUsersProps = modules.login.enabled || auth.isAuthenticated
        ? {
            [EUsers.status]: true,
            [EUsers.id]: user[EUsers.id],
            [EUsers.name]: user[EUsers.name],
            [EUsers.email]: user[EUsers.email],
            [EUsers.password]: user[EUsers.password],
            [EUsers.admin]: user[EUsers.admin],
            [EUsers.language]: user[EUsers.language],
            [EUsers.displayMode]: user[EUsers.displayMode],
            [EUsers.darkMode]: user[EUsers.displayMode] === UIDisplayMode.dark ? true : false,
            [EUsers.readonly]: user[EUsers.readonly],
            [EUsers.dashboard]: user[EUsers.dashboard],
            [EUsers.theme]: user[EUsers.theme]
        }
        : {
            [EUsers.status]: true,
            [EUsers.id]: "anonymous",
            [EUsers.name]: t("login.anonymous"),
            [EUsers.email]: "",
            [EUsers.password]: "",
            [EUsers.admin]: "N",
            [EUsers.language]: "en",
            [EUsers.displayMode]: UIDisplayMode.dark,
            [EUsers.darkMode]: true,
            [EUsers.readonly]: "Y",
            [EUsers.dashboard]: -1,
            [EUsers.theme]: "liberty"
        };

    // Save the application ID into a cookie
    Cookies.set('applicationId', application[EApplications.id].toString(), { expires: 30 });

    dispatch(onAppsPropertiesChanged({
        [EApplications.id]: application[EApplications.id],
        [EApplications.pool]: application[EApplications.pool],
        [EApplications.name]: application[EApplications.name],
        [EApplications.description]: application[EApplications.description],
        [EApplications.offset]: application[EApplications.offset],
        [EApplications.limit]: application[EApplications.limit],
        [EApplications.version]: application[EApplications.version],
        [EApplications.session]: ESessionMode.session,
        [EApplications.dashboard]: application[EApplications.dashboard],
        [EApplications.theme]: application[EApplications.theme],
        [EApplications.jwt_token]: jwt_token

    }));
    dispatch(onUserPropertiesChanged(userProperties));
    dispatch({ type: 'connect', payload: {user: userProperties[EUsers.id], application: application[EApplications.id]} })
    dispatch(onDarkModeChanged(userProperties[EUsers.darkMode] ?? true));
    i18n.changeLanguage(userProperties[EUsers.language]);
};

