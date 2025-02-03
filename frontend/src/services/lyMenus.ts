/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Dispatch } from "react";
import { AuthContextProps } from "react-oidc-context";

// Custom Import
import { IAppsProps, ESessionMode, EApplications } from "@ly_types/lyApplications";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { IGetMenusFromApiProps, IGetMenusProps, EMenus, IMenusItem } from "@ly_types/lyMenus"
import { IFiltersProperties } from "@ly_types/lyFilters";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings, UIDisplayMode } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { ComponentProperties, LYComponentType, LYComponentMode } from "@ly_types/lyComponents";
import { onAppsPropertiesChanged, onChatOpenChanged, onSessionModeChanged, onToggleMenusDrawer, onUserPropertiesChanged } from "@ly_features/global";
import { UnknownAction } from "@reduxjs/toolkit";


/* Create a tree array for application navigation, columns are hard coded */
function getMenusTree(
  arr: IMenusItem[],  
  parent: string = "0", 
  key: string = "0" 
): IMenusItem[] {  
  let output: IMenusItem[] = [];
  for (const obj of arr) {
    if (obj[EMenus.parent] === parent && obj[EMenus.child].includes(key)) {
      const children = getMenusTree(arr, obj[EMenus.child], obj[EMenus.key]);

      if (children.length) {
        obj.children = children;
      }
      output.push(obj);
    }
  }
  return output;
}

export const lyGetMenus = async (props: IGetMenusProps) => {
  const { appsProperties, userProperties, modulesProperties } = props;
  let filters: IFiltersProperties[] = []

  filters.push({
    header: "",
    field: EUsers.id,
    value: userProperties[EUsers.id],
    type: "string",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: (appsProperties[EApplications.session] === ESessionMode.framework) ? GlobalSettings.getDefaultPool : appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.menus,
    sessionMode: appsProperties[EApplications.session],
    filters: filters,
    language: userProperties[EUsers.language],
    modulesProperties: modulesProperties,
    jwt_token: appsProperties[EApplications.jwt_token]
  })
  let menus = getMenusTree(results.items)

  return {results: results, tree: menus};
}

export const getMenusFromApi = async (props: IGetMenusFromApiProps) => {
  return await lyGetMenus(props);
};

export const openInNewTab = (url: string) => window.open(url, "_blank", "noreferrer");

export const handleMenuAction = (
  value: string,
  sessionMode: ESessionMode,
  setSelectedIndex: Dispatch<string | null>,
  dispatch: Dispatch<UnknownAction>,
  updateActiveComponent: (component: ComponentProperties) => void,
  auth: AuthContextProps,
  application: IAppsProps,
  userProperties: IUsersProps
) => {

  switch (value) {
    case "admin":
      dispatch(onSessionModeChanged(sessionMode === ESessionMode.framework ? ESessionMode.session : ESessionMode.framework));
      dispatch(onToggleMenusDrawer());
      break;
    case "signout":
      if (auth.isAuthenticated) {
        auth.removeUser().catch(console.error);
        auth.revokeTokens().catch(console.error);
      }
      dispatch(onAppsPropertiesChanged({
        [EApplications.id]: 0,
        [EApplications.pool]: GlobalSettings.getDefaultPool,
        [EApplications.name]: "LIBERTY",
        [EApplications.description]: "Liberty Framework",
        [EApplications.offset]: 5000,
        [EApplications.limit]: 5000,
        [EApplications.version]: GlobalSettings.getVersion,
        [EApplications.session]: ESessionMode.session,
        [EApplications.dashboard]: -1,
        [EApplications.theme]: "liberty",
        [EApplications.jwt_token]: ""

      }));
      dispatch(onUserPropertiesChanged({
        [EUsers.status]: false,
        [EUsers.id]: "",
        [EUsers.name]: "",
        [EUsers.email]: "",
        [EUsers.password]: "",
        [EUsers.admin]: "N",
        [EUsers.language]: "en",
        [EUsers.displayMode]: UIDisplayMode.dark,
        [EUsers.darkMode]: true,
        [EUsers.theme]: "liberty",
        [EUsers.dashboard]: -1,
        [EUsers.readonly]: "Y",
      }));
      setSelectedIndex(null);
      dispatch(onToggleMenusDrawer());
      dispatch(onChatOpenChanged(false));
      dispatch({ type: 'signout', payload: { user: userProperties[EUsers.id], application: application[EApplications.id] } })
      break;
    case "pgadmin":
      openInNewTab(GlobalSettings.getBackendURL + "pgadmin");
      break;
    case "rundeck":
      openInNewTab(GlobalSettings.getBackendURL + "rundeck");
      break;
    case "documentation":
      openInNewTab("https://docs.nomana-it.fr/liberty/getting-started/");
      break;
    case "lyAI":
      dispatch(onChatOpenChanged(true));
      dispatch(onToggleMenusDrawer());

      break;
    case "lyTools":
      const toolsComponent: ComponentProperties = {
        id: 9999,
        type: LYComponentType.FormsTools,
        label: "Liberty Tools",
        filters: [],
        showPreviousButton: false,
        componentMode: LYComponentMode.standard,
        isChildren: false,
      };
      setSelectedIndex(value);
      dispatch(onToggleMenusDrawer());
      updateActiveComponent(toolsComponent);
      break;      
    default:
      break;
  }
};