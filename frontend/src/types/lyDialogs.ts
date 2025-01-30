/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { ELanguage } from "@ly_types/lyLanguage";
import { LYComponentMode } from "@ly_types/lyComponents";
import { IContentValue } from "@ly_utils/commonUtils";
import { IModulesProps } from "@ly_types/lyModules";

export enum EDialogHeader {
  id = "FRM_ID",
  label = "FRM_LABEL",
  pool = "QUERY_POOL",
  queryID = "FRM_QUERY_ID",
  language = ELanguage.id
}

export interface IDialogHeader {
  [EDialogHeader.id]: string;
  [EDialogHeader.label]: string;
  [EDialogHeader.pool]: string;
  [EDialogHeader.queryID]: number;
  [EDialogHeader.language]: string;
}

export enum EDialogDetails {
  id = "COL_ID",
  tab_sequence = "TAB_SEQ",
  sequence = "COL_SEQ",
  language = ELanguage.id,
  component = "COL_COMPONENT",
  componentID = "COL_COMPONENT_ID",
  dictionaryID = "COL_DD_ID",
  label = "COL_LABEL",
  type = "COL_TYPE",
  rules = "COL_RULES",
  rulesValues = "COL_RULES_VALUES",
  default = "COL_DEFAULT",
  target = "COL_TARGET",
  visible = "COL_VISIBLE",
  disabled = "COL_DISABLED",
  required = "COL_REQUIRED",
  key = "COL_KEY",
  colspan = "COL_COLSPAN",
  dynamic_params = "DYNAMIC_PARAMS",
  fixed_params = "FIXED_PARAMS",
  pool_params = "POOL_PARAMS",
  output_params = "OUTPUT_PARAMS",
  cdn_id = "COL_CDN_ID",
  cdn_dynamic_params = "CDN_DYNAMIC_PARAMS",
  cdn_fixed_params = "CDN_FIXED_PARAMS",
}

export enum EDialogTabs {
  id = "TAB_ID",
  component = "TAB_COMPONENT",
  sequence = "TAB_SEQ",
  label = "TAB_LABEL",
  hide = "TAB_HIDDEN",
  condition = "TAB_CDN_ID",
  cols = "TAB_COLS",
  params = "TAB_PARAMS",
  dynamic_params = "DYNAMIC_PARAMS",
  fixed_params = "FIXED_PARAMS",
  disable_add = "TAB_DISABLE_ADD",
  disable_edit = "TAB_DISABLE_EDIT"
}

export interface IDialogsHeaderProps {
  appsProperties: IAppsProps;
  dialogID: number;
  modulesProperties: IModulesProps
}

export interface IDialogsDetailsProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps
  dialogID: number;
}

export interface IDialogsTabProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  dialogID: number;
  componentMode: LYComponentMode;
  data: CDialogContent;
  isModified: boolean;
}

export interface IDialogsTab {
  [EDialogTabs.id]: number;
  [EDialogTabs.sequence]: string;
  [EDialogTabs.label]: string | null;
  [EDialogTabs.hide]: boolean;
  [EDialogTabs.cols]: number;
  [EDialogTabs.params]: string | null;
}


export interface IDialogDetails {
  [EDialogDetails.id]: string;
  [EDialogDetails.tab_sequence]: string;
  [EDialogDetails.sequence]: number;
  [EDialogDetails.language]: string;
  [EDialogDetails.component]: string;
  [EDialogDetails.componentID]: number;
  [EDialogDetails.dictionaryID]: string;
  [EDialogDetails.label]: string;
  [EDialogDetails.type]: string;
  [EDialogDetails.rules]: string;
  [EDialogDetails.rulesValues]: string;
  [EDialogDetails.default]: string;
  [EDialogDetails.target]: string;
  [EDialogDetails.visible]: string;
  [EDialogDetails.disabled]: string;
  [EDialogDetails.required]: string;
  [EDialogDetails.key]: string;
  [EDialogDetails.colspan]: number;
  [EDialogDetails.dynamic_params]: string;
  [EDialogDetails.fixed_params]: string;
  [EDialogDetails.pool_params]: string;
  [EDialogDetails.output_params]: string;
  [EDialogDetails.cdn_id]: number;
  [EDialogDetails.cdn_dynamic_params]: string;
  [EDialogDetails.cdn_fixed_params]: string;
}

export interface IDialogContent {
  [index: string]: {
    [EDialogDetails.id]: string,
    [EDialogDetails.rules]: string | null,
    [EDialogDetails.rulesValues]: string | null,
    [EDialogDetails.target]: string | null,
    [EDialogDetails.disabled]: boolean,
    [EDialogDetails.required]: boolean,
    [EDialogDetails.visible]: boolean,
    [EDialogDetails.key]: boolean,
    [EDialogDetails.dynamic_params]: string,
    [EDialogDetails.fixed_params]: string,
    [EDialogDetails.output_params]: string,
    [EDialogDetails.cdn_id]: number | null,
    [EDialogDetails.cdn_dynamic_params]: string | null,
    [EDialogDetails.cdn_fixed_params]: string | null,
    [EDialogDetails.type]: string
    value: IContentValue ,
  }
}


export class CDialogContent {
  fields: IDialogContent;
  constructor() {
    this.fields = {};
  }
}

export type TDialogContentFields = CDialogContent['fields'];

export type DialogKeys = Record<string, IContentValue> | null;

export type IReservedRecord = IContentValue[];