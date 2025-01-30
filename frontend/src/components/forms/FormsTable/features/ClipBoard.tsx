/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import {
    TableFeature,
    RowData,
    OnChangeFn,
    InitialTableState,
    Table,
    makeStateUpdater,
} from '@tanstack/react-table';

// Custom Import
import { EDictionaryRules } from '@ly_types/lyDictionary';
import { IContentValue } from '@ly_utils/commonUtils';
import { IColumnsProperties, ITableRow, TablesGridHardCoded } from '@ly_types/lyTables';

// Define Clipboard State
export interface ClipboardTableState {
    clipboard: {
        content: string;
        hasClipboardContent: boolean;
    }
}

// Define Clipboard Options
export interface ClipboardOptions {
    onClipboardChange?: OnChangeFn<ClipboardTableState['clipboard']>;
}

// Define Clipboard Instance API
export interface ClipboardInstance {
    copyToClipboard: () => void;
    pasteFromClipboard: () => void;
    clearClipboard: () => void;
}

// Extend TanStack Table types with Clipboard functionality
declare module '@tanstack/react-table' {
    interface TableState extends ClipboardTableState { }
    interface TableOptionsResolved<TData extends RowData> extends ClipboardOptions { }
    interface Table<TData extends RowData> extends ClipboardInstance { }
}

// Implement Clipboard Feature
export const ClipboardFeature: TableFeature<RowData> = {
    getInitialState: (initialState?: InitialTableState): ClipboardTableState => ({
        clipboard: {
            content: "",
            hasClipboardContent: false,
        },
        ...initialState,
    }),

    getDefaultOptions: (table): ClipboardOptions => ({
        onClipboardChange: makeStateUpdater('clipboard', table),
    }),

    createTable: (table) => {
        // Method to copy selected rows to clipboard
        table.copyToClipboard = () => {
            const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original as ITableRow);
            const columns: IColumnsProperties[] = table.options.columns as IColumnsProperties[];  // Correct column reference

            // Generate CSV string
            const csv = selectedRows
                .map((row) => columns.map((col) => row[col.accessorKey]).join('\t'))
                .join('\n');

            // Update clipboard state and mark as copied
            table.options.onClipboardChange?.((oldClipboardState) => {
                return {
                    ...oldClipboardState,
                    content: csv,
                    hasClipboardContent: true,
                };
            });
        };

        // Method to paste rows from clipboard
        table.pasteFromClipboard = () => {
            const currentRows = table.options.data;
            const clipboardData = table.getState().clipboard.content;
            if (!clipboardData) return ;  // Exit if no clipboard data

            const lines = clipboardData.split('\n').filter((line) => line.trim() !== '');
            const columns: IColumnsProperties[] = table.options.columns as IColumnsProperties[];  // Correct column reference

            // Parse clipboard data and map it to row objects
            const newRows = lines.map((line, index) => {
                const values = line.split('\t');
                const rowObject: { [TablesGridHardCoded.row_id]: string; [key: string]: IContentValue } = { [TablesGridHardCoded.row_id]: (currentRows.length + index + 1).toString() };
    
                values.forEach((value, idx) => {
                    let newValue: string | null = value;
                    const column = columns.find((item) => item.accessorKey === columns[idx].accessorKey);
                    if (column !== undefined && (column.rules === EDictionaryRules.sequence || column.rules === EDictionaryRules.nextNumber)) {
                        newValue = null;
                    }
                    if (columns[idx]?.accessorKey !== undefined)
                        rowObject[columns[idx]?.accessorKey] = newValue;

                });
                return rowObject;
            });
            table.addRows(newRows);  
            table.deselectAllRows();
            table.options.onClipboardChange?.((oldClipboardState) => {
              
                return {
                    content: '',
                    hasClipboardContent: false,
                };
            });
        };

        // Method to clear the clipboard content
        table.clearClipboard = () => {
            table.options.onClipboardChange?.((oldClipboardState) => ({
                content: '',
                hasClipboardContent: false,

            }));
        };
    },
};