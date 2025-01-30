/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps, ESessionMode } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IModulesProps } from "@ly_types/lyModules";
import { IColumnMetadata, ResultStatus } from "@ly_types/lyQuery";

export enum EEnumHeader {
  id = "ENUM_ID",
  label = "ENUM_LABEL",
  display_add = "ENUM_DISPLAY_ADD"
}

export interface IEnumProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  [EEnumHeader.id]: number;
  sessionMode?: ESessionMode;
}

export enum EEnumValues {
  id = "ENUM_ID",
  value = "VAL_ENUM",
  label = "VAL_LABEL",
  display_add = "ENUM_DISPLAY_ADD"
}

export interface IEnumOption {
  [EEnumValues.value]: string;
  [EEnumValues.label]: string;
}

export interface IEnumsResult {
  columns: IColumnMetadata[];
  data: IEnumOption[];
  header: {
    [key in EEnumHeader]?: string;
  };
  status?: ResultStatus.success;
}


