/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { IDialogContent } from "@ly_types/lyDialogs";
import { IModulesProps } from "@ly_types/lyModules";

export enum ESequence {
    id = "SEQ_ID",
    value = "SEQ_VALUE",
    queryID = "SEQ_QUERY_ID"
}


export interface ISequenceProps {
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps;
    [ESequence.id]: number;
    data: IDialogContent;
    dynamic_params?: string;
    fixed_params?: string
}
