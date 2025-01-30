/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { IModulesProps } from "@ly_types/lyModules";
import { UIDisplayMode } from "@ly_utils/GlobalSettings";

/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
export enum EUsers {
    id = "USR_ID",
    name = "USR_NAME",
    password = "USR_PASSWORD",
    password_confirm = "USR_PASSWORD_CONFIRM",
    email = "USR_EMAIL",
    status = "USR_STATUS",
    admin = "USR_ADMIN",
    language = "USR_LANGUAGE",
    displayMode = "USR_MODE",
    readonly = "USR_READONLY",
    audit_user = "USR_AUDIT_USER",
    audit_date = "USR_AUDIT_DATE",
    dashboard = "USR_DASHBOARD",
    theme = "USR_THEME",
    darkMode = "DARK_MODE"
}


/* User properties */
/* Properties are updated when user log into an application */
/* Data is coming from table LY_USERS */
export interface IUsersProps {
    [EUsers.id]: string;
    [EUsers.name]: string;
    [EUsers.password]: string;
    [EUsers.password_confirm]?: string;
    [EUsers.email]: string;
    [EUsers.status]: boolean | 'Y' | 'N';
    [EUsers.admin]: string;
    [EUsers.language]: string;
    [EUsers.displayMode]: UIDisplayMode;
    [EUsers.readonly]: string;
    [EUsers.dashboard]: number;
    [EUsers.theme]: string;
    [EUsers.darkMode]?: boolean;
    [EUsers.audit_user]?: string;
    [EUsers.audit_date]?: string;
}

export enum EUserReadonly {
    true = "Y",
    false = "N"
}
export interface ISaveUserData {
    restData: IUsersProps;
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps;
}
