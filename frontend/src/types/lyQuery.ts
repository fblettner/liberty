/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IUsersProps } from "@ly_types/lyUsers";
import { IAppsProps, ESessionMode } from "@ly_types/lyApplications";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import { ITableRow } from "@ly_types/lyTables";

export type QueryProperties = {
  source: QuerySource;
  framework_pool: string;
  query: number;
  sessionMode: ESessionMode;
  filters?: IFiltersProperties[];
  language?: string;
  offset?: number;
  limit?: number;
  override_target_pool?: string;
  params?: string;
  modulesProperties: IModulesProps;
  jwt_token: string
}

export enum QueryType {
  Table = "table",
  Columns = "columns"
}

export enum QuerySource {
  Framework = "framework", /* DATA FROM LY_QRY_FMW */
  Query = "query", /* DATA FROM LY_QRY_SQL */
}

export enum QueryRoute {
  token = "api/auth/token",
  user = "api/auth/user",
  crud = "api/db/query",
  oidc = "api/oidc",
  open = "api/db/open",
  close = "api/db/close",
  encrypt = "api/fmw/encrypt",
  audit = "api/db/audit",
  modules = "api/fmw/modules",
  applications = "api/fmw/applications",
  themes = "api/fmw/themes",
  ai_prompt = "api/ai/prompt",
  ai_welcome = "api/ai/welcome",
}

export enum QueryMethod {
  delete = "DELETE",
  insert = "POST",
  update = "PUT",
  select = "GET",
}

export interface IColumnsProps {
  source: QuerySource;
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  tableID: number;
  sessionMode?: ESessionMode;
  language?: string;
  params?: string
  overrideQueryPool?: string;
  modulesProperties: IModulesProps;
}

export enum ResultStatus {
  success = "success",
  error = "error",
  warning = "warning",
}

// Define an interface for the result type
export interface IRestResult {
  items: ITableRow[];
  status: ResultStatus;
}

export interface IColumnMetadata {
  header: string;
  field: string;
  type: string;
  operator: string;
  defined: boolean;
  template: string;
  rules: string;
  rulesValues: string;
  disabled: boolean;
  required: boolean;
  visible: boolean;
}

export interface IRestMetadata {
  headerName: string;
  field: string;
  type: string;
  operator: string;
  defined: boolean;
  template: string;
  rules: string;
  rules_values: string;
  disabled: boolean;
  required: boolean;
  visible: boolean;
}