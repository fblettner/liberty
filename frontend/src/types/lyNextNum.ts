/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IModulesProps } from "@ly_types/lyModules";

export enum ENextNumber {
    id = "NN_ID",
    current = "NN_CURRENT"
}

export interface INextNumberProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;  
    modulesProperties: IModulesProps;
    [ENextNumber.id]: string;
    overrideQueryPool?: string;
  }