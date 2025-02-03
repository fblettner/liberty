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
    Table,
} from '@tanstack/react-table';

// Custom Import
import { EDictionaryRules } from '@ly_types/lyDictionary';
import { IColumnsProperties, IColumnsVisibility, ITableRow, TablesGridHardCoded } from '@ly_types/lyTables';
import { IFiltersProperties } from '@ly_types/lyFilters';

// Use declaration merging to extend TanStack Table's types
declare module '@tanstack/react-table' {
    interface TableState extends TableEditState { }
    interface TableOptionsResolved<TData extends RowData>
        extends TableEditOptions {
    }
    interface Table<TData extends RowData> extends TableEditInstance { }

}
// Define the custom feature's state
export interface TableEditState {
    tableEdit: {
        unsavedRows: Record<string, ITableRow>;
        rowsBeforeChange: Record<string, ITableRow>;
        isNew: Record<string, boolean>;
        editMode: boolean;
        hasUnsavedRows: boolean;
    };
}

export interface TableDataState {
    tableData: {
        table_id: number;
        rows: ITableRow[],
        columns: IColumnsProperties[],
        columnsVisibility: IColumnsVisibility
    };
}

// Define the custom feature's options
export interface TableEditOptions {
    onTableEditChange?: OnChangeFn<TableEditState['tableEdit']>;
    onTableDataChange?: OnChangeFn<TableDataState["tableData"]>;

}

// Define the custom feature's instance methods
export interface TableEditInstance {
    addRows: (newRows: ITableRow[]) => void;
    addNewRow: (filters: IFiltersProperties[]) => void;
    editRow: (rowId: string, updatedRow: ITableRow) => void;
    deleteRow: (rowId: string) => void;
    restoreRow: (rowId: string) => void;
    isRowChanged: (rowId: string) => boolean;
    discardAllChanges: () => void;
    hasUnsavedRows: () => boolean;
    isCellEditable: (rowId: string, field: string) => boolean;
    toggleEditMode: () => void;
    isEditMode: () => boolean;
}


// Define the feature
export const TableEditFeature = {
    getInitialState: (initialState?: InitialTableState): TableEditState => ({
        tableEdit: {
            unsavedRows: {},
            rowsBeforeChange: {},
            isNew: {},
            editMode: false,
            hasUnsavedRows: false
        },
        ...initialState,
    }),

    getDefaultOptions: <TData extends RowData>(
        table: Table<TData>
    ): TableEditOptions => ({
        onTableEditChange: makeStateUpdater('tableEdit', table),
    }),

    createTable: <TData extends ITableRow>(table: Table<TData>) => {
        // Add a new row and mark it as unsaved
        table.addRows = (newRows) => {
            // Generate a new row id for the blank row
            const currentRows = table.options.data ;

            const selectedRowIds = table
                .getSelectedRowModel()
                .rows.map((row) => row.id);

            if (selectedRowIds.length > 0) {
                // Case when a row is selected
                const selectedRowId = selectedRowIds[selectedRowIds.length - 1];

                // Find the index of the selected row
                const selectedIndex = currentRows.findIndex((row) => row[TablesGridHardCoded.row_id] === selectedRowId);

                // Insert the new row right after the selected row
                const updatedRows = [
                    ...currentRows.slice(0, selectedIndex + 1), // Rows before the selected row
                    ...newRows, // New blank row
                    ...currentRows.slice(selectedIndex + 1) // Rows after the selected row
                ];

                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: updatedRows,  // Only update the rows
                }));
            } else {
                // Case when no row is selected
                // Insert the new row at the top
                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: [...newRows, ...currentRows],  // Only update the rows
                }));
            }

            table.options.onTableEditChange?.((oldTableEdit) => {
                // Create new objects to accumulate unsaved rows and isNew flags
                const updatedUnsavedRows = { ...oldTableEdit.unsavedRows };
                const updatedIsNew = { ...oldTableEdit.isNew };

                // Iterate over each row in newRows and add it to unsavedRows and isNew
                newRows.forEach((row) => {
                    const rowId = row[TablesGridHardCoded.row_id];  

                    // Mark the row as unsaved and as a new row
                    updatedUnsavedRows[rowId] = row;
                    updatedIsNew[rowId] = true;
                });

                // Return the updated state with unsavedRows and isNew for all newRows
                return {
                    ...oldTableEdit,
                    unsavedRows: updatedUnsavedRows,
                    isNew: updatedIsNew,
                    hasUnsavedRows: true,
                };
            });

        };

        table.addNewRow = (filters: IFiltersProperties[]) => {
            const currentRows = table.options.data;
            const newId =
            currentRows.length > 0
              ? Math.max(
                  ...currentRows.map((row) =>
                    Number(row[TablesGridHardCoded.row_id]) 
                  )
                ) + 1
              : 1;
            // Create a blank row object
            const newRow: ITableRow = { [TablesGridHardCoded.row_id]: newId.toString() };

            // Add default values for all columns
            const columns = table.options.columns as IColumnsProperties[];
            columns.forEach((col) => {
                let defaultValue;
                if (col.rules === EDictionaryRules.lookup || col.rules === EDictionaryRules.enum) {
                    defaultValue = filters.find((item) => item.field === col.accessorKey.replace("_LABEL", ""));
                } else
                    defaultValue = filters.find((item) => item.field === col.accessorKey);

                if (col.accessorKey !== undefined)
                    if ((col.rules === EDictionaryRules.lookup || col.rules === EDictionaryRules.enum) && col.accessorKey.includes("_LABEL"))
                        newRow[col.accessorKey] = defaultValue?.label ?? col.default; 
                    else
                        newRow[col.accessorKey] = defaultValue?.value ?? col.default; 
            });

            const selectedRowIds = table
                .getSelectedRowModel()
                .rows.map((row) => row.id);

            if (selectedRowIds.length > 0) {
                // Case when a row is selected
                const selectedRowId = selectedRowIds[0];

                // Find the index of the selected row
                const selectedIndex = currentRows.findIndex((row) => row[TablesGridHardCoded.row_id] === selectedRowId);

                // Insert the new row right after the selected row
                const updatedRows = [
                    ...currentRows.slice(0, selectedIndex + 1), // Rows before the selected row
                    newRow, // New blank row
                    ...currentRows.slice(selectedIndex + 1) // Rows after the selected row
                ];

                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: updatedRows,  // Only update the rows
                }));
            } else {
                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: [newRow, ...currentRows],  // Only update the rows
                }));
            }
            const rowId = newId.toString();
            table.options.onTableEditChange?.((oldTableEdit) => {
                const updatedState = {
                    ...oldTableEdit,
                    hasUnsavedRows: true,
                    unsavedRows: {
                        ...oldTableEdit.unsavedRows,
                        [rowId]: newRow,
                    },
                    isNew: {
                        ...oldTableEdit.isNew,
                        [rowId]: true,
                    },
                }
                return updatedState;

            });
        };

        // Edit a row and save its original state before the change
        table.editRow = (rowId, updatedRow) => {
            const originalRow = table.getRowModel().rows.find(
                (row) => row.id === rowId
            )?.original;

            // Handle updating the row in the external data
            const currentRows = table.options.data;
            // Map the rows to find the row by rowId and update it
            const updatedRows = currentRows.map((row) =>
                row[TablesGridHardCoded.row_id] === rowId ? { ...row, ...updatedRow } : row
            );
            // Update the external data with the updated row, keeping columns and visibility intact
            table.options.onTableDataChange?.((prevData) => ({
                ...prevData,  
                rows: updatedRows,  
            }));

            table.options.onTableEditChange?.((oldTableEdit) => {
                return {
                    ...oldTableEdit,
                    hasUnsavedRows: true,
                    unsavedRows: {
                        ...oldTableEdit.unsavedRows,
                        [rowId]: updatedRow,
                    },
                    rowsBeforeChange: {
                        ...oldTableEdit.rowsBeforeChange,
                        [rowId]: oldTableEdit.rowsBeforeChange[rowId] || originalRow,
                    },
                };
            });
        };

        table.deleteRow = (rowId: string) => {
            const currentRows = table.options.data;
            const isNew = table.getState().tableEdit.isNew || {};

            const isNewRow = isNew[rowId];
            if (isNewRow) {
                // If it's a new row, directly delete it from the data
                const updatedRows = currentRows.filter((row) => row[TablesGridHardCoded.row_id] !== rowId);

                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: updatedRows,  // Only update the rows
                }));
            }

            table.options.onTableEditChange?.((oldTableEdit) => {
                // Ensure that these objects exist before spreading
                const unsavedRows = oldTableEdit.unsavedRows || {};
                const rowsBeforeChange = oldTableEdit.rowsBeforeChange || {};
                const isNew = oldTableEdit.isNew || {};

                const isNewRow = isNew[rowId];
                if (isNewRow) {
                    // Remove the row from the unsaved changes state
                    const { [rowId]: _, ...restUnsavedRows } = unsavedRows;
                    const { [rowId]: __, ...restRowsBeforeChange } = rowsBeforeChange;
                    const { [rowId]: ___, ...restIsNew } = isNew;

                    return {
                        unsavedRows: restUnsavedRows,
                        rowsBeforeChange: restRowsBeforeChange,
                        isNew: restIsNew,
                        editMode: oldTableEdit.editMode,
                        hasUnsavedRows: Object.keys(restUnsavedRows).length > 0 || Object.keys(restIsNew).length > 0
                    };
                } else {
                    // If it's not a new row, mark it for deletion
                    const row = table.getRowModel().rows.find((r) => r.id === rowId)?.original;
                    // Ensure that `row` exists before marking it for deletion
                    if (row) {
                        return {
                            ...oldTableEdit,
                            hasUnsavedRows: true,
                            unsavedRows: {
                                ...unsavedRows, // Safe spread
                                [rowId]: {
                                    ...row,
                                    _action: 'delete', // Mark the row for deletion
                                },
                            },
                        };
                    }
                    return oldTableEdit; // Return unchanged state if row is not found
                }
            });
        };

        table.restoreRow = (rowId: string) => {
            const currentRows = table.options.data;
            const restoredRow: ITableRow = table.getState().tableEdit.rowsBeforeChange[rowId];

            if (restoredRow) {
                // Update the table rows by restoring the modified row to its original state
                const updatedRows = currentRows.map((row) =>
                    row[TablesGridHardCoded.row_id] === rowId ? restoredRow : row
                );

                // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
                table.options.onTableDataChange?.((prevData) => ({
                    ...prevData,  // Keep columns and other parts of the state intact
                    rows: updatedRows,  // Only update the rows
                }));

            }
            table.options.onTableEditChange?.((oldTableEdit) => {
                const currentRows = table.options.data;

                // Ensure the relevant properties exist
                const unsavedRows = oldTableEdit.unsavedRows || {};
                const rowsBeforeChange = oldTableEdit.rowsBeforeChange || {};
                const isNew = oldTableEdit.isNew || {};  // Ensure `isNew` exists

                if (unsavedRows[rowId]) {
                    // Remove the row from unsaved changes after restoring
                    const { [rowId]: removedRow, ...restUnsavedRows } = unsavedRows;
                    const { [rowId]: removedBeforeChange, ...restRowsBeforeChange } = rowsBeforeChange;
                    const { [rowId]: removedNew, ...restIsNew } = isNew; // Also handle the case where the row might be new

                    // Return the updated TableEdit state
                    return {
                        unsavedRows: restUnsavedRows,
                        rowsBeforeChange: restRowsBeforeChange,
                        isNew: restIsNew,
                        editMode: oldTableEdit.editMode,
                        hasUnsavedRows: Object.keys(restUnsavedRows).length > 0 || Object.keys(restIsNew).length > 0
                    };
                }
                // If the row was not modified, return the current state unchanged
                return oldTableEdit;
            });
        };

        table.isRowChanged = (rowId: string) => {
            const { unsavedRows, isNew } = table.getState().tableEdit;
            return !!unsavedRows[rowId] && !isNew[rowId];
        };

        // Discard all changes, restoring original data and removing new rows
        table.discardAllChanges = () => {
            const currentRows = table.options.data;

            // Restore modified rows to their original state from rowsBeforeChange
            const restoredRowsMap = table.getState().tableEdit.rowsBeforeChange || {};
            const isNewMap = table.getState().tableEdit.isNew || {};

            // Get the list of new row IDs that need to be removed
            const newRowsToDelete = Object.keys(isNewMap);

            // Update the table rows: restore modified rows and remove new ones
            const updatedRows = currentRows
                .filter((row) => !newRowsToDelete.includes(row[TablesGridHardCoded.row_id])) // Remove new rows
                .map((row) => {
                    // Restore the row if it was modified, otherwise keep it unchanged
                    return restoredRowsMap[row[TablesGridHardCoded.row_id]] ? restoredRowsMap[row[TablesGridHardCoded.row_id]] : row;
                });

            // Update the external data, maintaining the structure {rows, columns, columnsVisibility}
            table.options.onTableDataChange?.((prevData) => ({
                ...prevData,  // Keep columns and other parts of the state intact
                rows: updatedRows,  // Only update the rows
            }));

            table.options.onTableEditChange?.((oldTableEdit) => {
                // Reset unsaved changes state
                return {
                    unsavedRows: {},
                    rowsBeforeChange: {},
                    isNew: {},
                    editMode: oldTableEdit.editMode,
                    hasUnsavedRows: false,
                };
            });
        };

        table.toggleEditMode = () => {

            table.options.onTableEditChange?.((oldTableEdit) => {
                const newEditMode = !oldTableEdit.editMode;
                return {
                    ...oldTableEdit,
                    editMode: newEditMode,
                };
            });
        };

        table.isEditMode = () => {
            return table.getState().tableEdit.editMode;
        };

        table.isCellEditable = (rowId: string, field: string) => {
            const columns = table.options.columns as IColumnsProperties[];
            const isNewRow = table.getState().tableEdit.isNew[rowId] === true;

            const column = columns.find((col) => col.accessorKey === field);

            if (column !== undefined) {
                let isEditable = !column.disabled && !column.key  && column.editable;

                if (isNewRow && column.key && column.rules !== EDictionaryRules.sequence && column.rules !== EDictionaryRules.nextNumber  && column.editable ) {
                    isEditable = true;
                }

                return isEditable;
            }
            else
                return false
        };



    },
};