/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { EDialogDetails, EDialogTabs, EDialogHeader, IDialogsDetailsProps, IDialogsHeaderProps, IDialogsTab, IDialogsTabProps } from "@ly_types/lyDialogs";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { LYComponentMode } from "@ly_types/lyComponents";
import { lyCheckConditions } from "@ly_services/lyConditions";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";
import { EConditions } from "@ly_types/lyConditions";


export const lyGetDialogHeader = async (props: IDialogsHeaderProps) => {
  let filters: IFiltersProperties[] = [];
  filters.push({
    header: "",
    field: EDialogHeader.id,
    value: props.dialogID,
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
    query: GlobalSettings.getFramework.dialogs_header,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })
  return results.items[0];
}


export const lyGetDialogDetails = async (props: IDialogsDetailsProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EDialogDetails.language,
    value: props.userProperties[EUsers.language],
    type: "string",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  filters.push({
    header: "",
    field: EDialogHeader.id,
    value: props.dialogID,
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
    query: GlobalSettings.getFramework.dialogs_details,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  });
  return results.items;
}

export const lyGetDialogTab = async (props: IDialogsTabProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: EDialogDetails.language,
    value: props.userProperties[EUsers.language],
    type: "string",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  filters.push({
    header: "",
    field: EDialogHeader.id,
    value: props.dialogID,
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
    query: GlobalSettings.getFramework.dialogs_tab,
    sessionMode: props.appsProperties[EApplications.session],
    filters: filters,
    language: props.userProperties[EUsers.language],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  });

  let tmpTab: IDialogsTab[] = [];
  if (results.status === ResultStatus.success)
    if (results.items.length > 0)
      for (const item of results.items) {
        let hidden = false;
        /*        if (item[DialogDetailTab.conditional] !== null) {
                  let disableFunc = new Function('mode', 'content', item[DialogDetailTab.conditional]);
                  disabled = disableFunc(mode, content);
                }
        */
        if (item[EDialogTabs.disable_add] === "Y" 
          && (props.componentMode === LYComponentMode.add || props.componentMode === LYComponentMode.copy))
          hidden = true;

        if (item[EDialogTabs.disable_edit] === "Y" && (props.componentMode === LYComponentMode.edit))
          hidden = true;

        if (!hidden && item[EDialogTabs.condition] !== null && item[EDialogTabs.condition] > 0) {
          hidden = await lyCheckConditions({
            appsProperties: props.appsProperties,
            [EConditions.id]: item[EDialogTabs.condition],
            data: props.data,
            dynamic_params: item[EDialogTabs.dynamic_params],
            fixed_params: item[EDialogTabs.fixed_params],
            modulesProperties: props.modulesProperties,
          })
        }

        tmpTab.push({
          [EDialogTabs.id]: item[EDialogTabs.id],
          [EDialogTabs.sequence]: item[EDialogTabs.sequence],
          [EDialogTabs.label]: item[EDialogTabs.label],
          [EDialogTabs.hide]: hidden,
          [EDialogTabs.cols]: item[EDialogTabs.cols],
          [EDialogTabs.params]: item[EDialogTabs.dynamic_params] + ";" + item[EDialogTabs.fixed_params]
        })
      }
    else
      tmpTab.push({
        [EDialogTabs.id]: 1,
        [EDialogTabs.sequence]: props.dialogID + "-tab-id-1",
        [EDialogTabs.label]: null,
        [EDialogTabs.hide]: false,
        [EDialogTabs.cols]: 1,
        [EDialogTabs.params]: null
      })

  return tmpTab;
}

