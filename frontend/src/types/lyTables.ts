/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IContextMenus } from "@ly_types/lyContextual";
import { IContentValue } from "@ly_utils/commonUtils";
import { CColumnsFilter, IFiltersProperties } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import { CellContext, FilterMeta, Row } from "@tanstack/react-table";
import { EDictionaryType } from "@ly_types/lyDictionary";
import { OnAutoCompleteChangeFunction, OnBlurFunction, OnChangeFunction } from "@ly_components/forms/FormsTable/utils/commonUtils";

export enum TablesGridHardCoded {
  addRow = "ADD_ROW",
  row_id = "ROW_ID"
}

export enum ETableHeader {
  id = "TBL_ID",
  dbName = "TBL_DB_NAME",
  description = "TBL_LABEL",
  pool = "QUERY_POOL",
  queryID = "TBL_QUERY_ID",
  editable = "TBL_EDITABLE",
  uploadable = "TBL_UPLOADABLE",
  audit = "TBL_AUDIT",
  burst = "TBL_BURST",
  workbook = "TBL_WORKBOOK",
  sheet = "TBL_SHEET",
  treeID = "TBL_TREE_ID",
  formID = "TBL_FRM_ID",
  formLabel = "FRM_LABEL",
  contextMenusID = "TBL_CTX_ID",
  key = "TBL_KEY",
  autoLoad = "TBL_AUTO_LOAD"
}

export type ITableHeader = {
  [ETableHeader.id]: number;
  [ETableHeader.dbName]: string;
  [ETableHeader.description]: string;
  [ETableHeader.queryID]: number;
  [ETableHeader.editable]: boolean;
  [ETableHeader.uploadable]: boolean;
  [ETableHeader.audit]: boolean;
  [ETableHeader.burst]: boolean;
  [ETableHeader.workbook]: string;
  [ETableHeader.sheet]: string;
  [ETableHeader.contextMenusID]: IContextMenus[];
  [ETableHeader.treeID]: number;
  [ETableHeader.formID]: number;
  [ETableHeader.formLabel]: string;
  [ETableHeader.key]: Array<string>;
  [ETableHeader.autoLoad]: boolean;
};

export enum ETableDetails {
  id = "COL_DD_ID",
  target = "COL_TARGET",
  label = "COL_LABEL",
  type = "COL_TYPE",
  rules = "COL_RULES",
  rulesValues = "COL_RULES_VALUES",
  default = "COL_DEFAULT",
  disabled = "COL_DISABLED",
  required = "COL_REQUIRED",
  visible = "COL_VISIBLE",
  filter = "COL_FILTER",
  dynamic_params = "DYNAMIC_PARAMS",
  fixed_params = "FIXED_PARAMS",
  pool_params = "POOL_PARAMS",
  output_params = "OUTPUT_PARAMS",
  key = "COL_KEY",
  col_cdn_id = "COL_CDN_ID",
  cdn_dynamic_params = "CDN_DYNAMIC_PARAMS",
  cdn_fixed_params = "CDN_FIXED_PARAMS",
  cdn_pool_params = "CDN_POOL_PARAMS",
}

export interface ITableDetails {
  [ETableDetails.visible]: string;
  [ETableDetails.label]: string;
  [ETableDetails.id]: string;
  [ETableDetails.type]: string;
  [ETableDetails.rules]: string;
  [ETableDetails.key]: string;
  [ETableDetails.disabled]: string;
  [ETableDetails.required]: string;
  [ETableDetails.rulesValues]: string;
  [ETableDetails.target]: string;
  [ETableDetails.filter]: string;
  [ETableDetails.dynamic_params]: string;
  [ETableDetails.fixed_params]: string;
  [ETableDetails.pool_params]: string;
  [ETableDetails.col_cdn_id]: string;
  [ETableDetails.cdn_dynamic_params]: string;
  [ETableDetails.cdn_fixed_params]: string;
  [ETableDetails.cdn_pool_params]: string;
}

export interface IEditCell {
  cell: CellContext<ITableRow, IContentValue>;
  value: IContentValue;
  handleChange: OnChangeFunction;
  handleAutoCompleteChange: OnAutoCompleteChangeFunction;
  handleBlur: OnBlurFunction;
}

export interface IColumnsProperties {
  header: string;
  field: string;
  type: string;
  operator: string;
  rules: string;
  disabled: boolean;
  required: boolean;
  rulesValues: string;
  default: string;
  target: string;
  editable: boolean;
  visible: boolean;
  filter: boolean;
  dynamic_params: string;
  fixed_params: string;
  pool_params: string;
  output_params: string;
  key: boolean;
  col_cdn_id: number;
  accessorKey: string;
  filterFn?: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => boolean;
  meta?: {
    align: 'left' | 'center' | 'right';
  };
  cell?: (cell: CellContext<ITableRow, IContentValue>) => JSX.Element | string | null | undefined;
  editCell?: (params: IEditCell) => JSX.Element;
  minWidth?: number;
  maxWidth?: number;
};

type TAddMeta = (meta: FilterMeta) => void;

interface FilterObject {
  operator?: string;
  value?: IContentValue;
  type: EDictionaryType;
}

export interface IColumnsVisibility {
  [index: string]: boolean;
};

export interface IGetTableProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  [ETableHeader.id]: number;
  getAllColumns: boolean;
  columnsFilter?: CColumnsFilter,
  rowsFilterRef?: React.MutableRefObject<IFiltersProperties[]>
}

export interface ITableRow {
  [TablesGridHardCoded.row_id]: string;
  [key: string]: IContentValue;
}

export interface ITablesProperties {
  tableProperties: ITableHeader;
  columnFilter: CColumnsFilter;
  columns: IColumnsProperties[];
}


