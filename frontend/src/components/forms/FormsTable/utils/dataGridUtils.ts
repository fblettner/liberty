/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { RowData } from "@tanstack/react-table";

// Custom Import
import { IColumnsProperties, ITableRow, ITableHeader, TablesGridHardCoded } from "@ly_types/lyTables";
import { ITableDisplayView } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ComponentProperties,  LYComponentEvent, LYComponentMode } from "@ly_types/lyComponents";
import { IUsersProps } from "@ly_types/lyUsers";
import { IAppsProps } from "@ly_types/lyApplications";
import { rowDelete, rowUpdate } from "@ly_components/forms/FormsTable/utils/apiUtils";
import { IErrorState } from "@ly_utils/commonUtils";
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IModulesProps } from "@ly_types/lyModules";
import { ResultStatus } from "@ly_types/lyQuery";
import { TableEditState } from "@ly_components/forms/FormsTable/features/TableEdit";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { ChangeEvent } from "react";

const hiddenFields = [TablesGridHardCoded.row_id, '__row_group_by_columns_group__'];

export interface ISelectedRow {
    event: LYComponentEvent,
    status: "success" | "error" | "selected",
    message: string,
    keys: ITableRow
}

export function getRowId(row: ITableRow) {
    return row[TablesGridHardCoded.row_id];
}


// Utility function to get row class name
export const getRowClassNameHandler = (
    rowId: string,
    unsavedChanges: TableEditState['tableEdit'],
    row: ITableRow
) => {
    const unsavedRow = unsavedChanges.unsavedRows[rowId];

    if (row["error"]  && row["error"] === true) {
        return 'row--error'; // Return class for error rows
    }

    if (unsavedRow) {
        if (unsavedRow._action === 'delete') {
            return 'row--removed'; // Return class for deleted rows
        }
        return 'row--edited'; // Return class for edited rows
    }

    return ''; // Return empty class if no changes
};


// Utility function to add a blank row
export const addBlankRowHandler = (table: LYTableInstance<ITableRow>, filters: IFiltersProperties[]) => {
    table.addNewRow(filters);
};

// Utility function to copy to clipboard
export const copyToClipboardHandler = (table: LYTableInstance<ITableRow>) => {
    table.copyToClipboard();
};

// Utility function to copy to clipboard
export const pasteFromClipboardHandler = (table: LYTableInstance<ITableRow>) => {
    table.pasteFromClipboard();
};

export interface ISaveDataAPI {
    table: LYTableInstance<ITableRow>; 
    tableState: ITableState;
    setTableState: React.Dispatch<React.SetStateAction<ITableState>>;
    component: ComponentProperties;
    tableProperties: ITableHeader;
    columns: IColumnsProperties[];
    userProperties: IUsersProps;
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>
    updateTableState: <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
      ) => void;
}
export const saveDataAPI = async (params: ISaveDataAPI) => {
    const { table, tableState, setTableState, component, tableProperties, columns, userProperties, appsProperties, modulesProperties, setErrorState, updateTableState } = params;
    // Call API to remove rows marked for deletion
    const rowsToDelete = Object.values(tableState.tableEdit.unsavedRows).filter((row) => row._action === 'delete') as ITableRow[];
    let errorFound: boolean = false

    if (rowsToDelete.length > 0) {
        // Use Promise.all to wait for all rowDelete calls to complete
        for (const row of rowsToDelete) {
            const deleteParams = {
                rowValue: row,
                tableProperties,
                columns,
                userProperties,
                appsProperties,
                modulesProperties,
                setErrorState,
                tableState,
                setTableState,
                table,
                updateTableState
            };
            let status = await rowDelete(deleteParams);
            if (status === ResultStatus.error) {
               errorFound = true;
           } 
        }
    }

    const rowsToUpdate = Object.values(tableState.tableEdit.unsavedRows).filter((row) => row._action !== 'delete') as ITableRow[];
    if (rowsToUpdate.length > 0) {
        for (const row of rowsToUpdate) {
            const updateParams = {
                rowValue: row,
                tableProperties,
                columns,
                userProperties,
                appsProperties,
                modulesProperties,
                component,
                setErrorState,
                table,
                tableState, 
                setTableState,
                updateTableState
            }
            let status = await rowUpdate(updateParams);
            if (status === ResultStatus.error) {
                errorFound = true;
            }
        }
    }
    return errorFound
};


export const discardHandler = async(table: LYTableInstance<ITableRow>, setOpenSaveDialog: React.Dispatch<React.SetStateAction<boolean>>) => {
    // Reset the unsaved changes
    table.discardAllChanges();
    // Close the save dialog
    setOpenSaveDialog(false);
};


export interface IConfirmDeleteHandler  {
    setOpenDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
    tableProperties: ITableHeader;
    columns: IColumnsProperties[];
    userProperties: IUsersProps;
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    setTableState: React.Dispatch<React.SetStateAction<ITableState>>;
    updateTableState: <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
      ) => void;
}

export const confirmDeleteHandler = async (params: IConfirmDeleteHandler) => {
    const { setOpenDeleteDialog, tableProperties, columns, userProperties, appsProperties, modulesProperties, setErrorState, table, tableState, setTableState, updateTableState } = params;
    const selectedRow = table.getAllSelectedRows() as ITableRow[];
    // Perform delete operation for the selected rows
    for (const row of selectedRow) {
        const deleteParams = {
            rowValue: row,
            tableProperties,
            columns,
            userProperties,
            appsProperties,
            modulesProperties,
            setErrorState,
            table,
            tableState,
            setTableState,
            updateTableState
        };
        await rowDelete(deleteParams); 
    }
    // After deletion, close the dialog and clear the selected rows
    setOpenDeleteDialog(false);

}

export interface ISaveChangesHandler {
    table: LYTableInstance<ITableRow>; 
    tableState: ITableState;
    setTableState: React.Dispatch<React.SetStateAction<ITableState>>;
    component: ComponentProperties;
    tableProperties: ITableHeader;
    columns: IColumnsProperties[];
    userProperties: IUsersProps;
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
    updateTableState: <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
      ) => void;
}

export const saveChangesHandler = async (params: ISaveChangesHandler) => {
    const {updateTableState, tableState} = params;
    let error = await saveDataAPI(params);

    if (!error) {
        updateTableState('tableEdit', {
            unsavedRows: {},
            rowsBeforeChange: {},
            isNew: {},
            editMode: true,
            hasUnsavedRows: false,
        });

    }
}

export interface ICellMouseDownHandler {
    displayView: ITableDisplayView,
    event: React.MouseEvent<Element> | React.TouchEvent<Element> | ChangeEvent<HTMLInputElement>,
    apiRef: React.MutableRefObject<TableGridRef | undefined>,
    row: ITableRow,
    table: LYTableInstance<ITableRow>;
    handleOpenDialog?:  (mode: LYComponentMode, row?: ITableRow) => void;
}

let clickTimeout: number | null = null;

export const cellMouseDownHandler = (params: ICellMouseDownHandler) => {
    const { event, displayView, apiRef, row, table } = params;
    // Clear the previous timeout 
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }

    // Set a timeout for the single-click action
    clickTimeout = window.setTimeout(() => {
        table.deselectAllRows();
        table.toggleRowSelected(row[TablesGridHardCoded.row_id].toString());

        if (displayView.tree && apiRef.current !== undefined) {
            apiRef.current.scrollToRow(row[TablesGridHardCoded.row_id]);
        }
    }, 250); // 200ms delay for single click
};

export const selectHandler =(params: ICellMouseDownHandler) => {
    const { event, apiRef, row, table } = params;
    if (row !== undefined) {
        table.toggleRowSelected(row[TablesGridHardCoded.row_id]);
    }
};

// Handle the double-click event separately
export const cellDoubleClickHandler = (params: ICellMouseDownHandler) => {
    const {event, row, table, handleOpenDialog } = params;

    // Clear the single-click timeout so it doesn't trigger
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }

    table.deselectAllRows();

    if (typeof handleOpenDialog === "function") {
        handleOpenDialog(LYComponentMode.edit, row)
    }

};

export const touchStartHandler = (params: ICellMouseDownHandler) => {
    const { event, displayView, apiRef, row, table } = params;

        table.deselectAllRows();
        table.toggleRowSelected(row[TablesGridHardCoded.row_id]);

        if (displayView.tree && row !== undefined && apiRef.current !== undefined) {
            apiRef.current.scrollToRow(row[TablesGridHardCoded.row_id]);
        }
};

export const touchEndHandler = (
    longPressTimeout: React.MutableRefObject<number | null>,

) => {
    if (longPressTimeout.current !== null) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
    }
}