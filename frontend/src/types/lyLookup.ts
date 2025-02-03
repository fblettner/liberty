/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IColumnMetadata } from "@ly_types/lyQuery";
import { IAppsProps, ESessionMode } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { ITransformedObject } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { IColumnsFilter, IFiltersProperties } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import { IRestResult, ResultStatus } from "@ly_types/lyQuery";
import { IContentValue } from "@ly_utils/commonUtils";

export enum ELookup {
  id = "LKP_ID",
  label = "LKP_LABEL",
  group = "LKP_GROUP",
  queryID = "LKP_QUERY_ID",
  display_add = "LKP_DISPLAY_ADD",
  frm_id = "LKP_FRM_ID",
  dd_id = "LKP_DD_ID",
  dd_label = "LKP_DD_LABEL",
  dd_group = "LKP_DD_GROUP",
  display_search = "LKP_DISPLAY_SEARCH",
  tbl_id = "LKP_TBL_ID",
}

export interface ILookupProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  [ELookup.id]: number;
  data?: IColumnsFilter | ITransformedObject;
  dynamic_params?: string;
  fixed_params?: string;
  getAllValues?: boolean;
  sessionMode?: ESessionMode;
  overrideQueryPool?: string;
  searchbyLabel?: boolean;
  value?: IContentValue;
}

export interface ILookupOption {
  [ELookup.id]: string;
  [ELookup.label]: string;
  [ELookup.group]: string;
  [ELookup.dd_id]: string;
  [ELookup.dd_label]: string;
  [ELookup.frm_id]: string;
  [ELookup.tbl_id]: string;
}


export interface IGetLookup {
  columns:  IColumnMetadata[],
  data: ILookupOption[],
  header: {
    [key in ELookup]?: string;
  };
  status?: ResultStatus,
}

export interface IFetchParallelLookupData {
  appsProperties: IAppsProps;
  results: IRestResult;
  parallelCount: number;
  filtersLKP: IFiltersProperties[];
  overrideQueryPool?: string;
  sessionMode?: ESessionMode;
  modulesProperties: IModulesProps;
}

// Define an interface for the result
export interface ILookupResult {
  items: ILookupOption[];
  status: ResultStatus;
}
