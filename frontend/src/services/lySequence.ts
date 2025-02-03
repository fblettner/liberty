/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IFiltersProperties } from "@ly_types/lyFilters";
import { QuerySource } from "@ly_types/lyQuery";
import { ISequenceProps, ESequence } from "@ly_types/lySequence";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications } from "@ly_types/lyApplications";

export const lyGetSequence = async (props: ISequenceProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: ESequence.id,
    value: props[ESequence.id],
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
    query: GlobalSettings.getFramework.sequence,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  let errorFound = false;
  let filtersSEQ: IFiltersProperties[] = [];
  if (results.items.length > 0) {
    /* Create filter from tables or dialogs value */
    let filterString: string;
    if (props.dynamic_params !== null && props.dynamic_params !== undefined) {
      filterString = props.dynamic_params;

      filterString.split(";").forEach((filters) => {
        let filter = filters.split("=")
        if (props.data[filter[1]] === undefined)
          errorFound = true;
        else
          if (props.data[filter[1]].value !== null)
            filtersSEQ.push({
              header: "",
              field: filter[0],
              value: props.data[filter[1]].value,
              type: "string",
              operator: "=",
              defined: true,
              rules: "",
              disabled: true,
              values: "",
            });
      })
    }

    /* Create filter for fixed values defined into LY_SEQ_FILTERS */

    if (props.fixed_params !== null && props.fixed_params !== undefined) {
      filterString = props.fixed_params;
      filterString.split(";").forEach((filters) => {
        let filter = filters.split("=")

        filtersSEQ.push({
          header: "",
          field: filter[0],
          value: filter[1],
          type: "string",
          operator: "=",
          defined: true,
          rules: "",
          disabled: true,
          values: "",
        });
      })
    }
  }

  /* Add 10000 to sequence if not in development mode (this is to not override customizations done by customers with standard development) */
  filtersSEQ.push({
    header: "",
    field: ESequence.value,
    value: 10000,
    type: "number",
    operator: !props.modulesProperties.dev.enabled ? ">" : "<",
    defined: true,
    rules: "",
    disabled: true,
    values: "",
  });

  const sequence = await ToolsQuery.get({
    source: QuerySource.Query,
    framework_pool: props.appsProperties[EApplications.pool],
    query: results.items[0][ESequence.queryID],
    sessionMode: props.appsProperties[EApplications.session],
    filters: filtersSEQ,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  if (sequence.count === 0)
    return !props.modulesProperties.dev.enabled ? 10001 : 1;
  else
    return sequence.items[0][ESequence.value] + 1
}

