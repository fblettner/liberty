/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IModulesProps } from "@ly_types/lyModules";

export enum EContextMenus {
    ctxID = "CTX_ID",
    id = "VAL_ID",
    label = "VAL_LABEL",
    component = "VAL_COMPONENT",
    componentID = "VAL_COMPONENT_ID",
    dynamic_params = "DYNAMIC_PARAMS",
    fixed_params = "FIXED_PARAMS",
    pool_params = "POOL_PARAMS"
}

/* Context Menus */
/* Display a menus when click right on a table */
/* Data is coming from table LY_CONTEXTUAL */
export interface IContextMenus {
    [EContextMenus.id]: string;
    [EContextMenus.label]: string;
    [EContextMenus.component]: string;
    [EContextMenus.componentID]: number;
    [EContextMenus.dynamic_params]: string;
    [EContextMenus.fixed_params]: string;
    [EContextMenus.pool_params]: string;
}

export interface IContextMenusProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps
    [EContextMenus.id]: number;
}