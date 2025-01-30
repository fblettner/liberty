/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Fragment, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { Column } from "@tanstack/react-table";
import { v4 as uuidv4 } from 'uuid'; // Import a UUID generator

// Custom Imports
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { handleAutoSizeColumnsHandler } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { ColumnsFilter } from "@ly_components/forms/FormsTable/tanstack/ColumnsFilter";
import { IFilterState } from "@ly_components/forms/FormsTable/utils/columnsUtils";
import { EStandardColor, IContentValue } from "@ly_utils/commonUtils";
import { ITableRow } from "@ly_types/lyTables";
import { LYAddIcon, LYAutoAwesomeIcon, LYCancelIcon, LYCloudUploadIcon, LYContentCopyIcon, LYContentPasteIcon, LYDensityLargeIcon, LYDensityMediumIcon, LYDensitySmallIcon, LYFilterListIcon, LYReactIcon, LYSaveIcon, LYSearchIcon, LYViewColumnIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Divider } from "@ly_components/common/Divider";
import { Div_DialogToolbar, Div_DialogToolbarButtons, Div_DialogToolbarButtonsEnd, Div_Inline, Div_TableAllColumnsChooser, Div_TableColumnsChooser, Div_TableSearch, Div_TableToolbar } from "@ly_components/styles/Div";
import { Button } from "@ly_components/common/Button";
import { Checkbox } from "@ly_components/common/Checkbox";
import { Menu, MenuItem } from "@ly_components/common/Menus";
import { Input } from "@ly_components/common/Input";
import { Popper } from "@ly_components/common/Popper";

export interface ITableToolbar {
    isLoading: boolean;
    table: LYTableInstance<ITableRow>;
    tableState: ITableState
    tableRef: RefObject<HTMLDivElement>;
    handleCancelQuery: () => void;
    addBlankRow: () => void;
    copyToClipboard: () => void;
    pasteFromClipboard: () => void
    saveChanges: () => void;
    discardChanges: () => void;
    openFilters: IFilterState;
    setOpenFilters: React.Dispatch<React.SetStateAction<IFilterState>>;
    openColumns: boolean;
    setOpenColumns: React.Dispatch<React.SetStateAction<boolean>>;
    onImport: () => void;
}

export const TableToolbar = (props: ITableToolbar) => {
    const { isLoading, table, tableState, tableRef, handleCancelQuery, addBlankRow, copyToClipboard, pasteFromClipboard, saveChanges, discardChanges, openFilters, setOpenFilters,
        openColumns, setOpenColumns, onImport
    } = props;
    const [filterInput, setFilterInput] = useState('');
    const [searchColumn, setSearchColumn] = useState("");
    const toolbarRef = useRef<HTMLDivElement | null>(null); // Ref for the toolbar


    const handleOpenFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOpenFilters({ openFilters: true, selectedColumn: null });
    };

    const handleCloseFilters = () => {
        setOpenFilters({ openFilters: false, selectedColumn: null });
    };

    const toggleDensity = () => {
        table.toggleDensity();
    };

    // Function to render the appropriate density icon
    const renderDensityIcon = () => {
        if (tableState.density === 'sm') {
            return LYDensitySmallIcon
        } else if (tableState.density === 'md') {
            return LYDensityMediumIcon
        } else {
            return LYDensityLargeIcon
        }
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOpenColumns(true);
    };

    const handleCloseMenu = () => {
        setOpenColumns(false);
    };

    // Handle the filter input change
    const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterInput(event.target.value); // Only update the input, don't filter immediately
    };

    // Debouncing effect for filtering rows
    useEffect(() => {
        // Create a timeout to apply the filtering after a delay (debounce)
        const timeout = setTimeout(() => {
            table.setGlobalFilter(filterInput);
        }, 500); // 500ms debounce delay

        // Cleanup function to clear the timeout if the input changes again before the delay ends
        return () => clearTimeout(timeout);
    }, [filterInput]);

    // Handle clear button click
    const handleClearFilter = () => {
        setFilterInput(''); // Clear the input
        table.clearGlobalFilter();
    };

    // Handle the search input change
    const handleSearchColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchColumn(event.target.value);
    };

    // Filter columns based on search text
    const filteredColumns = table.getAllLeafColumns().filter((column) => {
        return column.columnDef.header.toLowerCase().includes(searchColumn.toLowerCase())
    }
    );

    // Toggle visibility for all columns
    const handleToggleAllColumns = () => {
        const allColumnsVisible = table.getIsAllColumnsVisible();
        table.getAllLeafColumns().forEach((column) => column.toggleVisibility(!allColumnsVisible));
    };

    const handleAutoSizeColumns = useCallback(() => {
        handleAutoSizeColumnsHandler(tableRef, table);
    }, [tableRef, table]);

    const handleCancel = useCallback(() => {
        handleCancelQuery();
    }, [handleCancelQuery]);

    const handleAddBlankRow = useCallback(() => {
        addBlankRow();
    }, [addBlankRow]);

    const handleCopyToClipboard = useCallback(() => {
        copyToClipboard();
    }, [copyToClipboard]);

    const handlePasteFromClipboard = useCallback(() => {
        pasteFromClipboard()
    }, [pasteFromClipboard]);

    const handleSave = useCallback(() => {
        saveChanges();
    }, [saveChanges]);

    const handleDiscard = useCallback(() => {
        discardChanges();
    }, [discardChanges]);

    const handleImport = useCallback(() => {
        onImport();
    }, [discardChanges]);

    const hasErrorInRows: boolean = tableState.tableData.rows.some((row) => row.error === true);

    return (
        <Div_TableToolbar>
            <Div_DialogToolbar>
                <Div_DialogToolbarButtons ref={toolbarRef}>
                    {!isLoading &&
                        <Fragment>
                            <Button
                                variant="outlined" // Use 'outlined' for a modern, clean look
                                startIcon={LYViewColumnIcon}
                                onClick={handleOpenMenu}
                            >
                                {t("button.columns")}
                            </Button>
                            {openColumns &&
                                <Popper
                                    open={openColumns}
                                    anchorEl={toolbarRef.current}
                                    onClose={handleCloseMenu}
                                    placement="bottom-start"
                                    modal
                                >
                                    <Menu
                                        anchorEl={toolbarRef.current}
                                        open={openColumns}
                                        onClose={handleCloseMenu}
                                    >
                                        {/* Search input */}
                                        <Div_TableSearch>
                                            <Input
                                                id={"table-search-columns-"+tableState.tableData.table_id}
                                                fullWidth
                                                variant="standard" // Modern style
                                                placeholder="Search columns..."
                                                value={searchColumn}
                                                onChange={handleSearchColumn}
                                                showClearButton={true}
                                                onClear={() => setSearchColumn('')}
                                            />
                                        </Div_TableSearch>

                                        <Divider />

                                        {/* Scrollable filtered columns */}
                                        <Div_TableColumnsChooser>
                                            {filteredColumns.map((column: Column<ITableRow, IContentValue>) => (
                                                <MenuItem
                                                    key={column.id}
                                                    onClick={column.getToggleVisibilityHandler()}
                                                >
                                                    <Checkbox
                                                        id={column.id}
                                                        checked={column.getIsVisible()}

                                                        label={column.columnDef.header}
                                                        labelPlacement="end"
                                                    />

                                                </MenuItem>
                                            ))}
                                        </Div_TableColumnsChooser>

                                        <Divider />

                                        {/* "Select All" Checkbox */}
                                        <Div_TableAllColumnsChooser>
                                            <MenuItem onClick={handleToggleAllColumns}>
                                                <Checkbox
                                                    id="select-all-columns"
                                                    checked={table.getIsAllColumnsVisible()}
                                                    indeterminate={
                                                        !table.getIsAllColumnsVisible() &&
                                                        filteredColumns.some((column: Column<ITableRow, IContentValue>) => column.getIsVisible())
                                                    }

                                                    label="Show/Hide All"
                                                    labelPlacement="end"
                                                />

                                            </MenuItem>
                                        </Div_TableAllColumnsChooser>
                                    </Menu>
                                </Popper>
                            }
                            <Button
                                variant="outlined" // Use 'outlined' for a modern, clean look
                                startIcon={LYFilterListIcon}
                                badgeContent={table.getState().columnFilters.length > 0 ? table.getState().columnFilters.length : undefined} 
                                onClick={handleOpenFilters}
                            >
                                {t('button.filters.title')}
                            </Button>
                            {openFilters.openFilters && (
                                <ColumnsFilter
                                    table={table}
                                    anchorEl={toolbarRef.current}
                                    onClose={handleCloseFilters}
                                    openFilters={openFilters}
                                />
                            )}
                            <Button
                                variant="outlined" // Use 'outlined' for a modern, clean look
                                startIcon={renderDensityIcon()}
                                onClick={toggleDensity}
                            >
                                {t("button.density")}
                            </Button>
                            <Button
                                variant="outlined" // Use 'outlined' for a modern, clean look
                                startIcon={LYAutoAwesomeIcon}
                                onClick={handleAutoSizeColumns}
                            >
                                {t("button.autosize")}
                            </Button>
                        </Fragment>
                    }
                    {isLoading && (
                        <Button
                            variant="outlined" // Use 'outlined' for a modern, clean look
                            onClick={handleCancel}
                            startIcon={LYCancelIcon}>
                            {t('button.cancel')}
                        </Button>
                    )}
                </Div_DialogToolbarButtons>
                <Div_DialogToolbarButtonsEnd>
                    <Input
                        id={"global-filter-"+uuidv4()}
                        value={filterInput}
                        variant="standard"
                        onChange={handleGlobalFilterChange}
                        placeholder="Search..."
                        startAdornment={
                            <Div_Inline>
                                <LYReactIcon
                                    icon={LYSearchIcon}
                                    size={LYIconSize.medium}
                                />
                            </Div_Inline>
                        }
                        showClearButton={true}
                        onClear={handleClearFilter}

                    />
                </Div_DialogToolbarButtonsEnd>
            </Div_DialogToolbar>
            {tableState.tableEdit.editMode && (
                <Div_DialogToolbar>

                    <Button variant="text" onClick={handleAddBlankRow} startIcon={LYAddIcon}>
                        {t('button.add_value')}
                    </Button>
                    <Button variant="text" onClick={handleCopyToClipboard} disabled={Object.keys(tableState.selectedRowModel).length === 0} startIcon={LYContentCopyIcon} >
                        {t('button.copy')}
                    </Button>
                    <Button variant="text" onClick={handlePasteFromClipboard} disabled={!tableState.clipboard.hasClipboardContent} startIcon={LYContentPasteIcon} >
                        {t('button.paste')}
                    </Button>
                    <Button variant="text" onClick={handleImport} startIcon={LYCloudUploadIcon}>
                        {t('button.import')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!tableState.tableEdit.hasUnsavedRows || hasErrorInRows}
                        color={tableState.tableEdit.hasUnsavedRows && !hasErrorInRows ? EStandardColor.success : EStandardColor.primary}
                        startIcon={LYSaveIcon}
                        variant="text"
                    >
                        {t('button.save')}
                    </Button>
                    <Button
                        onClick={handleDiscard}
                        disabled={!tableState.tableEdit.hasUnsavedRows}
                        color={tableState.tableEdit.hasUnsavedRows ? EStandardColor.error : EStandardColor.primary}
                        variant="text"
                        startIcon={LYCancelIcon}
                    >
                        {t('button.discard')}
                    </Button>

                </Div_DialogToolbar>
            )}
        </Div_TableToolbar>
    )
};