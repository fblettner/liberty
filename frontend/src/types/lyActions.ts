/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IUsersProps } from "@ly_types/lyUsers";
import { IAppsProps } from "@ly_types/lyApplications";
import { LYComponentType } from "@ly_types/lyComponents";
import { IModulesProps } from "@ly_types/lyModules";
import { CDialogContent } from "@ly_types/lyDialogs";
import { IContentValue } from "@ly_utils/commonUtils";


export enum EActionsHeader {
    action_id = "ACT_ID",
    label = "ACT_LABEL",
}

export interface IActionsHeader {
    [EActionsHeader.action_id]: number;
    [EActionsHeader.label]: string;
}

export interface IActionsHeaderProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    [EActionsHeader.action_id]: number;
    modulesProperties: IModulesProps
}

export enum EActionsParams {
    action_id = "ACT_ID",
    task_id = "EVT_ID",
    id = "MAP_ID",
    type = "MAP_TYPE",
    direction = "MAP_DIR",
    var_id = "MAP_VAR",
    label = "MAP_LABEL",
    value = "MAP_VALUE",
    var_type = "MAP_VAR_TYPE",
    rules = "MAP_RULES",
    rulesValues = "MAP_RULES_VALUES",
    default = "MAP_DEFAULT",
    display = "MAP_DISPLAY",
    dynamic_params = "DYNAMIC_PARAMS",
    fixed_params = "FIXED_PARAMS",
    pool_params = "POOL_PARAMS",
}

export interface IActionsParams {
    [EActionsParams.action_id]: number;
    [EActionsParams.task_id]: number;
    [EActionsParams.id]: number;
    [EActionsParams.type]: string;
    [EActionsParams.direction]: string;
    [EActionsParams.var_id]: string;
    [EActionsParams.label]: string;
    [EActionsParams.value]: string;
    [EActionsParams.var_type]: string;
    [EActionsParams.rules]: string;
    [EActionsParams.rulesValues]: string;
    [EActionsParams.default]: string;
    [EActionsParams.display]: string;
    [EActionsParams.dynamic_params]: string;
    [EActionsParams.fixed_params]: string;
    [EActionsParams.pool_params]: string;
}

export interface IActionsParamsProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    [EActionsParams.action_id]: number;
    modulesProperties: IModulesProps
}

export enum EActionsTasks {
    action_id = "ACT_ID",
    task_id = "EVT_ID",
    type = "EVT_TYPE",
    crud = "EVT_QUERY_CRUD",
    queryID = "EVT_QUERY_ID",
    condition = "EVT_CDN_ID",
    branch_true = "EVT_BRC_TRUE",
    branch_false = "EVT_BRC_FALSE",
    branch_id = "EVT_BRC_ID",
    api_id = "EVT_API_ID",
    label = "EVT_LABEL",
    component = "EVT_COMPONENT",
    component_id = "EVT_COMPONENT_ID",
    loop = "EVT_LOOP",
    loop_array = "EVT_LOOP_ARRAY"
}

export interface IActionsTasks {
    [EActionsTasks.action_id]: number;
    [EActionsTasks.task_id]: number;
    [EActionsTasks.type]: string;
    [EActionsTasks.crud]: string;
    [EActionsTasks.queryID]: number;
    [EActionsTasks.condition]: number;
    [EActionsTasks.branch_true]: number;
    [EActionsTasks.branch_false]: number;
    [EActionsTasks.branch_id]: number;
    [EActionsTasks.api_id]: number;
    [EActionsTasks.label]: string;
    [EActionsTasks.component]: LYComponentType;
    [EActionsTasks.component_id]: number;
    [EActionsTasks.loop]: string;
    [EActionsTasks.loop_array]: string;
}

export interface IActionsTasksProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    [EActionsTasks.action_id]: number;
    modulesProperties: IModulesProps;
}

export enum EActionsTasksParams {
    action_id = "ACT_ID",
    task_id = "EVT_ID",
    id = "MAP_ID",
    type = "MAP_TYPE",
    direction = "MAP_DIR",
    var_id = "MAP_VAR",
    label = "MAP_LABEL",
    value = "MAP_VALUE",
    var_type = "MAP_VAR_TYPE",
    rules = "MAP_RULES",
    rulesValues = "MAP_RULES_VALUES",
    default = "MAP_DEFAULT",
}

export interface IActionsTasksParams {
    [EActionsTasksParams.action_id]: number;
    [EActionsTasksParams.task_id]: number;
    [EActionsTasksParams.type]: string;
    [EActionsTasksParams.id]: number;
    [EActionsTasksParams.type]: string;
    [EActionsTasksParams.direction]: string;
    [EActionsTasksParams.var_id]: string;
    [EActionsTasksParams.label]: string;
    [EActionsTasksParams.value]: string;
    [EActionsTasksParams.var_type]: string;
    [EActionsTasksParams.rules]: string;
    [EActionsTasksParams.rulesValues]: string;
    [EActionsTasksParams.default]: string;
}

export interface IActionsTasksParamsProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    [EActionsTasks.action_id]: number;
    [EActionsTasks.task_id]: number;
    modulesProperties: IModulesProps;
}

export enum EActionsDirection {
    in = "IN",
    out = "OUT",
    both = "BOTH",
    pool = "POOL"
}

export enum EActionsType {
    query = "QUERY",
    if = "IF",
    api = "API",
    return = "RETURN",
    component = "COMPONENT"
}



export interface IActionsStatus {
    status: "success" | "error" | "warning" | "info";
    message: string;
    params?: CDialogContent
}

export interface IActionsData {
    [key: string]: IActionsData | IContentValue; // Allow nested objects and common data types
}
