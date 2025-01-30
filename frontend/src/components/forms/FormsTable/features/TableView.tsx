/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import {
    InitialTableState,
    makeStateUpdater,
    OnChangeFn,
    RowData,
    Table
} from '@tanstack/react-table';

// Define the custom feature's state
export interface TableViewState {
    tableView: {
        tree: boolean;
        list: boolean;
        table: boolean;
    };
}

// Define the custom feature's options
export interface TableViewOptions {
    onTableViewChange?: OnChangeFn<TableViewState['tableView']>;
}

// Define the custom feature's instance methods
export interface TableEditInstance {  
}

// Use declaration merging to extend TanStack Table's types
declare module '@tanstack/react-table' {
    interface TableState extends TableViewState { }
    interface TableOptionsResolved<TData extends RowData>
        extends TableViewOptions { }
    interface Table<TData extends RowData> extends TableEditInstance { }
}

// Define the feature
export const TableViewFeature = {
    getInitialState: (initialState?: InitialTableState): TableViewState => ({
        tableView: {
            tree: false,
            list: false,
            table: true
        },
        ...initialState,
    }),

    getDefaultOptions: <TData extends RowData>(
        table: Table<TData>
    ): TableViewOptions => ({
        onTableViewChange: makeStateUpdater('tableView', table),
    }),

    createTable: <TData extends RowData>(table: Table<TData>) => {
        // Add a new row and mark it as unsaved
 
    },
};