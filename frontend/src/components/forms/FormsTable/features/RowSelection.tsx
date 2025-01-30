/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import {
    makeStateUpdater,
    OnChangeFn,
    RowData,
    Table,
    TableFeature,
} from '@tanstack/react-table';

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module '@tanstack/react-table' { // or whatever framework adapter you are using
    interface TableState extends RowSelectionTableState { }
    interface TableOptionsResolved<TData extends RowData>
        extends RowSelectionOptions { }
    interface Table<TData extends RowData> extends RowSelectionInstance<TData> { }
}

// Define custom state types for row selection
export interface RowSelectionTableState {
    rowSelection: Record<string, boolean>;
}

// Define custom options for row selection
export interface RowSelectionOptions {
    onRowSelectionChange?: OnChangeFn<Record<string, boolean>>;
}

// Define custom instance APIs for row selection
export interface RowSelectionInstance<TData extends RowData> {
    toggleRowSelected: (rowId: string) => void;
    getIsRowSelected: (rowId: string) => boolean;
    toggleAllRowsSelected: () => void;
    deselectAllRows: () => void;
    getFirstSelectedRow: () => TData | undefined;
    getAllSelectedRows: () => TData[];
}

// Create the `RowSelectionFeature`
export const RowSelectionFeature: TableFeature<RowData> = {
    getInitialState: (state): RowSelectionTableState => {
        return {
            rowSelection: {},
            ...state,
        };
    },
    getDefaultOptions: (table): RowSelectionOptions => {
        return {
            onRowSelectionChange: makeStateUpdater('rowSelection', table),
        };
    },
    createTable: (table): void => {
        table.toggleRowSelected = (rowId: string) => {
            table.options.onRowSelectionChange?.(old => {
                const newSelection = { ...old };
                if (newSelection[rowId]) {
                    delete newSelection[rowId];
                } else {
                    newSelection[rowId] = true;
                }
                return newSelection;
            });
        };

        table.getIsRowSelected = (rowId: string) => {
            return !!table.getState().rowSelection[rowId];
        };
        table.deselectAllRows = () => {
            table.setRowSelection({}); // Clear row selection state
        }

        table.toggleAllRowsSelected = () => {
            const allRowsSelected = Object.keys(table.getState().rowSelection).length === table.getRowModel().rows.length;
            table.options.onRowSelectionChange?.(() => {
                if (allRowsSelected) {
                    return {};
                } else {
                    const newSelection: Record<string, boolean> = {};
                    table.getRowModel().rows.forEach(row => {
                        newSelection[row.id] = true;
                    });
                    return newSelection;
                }
            });
        };

        // New function to get the first selected row's original data
        table.getFirstSelectedRow = () => {
            const selectedRowIds = Object.keys(table.getState().rowSelection);
            if (selectedRowIds.length === 0) {
                return undefined; // No row is selected
            }
            const firstSelectedRow = table.getRowModel().rows.find(row => row.id === selectedRowIds[0]);
            return firstSelectedRow?.original; // Return the original row data
        };

        // New function to get all selected rows' original data
        table.getAllSelectedRows = () => {
            const selectedRowIds = Object.keys(table.getState().rowSelection);
            return table.getRowModel().rows
                .filter(row => selectedRowIds.includes(row.id))
                .map(row => row.original); // Return an array of the original row data
        };
    },
};