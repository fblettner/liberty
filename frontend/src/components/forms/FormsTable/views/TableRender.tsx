/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import

// Custom Import
import { ComponentProperties, LYComponentDisplayMode, LYComponentMode } from "@ly_types/lyComponents";
import { ITableRow, ITableHeader } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { TableToolbar } from "@ly_components/forms/FormsTable/toolbar/TableToolbar";
import { TableGrid, TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { TableList } from "@ly_components/forms/FormsTable/views/TableList";
import { TableTree } from "@ly_components/forms/FormsTable/views/TableTree";
import { ITableDisplayView } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { Stack_Table } from "@ly_components/styles/Stack";
import { ChangeEvent } from "react";
import { FlexPanels } from "@ly_components/common/Flex";


interface ITableRender {
    isLoading: boolean,
    apiRef: React.MutableRefObject<TableGridRef | undefined>,
    table: LYTableInstance<ITableRow>,
    tableState: ITableState,
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void,
    readonly: boolean,
    displayMode: LYComponentDisplayMode,
    displayView: ITableDisplayView,
    setDisplayView: React.Dispatch<React.SetStateAction<ITableDisplayView>>,
    filtersDP: CColumnsFilter,
    currentFilters: IFiltersProperties[],
    tableProperties: ITableHeader,
    componentProperties: ComponentProperties,
    onOpenDialog: (mode: LYComponentMode, row?: ITableRow) => void;
    onDelete: () => void,
    fetchData: (restoreState: boolean) => void,
    onCancelQuery: () => void,
    handleOpenFilters: () => void,
    handleRefresh: () => void,
    onSelect: (event: React.MouseEvent<Element> | ChangeEvent<HTMLInputElement>, row: ITableRow) => void,
    onMouseDown: (event: React.MouseEvent<Element> | React.MouseEvent<Element>, row: ITableRow) => void,
    onTouchStart: (event: React.TouchEvent<Element>, row: ITableRow) => void,
    onTouchEnd: () => void,
    onDoubleClick: (event: React.MouseEvent<Element> | React.MouseEvent<Element>, row: ITableRow) => void,
    onSave: () => Promise<void>,
    onDiscard: () => void,
    onImport: () => void,
    uploadComponent: React.MutableRefObject<ComponentProperties>,
    setOpenUpload: React.Dispatch<React.SetStateAction<boolean>>
    rowCount: number
}

export const TableRender = (params: ITableRender) => {
    const {
        isLoading,
        apiRef,
        table,
        tableState,
        updateTableState,
        readonly,
        displayMode,
        displayView,
        setDisplayView,
        filtersDP,
        currentFilters,
        tableProperties,
        componentProperties,
        onOpenDialog,
        onDelete,
        fetchData,
        onCancelQuery,
        handleOpenFilters,
        handleRefresh,
        onSelect,
        onMouseDown,
        onTouchStart,
        onTouchEnd,
        onDoubleClick,
        onSave,
        onDiscard,
        onImport,
        uploadComponent,
        setOpenUpload,
        rowCount
    } = params

    return (

        <Stack_Table>

            {!isLoading && displayMode === LYComponentDisplayMode.component &&
                <TableToolbar
                    displayView={displayView}
                    setDisplayView={setDisplayView}
                    handleOpenFilters={handleOpenFilters}
                    handleRefresh={handleRefresh}
                    filtersDP={filtersDP}
                    currentFilters={currentFilters}
                    tableProperties={tableProperties}
                    component={componentProperties}
                    readonly={readonly}
                    handleOpenDialog={onOpenDialog}
                    handleDelete={onDelete}
                    table={table}
                    uploadComponent={uploadComponent}
                    setOpenUpload={setOpenUpload}
                />
            }
            <FlexPanels panels={[1, 5]} direction="horizontal">
                {!isLoading && displayView.tree &&
                    <TableTree
                        displayView={displayView}
                        displayMode={displayMode}
                        table={tableProperties}
                        tableState={tableState}
                        onDoubleClick={onDoubleClick}
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd} />}
                {displayView.table &&
                    <TableGrid
                        ref={apiRef}
                        isLoading={isLoading}
                        table={table}
                        tableState={tableState}
                        updateTableState={updateTableState}
                        filters={currentFilters}
                        onSelect={onSelect}
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        onDoubleClick={onDoubleClick}
                        onCancelQuery={onCancelQuery}
                        onSave={onSave}
                        onDiscard={onDiscard}
                        onImport={onImport}
                        rowCount={rowCount}
                    />
                }

            {!isLoading && displayView.list &&
                <TableList
                    table={table}
                    tableState={tableState}
                    onDoubleClick={onDoubleClick}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd} />}
            </FlexPanels>

        </Stack_Table>
    )
}