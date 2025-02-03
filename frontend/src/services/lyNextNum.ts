/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IFiltersProperties } from "@ly_types/lyFilters";
import { INextNumberProps, ENextNumber } from "@ly_types/lyNextNum";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";

const setRow = (id: string, next: number, user: string) => {
  return JSON.stringify({
    NN_ID: id,
    NN_CURRENT: next,
    NN_AUDIT_USER: user,
    NN_AUDIT_DATE: new Date().toISOString()
  })
}

export const lyGetNextNumber = async (props: INextNumberProps ) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: ENextNumber.id,
    value: props[ENextNumber.id],
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
    query: GlobalSettings.getFramework.nextNumber,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  if (results.items.length == 0) {
    let restData = setRow(props[ENextNumber.id], 1, props.userProperties[EUsers.id]);
    await ToolsQuery.post({
      source: QuerySource.Framework,
      framework_pool: props.appsProperties[EApplications.pool],
      query: GlobalSettings.getFramework.nextNumber,
      sessionMode: props.appsProperties[EApplications.session],
      modulesProperties: props.modulesProperties,
      jwt_token: props.appsProperties[EApplications.jwt_token]
    }, restData);
    return 1
  }
  else {
    let sequence = results.items[0][ENextNumber.current] + 1
    let restData = setRow(props[ENextNumber.id], sequence, props.userProperties[EUsers.id]);
    await ToolsQuery.put({
      source: QuerySource.Framework,
      framework_pool: props.appsProperties[EApplications.pool],
      query: GlobalSettings.getFramework.nextNumber,
      sessionMode: props.appsProperties[EApplications.session],
      modulesProperties: props.modulesProperties,
      jwt_token: props.appsProperties[EApplications.jwt_token]
    }, restData);

    return results.items[0][ENextNumber.current] + 1
  }
}

