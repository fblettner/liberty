/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from 'react-dropzone';
import { t } from "i18next";
import { functionalUpdate, getCoreRowModel, getSortedRowModel, SortingState, useReactTable, getGroupedRowModel, getExpandedRowModel, getFilteredRowModel, ColumnFiltersState, CellContext } from "@tanstack/react-table";

// Custom Import
import { getAppsProperties, getModules, getUserProperties, onSnackMessageChanged } from "@ly_features/global";
import { Button } from "@ly_components/common/Button";
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { ToolsQuery } from "@ly_services/lyQuery";
import { lyGetTableProperties } from "@ly_services/lyTables";
import { EApplications, IAppsProps } from "@ly_types/lyApplications";
import { ComponentProperties, LYComponentEvent } from "@ly_types/lyComponents";
import { EDictionaryType, EDictionaryRules } from "@ly_types/lyDictionary";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { ETableHeader, IColumnsProperties, ITableRow, TablesGridHardCoded } from "@ly_types/lyTables";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { EStandardColor, ESeverity, IContentValue, IErrorState, IRestData } from "@ly_utils/commonUtils";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { LoadingIndicator } from "@ly_components/common/LoadingIndicator";
import { ClipboardFeature } from "@ly_components/forms/FormsTable/features/ClipBoard";
import { DensityFeature } from "@ly_components/forms/FormsTable/features/Density";
import { RowSelectionFeature } from "@ly_components/forms/FormsTable/features/RowSelection";
import { TableEditFeature } from "@ly_components/forms/FormsTable/features/TableEdit";
import { GlobalFilterFeature } from "@ly_components/forms/FormsTable/features/GlobalFilter";
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { TableGrid, TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import { importExcelFiles } from "@ly_components/forms/FormsTable/utils/importUtils";
import { LYCancelIcon, LYCheckIcon, LYCloseIcon, LYCloudUploadIcon, LYReactIcon, LYSaveIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Typography } from "@ly_components/common/Typography";
import { Div_DialogToolbarButtons } from "@ly_components/styles/Div";
import { Paper_Dialogs, Paper_DialogToolbar, Paper_UploadFile } from "@ly_components/styles/Paper";
import { Stack_Dialogs, Stack_Table } from "@ly_components/styles/Stack";

type Props = Readonly<{
    componentProperties: ComponentProperties;
    onClose?: (action: { event: LYComponentEvent }) => void;
}>;

export function FormsUpload(props: Props) {
    const dispatch = useDispatch()
    const appsProperties: IAppsProps = useSelector(getAppsProperties);
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);

    const component = useRef<ComponentProperties>(props.componentProperties);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });
    const importColumns = useRef([]);
    const tableProperties = useRef();
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
            table_id: component.current.id,
            rows: [],
            columns: [],
            columnsVisibility: {}
        },
        filteredRows: [],
        globalFilter: ""
    });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        [],
    );
    const apiRef = useRef<TableGridRef>();
    const rowsFilterRef = useRef<IFiltersProperties[]>([]);
    const [rowCount, setRowCount] = useState(0);

    // Use Effect
    useEffect(() => {
        setIsLoading(true);
        const init = async () => {
            component.current = props.componentProperties
            setErrorState({ open: false, message: "" })
            await initDialog();
            setIsLoading(false);
        }
        init();

    }, [props.componentProperties.id]);

    const initDialog = async () => {
        setIsLoading(true);

        const tables = await lyGetTableProperties({
            appsProperties: appsProperties,
            userProperties: userProperties,
            [ETableHeader.id]: component.current.id,
            getAllColumns: true,
            modulesProperties: modulesProperties
        });
        importColumns.current = tables.columns
        tableProperties.current = tables.tableProperties;

        if (tables.status === ResultStatus.error) {
            setErrorState({ open: true, message: tables.items[0].message, severity:  ESeverity.error });
        } else {
            let columnsProperties: IColumnsProperties[] = [];

            tables.columns.forEach((item: IColumnsProperties) => {
                switch (item.type) {
                    case EDictionaryType.date:
                        columnsProperties.push({
                            accessorKey: (item.target === null) ? item.field : item.target,
                            header: item.header,
                            type: "date",
                            field: (item.target === null) ? item.field : item.target,
                            target: item.target,
                            visible: item.visible,
                            filter: item.filter,
                            operator: item.operator,
                            rules: item.rules,
                            rulesValues: item.rulesValues,
                            default: item.default,
                            editable: item.editable,
                            disabled: item.disabled,
                            required: item.required,
                            dynamic_params: item.dynamic_params,
                            fixed_params: item.fixed_params,
                            pool_params: item.pool_params,
                            output_params: item.output_params,
                            key: item.key,
                            col_cdn_id: item.col_cdn_id,
                            cell: (cell: CellContext<ITableRow, IContentValue>) => {
                                const value = new Date(cell.getValue() as string);
                                return value.toLocaleDateString(); // Format date
                            },
                        })
                        break;
                    case EDictionaryType.boolean:
                        columnsProperties.push({
                            accessorKey: (item.target === null) ? item.field : item.target,
                            header: item.header,
                            type: "boolean",
                            field: (item.target === null) ? item.field : item.target,
                            target: item.target,
                            visible: item.visible,
                            filter: item.filter,
                            operator: item.operator,
                            rules: item.rules,
                            rulesValues: item.rulesValues,
                            default: item.default,
                            editable: item.editable,
                            disabled: item.disabled,
                            required: item.required,
                            dynamic_params: item.dynamic_params,
                            fixed_params: item.fixed_params,
                            pool_params: item.pool_params,
                            output_params: item.output_params,
                            key: item.key,
                            col_cdn_id: item.col_cdn_id,
                            cell: (cell: CellContext<ITableRow, IContentValue>) => {
                                const isActive = (item.rulesValues.split(";").includes(cell.getValue() as string)) ? true : false;
                                return isActive ? <LYReactIcon icon={LYCheckIcon} color={EStandardColor.primary}  size={LYIconSize.small}/> : <LYReactIcon icon={LYCloseIcon} color={EStandardColor.secondary} size={LYIconSize.small}/>;
                            },
                        })
                        break;
                    default:
                        let itemDefault = {
                            accessorKey: (item.target === null) ? item.field : item.target,
                            header: item.header,
                            type: item.type,
                            field: (item.target === null) ? item.field : item.target,
                            target: item.target,
                            visible: item.visible,
                            filter: item.filter,
                            operator: item.operator,
                            rules: item.rules,
                            rulesValues: item.rulesValues,
                            default: item.default,
                            editable: item.editable,
                            disabled: item.disabled,
                            required: item.required,
                            dynamic_params: item.dynamic_params,
                            fixed_params: item.fixed_params,
                            pool_params: item.pool_params,
                            output_params: item.output_params,
                            key: item.key,
                            col_cdn_id: item.col_cdn_id,

                        }
                        columnsProperties.push(itemDefault);
                }
            })

            // Update the columns state
            updateTableState('tableData', {
                ...tableState.tableData,
                columns: columnsProperties
            });
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Handle dropped files here, e.g., upload or process them
        _fileListener(acceptedFiles);
    }, [tableState.tableData.columns]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    });

    const _fileListener = async (files: File[]) => {
        const params = {
            files: files,
            appsProperties: appsProperties,
            userProperties: userProperties,
            modulesProperties: modulesProperties,
            importColumns: importColumns.current,
            setErrorState: setErrorState,
            setIsLoading: setIsLoading,
            updateTableState: updateTableState,
            tableState: tableState,
            component: component.current
        }
        setIsLoading(true)
        setErrorState({ open: false, message: "" })
        const importData = await importExcelFiles(params);
        // Update the rows state
        setRowCount(importData.length);
        updateTableState('filteredRows', importData);
        updateTableState('tableData', {
            ...tableState.tableData,
            rows: importData
        });

        setIsLoading(false);
    }

    const handleCloseDialog = () => {
        if (props.onClose)
            props.onClose({ event: LYComponentEvent.Cancel})
    }

    const handleSaveDialog = async () => {
        let result = await saveDataAPI()
        if (result === ResultStatus.success) {
            dispatch(onSnackMessageChanged({
                message: t("files.success"),
                severity: ESeverity.success,
                open: true,
                id: "upload-table",
            }));
            if (props.onClose)
                props.onClose({ event: LYComponentEvent.Cancel})
        }
    }

    const saveDataAPI = async () => {
        setIsLoading(true)
        setErrorState({ open: false, message: "" })
        let errorMessage: IErrorState[] = [];
        let rowNumber = 1;

        // If audit is enabled, save entire table before uploading file
        if (component.current.tableProperties?.[ETableHeader.audit]) {
            let result;
            result = await ToolsQuery.audit(
                component.current.tableProperties?.[ETableHeader.dbName],
                userProperties[EUsers.id],
                {
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: component.current.tableProperties?.[ETableHeader.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                },
                {}
            )

            if (result.status === ResultStatus.error) {
                setErrorState({ open: true, message: result.items[0].message, severity:  ESeverity.error })
                setIsLoading(false)
                return ResultStatus.error
            } else {
                setErrorState({ open: true, message: t("files.success"), severity: ESeverity.success })
                setIsLoading(false)
            }
        }

        await Promise.all(tableState.tableData.rows.map(async (item) => {
            let restData: IRestData = {}
            importColumns.current.filter((columns: IColumnsProperties) => columns.target !== null).forEach((column: IColumnsProperties) => {
                switch (column.rules) {
                    case EDictionaryRules.boolean:
                        restData[column.target] = item[(column.target === null) ? column.field : column.target] ?? "N";
                        break;
                    case EDictionaryRules.login:
                        restData[column.target] = userProperties[EUsers.id];
                        break;
                    case EDictionaryRules.sysdate:
                    case EDictionaryRules.current_date:
                        if (column.type === EDictionaryType.jdedate)
                            restData[column.target] = ToolsDictionary.DateToJde(new Date().toISOString());
                        else
                            restData[column.target] = new Date().toISOString();
                        break;
                    case EDictionaryRules.default:
                        restData[column.target] = (item[(column.target === null) ? column.field : column.target] !== null)
                            ? item[(column.target === null) ? column.field : column.target]
                            : column.rulesValues;
                        break;
                    default:
                        switch (column.type) {
                            case EDictionaryType.jdedate:
                                let value = item[(column.target === null) ? column.field : column.target];
                                const jdeDate = value ? ToolsDictionary.DateToJde(value as string) : 0;
                                restData[column.target] = jdeDate
                                break;
                            default:
                                restData[column.target] = item[(column.target === null) ? column.field : column.target];
                        }
                }
            })
            let result;
            result = await ToolsQuery.put({
                source: QuerySource.Query,
                framework_pool: appsProperties[EApplications.pool],
                query: component.current.tableProperties![ETableHeader.queryID],
                sessionMode: appsProperties[EApplications.session],
                override_target_pool: component.current.overrideQueryPool,
                modulesProperties: modulesProperties,
                jwt_token: appsProperties[EApplications.jwt_token]
            },
                JSON.stringify(restData));
            if (result.status === ResultStatus.error)
                errorMessage.push(
                    {
                        open: true,
                        severity: ESeverity.error,
                        message: "Row: " + rowNumber + " | " + result.items[0].message,

                    });
            rowNumber++;
        }));

        setIsLoading(false)
        if (errorMessage.length > 0) {
            setErrorState(errorMessage[0])
            return ResultStatus.error
        }
        else {
            setErrorState({ open: true, message: t("files.success"), severity: ESeverity.success })
            return ResultStatus.success
        }

    }

    const table: LYTableInstance<ITableRow> = useReactTable({
        _features: [DensityFeature, RowSelectionFeature, TableEditFeature, ClipboardFeature, GlobalFilterFeature],
        data: tableState.filteredRows,
        columns: tableState.tableData.columns,
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            strictEquals: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId);
                return cellValue === filterValue;;
            }
        },
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

    const updateTableState = <K extends keyof ITableState>(key: K, value: ITableState[K]) => {
        setTableState((prevState) => ({
            ...prevState,
            [key]: value, // Dynamically set the state key with the new value
        }));
    };
    const handleMessageClose = useCallback(() => { }, [setErrorState]);

    // Memoized handleCellMouseDown function
    const handleSelect = () => { };
    const handleCellMouseDown = () => { };
    const handleTouchStart = () => { };
    const handleTouchEnd = () => { };
    const handleDoubleClick = () => { };
    const handleCancelQuery = () => { };
    const handleSave = () => { };
    const handleDiscard = () => { };

    if (isLoading) return <LoadingIndicator />
    return (
        <Stack_Dialogs>
            <Paper_Dialogs elevation={0}>
                <AlertMessage severity={errorState.severity} message={errorState.message} open={errorState.open} onClose={handleMessageClose} />

                {!component.current.isChildren &&
                    <Paper_DialogToolbar elevation={0}>
                        <Div_DialogToolbarButtons>
                            <Button disabled={false} variant="outlined" onClick={handleCloseDialog} startIcon={LYCancelIcon}>
                                {t('button.cancel')}
                            </Button>
                            <Button disabled={errorState.open} variant="outlined" onClick={handleSaveDialog} startIcon={LYSaveIcon}>
                                {t('button.save')}
                            </Button>
                        </Div_DialogToolbarButtons>
                    </Paper_DialogToolbar>
                }
                <Paper_UploadFile
                    elevation={0}
                    {...getRootProps()}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <Typography variant="subtitle1">Drop the file here</Typography>
                    ) : (
                        <Typography variant="subtitle1">Drag and drop a file here or click to select</Typography>
                    )}
                    <LYReactIcon icon={LYCloudUploadIcon} size={LYIconSize.extra_large} /> 
                </Paper_UploadFile>
                <Stack_Table>
                    <TableGrid
                        ref={apiRef}
                        isLoading={isLoading}
                        table={table}
                        tableState={tableState}
                        updateTableState={updateTableState}
                        filters={rowsFilterRef.current}
                        onSelect={handleSelect}
                        onMouseDown={handleCellMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onDoubleClick={handleDoubleClick}
                        onCancelQuery={handleCancelQuery}
                        onSave={handleSave}
                        onDiscard={handleDiscard}
                        onImport={() => { }}
                        rowCount={rowCount}
                    />
                </Stack_Table>
            </Paper_Dialogs>
        </Stack_Dialogs>

    );
}
