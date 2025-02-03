/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { LYComponentType } from "@ly_types/lyComponents";
import { IAppsProps } from "@ly_types/lyApplications";
import { IModulesProps } from "@ly_types/lyModules";

export enum EDahsboardHeader {
    id = "DSH_ID",
    label = "DSH_LABEL",
    rows = "DSH_ROW",
    columns = "DSH_COLUMN"
}

export interface IDashboardHeader {
    [EDahsboardHeader.id]: number;
    [EDahsboardHeader.label]: string;
    [EDahsboardHeader.rows]: number;
    [EDahsboardHeader.columns]: number;
}

export enum EDahsboardContent {
    id = "DSH_ID",
    col_id = "DSH_COL_ID",
    rows = "DSH_ROW",
    columns = "DSH_COLUMN",
    component = "DSH_COMPONENT",
    componentID = "DSH_COMPONENT_ID",
    display_title = "DSH_DISPLAY_TITLE",
    title = "DSH_TITLE"
}

export interface IDashboardContent {
    [EDahsboardContent.id]: string;
    [EDahsboardContent.col_id]: string;
    [EDahsboardContent.rows]: number;
    [EDahsboardContent.columns]: number;
    [EDahsboardContent.component]: LYComponentType;
    [EDahsboardContent.componentID]: number;
    [EDahsboardContent.display_title]: string;
    [EDahsboardContent.title]: string;
}

export interface IDashboardState {
    header?: IDashboardHeader;
    content?: IDashboardContent[];
}

export interface IDashboardProps {
    appsProperties: IAppsProps;
    [EDahsboardHeader.id]: number;
    modulesProperties: IModulesProps;
}
   