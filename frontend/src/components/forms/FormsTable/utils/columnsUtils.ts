/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Column } from "@tanstack/react-table";

// Custom Import
import { ComponentProperties, LYComponentDisplayMode } from "@ly_types/lyComponents";
import { ETableHeader, IColumnsProperties, IColumnsVisibility, ITableRow } from "@ly_types/lyTables";
import { getColumnProperties } from "@ly_components/forms/FormsTable/features/ColumnsProperties";
import { ITablesProperties } from "@ly_types/lyTables";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IContentValue } from "@ly_utils/commonUtils";


// Set column properties
export interface ISetColumnProperties {
    tables: ITablesProperties;
    tableState: ITableState;
    componentProperties: ComponentProperties;
    displayMode: LYComponentDisplayMode;
    readonly: boolean;
    ActionsForGrid: IColumnsProperties;
    ActionsForTable: IColumnsProperties;
    ActionsNone: IColumnsProperties;
}

// Define the type for the state
export interface IFilterState {
    openFilters: boolean;
    selectedColumn: Column<ITableRow, IContentValue> | null; // Adjust types as needed
  }
  

export const setColumnProperties = (params: ISetColumnProperties ) => {
    const {
        tables,
        tableState,
        componentProperties,
        displayMode,
        readonly,
        ActionsForGrid,
        ActionsForTable,
        ActionsNone,
    } = params;
    let columnsProperties: IColumnsProperties[] = [];

    if (tables.tableProperties[ETableHeader.editable]
        && displayMode === LYComponentDisplayMode.component
        && !readonly
    ) {
        columnsProperties.push(tableState.tableEdit.editMode
            ? ActionsForGrid
            : (tables.tableProperties[ETableHeader.formID] != null && tables.tableProperties[ETableHeader.formID] != undefined) ? ActionsForTable : ActionsForGrid)
    }

    tables.columns.forEach((columnProperties: IColumnsProperties) => {
        const params = {
            columnProperties, 
            componentProperties
        }
        const columnProps = getColumnProperties(params);
        columnsProperties.push(...columnProps);
    });

    return columnsProperties;
};

// Set column visibility
export const setColumnVisibility = (
    tables: ITablesProperties, 
    getColumnsVisibility: (item: IColumnsProperties) => IColumnsVisibility
) => {
    let columnsVisibility = {};

    tables.columns.forEach((item: IColumnsProperties) => {
        const visibility = getColumnsVisibility(item);
        columnsVisibility = { ...columnsVisibility, ...visibility };
    });

    return columnsVisibility;
};

