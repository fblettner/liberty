/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IModulesProps } from "@ly_types/lyModules";

export enum ELanguage {
    id = "LNG_ID",
    name = "LNG_NAME"
}

export interface ILanguageProps {
  appsProperties: IAppsProps;
  modulesProperties: IModulesProps;
}
