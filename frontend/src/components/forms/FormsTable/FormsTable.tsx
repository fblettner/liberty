/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useState, useRef, useEffect, useCallback, useMemo, Fragment, ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { t } from "i18next";
import { functionalUpdate, getCoreRowModel, getSortedRowModel, SortingState, useReactTable, getGroupedRowModel, getExpandedRowModel, getFilteredRowModel, ColumnFiltersState, RowData } from "@tanstack/react-table";

// Custom Import
import { getAppsProperties, getModules, getUserProperties } from "@ly_features/global";
import { IAppsProps } from "@ly_types/lyApplications";
import { ComponentProperties, LYComponentDisplayMode, LYComponentViewMode, LYComponentType, LYComponentMode, LYComponentEvent } from "@ly_types/lyComponents";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ITableRow, ITableHeader, TablesGridHardCoded, ETableHeader } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { IUsersProps } from "@ly_types/lyUsers";
import { getActionsForGrid, getActionsForTable } from "@ly_components/forms/FormsTable/features/TableActions";
import { ITableDisplayView, setFilters } from "@ly_components/forms/FormsTable/utils/commonUtils"
import { IDialogAction } from "@ly_utils/commonUtils";
import { fetchDataHandler, FetchDataParams } from "@ly_components/forms/FormsTable/utils/fetchDataUtils";
import { TableFilters } from "@ly_components/forms/FormsTable/dialogs/TableFilters";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { ConfirmationDialog } from "@ly_components/common/ConfirmationDialog";
import { DialogWidget } from "@ly_components/forms/FormsDialog//dialogs/DialogWidget";
import { TableDialog } from "@ly_components/forms/FormsTable/dialogs/TableDialog";
import { TableContextMenus } from "@ly_components/forms/FormsTable/toolbar/TableContextMenu";
import { getMenuItemComponent } from "@ly_components/forms/FormsTable/utils/menuItemUtils";
import { TableRender } from "@ly_components/forms/FormsTable/views/TableRender";
import {
    cellDoubleClickHandler,
    cellMouseDownHandler, confirmDeleteHandler, discardHandler, ISelectedRow, saveChangesHandler, selectHandler, touchEndHandler,
    touchStartHandler
} from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { getColumnsVisibility, getFilters } from "@ly_components/forms/FormsTable/features/ColumnsProperties";
import { openDialogHandler } from "@ly_components/forms/FormsTable/utils/dialogUtils";
import { IErrorState } from "@ly_utils/commonUtils";
import { ClipboardFeature } from "@ly_components/forms/FormsTable/features/ClipBoard";
import { DensityFeature } from "@ly_components/forms/FormsTable/features/Density";
import { RowSelectionFeature } from "@ly_components/forms/FormsTable/features/RowSelection";
import { TableEditFeature } from "@ly_components/forms/FormsTable/features/TableEdit";
import { GlobalFilterFeature } from "@ly_components/forms/FormsTable/features/GlobalFilter";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IModulesProps } from "@ly_types/lyModules";
import { TableImport } from "@ly_components/forms/FormsTable/dialogs/TableImport";
import { TableUpload } from "@ly_components/forms/FormsTable/dialogs/TableUpload";
import { TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { onSelectRowFunction } from "@ly_components/input/InputLookup/utils/commonUtils";
import { LYAddIcon, LYCopyIcon, LYDeleteIcon, LYEditIcon } from "@ly_styles/icons";
import { Stack_FormsTable } from "@ly_components/styles/Stack";
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { AnchorPosition } from "@ly_components/types/common";

interface IFormsTable {
    componentProperties: ComponentProperties;
    displayMode: LYComponentDisplayMode;
    viewGrid: boolean;
    viewMode: LYComponentViewMode;
    onSelectRow?: onSelectRowFunction,
    readonly: boolean;
}

export function FormsTable(params: IFormsTable) {
    const { componentProperties, displayMode, viewGrid, viewMode, onSelectRow, readonly } = params;
    const isMobile = useMediaQuery('(max-width:600px)');
    const longPressTimeout = useRef<number | null>(null);

    const appsProperties: IAppsProps = useSelector(getAppsProperties)
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);

    // Declare States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tableState, setTableState] = useState<ITableState>({
        sorting: [] as SortingState,
        density: 'sm',
        columnsVisibility: {},
        selectedRowModel: {},
        tableEdit: {
            unsavedRows: {},
            rowsBeforeChange: {},
            isNew: {},
            editMode: false,
            hasUnsavedRows: false
        },
        clipboard: {
            content: "",
            hasClipboardContent: false,
        },
        tableData: {
            table_id: 0,
            rows: [],
            columns: [],
            columnsVisibility: {}
        },
        filteredRows: [],
        globalFilter: ""
    });

    const [openFilters, setOpenFilters] = useState<boolean>(true);
    const [columnsFilter, setColumnsFilter] = useState<CColumnsFilter>(new CColumnsFilter());
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        [],
    );

    const [contextMenuState, setContextMenuState] = useState<{
        open: boolean;
        anchorEl: AnchorPosition | undefined
    }>({ open: false, anchorEl: undefined });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });
    const [openDialog, setOpenDialog] = useState(false);
    const [openTable, setOpenTable] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);
    const uploadComponent = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: "",
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });

    const [displayView, setDisplayView] = useState<ITableDisplayView>({
        tree: false,
        list: false,
        table: viewGrid,
        grid: viewMode === LYComponentViewMode.grid
    })
    const [sendAction, setSendAction] = useState<IDialogAction>({ event: LYComponentEvent.none, keys: null, message: "" });
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [rowCount, setRowCount] = useState(0);

    // Declare Refs
    const rowsFilterRef = useRef<IFiltersProperties[]>([]);
    const cancelQueryStatusRef = useRef<boolean>(false);
    const apiRef = useRef<TableGridRef>();
    const loadDataRef = useRef<boolean>(false);
    const rowNumRef = useRef(0);
    const tablePropertiesRef = useRef<ITableHeader>({
        [ETableHeader.id]: -1,
        [ETableHeader.dbName]: "",
        [ETableHeader.description]: "",
        [ETableHeader.queryID]: -1,
        [ETableHeader.editable]: false,
        [ETableHeader.uploadable]: false,
        [ETableHeader.audit]: false,
        [ETableHeader.burst]: false,
        [ETableHeader.workbook]: "",
        [ETableHeader.sheet]: "",
        [ETableHeader.contextMenusID]: [],
        [ETableHeader.treeID]: -1,
        [ETableHeader.formID]: -1,
        [ETableHeader.formLabel]: "",
        [ETableHeader.key]: [],
        [ETableHeader.autoLoad]: true
    });
    const componentPropertiesRef = useRef(componentProperties);
    const dialogProperties = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: "",
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });

    const table = useReactTable({
        _features: [DensityFeature, RowSelectionFeature, TableEditFeature, ClipboardFeature, GlobalFilterFeature],
        data: tableState.filteredRows,
        columns: tableState.tableData.columns,
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting: tableState.sorting,
            density: tableState.density,
            columnVisibility: tableState.tableData.columnsVisibility,
            rowSelection: tableState.selectedRowModel,
            tableEdit: tableState.tableEdit,
            clipboard: tableState.clipboard,
            globalFilter: tableState.globalFilter,
            columnFilters
        },
        onSortingChange: (newSorting) =>
            setTableState((prevState) => ({
                ...prevState,
                sorting: functionalUpdate(newSorting, prevState.sorting),
            })),
        onDensityChange: (updaterOrValue) =>
            setTableState((prevState) => ({
                ...prevState,
                density: typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.density)
                    : updaterOrValue,
            })),
        onRowSelectionChange: (updaterOrValue) => {
            setTableState((prevState) => ({
                ...prevState,
                selectedRowModel: typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.selectedRowModel)
                    : updaterOrValue,
            }))
        },
        onClipboardChange: (updaterOrValue) =>
            setTableState((prevState) => ({
                ...prevState,
                clipboard: typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.clipboard)
                    : updaterOrValue,
            })),
        onTableEditChange: (updaterOrValue) => {
            setTableState((prevState) => ({
                ...prevState,
                tableEdit: typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.tableEdit)
                    : updaterOrValue,
            }))
        },
        onColumnVisibilityChange: (updaterOrValue) => {
            setTableState((prevState) => ({
                ...prevState,
                tableData: {
                    ...prevState.tableData,
                    columnsVisibility: typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState.tableData.columnsVisibility)
                        : updaterOrValue,
                }
            }));
        },
        onGlobalFilterChange: (updaterOrValue) => {
            setTableState((prevState) => {
                const newGlobalFilter = typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.globalFilter)
                    : updaterOrValue;

                const filteredRows = table.applyGlobalFilter(newGlobalFilter, tableState.tableData.rows);
                return {
                    ...prevState,
                    globalFilter: newGlobalFilter,  // Update global filter
                    filteredRows,  // Update the filtered rows based on the new global filter
                };
            });
        },
        getRowId: (row) => row[TablesGridHardCoded.row_id],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: "onChange",
        columnResizeDirection: "ltr",

        onTableDataChange: (updaterOrValue) => {
            setTableState((prevState) => ({
                ...prevState,
                tableData: typeof updaterOrValue === 'function'
                    ? updaterOrValue(prevState.tableData)
                    : updaterOrValue,
            }))
        }
    });


    const updateTableState = <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
    ) => {
        setTableState((prevState) => ({
            ...prevState,
            [key]: typeof value === 'function' ? (value as (prev: ITableState[K]) => ITableState[K])(prevState[key]) : value,
        }));
    };



    // Use Effect
    useEffect(() => {
        componentPropertiesRef.current = componentProperties
        rowNumRef.current = 0;
        loadDataRef.current = false;
        switch (viewMode) {
            case LYComponentViewMode.tree:
                setDisplayView((prevDisplayView) => ({
                    ...prevDisplayView,
                    tree: true,
                    list: false,
                    table: viewGrid,
                }));
                break;
            case LYComponentViewMode.list:
                setDisplayView((prevDisplayView) => ({
                    ...prevDisplayView,
                    tree: false,
                    list: true,
                    table: false,
                }));
                break;
            default:
                setDisplayView((prevDisplayView) => ({
                    ...prevDisplayView,
                    tree: false,
                    list: false,
                    table: true,
                }));
                if (viewMode === LYComponentViewMode.grid)
                    table.options.onTableEditChange?.((oldTableEdit) => {
                        const newEditMode = !oldTableEdit.editMode;
                        return {
                            ...oldTableEdit,
                            editMode: true,
                        };
                    });
                break
        }
        setSendAction({ event: LYComponentEvent.none, keys: null, message: "" });
        setOpenFilters(false);
        fetchData(false);
    }, [componentProperties.id]);


    useEffect(() => {
        updateTableState('filteredRows', tableState.tableData.rows);
        updateTableState('tableData', tableState.tableData);
    }, [tableState.tableData])

    useEffect(() => {
        if (isMobile && displayView.tree) {
            setDisplayView((prevDisplayView) => ({
                ...prevDisplayView,
                list: false,
                table: false,
            }));
        }
        else
            if (isMobile && (displayView.list || displayView.table)) {
                setDisplayView((prevDisplayView) => ({
                    ...prevDisplayView,
                    list: true,
                    table: false,
                }));
            }
            else {
                setDisplayView((prevDisplayView) => ({
                    ...prevDisplayView,
                    list: (viewMode === LYComponentViewMode.list) ? true : false,
                    table: (viewGrid === true || viewGrid === undefined) ? true : false,
                    tree: (viewMode === LYComponentViewMode.tree) ? true : false
                }));
            }
    }, [isMobile])


    useEffect(() => {
        if (!isLoading && tableState.tableData.columns.length > 0) {
            // Create a shallow copy of the columns array
            const updatedColumns = tableState.tableData.columns.slice();

            // Copy the first column object and update it based on gridMode
            updatedColumns[0] = tableState.tableEdit.editMode
                ? { ...ActionsForGrid }
                : readonly || tablePropertiesRef.current[ETableHeader.formID] === null || tablePropertiesRef.current[ETableHeader.formID] === undefined
                    ? { ...ActionsNone }
                    : { ...ActionsForTable };

            // Update the columns state
            updateTableState('tableData', {
                ...tableState.tableData,
                columns: updatedColumns
            });
            table.deselectAllRows();
        }

    }, [tableState.tableEdit.editMode]);


    /* Open dialog to edit a line */
    const handleOpenDialog = useCallback(async (mode: LYComponentMode, row?: ITableRow) => {
        const params = {
            mode,
            row,
            tableState,
            componentPropertiesRef,
            tablePropertiesRef,
            onSelectRow,
            setErrorState,
            dialogPropertiesRef: dialogProperties,
            apiRef,
            setOpenDialog,
            table
        }
        openDialogHandler(params);
    }, [
        openDialogHandler,
        displayView,
        componentPropertiesRef,
        tablePropertiesRef,
        onSelectRow,
        setErrorState,
        dialogProperties,
        apiRef,
        setOpenDialog,
        table,
        tableState
    ]);


    const handleDelete = useCallback(() => { setOpenDeleteDialog(true); }, [setOpenDeleteDialog]);
    const ActionsForTable = useMemo(() => getActionsForTable({ handleOpenDialog, handleDelete }), [handleOpenDialog, handleDelete]);
    const ActionsNone = useMemo(() => ({
        accessorKey: 'none',
        header: 'Actions',
        field: 'actions',
        value: null,
        type: '',
        operator: "",
        defined: false,
        template: '',
        rules: '',
        disabled: false,
        required: false,
        rulesValues: '',
        default: '',
        target: 'actions',
        editable: false,
        visible: true,
        filter: false,
        dynamic_params: '',
        fixed_params: '',
        pool_params: '',
        output_params: '',
        key: false,
        col_cdn_id: 0,
    }), []);
    const ActionsForGrid = useMemo(() => { return getActionsForGrid({ table }) }, [table]);

    const fetchData = useCallback((restoreState: boolean) => {
        const params: FetchDataParams = {
            componentProperties: componentPropertiesRef.current,
            apiRef,
            displayMode: displayMode,
            setIsLoading,
            tablePropertiesRef: tablePropertiesRef,
            appsProperties,
            userProperties,
            modulesProperties: modulesProperties,
            readonly: readonly,
            updateTableState: updateTableState,
            setOpenFilters: setOpenFilters,
            tableState,
            ActionsForGrid,
            ActionsForTable,
            ActionsNone,
            columnsFilter,
            rowsFilterRef,
            cancelQueryStatus: cancelQueryStatusRef,
            loadDataRef,
            getFilters,
            setFilters,
            getColumnsVisibility,
            dialogComponent: dialogProperties,
            restoreState: restoreState,
            setRowCount
        };
        fetchDataHandler(params);
    }, [componentPropertiesRef,
        apiRef,
        displayMode,
        setIsLoading,
        tablePropertiesRef,
        appsProperties,
        userProperties,
        modulesProperties,
        readonly,
        updateTableState,
        setOpenFilters,
        tableState,
        ActionsForGrid,
        ActionsForTable,
        ActionsNone,
        columnsFilter,
        rowsFilterRef,
        cancelQueryStatusRef,
        loadDataRef,
        getFilters,
        setFilters,
        getColumnsVisibility,
        dialogProperties,
        setRowCount]);

    const handleContextMenu = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();

        let clientX: number, clientY: number;

        // Check if it's a MouseEvent or TouchEvent
        if ('touches' in event) {
            // TouchEvent: get the first touch point
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // MouseEvent: use clientX and clientY directly
            clientX = event.clientX;
            clientY = event.clientY;
        }

        setContextMenuState((prevState) => ({
            open: !prevState.open,
            anchorEl: !prevState.open
                ? { left: clientX - 2, top: clientY - 4 }
                : undefined
        }));
    }, [setContextMenuState]);

    const handleContextMenuClose = useCallback(() => {
        setContextMenuState({
            open: false,
            anchorEl: undefined,
        });
    }, [setContextMenuState]);


    const handleMenuItemClick = useCallback((menuID: number) => {
        const params = {
            apiRef,
            displayView,
            componentProperties: componentPropertiesRef.current,
            tableProperties: tablePropertiesRef.current,
            filters: rowsFilterRef.current,
            dataColumns: tableState.tableData.columns,
            columns: tableState.tableData.columns,
            table,
            menuID
        }

        dialogProperties.current = getMenuItemComponent(params);
        if (dialogProperties.current.type === LYComponentType.FormsDialog)
            setOpenDialog(true);
        else
            setOpenTable(true);

        handleContextMenuClose();
    }, [apiRef, displayView, componentPropertiesRef, tablePropertiesRef, rowsFilterRef, tableState.tableData.columns, table, handleContextMenuClose]);

    const handleCloseTableDialog = useCallback(() => { setOpenTable(false) }, [setOpenTable]);
    const handleCloseImportDialog = useCallback(() => { setOpenImport(false) }, [setOpenImport]);
    const handleCancelQuery = useCallback(() => {
        cancelQueryStatusRef.current = true
    }, [cancelQueryStatusRef]);


    const handleRefresh = useCallback(() => {
        loadDataRef.current = true;
        table.deselectAllRows();
        setOpenFilters(false);
        fetchData(true);
    }, [fetchData, setOpenFilters]);


    type MenuItemHandler = () => void

    const gridDefaultMenus = useMemo(() => [
        { text: t("button.dialogsMode.add"), icon: LYAddIcon, handler: () => handleOpenDialog(LYComponentMode.add) },
        { text: t("button.dialogsMode.edit"), icon: LYEditIcon, handler: () => handleOpenDialog(LYComponentMode.edit) },
        { text: t("button.dialogsMode.copy"), icon: LYCopyIcon, handler: () => handleOpenDialog(LYComponentMode.copy) },
        { text: t("button.dialogsMode.delete"), icon: LYDeleteIcon, handler: () => handleDelete() },
    ], [t, handleOpenDialog, handleDelete]);

    const handleDefaultMenuItemClick = useCallback((handler: MenuItemHandler) => {
        handler();
        handleContextMenuClose();
    }, [handleContextMenuClose]);

    const handleOpenFilters = useCallback(() => {
        setOpenFilters(true);
    }, [setOpenFilters])

    const handleCancelFilters = useCallback(() => {
        setOpenFilters(false);
    }, [setOpenFilters])

    const handleApplyFilters = useCallback(() => {
        loadDataRef.current = true;
        setOpenFilters(false);
        fetchData(false);
    }, [loadDataRef, setOpenFilters, fetchData])


    const onEditDialogClose = useCallback((action: IDialogAction) => {
        setSendAction({ event: LYComponentEvent.none, keys: null, message: "" });
        switch (action.event) {
            case LYComponentEvent.Cancel:
                handleRefresh();
                setOpenDialog(false);
                break;
        }
    }, [handleRefresh, setOpenDialog, setSendAction]);

    const onTableDialogClose = useCallback((action: ISelectedRow) => {
        switch (action.event) {
            case LYComponentEvent.Cancel:
                handleRefresh();
                setOpenTable(false);
                break;
        }
    }, [handleRefresh, setOpenTable]);


    // Memoized handleCellMouseDown function
    const handleCellMouseDown = useCallback(
        (event: React.MouseEvent<Element>, row: ITableRow) => {
            const params = {
                displayView,
                event,
                rows: tableState.tableData.rows,
                apiRef,
                displayMode,
                row,
                table: table
            }
            cellMouseDownHandler(params)
            switch (event.button) {
                case 2:
                    handleContextMenu(event);
                    break
            }
        },
        [displayView, tableState.tableData.rows, apiRef, displayMode, handleContextMenu, table]
    );


    // Memoized handleCellMouseDown function
    const handleSelect = useCallback(
        (
            event: React.MouseEvent<Element> | ChangeEvent<HTMLInputElement>,
            row: ITableRow
        ) => {
            const isCheckboxEvent = event.type === "change"; // Check if triggered by checkbox
            const isChecked = isCheckboxEvent
                ? (event.target as HTMLInputElement).checked // Get checked state from checkbox
                : false;

            const params = {
                displayView,
                event,
                rows: tableState.tableData.rows,
                apiRef,
                displayMode,
                row,
                table,
                isChecked, // Pass checked state
            };

            selectHandler(params);

            // Handle right-click context menu
            if (!isCheckboxEvent && (event as React.MouseEvent).button === 2) {
                handleContextMenu(event as React.MouseEvent);
            }
        },
        [displayView, tableState.tableData.rows, apiRef, displayMode, handleContextMenu, table, selectHandler]
    );


    // Memoized handleCellMouseDown function
    const handleDoubleClick = useCallback(
        (event: React.MouseEvent<Element>, row: ITableRow) => {
            const params = {
                displayView,
                event,
                rows: tableState.tableData.rows,
                apiRef,
                displayMode,
                row,
                table: table,
                handleOpenDialog: (tablePropertiesRef.current[ETableHeader.editable] || componentProperties.componentMode === LYComponentMode.search)
                    ? () => handleOpenDialog(LYComponentMode.edit, row)
                    : undefined
            }
            cellDoubleClickHandler(params)
        },
        [displayView, tableState.tableData.rows, apiRef, displayMode, handleContextMenu, handleOpenDialog, tablePropertiesRef, componentProperties]
    );

    // Memoized handleTouchStart function
    const handleTouchStart = useCallback(
        (event: React.TouchEvent<Element>, row: ITableRow) => {
            const params = {
                displayView,
                event,
                rows: tableState.tableData.rows,
                apiRef,
                displayMode,
                row,
                table: table
            }

            touchStartHandler(params),
                // Long press on mobile
                longPressTimeout.current = window.setTimeout(() => {
                    if (!readonly)
                        handleContextMenu(event);
                }, 800); // 800ms for long press
        },
        [displayView, tableState.tableData.rows, apiRef, displayMode, handleContextMenu]
    );

    // Memoized handleTouchEnd function
    const handleTouchEnd = useCallback(
        () => touchEndHandler(longPressTimeout),
        [longPressTimeout]
    );

    const handleDiscard = useCallback(() => { setOpenSaveDialog(true) }, [setOpenSaveDialog]);
    const handleDiscardConfirm = useCallback(() => { setOpenSaveDialog(true) }, [setOpenSaveDialog]);
    const handleDiscardDecline = useCallback(() => { setOpenSaveDialog(false) }, [setOpenSaveDialog]);
    const handleCloseDelete = useCallback(() => { setOpenDeleteDialog(false) }, [setOpenDeleteDialog]);
    const handleCancelDelete = handleCloseDelete;
    const handleMessageClose = useCallback(() => { setErrorState({ open: false, message: "" }) }, [setErrorState]);
    const handleDiscardAccept = useCallback(() => { discardHandler(table, setOpenSaveDialog) }, [table, setOpenSaveDialog]);

    //  Memoized handleConfirmDelete function
    const handleConfirmDelete = useCallback(
        () => {
            const params = {
                setOpenDeleteDialog,
                table,
                tableProperties: tablePropertiesRef.current,
                columns: tableState.tableData.columns,
                userProperties,
                appsProperties,
                modulesProperties,
                setErrorState,
                tableState,
                setTableState,
                updateTableState
            }
            confirmDeleteHandler(params)
            fetchData(true)
        },
        [table, tablePropertiesRef, tableState, setTableState, userProperties, appsProperties, setErrorState, setOpenDeleteDialog, updateTableState, fetchData, modulesProperties]
    );


    //  Memoized handleConfirmDelete function
    const handleSave = useCallback(
        async () => {
            const params = {
                apiRef,
                table,
                tableState,
                setTableState,
                component: componentPropertiesRef.current,
                tableProperties: tablePropertiesRef.current,
                columns: tableState.tableData.columns,
                userProperties,
                appsProperties,
                modulesProperties,
                setErrorState,
                updateTableState
            }
            await saveChangesHandler(params)
        },
        [apiRef, table, tableState, setTableState, componentPropertiesRef, tablePropertiesRef, userProperties, appsProperties, setErrorState, modulesProperties]
    );

    //  Memoized handleConfirmDelete function
    const handleImport = useCallback(() => {
        setOpenImport(true)
    },
        [setOpenImport]
    );


    return (
        <Fragment>
            <AlertMessage severity={errorState.severity} message={errorState.message} open={errorState.open} onClose={handleMessageClose} />
            <Stack_FormsTable>
                <ConfirmationDialog
                    open={openDeleteDialog}
                    title={t("tables.confirm")}
                    content={t("tables.delete")}
                    onClose={handleCloseDelete}
                    onAccept={handleConfirmDelete}
                    onDecline={handleCancelDelete}
                />
                <ConfirmationDialog
                    open={openSaveDialog}
                    title={t("dialogs.dataNotSaved")}
                    content={t('dialogs.confirmCloseDialog')}
                    onClose={handleDiscardConfirm}
                    onAccept={handleDiscardAccept}
                    onDecline={handleDiscardDecline}
                />
                <TableFilters
                    componentProperties={componentProperties}
                    open={openFilters}
                    tableProperties={tablePropertiesRef.current}
                    tableColumns={tableState.tableData.columns}
                    columnsFilter={columnsFilter}
                    setColumnsFilters={setColumnsFilter}
                    handleCancel={handleCancelFilters}
                    handleApply={handleApplyFilters}
                />
                {openDialog &&
                    <DialogWidget
                        open={openDialog}
                        componentProperties={dialogProperties.current}
                        onClose={onEditDialogClose}
                        sendAction={sendAction}
                    />
                }
                <TableDialog
                    open={openTable}
                    componentProperties={dialogProperties.current}
                    onClose={handleCloseTableDialog}
                    onSelectRow={onTableDialogClose}
                />
                <TableImport
                    open={openImport}
                    onClose={handleCloseImportDialog}
                    table={table}
                    tableState={tableState}
                    updateTableState={updateTableState}
                    componentProperties={dialogProperties.current}
                />
                <TableUpload
                    open={openUpload}
                    setOpen={setOpenUpload}
                    componentProperties={uploadComponent.current}
                    handleRefresh={handleRefresh}
                />
                <TableRender
                    isLoading={isLoading}
                    displayMode={displayMode}
                    displayView={displayView}
                    setDisplayView={setDisplayView}
                    fetchData={fetchData}
                    handleOpenFilters={handleOpenFilters}
                    handleRefresh={handleRefresh}
                    filtersDP={columnsFilter}
                    currentFilters={rowsFilterRef.current}
                    tableProperties={tablePropertiesRef.current}
                    componentProperties={componentPropertiesRef.current}
                    readonly={readonly}
                    onOpenDialog={handleOpenDialog}
                    onDelete={handleDelete}
                    apiRef={apiRef}
                    table={table}
                    tableState={tableState}
                    updateTableState={updateTableState}
                    onSelect={handleSelect}
                    onMouseDown={handleCellMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onDoubleClick={handleDoubleClick}
                    onCancelQuery={handleCancelQuery}
                    onSave={handleSave}
                    onDiscard={handleDiscard}
                    onImport={handleImport}
                    uploadComponent={uploadComponent}
                    setOpenUpload={setOpenUpload}
                    rowCount={rowCount}
                />
                {contextMenuState.open &&
                    <TableContextMenus
                        contextMenuState={contextMenuState}
                        componentProperties={componentPropertiesRef.current}
                        tableProperties={tablePropertiesRef.current}
                        defaultMenus={gridDefaultMenus}
                        readonly={readonly}
                        tableState={tableState}
                        onContextMenuClose={handleContextMenuClose}
                        onMenuItemClick={handleMenuItemClick}
                        onMenuDefaultItemClick={handleDefaultMenuItemClick}
                    />
                }
            </Stack_FormsTable>
        </Fragment>
    )
}

