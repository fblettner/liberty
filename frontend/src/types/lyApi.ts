/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { ESessionMode } from "@ly_types/lyApplications";
import { IModulesProps } from "@ly_types/lyModules";

export enum EAPIRoute {
    rest = "rest"

}export interface IAPIProperties  {
    pool: string;
    api: number;
    sessionMode: ESessionMode;
    modulesProperties: IModulesProps;
    jwt_token: string;
};

