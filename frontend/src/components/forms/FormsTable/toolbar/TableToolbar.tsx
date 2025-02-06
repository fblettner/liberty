/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Custom Import
import { ComponentProperties, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { EUserReadonly, EUsers, IUsersProps } from "@ly_types/lyUsers";
import { getAppsProperties, getUserProperties, onSnackMessageChanged } from "@ly_features/global";
import { ToolbarExport } from "@ly_components/forms/FormsTable/toolbar/ToolbarExport";
import { TableHelp } from "@ly_components/forms/FormsTable/dialogs/TableHelp";
import { ITableRow, ITableHeader, ETableHeader } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { LYAccountTreeIcon, LYAddIcon, LYContentCopyIcon, LYDeleteIcon, LYDownloadIcon, LYEditIcon, LYEditRoadIcon, LYFilterAltIcon, LYInfoOutlinedIcon, LYLinkIcon, LYListIcon, LYReactIcon, LYRefreshIcon, LYTableViewIcon, LYUploadIcon } from "@ly_styles/icons";
import { Divider } from "@ly_components/common/Divider";
import { Paper_TableToolbar } from "@ly_components/styles/Paper";
import { useDeviceDetection, useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { IconButton } from "@ly_components/common/IconButton";
import { DialogExport } from "@ly_components/common/DialogExport";
import { PDF } from "@ly_utils/pdfUtils";
import { EExportType, ESeverity, IExportOptions } from "@ly_utils/commonUtils";
import { Excel } from "@ly_utils/JSExcelUtils";
import { IAppsProps } from "@ly_types/lyApplications";
import { AppDispatch } from "@ly_app/store";

export interface ITableToolbar {
    displayView: {
        tree: boolean;
        list: boolean;
        table: boolean;
    };
    setDisplayView: (value: (prevState: { tree: boolean; list: boolean; table: boolean; grid: boolean }) => { tree: boolean; list: boolean; table: boolean; grid: boolean }) => void;
    table: LYTableInstance<ITableRow>;
    handleOpenFilters: () => void;
    handleRefresh: () => void;
    filtersDP: CColumnsFilter;
    currentFilters: IFiltersProperties[];
    tableProperties: ITableHeader;
    component: ComponentProperties;
    readonly: boolean;
    handleOpenDialog: (mode: LYComponentMode, row?: ITableRow) => void;
    handleDelete: () => void;
    uploadComponent: React.MutableRefObject<ComponentProperties>;
    setOpenUpload: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TableToolbar = ({
    displayView,
    setDisplayView,
    table,
    handleOpenFilters,
    handleRefresh,
    filtersDP,
    currentFilters,
    tableProperties,
    component,
    readonly,
    handleOpenDialog,
    handleDelete,
    uploadComponent,
    setOpenUpload

}: ITableToolbar) => {
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const isMobile = useDeviceDetection();
    const [openExport, setOpenExport] = useState<{
        anchorEl: HTMLElement | null
        open: boolean;
    }>({
        anchorEl: null,
        open: false,
    });
    const [openHelp, setOpenHelp] = useState(false);
    const hasUnsavedRows = table.getState().tableEdit.hasUnsavedRows;
    const [isEditMode, setIsEditMode] = useState(false);


    const displayEditToolbar = useMemo(() => {
        return tableProperties[ETableHeader.editable]
            && userProperties[EUsers.readonly] !== EUserReadonly.true
            && component.componentMode !== LYComponentMode.search
            && !readonly
            && tableProperties[ETableHeader.formID]
            && !isEditMode;
    }, [tableProperties, userProperties, component, readonly, isEditMode]);

    const displayGridToolbar = useMemo(() => {
        return tableProperties[ETableHeader.editable] && userProperties[EUsers.readonly] !== EUserReadonly.true && component.componentMode !== LYComponentMode.search && !isMobile && !isSmallScreen;
    }, [tableProperties[ETableHeader.editable], userProperties[EUsers.readonly], component.componentMode]);

    const displayTableToolbar = useMemo(() => {
        return displayView.tree && !isMobile && !isSmallScreen && !isEditMode;
    }, [displayView.tree, isMobile, isSmallScreen, isEditMode]);

    const displayListToolbar = useMemo(() => {
        return !displayView.tree && !isEditMode && !isMobile && !isSmallScreen ;
    }, [displayView.tree, isMobile, isEditMode, isSmallScreen]);

    const displayTreeToolbar = useMemo(() => {
        return tableProperties[ETableHeader.treeID] !== null && !isEditMode && component.componentMode !== LYComponentMode.search ;
    }, [tableProperties[ETableHeader.treeID], component.componentMode, displayView.list, isEditMode]);

    const displayImportToolbar = useMemo(() => {
        return tableProperties[ETableHeader.uploadable] && userProperties[EUsers.readonly] !== EUserReadonly.true && !isEditMode;
    }, [tableProperties[ETableHeader.uploadable], userProperties[EUsers.readonly], isEditMode]);

    const displayExportToolbar = useMemo(() => {
        return displayView.table && !isEditMode;
    }, [displayView.table, isEditMode]);

    const displayRefreshToolbar = useMemo(() => {
        return !isEditMode;
    }, [isEditMode]);

    const displayFilterToolbar = useMemo(() => {
        return Object.keys(filtersDP.fields).length > 0;
    }, [filtersDP.fields]);


    const handleTreeView = useCallback(() => {
        setDisplayView((prevDisplayView) => ({
            ...prevDisplayView,
            tree: !prevDisplayView.tree,
            table: !isMobile && !isSmallScreen ? true : false,
            list: (isMobile || isSmallScreen) && prevDisplayView.tree ? true : false,
        }));

    }, [displayView.tree, isMobile, isSmallScreen, handleRefresh]);


    const handleListView = useCallback(() => {
        setDisplayView((prevDisplayView) => ({
            ...prevDisplayView,
            tree: false,
            list: !prevDisplayView.list,
            table: prevDisplayView.list,
        }));

    }, [displayView.list]);


    const handleTableView = useCallback(() => {
        setDisplayView((prevDisplayView) => ({
            ...prevDisplayView,
            table: !prevDisplayView.table,
        }));

    }, [displayView.table]);

    const handleGridMode = useCallback(() => {
        setIsEditMode((prev) => !prev);
        table.toggleEditMode();
        setDisplayView((prevDisplayView) => ({
            ...prevDisplayView,
            list: false,
            table: true,
            tree: false,
        }));

    }, [table, setDisplayView, setIsEditMode]);

    const handleExport = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setOpenExport({
            anchorEl: event.currentTarget,
            open: true
        });
    }, []);


    const handleImport = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        /* Save current component settings into previous component */
        let currentComponent: ComponentProperties = {
            id: component.id,
            type: component.type,
            label: component.label,
            filters: component.filters,
            previous: component.previous,
            componentMode: component.componentMode,
            showPreviousButton: component.showPreviousButton,
            isChildren: false,
            overrideQueryPool: component.overrideQueryPool
        };

        if (component.previous !== undefined) {
            if (component.previous.type === LYComponentType.FormsDialog) {
                currentComponent = component.previous;
            }
        }

        uploadComponent.current = {
            id: tableProperties[ETableHeader.id],
            type: LYComponentType.FormsUpload,
            label: tableProperties[ETableHeader.formLabel],
            filters: component.filters,
            previous: currentComponent,
            componentMode: LYComponentMode.import,
            tableProperties: tableProperties,
            showPreviousButton: false,
            isChildren: false,
            overrideQueryPool: component.overrideQueryPool
        };
        setOpenUpload(true);
    }, [component, tableProperties, displayView.table, setOpenUpload, uploadComponent]);


    const handleOpenHelp = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setOpenHelp(true)
    }, [setOpenHelp]);

    const onExportClose = () => {
        console.log("close")
        setOpenDialog(false);
        setOpenExport({
            anchorEl: null,
            open: false
        });
    }

    const onExportAccept = () => {
        switch (exportType) {
            case EExportType.excel:
                exportExcel();
                break;
            case EExportType.pdf:
                exportToPDF();
                break;
            case EExportType.csv:
                exportToCSV();
                break;
        }
        setOpenDialog(false);
        setOpenExport({
            anchorEl: null,
            open: false
        });

    }

    const onExportDecline = () => {
        setOpenDialog(false);
        setOpenExport({
            anchorEl: null,
            open: false
        });
    }

    const appsProperties: IAppsProps = useSelector(getAppsProperties)

    const [openDialog, setOpenDialog] = useState(false);
    const [exportOptions, setExportOptions] = useState<IExportOptions>({
        columns: "visibleColumns",
        header: "columnName",
        rows: "visibleRows",
    });
    const [exportType, setExportType] = useState<EExportType>(EExportType.excel);

    const dispatch = useDispatch<AppDispatch>()

    const handleCloseExport = useCallback(() => {
        setOpenExport({
            anchorEl: null,
            open: false
        });
    }, [setOpenExport]);

    const exportExcel = useCallback(async () => {
        // Dispatch the first snack message
        dispatch(onSnackMessageChanged({
            message: "Export of table has started",
            severity: ESeverity.warning,
            open: true,
            id: "export-table",
        }));


        let columnsOptions = (exportOptions.columns === "allColumns") ? table.getAllColumns() : table.getVisibleLeafColumns();

        let headerOptions = (exportOptions.header === "columnId") ? true : false;
        let rows: ITableRow[] = [];
        switch (exportOptions.rows) {
            case "selectedRows":
                const selectedRowIds = Object.keys(table.getState().rowSelection);

                rows = selectedRowIds.map(rowId => {
                    const row = table.getRow(rowId); // Get the row by ID
                    return row.original; // Return the original row data
                });
                break;
            case "allRows":
                rows = table.getRowModel().rows.map((row) => row.original);
                break;
            case "visibleRows":
                rows = table.getSortedRowModel().rows.map((row) => row.original);
                break;
        }

        // Give the browser time to render the snack message before starting the export
        setTimeout(() => {
            let excel = new Excel(
                rows,
                columnsOptions,
                tableProperties,
                headerOptions
            );
            excel.export();

            // Dispatch the success message after the export is done
            dispatch(onSnackMessageChanged({
                message: "Table successfully exported",
                severity: ESeverity.success,
                open: true,
                id: "export-table",
            }));

            setOpenExport({
                anchorEl: null,
                open: false,
            });
        }, 100); // Delay export by 100ms to allow snack message to render
    }, [table, tableProperties, setOpenExport, exportOptions]);

    const openExportDialog = (type: EExportType) => {
        setOpenExport({
            anchorEl: null,
            open: false,
        });
        setExportType(type);
        setOpenDialog(true);
    }

    const exportToCSV = () => {
        // Extract the table headers (column names)
        const headers = table.getFlatHeaders().map((header) => header.column.columnDef.field);

        // Extract the row data (the original data used in the table)
        let rows: ITableRow[] = [];
        switch (exportOptions.rows) {
            case "selectedRows":
                const selectedRowIds = Object.keys(table.getState().rowSelection);
                rows = selectedRowIds.map(rowId => {
                    const row = table.getRow(rowId); // Get the row by ID
                    return row.original as ITableRow; // Return the original row data
                });
                break;
            case "allRows":
                rows = table.getRowModel().rows.map((row) => row.original as ITableRow);
                break;
            case "visibleRows":
                rows = table.getSortedRowModel().rows.map((row) => row.original as ITableRow);
                break;
        }
        // Convert headers and rows to CSV format
        const csvContent = [
            headers.join(','), // Join the headers with commas
            ...rows.map(row => headers.map((header) => row[header] || '').join(',')) // For each row, join column values
        ].join('\n'); // Join all rows with newlines

        // Create a downloadable link for the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'table_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up after download
    }

    const exportToPDF = () => {

        // Use the correct selector to get the column visibility model
        let columnsOptions = (exportOptions.columns === "allColumns") ? true : false;
        const columnVisibilityModel = table.getState().columnVisibility;

        // Get all visible column definitions (including header)
        const columns = table
            .getAllLeafColumns()  // Get all leaf columns (visible and hidden)
            .filter((col) => {
                // If columnsOptions is true, include all columns; otherwise, respect the visibility model
                return columnsOptions || columnVisibilityModel[col.id] !== false;
            })
            .filter((col) => col.id !== 'actions')  // Exclude actions and selection columns
            .map((col) => ({
                title: (exportOptions.header === "columnId") ? col.id : col.columnDef.header,
                dataKey: col.id,
                type: col.columnDef.type || 'string'
            }));

        // Get all visible rows (filtered and sorted)
        let rows: ITableRow[] = [];
        switch (exportOptions.rows) {
            case "selectedRows":
                const selectedRowIds = Object.keys(table.getState().rowSelection);
                rows = selectedRowIds.map(rowId => {
                    const row = table.getRow(rowId); // Get the row by ID
                    return row.original; // Return the original row data
                }) as ITableRow[];
                break;
            case "allRows":
                rows = table.getRowModel().rows.map((row) => row.original) as ITableRow[];
                break;
            case "visibleRows":
                rows = table.getSortedRowModel().rows.map((row) => row.original) as ITableRow[];
                break;
        }

        let pdf = new PDF(
            rows,
            columns,
            false,
            appsProperties,
            tableProperties,
        );
        pdf.export();

    }



    return (
        <Paper_TableToolbar>
            {displayRefreshToolbar &&
                <IconButton
                    onClick={handleRefresh}
                    icon={LYRefreshIcon}
                />
            }
            {displayFilterToolbar &&
                <IconButton
                    onClick={handleOpenFilters}
                    disabled={hasUnsavedRows}
                    isSelected={currentFilters.length > 0}
                    icon={LYFilterAltIcon} color="inherit"
                />
            }
            {displayTreeToolbar &&
                <IconButton
                    onClick={handleTreeView}
                    isSelected={displayView.tree}
                    icon={LYAccountTreeIcon}
                    color="inherit"
                />
            }
            {displayListToolbar &&
                <IconButton
                    onClick={handleListView}
                    icon={displayView.list && !isMobile && !isSmallScreen ? LYTableViewIcon : LYListIcon}
                />
            }
            {displayTableToolbar &&
                <IconButton
                    onClick={handleTableView}
                    isSelected={displayView.table}
                    icon={LYTableViewIcon}
                />
            }
            {!isEditMode &&
                <Divider />
            }
            {displayGridToolbar &&
                !readonly && !isMobile && !isSmallScreen &&
                <Fragment>
                    <IconButton
                        onClick={handleGridMode}
                        disabled={hasUnsavedRows}
                        isSelected={isEditMode}
                        icon={LYEditRoadIcon}
                        color="inherit"
                    />
                    <Divider />
                </Fragment>
            }
            {displayEditToolbar &&
                <Fragment>
                    <IconButton
                        onClick={() => handleOpenDialog(LYComponentMode.add)}
                        icon={LYAddIcon}
                    />
                    <IconButton
                        onClick={() => handleOpenDialog(LYComponentMode.edit)}
                        icon={LYEditIcon}
                    />
                    <IconButton
                        onClick={() => handleOpenDialog(LYComponentMode.copy)}
                        icon={LYContentCopyIcon}
                    />
                    <IconButton
                        onClick={() => handleDelete()}
                        icon={LYDeleteIcon}
                    />
                    <Divider />
                </Fragment>
            }

            {displayExportToolbar &&
                <IconButton
                    onClick={handleExport}
                    icon={LYDownloadIcon}
                />
            }
            {displayImportToolbar &&
                <IconButton
                    onClick={handleImport}
                    icon={LYUploadIcon}
                />
            }
            <Divider />
            <IconButton
                onClick={handleOpenHelp}
                icon={LYInfoOutlinedIcon}
            />
            {openExport.open &&
                <ToolbarExport
                    openExport={openExport}
                    onClose={handleCloseExport}
                    openExportDialog={openExportDialog}
                />
            }
            <DialogExport
                open={openDialog}
                exportType={exportType}
                exportOptions={exportOptions}
                setExportOptions={setExportOptions}
                onClose={onExportClose}
                onAccept={onExportAccept}
                onDecline={onExportDecline}
            />
            <TableHelp
                open={openHelp}
                setOpen={setOpenHelp}
                tableProperties={tableProperties}
            />

        </Paper_TableToolbar>
    )
}
