/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

export enum EModules {
    id = "MODULE_ID",
    enabled = "MODULE_ENABLED",
    params = "MODULE_PARAMS",
  }
  
export type IModuleConfig = {
  enabled: boolean;
  params: string | null;  
};

export type IModulesProps = {
  debug: IModuleConfig;
  sentry: IModuleConfig;
  login: IModuleConfig;
  menus: IModuleConfig;
  grafana: IModuleConfig;
  dev: IModuleConfig;
};


export type IModulesState = Record<string, IModuleConfig>

export interface IGetModulesProps {
  pool: string;
}
