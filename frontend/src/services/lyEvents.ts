/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { EEventComponent, IEventComponentsProps } from "@ly_types/lyEvents";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";

export const lyGetEventsComponent = async (props: IEventComponentsProps) => {
  let filters: IFiltersProperties[] = [];
  
  filters.push({
    header: "",
    field: EEventComponent.eventID,
    value: props[EEventComponent.eventID],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  filters.push({
    header: "",
    field: EEventComponent.componentID,
    value: props[EEventComponent.componentID],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  filters.push({
    header: "",
    field: EEventComponent.component,
    value: props[EEventComponent.component],
    type: "string",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.events_component,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })
  return results;
}


