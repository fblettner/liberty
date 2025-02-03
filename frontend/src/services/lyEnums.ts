/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { EEnumHeader, EEnumValues, IEnumProps } from "@ly_types/lyEnums";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import Logger from "@ly_services/lyLogging";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";

export const lyGetEnums = async (props: IEnumProps) => {
  let filters: IFiltersProperties[] = [];
  let errorFound = false;

  filters.push({
    header: "",
    field: EEnumValues.id,
    value: props[EEnumHeader.id],
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
    query: GlobalSettings.getFramework.enums_header,
    sessionMode: props.sessionMode ?? props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })


  filters.push({
    header: "",
    field: EEnumValues.id,
    value: props[EEnumHeader.id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  let enumData;
  let columns;
  if (results.items.length === 0 || results.status === ResultStatus.error) {
    errorFound = true
    const logger = new Logger({
      transactionName: "lyEnums.lyGetEnums",
      modulesProperties: props.modulesProperties,
      data: results
    });
    logger.logException("EnumInput: Failed to fetch enum header");
  }
  else {

    enumData = await ToolsQuery.get({
      source: QuerySource.Framework,
      framework_pool: props.appsProperties[EApplications.pool],
      query: GlobalSettings.getFramework.enums_content,
      sessionMode: props.sessionMode ?? props.appsProperties[EApplications.session],
      filters: filters,
      language: props.userProperties[EUsers.language],
      modulesProperties: props.modulesProperties,
      jwt_token: props.appsProperties[EApplications.jwt_token]
    });

    if (enumData.status === ResultStatus.error) {
      errorFound = true;
      const logger = new Logger({
        transactionName: "lyEnums.lyGetEnums",
        modulesProperties: props.modulesProperties,
        data: enumData
      });
      logger.logException("EnumInput: Failed to fetch enum data");
    }

    columns = await ToolsQuery.columns({
      source: QuerySource.Framework,
      appsProperties: props.appsProperties,
      userProperties: props.userProperties,
      tableID: GlobalSettings.getFramework.enums_content,
      language: props.userProperties[EUsers.language],
      modulesProperties: props.modulesProperties
    });
    if (columns.status === ResultStatus.error) {
      errorFound = true
      const logger = new Logger({
        transactionName: "lyEnums.lyGetEnums",
        modulesProperties: props.modulesProperties,
        data: columns
      });
      logger.logException("EnumInput: Failed to fetch enum columns");
    }
  }

  /* Remove ENUM_ID on returned values, not needed to show to users */
  return { columns: (errorFound) ? [] :  columns.slice(2), data: (errorFound) ? [] : enumData.items, header: results.items[0], status: enumData.status };
}


