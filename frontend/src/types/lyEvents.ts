/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IModulesProps } from "@ly_types/lyModules";


export enum EEventComponent {
    component = "EVT_COMPONENT",
    componentID = "EVT_CPT_ID",
    eventID = "EVT_ID",
    actionID = "EVT_ACT_ID",
}


export interface IEventComponent {
    [EEventComponent.component]: string;
    [EEventComponent.componentID]: number;
    [EEventComponent.eventID]: number;
    [EEventComponent.actionID]: number;
  }

export interface IEventComponentsProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps;
    [EEventComponent.component]: string;
    [EEventComponent.componentID]: number;
    [EEventComponent.eventID]: number;
}