/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// Custom Import
import { ITablesProperties } from "@ly_types/lyTables";
import { ComponentProperties } from "@ly_types/lyComponents";
import { IEnumOption } from "@ly_types/lyEnums";
import { ILookupOption } from "@ly_types/lyLookup";
import { IColumnsProperties, ITableRow } from "@ly_types/lyTables";
import { CColumnsFilter, IFiltersProperties } from "@ly_types/lyFilters";
import { IContentValue } from "@ly_utils/commonUtils";
import { Cell, CellContext, Row, RowData } from "@tanstack/react-table";

export const autosizeOptions = {
    includeHeaders: true,
    includeOutliers: true,
    outliersFactor: 1.5,
    expand: true
};

export interface ITableDisplayView {
    tree: boolean;
    list: boolean;
    table: boolean;
    grid: boolean
}

export interface ITransformedObject {
    [key: string]: { value: IContentValue };
  }

export function convertRowtoContent(originalObject: ITableRow) {
    const transformedObject: ITransformedObject = {};

    // Loop through each key in the original object
    for (const key in originalObject) {
        // Dynamically set each key in the transformed object
        transformedObject[key] = { value: originalObject[key] };
    }

    return transformedObject;
}

// Define a function to parse dynamic parameters
export const parseDynamicParams = (dynamicParams: string): Map<string, string> => {

    const paramMap = new Map<string, string>();
    const params = dynamicParams.split(';');
    params.forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
            paramMap.set(key.trim(), value.trim());
        }
    });
    return paramMap;
};

// Set filters
export const setFilters = (
    tables: ITablesProperties, 
    component: ComponentProperties, 
    columnsFilter: CColumnsFilter
) => {
    if (Object.keys(columnsFilter.fields).length === 0) {
        tables.columns
            .filter((columns: IColumnsProperties) => columns.filter === true)
            .forEach((item: IColumnsProperties) => {
                const componentFilter = component.filters.find(
                    (column: IFiltersProperties) => column.field === item.field
                );

                columnsFilter.fields[item.target ?? item.field] = {
                    header: item.header,
                    value: 
                        component.filters.length === 0 || componentFilter === undefined
                            ? null
                            : componentFilter.value,
                    rules: item.rules ?? null,
                    rulesValues: item.rulesValues ?? null,
                    type: item.type ?? null,
                    operator: item.operator ?? null,
                    dynamic_params: item.dynamic_params ?? null,
                    fixed_params: item.fixed_params ?? null,
                    pool_params: item.pool_params ?? null,
                    target: item.target ?? null,
                    label: "",
                    field: item.field ?? "",
                    disabled: item.disabled ?? false,
                    values: "",
                    defined: false,
                };
            });
    }
};


export interface OnTableEventParams {
    row: Row<ITableRow>, 
    columnId: string, 
    value: IContentValue
}
  
export interface OnAutoCompleteParams {
    cell: CellContext<ITableRow, IContentValue>;
    value: IContentValue; 
    label: string;
    data?: [] | ILookupOption | IEnumOption; 
}

export type OnBlurFunction = (params : OnTableEventParams) => void;
export type OnChangeFunction = (params : OnTableEventParams) => void;
export type OnAutoCompleteChangeFunction = (params : OnAutoCompleteParams) => void;