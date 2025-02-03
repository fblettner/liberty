/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";

// MUI Import


// Custom Import
import { LYComponentMode, LYComponentEvent, ComponentProperties, LYComponentType } from "@ly_types/lyComponents";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ESeverity, IErrorState } from "@ly_utils/commonUtils";
import { ITableRow, ITableHeader, ETableHeader } from "@ly_types/lyTables";
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { onSelectRowFunction } from "@ly_components/input/InputLookup/utils/commonUtils";

/**
 * Opens a dialog based on the provided parameters.
 * @param params - The parameters for opening the dialog.
 */
export interface IOpenDialogHandler  {
    mode: LYComponentMode;
    table: LYTableInstance<ITableRow>;
    row?: ITableRow;
    tableState: ITableState;
    componentPropertiesRef: React.MutableRefObject<ComponentProperties>;
    tablePropertiesRef: React.MutableRefObject<ITableHeader>;
    onSelectRow?: onSelectRowFunction;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
    dialogPropertiesRef: React.MutableRefObject<ComponentProperties>;
    apiRef: React.MutableRefObject<TableGridRef | undefined>
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}


export const openDialogHandler = async  (params: IOpenDialogHandler) => {

    const { mode, row, tableState, componentPropertiesRef, tablePropertiesRef, onSelectRow, setErrorState, dialogPropertiesRef, apiRef, setOpenDialog,table } = params;

    const selectedRow = table.getFirstSelectedRow();

    if (tableState.tableEdit.editMode)
        return;

    if (componentPropertiesRef.current.componentMode === LYComponentMode.search && typeof onSelectRow === "function") {
        let rowContent = row ?? selectedRow;
        if (rowContent !== null && rowContent !== undefined)
            return onSelectRow({ event: LYComponentEvent.Cancel, status: "selected", message: "", keys: rowContent as ITableRow })
    }

    if (tablePropertiesRef.current[ETableHeader.formID] === null || tablePropertiesRef.current[ETableHeader.formID] === undefined)
        return;

    if (mode !== LYComponentMode.add && !selectedRow  && !row ) {
        setErrorState({ open: true, message: t("tables.SelectedRowsError"), severity: ESeverity.error});
        return;
    }

    let filtersDLG: IFiltersProperties[] = [];
    if (mode !== LYComponentMode.add) {
        let rowContent = row ?? selectedRow;
        if (rowContent !== null && rowContent !== undefined)
            tablePropertiesRef.current[ETableHeader.key].forEach((key: string) => {
                filtersDLG.push({
                    header: "",
                    field: key,
                    value: (rowContent as ITableRow)[key],
                    type: "string",
                    operator: "=",
                    defined: true,
                    rules: "",
                    disabled: true,
                    values: "",
                });
            })
    }

    const secondArrayFields = new Set(filtersDLG.map(item => item.field));

    /* Save current component settings into previous component */
    let currentComponent: ComponentProperties = {
        id: componentPropertiesRef.current.id,
        type: componentPropertiesRef.current.type,
        label: componentPropertiesRef.current.label,
        filters: componentPropertiesRef.current.filters,
        previous: componentPropertiesRef.current.previous,
        componentMode: componentPropertiesRef.current.componentMode,
        initialState: (tableState.tableEdit.editMode && apiRef.current) ? apiRef.current.exportState() : undefined,
        showPreviousButton: componentPropertiesRef.current.showPreviousButton,
        isChildren: false,
        currentTab: componentPropertiesRef.current.currentTab,
        params: componentPropertiesRef.current.params,
        overrideQueryPool: componentPropertiesRef.current.overrideQueryPool

    };

    if (componentPropertiesRef.current.previous !== undefined && componentPropertiesRef.current.previous !== null) {
        if (componentPropertiesRef.current.previous.type === LYComponentType.FormsDialog) {
            currentComponent = {
                id: componentPropertiesRef.current.previous.id,
                type: componentPropertiesRef.current.previous.type,
                label: componentPropertiesRef.current.previous.label,
                filters: componentPropertiesRef.current.previous.filters,
                previous: componentPropertiesRef.current.previous.previous,
                componentMode: componentPropertiesRef.current.previous.componentMode,
                initialState: (tableState.tableEdit.editMode && apiRef.current) ? apiRef.current.exportState() : undefined,
                showPreviousButton: componentPropertiesRef.current.previous.showPreviousButton,
                isChildren: componentPropertiesRef.current.previous.isChildren,
                currentTab: componentPropertiesRef.current.currentTab ?? componentPropertiesRef.current.previous.currentTab,
                params: componentPropertiesRef.current.previous.params,
                overrideQueryPool: componentPropertiesRef.current.previous.overrideQueryPool
            }
        }
    }
  
    dialogPropertiesRef.current = {
        id: tablePropertiesRef.current[ETableHeader.formID],
        type: LYComponentType.FormsDialog,
        label: (componentPropertiesRef.current.previous?.label ?? componentPropertiesRef.current.label) + " > " + tablePropertiesRef.current[ETableHeader.formLabel],
        filters: (mode !== LYComponentMode.add) ? filtersDLG : componentPropertiesRef.current.filters,
        previous: currentComponent,
        componentMode: mode,
        tableProperties: tablePropertiesRef.current,
        showPreviousButton: false,
        isChildren: false,
        params: componentPropertiesRef.current.filters.filter((filterProperties: IFiltersProperties) => !secondArrayFields.has(filterProperties.field)),
        overrideQueryPool: componentPropertiesRef.current.overrideQueryPool
    }

    setOpenDialog(true);

}