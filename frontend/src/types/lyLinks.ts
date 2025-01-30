/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { LYComponentType } from "@ly_types/lyComponents";
import { IModulesProps } from "@ly_types/lyModules";
import { IUsersProps } from "@ly_types/lyUsers";

export enum ELinks {
    id = "LNK_ID",
    label = "VAL_LABEL",
    link = "VAL_LINK",
    component = "LNK_COMPONENT",
    componentID = "LNK_COMPONENT_ID"
}

export interface IGetLinks {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  [ELinks.component]: LYComponentType;
  [ELinks.componentID]: number;
}
