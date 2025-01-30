/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
/* LY_TABLES */

import { IFiltersProperties } from "@ly_types/lyFilters";
import { IColumnsProperties, IGetTableProps, ITableHeader, ETableHeader, ETableDetails } from "@ly_types/lyTables";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { LYComponentType } from "@ly_types/lyComponents";
import { lyGetContextMenus } from "@ly_services/lyContextMenus";
import { EDictionaryRules } from "@ly_types/lyDictionary";
import { lyCheckConditions } from "@ly_services/lyConditions";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";
import { EConditions } from "@ly_types/lyConditions";
import { EContextMenus } from "@ly_types/lyContextual";

export const lyGetTableProperties = async (props: IGetTableProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: ETableHeader.id,
    value: props[ETableHeader.id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.tables,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })
  
  if (results.status === ResultStatus.error )
    return results;

  const tableColumns = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.tables_details,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })


  let columns: IColumnsProperties[] = [];
  if (tableColumns.items.length == 0)
    columns = [];
  else {
    let tmpCols: IColumnsProperties[] = [];

    for (const item of tableColumns.items) {
      if (item[ETableDetails.visible] === "Y" || props.getAllColumns) {
        let hidden = false;
        if (props.columnsFilter && item[ETableDetails.col_cdn_id] !== null) {
          hidden = await lyCheckConditions({
            appsProperties: props.appsProperties,
            [EConditions.id]: parseInt(item[ETableDetails.col_cdn_id]),
            data: props.columnsFilter,
            dynamic_params: item[ETableDetails.cdn_dynamic_params],
            fixed_params: item[ETableDetails.cdn_fixed_params],
            modulesProperties: props.modulesProperties,
          });
        }

        tmpCols.push({
          header: item[ETableDetails.label],
          field: item[ETableDetails.id],
          type: item[ETableDetails.type],
          operator: item[ETableDetails.type] !== "text" ? "=" : item[ETableDetails.rules] === EDictionaryRules.enum || item[ETableDetails.rules] === EDictionaryRules.lookup ? "=" : "like",
          rules: item[ETableDetails.rules],
          key: item[ETableDetails.key] === "Y",
          disabled: item[ETableDetails.disabled] === "Y",
          required: item[ETableDetails.required] === "Y",
          rulesValues: item[ETableDetails.rulesValues],
          default: item[ETableDetails.default],
          target: item[ETableDetails.target],
          editable: true,
          visible: item[ETableDetails.visible] === "Y" && !hidden,
          filter: item[ETableDetails.filter] === "Y",
          dynamic_params: item[ETableDetails.dynamic_params],
          fixed_params: item[ETableDetails.fixed_params],
          pool_params: item[ETableDetails.pool_params],
          output_params: item[ETableDetails.output_params],
          col_cdn_id: parseInt(item[ETableDetails.col_cdn_id]),
          accessorKey: item[ETableDetails.target] ?? item[ETableDetails.id]
        });
      }
    }

    columns = tmpCols;
  }

  let ctxMenus = [];
  /* Add a column if contextual menus exist, none if not */
  
  if (results.items[0][ETableHeader.contextMenusID] !== null) {
    ctxMenus = await lyGetContextMenus({
      appsProperties: props.appsProperties,
      userProperties: props.userProperties,
      [EContextMenus.id]: results.items[0][ETableHeader.contextMenusID],
      modulesProperties: props.modulesProperties
    });
  }

  let tableProperties: ITableHeader = {
    [ETableHeader.id]: results.items[0][ETableHeader.id],
    [ETableHeader.dbName]: results.items[0][ETableHeader.dbName],
    [ETableHeader.description]: results.items[0][ETableHeader.description],
    [ETableHeader.queryID]: results.items[0][ETableHeader.queryID],
    [ETableHeader.contextMenusID]: ctxMenus,
    [ETableHeader.editable]: (results.items[0][ETableHeader.editable] === 'Y') ? true : false,
    [ETableHeader.uploadable]: (results.items[0][ETableHeader.uploadable] === 'Y') ? true : false,
    [ETableHeader.treeID]: results.items[0][ETableHeader.treeID],
    [ETableHeader.formID]: results.items[0][ETableHeader.formID],
    [ETableHeader.formLabel]: results.items[0][ETableHeader.formLabel],
    [ETableHeader.key]: (results.items[0][ETableHeader.key] === null) ? null : results.items[0][ETableHeader.key].split(";"),
    [ETableHeader.audit]: (results.items[0][ETableHeader.audit] === 'Y') ? true : false,
    [ETableHeader.burst]: (results.items[0][ETableHeader.burst] === 'Y') ? true : false,
    [ETableHeader.workbook]: (results.items[0][ETableHeader.workbook] === null || results.items[0][ETableHeader.workbook] === '')
      ? null 
      : results.items[0][ETableHeader.workbook],
    [ETableHeader.sheet]: (results.items[0][ETableHeader.sheet] === null || results.items[0][ETableHeader.sheet] === '')
      ? null 
      : results.items[0][ETableHeader.sheet],
    [ETableHeader.autoLoad]: (results.items[0][ETableHeader.autoLoad] === 'Y') ? true : false,

  };

  return { tableProperties: tableProperties, filters: tableColumns, columns: columns };
}

export interface IGetTableProperties {
  tableProperties: ITableHeader;
  filters: IFiltersProperties[];
  columns: IColumnsProperties[];
}