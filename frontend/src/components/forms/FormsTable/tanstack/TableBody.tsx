/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { ChangeEvent, memo, useEffect, useRef, useState } from "react";
import { Cell, flexRender } from "@tanstack/react-table";
import { v4 as uuidv4 } from 'uuid'; // Import a UUID generator

// Custom Import
import { IContentValue } from "@ly_utils/commonUtils";
import { handleKeyDown, ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { getRowClassNameHandler } from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { OnAutoCompleteParams, OnTableEventParams } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { Virtualizer } from "@tanstack/react-virtual";
import { ITableRow, TablesGridHardCoded } from "@ly_types/lyTables";
import { LYArrowCircleDownIcon, LYArrowCircleRightIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Div_TableExpander } from "@ly_components/styles/Div";
import { IconButton } from "@ly_components/common/IconButton";
import { TableBody, TableCell, TableRow } from "@ly_components/common/Table";
import { TableCell_Checkbox, TableCell_Tanstack } from "@ly_components/styles/Table";
import { Checkbox } from "@ly_components/common/Checkbox";

interface ITableBodyProps {
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    tableRef: React.MutableRefObject<HTMLDivElement | null>;
    onSelect: (event: React.MouseEvent<Element> | ChangeEvent<HTMLInputElement>, row: ITableRow) => void
    onMouseDown: (event: React.MouseEvent<Element>, row: ITableRow) => void;
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>, row: ITableRow) => void
    onTouchEnd: () => void;
    onDoubleClick: (event: React.MouseEvent<Element>, row: ITableRow) => void;
}

// Special memoized wrapper for our table body that we will use during column resizing
export const LYTableBody = ({
    rowVirtualizer,
    table,
    tableState,
    tableRef,
    onSelect,
    onMouseDown,
    onTouchStart,
    onTouchEnd,
    onDoubleClick
}: ITableBodyProps) => {

    // State to track which cell is being edited
    const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string, cell: Cell<ITableRow, IContentValue> } | null>(null);
    const [inputValue, setInputValue] = useState<IContentValue>(null);
    const isRestoring = useRef<boolean>(false)

    // Calculate total row height
    const totalHeight = rowVirtualizer.getTotalSize();
    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? totalHeight - virtualRows[virtualRows.length - 1].end
            : 0;


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const columnDef = editingCell?.cell.column.columnDef;
            if (columnDef && columnDef.rules !== EDictionaryRules.lookup
                && columnDef.rules !== EDictionaryRules.enum
                && columnDef.rules !== EDictionaryRules.boolean
                && columnDef.type !== EDictionaryType.date
                && columnDef.type !== EDictionaryType.jdedate) {
                if (editingCell && tableRef.current && !tableRef.current.contains(event.target as Node)) {
                    // If click is outside the table, trigger handleBlur manually
                    const row = table.getRowModel().rows.find((r) => r.id === editingCell.rowId);
                    if (row) {
                        const params = {
                            row: row,
                            columnId: editingCell.columnId,
                            value: inputValue
                        }
                        handleBlur(params);
                    }
                }
            };
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingCell, inputValue, table]);


    // Handle cell click to switch to edit mode
    const handleCellClick = (rowId: string, columnId: string, cell: Cell<ITableRow, IContentValue>) => {
        if (table.isCellEditable(rowId, columnId) && tableState.tableEdit.editMode) {
            isRestoring.current = false
            setInputValue(cell.getValue() as IContentValue);
            setEditingCell({ rowId, columnId, cell });
        }
    };

    useEffect(() => {
        if (editingCell) {
            const inputElement = document.getElementById(`input-${editingCell.rowId}-${editingCell.columnId}`) as HTMLInputElement;
            if (inputElement) {
                inputElement.focus();
                if (inputElement.select)
                    inputElement.select();
            }
        }
    }
    , [editingCell]);

    const handleInputChange = (params: OnTableEventParams) => {
        setInputValue(params.value)
    };

    // Handle input change and save to the table edit state with debounce
    const handleAutoCompleteChange = (params: OnAutoCompleteParams) => {
        const { cell, value, label, data } = params;
        const original = cell.row.original as ITableRow;
        
        if (editingCell) {
            if (cell.row && value !== original[cell.column.id.replace("_LABEL", "")]) {
                let updateData = {
                    ...(typeof cell.row.original === 'object' ? cell.row.original : {}),
                    [cell.column.id.replace("_LABEL", "")]: value,
                    [cell.column.id]: label,
                    [TablesGridHardCoded.row_id]: original[TablesGridHardCoded.row_id] || cell.row.id
                };

                if (cell.column.columnDef.output_params !== undefined && cell.column.columnDef.output_params !== null && data !== undefined && data !== null) {
                    // Parse the output_params (e.g., SY=SY;RT=RT)
                    const params = cell.column.columnDef.output_params.split(';');

                    params.forEach((param: string) => {
                        const [inputKey, outputKey] = param.split('=');
                    
                        if (
                            inputKey &&
                            outputKey &&
                            typeof data === 'object' &&
                            data !== null &&
                            !Array.isArray(data) &&
                            inputKey in data
                        ) {
                            // TypeScript now knows `data` is either ILookupOption or IEnumOption
                            updateData[outputKey] = data[inputKey as keyof typeof data];
                        }
                    });
                }

                // Apply the update to the table row
                table.editRow(cell.row.id, updateData);
            }
            setEditingCell(null); // Exit edit mode
            document.getElementById(`cell-${cell.row.id}-${cell.column.id}`)?.focus();
        }
    };

    const handleDatePicker = (params: OnTableEventParams) => {
        const { row, columnId, value } = params;
        const original = row.original as ITableRow;

        if (editingCell) {
            if (row && value !== original[columnId]) {
                table.editRow(row.id, {
                    ...(typeof row.original === 'object' ? row.original : {}),
                    [columnId]: value,
                    [TablesGridHardCoded.row_id]: original[TablesGridHardCoded.row_id] || row.id, 
                });
            }
            // document.getElementById(`cell-${row.id}-${columnId}`)?.focus();
        }
    };

    const handleBlur = (params: OnTableEventParams) => {
        const { row, columnId, value } = params;
        const original = row.original as ITableRow;
        if (editingCell && !isRestoring.current) {
            if (row && value !== original[columnId]) {
                table.editRow(row.id, {
                    ...(typeof row.original === 'object' ? row.original : {}),
                    [columnId]: value,
                    [TablesGridHardCoded.row_id]: original[TablesGridHardCoded.row_id] || row.id
                });
            }
            setEditingCell(null); // Exit edit mode
            document.getElementById(`cell-${row.id}-${columnId}`)?.focus();
        }
    };

    const handleRestore = (cell: Cell<ITableRow, IContentValue>) => {
        isRestoring.current = true
        setInputValue(cell.getValue());
        setEditingCell(null);
    };

    return (
        <TableBody>
            {/* Top padding row with unique key */}
            <TableRow key="top-padding-row" style={{ height: `${paddingTop}px` }}>
                <TableCell colSpan={table.getVisibleLeafColumns().length + 1} style={{ padding: 0, border: 'none' }} />
            </TableRow>
            {/* Render each virtualized row */}
            {virtualRows.map((virtualRow) => {
                // Get the row by its index in the row model
                const row = table.getRowModel().rows[virtualRow.index];
                const rowOriginal = row?.original as ITableRow;
                // Safeguard: Check if row and row id exist before rendering
                if (!row || !row.id) {
                    return null; // Skip rendering if row or row id is undefined
                }
                const isSelected = table.getIsRowSelected(row.id);
                return (
                    <TableRow
                        key={row.id}
                        onMouseDown={(event) => {
                            event.stopPropagation(); // Stop event propagation
                            onMouseDown(event, rowOriginal);
                        }}
                        onTouchStart={(event) => {
                            event.stopPropagation(); // Stop event propagation for touch
                            onTouchStart(event, rowOriginal);
                        }}
                        onTouchEnd={onTouchEnd} // Handle touch end
                        onDoubleClick={(event) => {
                            event.stopPropagation(); // Stop event propagation for double click
                            onDoubleClick(event, rowOriginal);
                        }}
                        isSelected={isSelected && getRowClassNameHandler(row.id, tableState.tableEdit, rowOriginal) === ''}
                        className={getRowClassNameHandler(row.id, tableState.tableEdit, rowOriginal)}
                    >
                        {/* Checkbox for row selection */}
                        <TableCell_Checkbox  key={`${row.id}-checkbox`}>
                            <Checkbox
                                id={`${uuidv4()}-row-checkbox`}
                                checked={table.getIsRowSelected(row.id)}
                                onChange={(event) => {
                                    event.stopPropagation(); // Prevent click event from propagating
                                    onSelect(event, rowOriginal);
                                }}
                                onMouseDown={(event) => {
                                    event.stopPropagation(); // Prevent mousedown event from propagating
                                }}
                            />
                        </TableCell_Checkbox>

                        {/* Render visible cells in each row */}
                        {row.getVisibleCells().map((cell, columnIndex) => (
                            <TableCell_Tanstack
                                key={`${cell.id}`}
                                tabIndex={0} // Make the cell focusable
                                onClick={() => handleCellClick(row.id, cell.column.id, cell)}
                                onKeyDown={(event) => handleKeyDown(event, row.id, cell, columnIndex, table, editingCell, handleCellClick, handleBlur, handleRestore)}
                                id={`cell-${row.id}-${cell.column.id}`} // Assign unique ID for navigation
                                table={table}
                                cell={cell}
                            >
                                {cell.getIsGrouped() ? (
                                    // If it's a grouped cell, add an expander and row count
                                    <Div_TableExpander>
                                        <IconButton
                                            onClick={row.getToggleExpandedHandler()}
                                            icon={row.getIsExpanded() ? LYArrowCircleDownIcon : LYArrowCircleRightIcon}
                                        />

                                        {/* Render the cell content outside the button */}
                                        <span>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            {row.getCanExpand() && ` (${row.subRows.length})`}
                                        </span>
                                    </Div_TableExpander>
                                ) : cell.getIsAggregated() ? (
                                    // If the cell is aggregated, use the Aggregated
                                    // renderer for cell
                                    flexRender(
                                        cell.column.columnDef.aggregatedCell ??
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )
                                ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                                    tableState.tableEdit.editMode && editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id ? (
                                        // Render input component if the cell is in edit mode
                                        (cell.column.columnDef.rules === EDictionaryRules.lookup || cell.column.columnDef.rules === EDictionaryRules.enum)
                                            ? cell.column.columnDef.editCell({cell: cell, value: inputValue, handleAutoCompleteChange: handleAutoCompleteChange})
                                            : (cell.column.columnDef.type === EDictionaryType.date || cell.column.columnDef.type === EDictionaryType.jdedate)
                                                ? cell.column.columnDef.editCell({cell: cell, value: inputValue, handleChange: handleDatePicker})
                                                : (cell.column.columnDef.rules === EDictionaryRules.boolean)
                                                    ? cell.column.columnDef.editCell({cell: cell, value: inputValue, handleBlur: handleBlur})
                                                    : cell.column.columnDef.editCell({cell: cell, value: inputValue, handleChange: handleInputChange, handleBlur: handleBlur})
                                    ) : (
                                        // Otherwise, just render the regular cell
                                        flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )
                                    )
                                )}
                            </TableCell_Tanstack>
                        ))}
                    </TableRow>
                );
            })}
            {/* Bottom padding row with unique key */}
            <TableRow key="bottom-padding-row" style={{ height: `${paddingBottom}px` }}>
                <TableCell colSpan={table.getVisibleLeafColumns().length + 1} style={{ padding: 0, border: 'none' }} />
            </TableRow>
        </TableBody>
    );

};

const genericMemo = (
    component: (props: ITableBodyProps) => JSX.Element,
    propsAreEqual?: (
        prevProps: ITableBodyProps,
        nextProps: ITableBodyProps
    ) => boolean
) => memo(component, propsAreEqual) as (props: ITableBodyProps) => JSX.Element;

function MemoizedTableBodyComponent(props: ITableBodyProps): JSX.Element {
    return <LYTableBody {...props} />;
}

export const MemoizedTableBody = genericMemo(MemoizedTableBodyComponent, (prevProps, nextProps) => {
    // Memoize based on important props to avoid unnecessary re-renders
    return (
        prevProps.table === nextProps.table &&
        prevProps.tableState === nextProps.tableState &&
        prevProps.rowVirtualizer === nextProps.rowVirtualizer
    );
});

