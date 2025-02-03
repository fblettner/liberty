/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { t } from "i18next";
import { ChangeEvent, forwardRef, Fragment, Ref, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Column, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import dayjs from "dayjs";

// Custom Import
import {
    addBlankRowHandler,
    copyToClipboardHandler,
    pasteFromClipboardHandler
} from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { HeaderMenus } from "@ly_components/forms/FormsTable/tanstack/HeaderMenus";
import { TableToolbar } from "@ly_components/forms/FormsTable/tanstack/TableToolbar";
import { MemoizedTableBody } from "@ly_components/forms/FormsTable/tanstack/TableBody";
import { LYTableBody } from "@ly_components/forms/FormsTable/tanstack/TableBody";
import { handleAutoSizeColumnsHandler, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IFilterState } from "@ly_components/forms/FormsTable/utils/columnsUtils";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { InputEnum } from "@ly_components/input/InputEnum/InputEnum";
import { CustomNoResultsOverlay, LYChevronDownIcon, LYChevronUpIcon, LYMoreVertIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { IContentValue, OnChangeParams } from "@ly_utils/commonUtils";
import { ITableRow, TablesGridHardCoded } from "@ly_types/lyTables";
import { Div, Div_TableCell, Div_TableFab, Div_TableFooter, Div_TableFooterContent, Div_TableGrid, Div_TableGridContent, Div_TableHeaderButtons, Div_TableHeaderContent, Div_TableHeaderReisze, Div_TableProgress, Div_TableResultsOverlay, Div_TableToolbarButtons } from "@ly_components/styles/Div";
import { IconButton } from "@ly_components/common/IconButton";
import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from "@ly_components/common/Table";
import { TableCell_HeaderCheckbox, TableRow_Header } from "@ly_components/styles/Table";
import { Tooltip } from "@ly_components/common/Tooltip";
import { CircularProgress } from "@ly_components/common/CircularProgress";
import { Checkbox } from "@ly_components/common/Checkbox";
import { Input } from "@ly_components/common/Input";
import { DefaultZIndex } from "@ly_components/types/common";
import { ColumnHelp } from "@ly_components/forms/FormsTable/dialogs/ColumnHelp";
import { DatePicker } from "@ly_components/input/InputDate";
import { Select } from "@ly_components/common/Select";
import { Skeleton } from "@ly_components/common/Skeleton";

// Custom Import
interface ITableGrid {
    isLoading: boolean;
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void;
    filters: IFiltersProperties[];
    onSelect: (event: React.MouseEvent<Element> | ChangeEvent<HTMLInputElement>, row: ITableRow) => void;
    onMouseDown: (event: React.MouseEvent<Element>, row: ITableRow) => void;
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>, row: ITableRow) => void
    onTouchEnd: () => void;
    onDoubleClick: (event: React.MouseEvent<Element>, row: ITableRow) => void;
    onCancelQuery: () => void;
    onSave: () => void;
    onDiscard: () => void;
    onImport: () => void;
    rowCount: number;
}

export interface TableGridRef {
    autosizeColumns: () => void;
    exportState: () => string;
    restoreState: (savedState: string) => void;
    clearState: () => void;
    table: LYTableInstance<ITableRow>;
    scrollToRow: (rowID: string) => void;
    isEditMode: () => boolean;
}

export const TableGrid = forwardRef(function TableGrid(
    params: ITableGrid,
    ref: Ref<TableGridRef | undefined>
) {
    const {
        table,
        tableState,
        updateTableState,
        isLoading,
        filters,
        onSelect,
        onMouseDown,
        onTouchStart,
        onTouchEnd,
        onDoubleClick,
        onCancelQuery,
        onSave,
        onDiscard,
        onImport,
        rowCount
    } = params;

    const tableRef = useRef<HTMLDivElement>(null);
    const [openFilters, setOpenFilters] = useState<IFilterState>({ openFilters: false, selectedColumn: null });
    const [openColumns, setOpenColumns] = useState<boolean>(false);
    const [rowFilter, setRowFilter] = useState<boolean>(false);

    // Memoized handler to add a blank row
    const addBlankRow = useCallback(() => {
        addBlankRowHandler(table, filters);
    }, [table, filters]);


    // Memoized handler to add a blank row
    const copyToClipboard = useCallback(() => {
        copyToClipboardHandler(table);
    }, [table]);

    // Memoized handler to add a blank row
    const pasteFromClipboard = useCallback(() => {
        pasteFromClipboardHandler(table);
    }, [table]);

    // Expose `apiRef` methods using `useImperativeHandle`
    useImperativeHandle(ref, () => ({
        autosizeColumns: () => {
            // Handle autosize columns
            handleAutoSizeColumnsHandler(tableRef, table);
        },
        exportState() {
            return JSON.stringify({
                sorting: tableState.sorting,
                globalFilter: tableState.globalFilter,
                columnsVisibility: tableState.columnsVisibility,
                selectedRowModel: tableState.selectedRowModel
            });
        },
        restoreState(savedState: string) {
            const parsedState = JSON.parse(savedState);
            updateTableState('sorting', parsedState.sorting || []);
            updateTableState('globalFilter', parsedState.globalFilter || "");
            const filteredRows = table.applyGlobalFilter(tableState.globalFilter, tableState.tableData.rows);
            updateTableState('filteredRows', filteredRows);

            updateTableState('columnsVisibility', parsedState.columnsVisibility || {});
            updateTableState('selectedRowModel', parsedState.selectedRowModel || {});

        },
        clearState() {
            updateTableState('sorting', []);
            updateTableState('globalFilter', "");
            updateTableState('columnsVisibility', {});
            updateTableState('selectedRowModel', {});
            updateTableState('filteredRows', tableState.tableData.rows);
        },
        table,
        scrollToRow: (rowID: string) => {
            handleScrollToRow(rowID);
        },
        isEditMode: () => {
            return table.getState().tableEdit.editMode
        }
    }));

    const columnSizeVars = useMemo(() => {
        const headers = table.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
        }
        return colSizes;
    }, [table.getState().columnSizingInfo, table.getState().columnSizing]);


    // Use the virtualizer for rows
    const rowVirtualizer = useVirtualizer({
        count: table.getFilteredRowModel().rows.length,
        estimateSize: () => {
            // Use the density state to dynamically calculate the row height
            const density = table.getState().density;
            switch (density) {
                case 'sm':
                    return 50; // Smaller row height for 'sm' density
                case 'md':
                    return 57; // Default row height for 'md' density
                case 'lg':
                    return 73; // Larger row height for 'lg' density
                default:
                    return 50; // Fallback
            }
        },
        getScrollElement: () => tableRef.current,
        measureElement:
            typeof window !== 'undefined' &&
                navigator.userAgent.indexOf('Firefox') === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
    });


    const handleScrollToRow = (rowId: string) => {
        const rowIndex = tableState.tableData.rows.findIndex((row: { [TablesGridHardCoded.row_id]: string; }) => row[TablesGridHardCoded.row_id] === rowId);
        if (rowIndex !== -1) {
            // Scroll to the row
            rowVirtualizer.scrollToIndex(rowIndex); // Scroll to the row's index
        }
    };

    // Properly typed menu action handlers
    const handleSortAsc = (column: Column<ITableRow, IContentValue>) => {
        column.toggleSorting(false); // Sort ascending
    };

    const handleSortDesc = (column: Column<ITableRow, IContentValue>) => {
        column.toggleSorting(true); // Sort descending
    };

    const handleSortClear = (column: Column<ITableRow, IContentValue>) => {
        column.clearSorting();
    };

    const handlePinColumn = (column: Column<ITableRow, IContentValue>, pinPosition: false | 'left' | 'right') => {
        column.pin(pinPosition);
    };

    const handleAutosizeColumn = (column: Column<ITableRow, IContentValue>) => {
        // Handle autosize logic
        handleAutoSizeColumnsHandler(tableRef, table, column.id);
    };

    const handleAutosizeAllColumns = () => {
        handleAutoSizeColumnsHandler(tableRef, table);
    };

    const handleGroupBy = (column: Column<ITableRow, IContentValue>) => {
        table.setGrouping([column.id]); // Group by the column
    };

    const handleClearGroupBy = (column: Column<ITableRow, IContentValue>) => {
        table.resetGrouping();
    };

    const handleFilter = (column: Column<ITableRow, IContentValue>) => {
        setOpenFilters({ openFilters: true, selectedColumn: column });
    };

    const handleManageColumns = (column: Column<ITableRow, IContentValue>) => {
        setOpenColumns(true)
    };

    const handleHideColumn = (column: Column<ITableRow, IContentValue>) => {
        column.toggleVisibility(false)
    };

    const renderSkeletonRows = () => (
        <Fragment>
            {/* Render 10 skeleton rows as a placeholder while loading */}
            {Array.from(new Array(10)).map((_, index) => (
                <TableRow key={index}>
                    {/* Render skeleton cells for each visible column */}
                    {table.getVisibleLeafColumns().map((column) => (
                        <TableCell key={column.id}>
                            <Skeleton variant="rounded" width="100%" height={8} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </Fragment>
    );

    // Calculate total row height
    const totalHeight = rowVirtualizer.getTotalSize();
    const containerHeight = tableRef.current ? tableRef.current.clientHeight : 0;
    const isShorterThanContainer = totalHeight < containerHeight;
    const tableHeight = isShorterThanContainer ? `${totalHeight}px` : '100%';

    // Scroll to top (first row)
    const handleScrollToTop = () => {
        rowVirtualizer.scrollToIndex(0); // Scroll to the first row
    };

    // Scroll to bottom (last row)
    const handleScrollToBottom = () => {
        rowVirtualizer.scrollToIndex(tableState.tableData.rows.length - 1); // Scroll to the last row
    };

    const handleBooleanChange = (column: Column<ITableRow, IContentValue>) => (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        if (option !== null && option.value !== null)
            column.setFilterValue({ operator: "is", value: option ? option.value === 'true' : null, type: column.columnDef.type });
        else
            handleClearFilter(column)       
    };

    const handleDateChange = (column: Column<ITableRow, IContentValue>) => (value: string | null) => {
        column.setFilterValue({ operator: "equals", value: value, type: column.columnDef.type });
    };

    const handleEnumChange = (column: Column<ITableRow, IContentValue>) => (event: OnChangeParams) => {
        const enumColumn = table.getAllLeafColumns().find((col) => col.id === column.id.replace("_LABEL", ""));
        if (enumColumn && event.value !== null)
            enumColumn.setFilterValue({ operator: "equals", value: event.value, type: column.columnDef.type });
        else {
            const currentFilters = table.getState().columnFilters;
            const updatedFilters = currentFilters.filter((filter) => filter.id !== column.id.replace("_LABEL", ""));
            table.setColumnFilters(updatedFilters);
        }
    };

    const handleNumberChange = (column: Column<ITableRow, IContentValue>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '' && event.target.value !== null)
            column.setFilterValue({ operator: "equals", value: Number(event.target.value), type: column.columnDef.type });
        else
            handleClearFilter(column)
    };

    const handleFilterValueChange = (column: Column<ITableRow, IContentValue>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        column.setFilterValue({ operator: "contains", value: event.target.value, type: column.columnDef.type });
    };

    const handleClearFilter = (column: Column<ITableRow, IContentValue>) => {
        const currentFilters = table.getState().columnFilters;
        const updatedFilters = currentFilters.filter((filter) => filter.id !== column.id);
        table.setColumnFilters(updatedFilters);
    }

    const renderFilterField = (column: Column<ITableRow, IContentValue>) => {
        return (
            column?.columnDef && column.columnDef.rules === EDictionaryRules.enum ? (
                    <InputEnum
                        id={`input-${column.id}`} // Add a unique id based on row and column
                        key={column.columnDef.target ?? column.columnDef.field}
                        enumID={parseInt(column.columnDef.rulesValues as string)}
                        label={column.columnDef.header as string}
                        defaultValue={(column.getFilterValue() as { value: string })?.value}
                        disabled={false}
                        variant="standard"
                        onChange={(e) => handleEnumChange(column)(e)}
                        freeSolo={false}
                        searchByLabel={false}
                        hideButton={true}
                    />

            ) : column?.columnDef && column.columnDef.type === EDictionaryType.boolean ? (

                <Select
                    label="Value"
                    id={`input-${column.id}`}  // Add a unique id based on row and column
                    value={
                        (column.getFilterValue() as { value: boolean })?.value === null || (column.getFilterValue() as { value: boolean })?.value === undefined
                            ? ''
                            : (column.getFilterValue() as { value: boolean }).value
                                ? 'true'
                                : 'false'
                    }
                    onChange={handleBooleanChange(column)}
                    variant='standard'
                    options={[{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }]}
                    fullWidth
                />

            ) : column?.columnDef && column.columnDef.type === EDictionaryType.number ? (
                <Input
                    id={`input-${column.id}`}
                    label="Value"
                    type="number"
                    value={(column?.getFilterValue() as { value: number })?.value || ''}
                    onChange={handleNumberChange(column)}
                    fullWidth
                    variant="standard"
                    showClearButton={true}
                    onClear={() => handleClearFilter(column)}

                />
            ) : column?.columnDef && (column.columnDef.type === EDictionaryType.date
                || column.columnDef.type === EDictionaryType.jdedate) ? (
                <DatePicker
                    // Initialize the picker with the current cell value
                    id={`input-${column.id}`}
                    label="Value"
                    value={(column.getFilterValue() as { value: string })?.value ? dayjs((column.getFilterValue() as { value: string } | { value: null })?.value) : null}
                    onChange={(newValue) => {
                        const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                        handleDateChange(column)(formattedDate);
                    }}
                />
            ) : (
                <Input
                    id={`input-${column.id}`}
                    type="text"
                    variant="standard"
                    value={(column?.getFilterValue() as { value: string })?.value || ''}
                    onChange={handleFilterValueChange(column)}
                    label="Contains"
                    style={{ width: '100%' }}
                    showClearButton={true}
                    onClear={() => handleClearFilter(column)}
                />
            )
        )
    }
    // Render the filter input row only in editMode
    const renderFilterRow = () => {
        if (!rowFilter && !tableState.tableEdit.editMode) return null; // Only show in editMode

        return (
            <TableRow_Header>
                <TableCell key="filter-checkbox" style={{ padding: '0px 4px 0px 4px' }}>
                    <Div_TableCell />
                </TableCell>
                {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id} style={{ padding: '0px 4px 4px 4px' }}>
                        {column.getCanFilter() ? (
                            renderFilterField(column)
                        ) : (
                            // Render an empty cell for columns without filtering
                            <Div_TableCell />
                        )}
                    </TableCell>
                ))}
            </TableRow_Header>
        );
    };

    const [anchorColumnsMenus, setAnchorColumnsMenus] = useState<Record<string, HTMLElement | null>>({});

    const handleOpenMenu = (columnId: string, event: React.MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget; // Capture the currentTarget immediately
        setAnchorColumnsMenus((prev) => {
            return {
                ...prev,
                [columnId]: target, // Use the captured target
            };
        });
    };

    const handleCloseMenu = (columnId: string) => {
        setAnchorColumnsMenus((prev) => {
            return {
                ...prev,
                [columnId]: null,
            };
        });
    };

    const [anchorColumnsProperties, setAnchorColumnsProperties] = useState<Record<string, boolean>>({});

    const handleOpenProperties = (columnId: string) => {
        setAnchorColumnsProperties((prev) => {
            return {
                ...prev,
                [columnId]: true,
            };
        });
    };

    const handleCloseProperties = (columnId: string) => {
        setAnchorColumnsProperties((prev) => {
            return {
                ...prev,
                [columnId]: false,
            };
        });
    };

    return (
        <Div_TableGrid>
            <Div_TableToolbarButtons>
                <TableToolbar
                    isLoading={isLoading}
                    table={table}
                    tableState={tableState}
                    tableRef={tableRef}
                    handleCancelQuery={onCancelQuery}
                    addBlankRow={addBlankRow}
                    copyToClipboard={copyToClipboard}
                    pasteFromClipboard={pasteFromClipboard}
                    saveChanges={onSave}
                    discardChanges={onDiscard}
                    openFilters={openFilters}
                    setOpenFilters={setOpenFilters}
                    openColumns={openColumns}
                    setOpenColumns={setOpenColumns}
                    onImport={onImport}
                />
            </Div_TableToolbarButtons>
            {/* Main grid/table */}
            <Div_TableGridContent ref={tableRef} rowCount={rowCount}>
                {/* Show CircularProgress at the center of the table when loading */}
                {isLoading && (
                    <Div_TableProgress>
                        <CircularProgress />
                    </Div_TableProgress>
                )}
                <Table
                    style={{
                        tableLayout: 'fixed',
                        ...columnSizeVars,
                        minWidth: table.getTotalSize(), // Ensure table takes the full width based on total column size
                        height: isShorterThanContainer ? tableHeight : '100%', // Avoid row stretching if fewer rows

                    }}
                >
                    <TableHead>
                        {!isLoading && table.getHeaderGroups().map((headerGroup) => (
                            <TableRow_Header key={headerGroup.id}>
                                <TableCell_HeaderCheckbox>
                                    <Checkbox
                                        id={`${uuidv4()}-header-checkbox`}
                                        indeterminate={Object.keys(tableState.selectedRowModel).length > 0 && !(Object.keys(tableState.selectedRowModel).length === tableState.tableData.rows.length)}
                                        checked={Object.keys(tableState.selectedRowModel).length === tableState.tableData.rows.length}
                                        onChange={() => table.toggleAllRowsSelected()}
                                    />
                                </TableCell_HeaderCheckbox>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        style={{
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: DefaultZIndex.Component,
                                            background: "inherit",
                                            width: `calc(var(--header-${header?.id}-size) * 1px)`,
                                            maxHeight: '32px',
                                            paddingRight: '12px',
                                            paddingTop: '0px',
                                            paddingBottom: '0px',

                                        }}
                                    >
                                        <Div_TableHeaderContent>
                                            <Tooltip title={header.column.columnDef.target
                                                ?? header.column.columnDef.field}>
                                                <TableSortLabel
                                                    active={!!header.column.getIsSorted()}
                                                    direction={header.column.getIsSorted() === 'asc' ? 'asc' : 'desc'}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableSortLabel>
                                            </Tooltip>
                                            <Div_TableHeaderButtons>
                                                <IconButton
                                                    onClick={(event) => handleOpenMenu(header.column.id, event)}
                                                    icon={LYMoreVertIcon}
                                                />
                                                {anchorColumnsMenus[header.column.id] && (
                                                    <HeaderMenus
                                                        anchorEl={anchorColumnsMenus[header.column.id]}
                                                        onClose={() => handleCloseMenu(header.column.id)}
                                                        column={header.column}
                                                        onSortAsc={handleSortAsc}
                                                        onSortDesc={handleSortDesc}
                                                        onSortClear={handleSortClear}
                                                        onPinColumn={handlePinColumn}
                                                        onAutosizeColumn={handleAutosizeColumn}
                                                        onAutosizeAllColumns={handleAutosizeAllColumns}
                                                        onGroupBy={handleGroupBy}
                                                        onClearGroupBy={handleClearGroupBy}
                                                        onFilter={handleFilter}
                                                        onManageColumns={handleManageColumns}
                                                        onHideColumn={handleHideColumn}
                                                        handleOpenProperties={() => handleOpenProperties(header.column.id)}
                                                    />
                                                )}
                                                {anchorColumnsProperties[header.column.id] && (
                                                    <ColumnHelp
                                                        open={anchorColumnsProperties[header.column.id] !== null}
                                                        setOpen={() => handleCloseProperties(header.column.id)}
                                                        column={header.column}
                                                    />
                                                )}
                                            </Div_TableHeaderButtons>
                                        </Div_TableHeaderContent>

                                        {header.column.getCanResize() && (
                                            <Div_TableHeaderReisze
                                                onDoubleClick={() => header.column.resetSize()}
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                            />
                                        )}
                                    </TableCell>
                                ))}
                                {/* Render filter row */}

                            </TableRow_Header>
                        ))}
                        {renderFilterRow()}
                    </TableHead>
                    {table.getState().columnSizingInfo.isResizingColumn ? (
                        <MemoizedTableBody
                            rowVirtualizer={rowVirtualizer}
                            table={table}
                            tableState={tableState}
                            tableRef={tableRef}
                            onSelect={onSelect}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            onDoubleClick={onDoubleClick}
                        />
                    ) : (
                        isLoading
                            ? (
                                <TableBody>
                                    {renderSkeletonRows()}
                                </TableBody>)
                            : table.getRowModel().rows.length === 0
                                ? null
                                : (
                                    <LYTableBody
                                        rowVirtualizer={rowVirtualizer}
                                        table={table}
                                        tableState={tableState}
                                        tableRef={tableRef}
                                        onSelect={onSelect}
                                        onMouseDown={onMouseDown}
                                        onTouchStart={onTouchStart}
                                        onTouchEnd={onTouchEnd}
                                        onDoubleClick={onDoubleClick}
                                    />
                                )
                    )}

                </Table>
                {/* Scroll to Top/Bottom Button */}
                <Div_TableFab>
                    <IconButton
                        onClick={handleScrollToTop}
                        icon={LYChevronUpIcon}
                        size={LYIconSize.large}
                    />
                    <IconButton
                        onClick={handleScrollToBottom}
                        icon={LYChevronDownIcon}
                        size={LYIconSize.large}
                    />
                </Div_TableFab>
            </Div_TableGridContent>
            {table.getRowModel().rows.length === 0 && !isLoading &&
                <Div_TableResultsOverlay>
                    {CustomNoResultsOverlay()}
                </Div_TableResultsOverlay>
            }
            <Div_TableFooter>
                <Div_TableFooterContent>
                    {`${t("tables.rows")}: ${isLoading ? rowCount : table.getFilteredRowModel().rows.length}`}
                </Div_TableFooterContent>
            </Div_TableFooter>
        </Div_TableGrid>
    );

});