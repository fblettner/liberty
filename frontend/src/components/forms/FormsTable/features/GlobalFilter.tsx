/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { ITableRow, TablesGridHardCoded } from '@ly_types/lyTables';
import {
    functionalUpdate,
    InitialTableState,
    makeStateUpdater,
    OnChangeFn,
    RowData,
    Table,
    Updater,
} from '@tanstack/react-table';

// Define the custom feature's state
export interface GlobalFilterState {
    globalFilter: string
}

// Define the custom feature's options
export interface GlobalFilterOptions {
    onGlobalFilterChange?: OnChangeFn<GlobalFilterState['globalFilter']>;

}

// Define the custom feature's instance methods
export interface GlobalFilterInstance {   
    clearGlobalFilter: () => void
    applyGlobalFilter: (filter: string, rows: ITableRow[]) => ITableRow[]
}

// Use declaration merging to extend TanStack Table's types
declare module '@tanstack/react-table' {
    interface TableState extends GlobalFilterState { }
    interface TableOptionsResolved<TData extends RowData>
        extends GlobalFilterOptions { }
    interface Table<TData extends RowData> extends GlobalFilterInstance { }
}

// Define the feature
export const GlobalFilterFeature = {
    getInitialState: (initialState?: InitialTableState): GlobalFilterState => ({
        globalFilter: '',
        ...initialState,
    }),

    getDefaultOptions: <TData extends ITableRow>(
        table: Table<TData>
    ): GlobalFilterOptions => ({
        onGlobalFilterChange: makeStateUpdater('globalFilter', table),
    }),

    createTable: <TData extends ITableRow>(table: Table<TData>) => {
        // Set the global filter
        table.setGlobalFilter = (updater: Updater<string>) => {
            const safeUpdater = functionalUpdate(updater, table.getState().globalFilter);
            table.options.onGlobalFilterChange?.(safeUpdater);
        };

        // Clear the global filter
        table.clearGlobalFilter = () => {
            table.setGlobalFilter(''); // Reset filter to empty string
        };

        // Method to filter rows based on the current global filter value
        table.applyGlobalFilter = (filter: string, rows: ITableRow[]) => {
            if (!filter) return rows; // Return all rows if no filter value

            return rows.filter((row: RowData) => {
                return Object.keys(row as ITableRow).some((columnId) => {
                    if (columnId === TablesGridHardCoded.row_id) return false; 

                    const value = (row as ITableRow)[columnId];
                    const safeValue = (() => {
                        if (value === null || value === undefined) {
                            return ''; // Treat null/undefined as empty strings
                        }
                        if (typeof value === 'number') {
                            return String(value); // Convert numbers to strings
                        }
                        if (typeof value === 'boolean') {
                            return value ? 'true' : 'false'; // Convert boolean to 'true'/'false'
                        }
                        return String(value); // Convert other types to strings
                    })();
                    return safeValue.toLowerCase().includes(filter.toLowerCase());
                });
            });
        };

    },
};