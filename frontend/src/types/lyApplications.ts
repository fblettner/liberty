/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

export enum EApplications {
  id = "APPS_ID",
  name = "APPS_NAME",
  description = "APPS_DESCRIPTION",
  pool = "APPS_POOL",
  offset = "APPS_OFFSET",
  limit = "APPS_LIMIT",
  version = "APPS_VERSION",
  dashboard = "APPS_DASHBOARD",
  theme = "APPS_THEME",
  session = "SESSION_MODE",
  jwt_token = "JWT_TOKEN"
}

export enum ESessionMode {
  framework = "framework",
  session = "session"
}

export interface IAppsProps  {
  [EApplications.id]: number;
  [EApplications.name]: string;
  [EApplications.description]: string;
  [EApplications.pool]: string;
  [EApplications.offset]: number;
  [EApplications.limit]: number;
  [EApplications.version]: string;
  [EApplications.dashboard]: number;
  [EApplications.theme]: string;
  [EApplications.session]: ESessionMode;
  [EApplications.jwt_token]: string;
};
