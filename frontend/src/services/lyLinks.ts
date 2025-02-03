/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ELinks, IGetLinks } from "@ly_types/lyLinks";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";

export const lyGetLinks = async (props: IGetLinks) => {
  let filters: IFiltersProperties[] = [];
  
  filters.push({
    header: "",
    field: ELinks.component,
    value: props[ELinks.component],
    type: "string",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  if (props[ELinks.componentID] > 0)
    filters.push({
      header: "",
      field: ELinks.componentID,
      value: props[ELinks.componentID],
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
    query: GlobalSettings.getFramework.links,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  });

  return results.items;
}
