/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { CDialogContent } from "@ly_types/lyDialogs";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";

export enum EConditions {
    id = "CDN_ID",
    dd_id = "CDN_DD_ID",
    operator = "CDN_OPERATOR",
    logical = "CDN_LOGICAL",
    value = "CDN_VALUE",
    group = "CDN_GROUP",
    type = "CDN_TYPE",
    params_id = "CDN_PARAMS_ID",
    label = "CDN_GRP_LABEL"
}

export interface IConditions {
    [EConditions.id]: number;
    [EConditions.dd_id]: string;
    [EConditions.operator]: string;
    [EConditions.logical]: string;
    [EConditions.value]: string | number;
    [EConditions.group]: string;
    [EConditions.type]: string;
    [EConditions.params_id]: number;
    [EConditions.label]: string;
    children: IConditions[];
 }

export enum EConditionsOperator {
    equal = "EQUAL",
    not_equal = "NOT_EQUAL",
    not_empty = "NOT_EMPTY",
    empty = "EMPTY",
    greater = "GREATER",
    less = "LESS"
}

export interface IConditionsProps {
    appsProperties: IAppsProps;
    [EConditions.id]: number;
    data: CDialogContent | CColumnsFilter;
    dynamic_params: string;
    fixed_params: string;
    modulesProperties: IModulesProps
}

export interface IConditionMapping {
    SOURCE: string;
    TARGET: string;
}

export interface IConditionTreeNode {
    items: IConditions;
    logical: string | null;
    children?: IConditionTreeNode[];
}

export interface IConditionGroupNode {
    items: IConditionTreeNode[];
    children?: IConditionGroupNode[];
}
