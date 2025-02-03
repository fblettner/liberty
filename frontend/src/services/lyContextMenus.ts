/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
/* LY_CONTEXTUAL */

import { EContextMenus, IContextMenusProps } from "@ly_types/lyContextual";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";


export const lyGetContextMenus = async (props: IContextMenusProps) => {
  let filters: IFiltersProperties[] = [];
  
  filters.push({
    header: "",
    field: EContextMenus.ctxID,
    value: props[EContextMenus.id],
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
    query: GlobalSettings.getFramework.contextMenus,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })
  return results.items;
}


