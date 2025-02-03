/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { LYComponentType } from "@ly_types/lyComponents";
import { IModulesProps } from "@ly_types/lyModules";
import { IUsersProps } from "@ly_types/lyUsers";
import { IconType } from "react-icons/lib";

export enum EMenus {
    key = "KEY_ATTRIBUTES",
    parent = "MENU_PARENT_ID",
    child = "MENU_CHILD_ID",
    id = "MENU_ID",
    label = "MENU_LABEL",
    component = "MENU_COMPONENT",
    componentID = "MENU_COMPONENT_ID",
    dynamic_params = "DYNAMIC_PARAMS",
    fixed_params = "FIXED_PARAMS",
    visible = "AUT_RUN"
}

export interface IMenusItem {
  [EMenus.key]: string;
  [EMenus.parent]: string;
  [EMenus.child]: string;
  [EMenus.id]: string;
  [EMenus.label]: string;
  [EMenus.component]: LYComponentType;
  [EMenus.componentID]: number;
  [EMenus.dynamic_params]: string;
  [EMenus.fixed_params]: string;
  [EMenus.visible]: string;
  menuIcon?: IconType;
  children?: IMenusItem[];
}

export interface IGetMenusProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
}

export interface IGetMenusFromApiProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
}

