import { IContentValue } from "@ly_utils/commonUtils";

/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
export interface IFiltersProperties {
    header: string;
    field: string;
    value: IContentValue;
    type: string;
    operator: string;
    defined: boolean;
    rules: string | null;
    rulesValues?: string;
    values: string | null;
    disabled: boolean;
    label?: string
    dynamic_params?: string;
    fixed_params?: string;
    pool_params?: string;
    target?: string;
  }


export interface IColumnsFilter {
  [index: string]: {
    header: string;
    value: IContentValue;
    rules: string;
    rulesValues: string;
    type: string;
    operator: string;
    dynamic_params: string;
    fixed_params: string;
    pool_params: string;
    target: string;
    label: string;
    field: string;
    disabled: boolean;
    values: string;
    defined: boolean;
  };
}

export class CColumnsFilter {
  fields: IColumnsFilter;
  constructor() {
    this.fields = {};
  }
}
