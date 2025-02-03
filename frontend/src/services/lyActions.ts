/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { EActionsHeader, EActionsParams, EActionsTasks, IActionsHeaderProps, IActionsParamsProps, IActionsTasksParamsProps, IActionsTasksProps } from "@ly_types/lyActions";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { EApplications } from "@ly_types/lyApplications";

export const lyGetActionsHeader = async (props: IActionsHeaderProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EActionsHeader.action_id,
    value: props[EActionsHeader.action_id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    modulesProperties: props.modulesProperties,
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.actions_header,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })


  return { data: results.items };
}


export const lyGetActionsParams = async (props: IActionsParamsProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EActionsParams.action_id,
    value: props[EActionsParams.action_id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    modulesProperties: props.modulesProperties,
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.actions_params,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  return { data: results.items };
}

export const lyGetActionsTasks = async (props: IActionsTasksProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EActionsTasks.action_id,
    value: props[EActionsTasks.action_id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    modulesProperties: props.modulesProperties,
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.actions_tasks,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  return { data: results.items };
}

export const lyGetActionsTasksParams = async (props: IActionsTasksParamsProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EActionsTasks.action_id,
    value: props[EActionsTasks.action_id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  filters.push({
    header: "",
    field: EActionsTasks.task_id,
    value: props[EActionsTasks.task_id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    modulesProperties: props.modulesProperties,
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.actions_tasks_params,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  return { data: results.items };
}