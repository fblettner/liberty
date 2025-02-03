/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Imports
import { Cell, RowData, RowSelectionState, SortingState, Table } from "@tanstack/react-table";

// Custom Import
import { OnTableEventParams } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { IContentValue } from "@ly_utils/commonUtils";
import { RefObject } from "react";
import { DensityState } from "@ly_components/forms/FormsTable/features/Density";
import { TableDataState, TableEditState } from "@ly_components/forms/FormsTable/features/TableEdit";
import { ClipboardTableState } from "@ly_components/forms/FormsTable/features/ClipBoard";
import { IColumnsVisibility, ITableRow } from "@ly_types/lyTables";

const measureTextWidth = (text: string, font: string = '14px Arial'): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
};

export const handleAutoSizeColumnsHandler = (parentRef: RefObject<HTMLDivElement>, table: LYTableInstance<ITableRow>, columnId?: string) => {
    try {
        if (parentRef.current) {
            parentRef.current.style.tableLayout = 'auto';
        }

        const newColumnSizes: { [key: string]: number } = {};
        const font = '14px Arial';

        const columnsToResize = columnId
            ? table.getAllLeafColumns().filter((col) => col.id === columnId) // Single column
            : table.getAllLeafColumns(); // All columns

        if (!columnsToResize.length) {
            return;
        }

        // Limit row processing to prevent hanging
        const maxRowsToProcess = 1000; // You can adjust this value
        const rowsToProcess = table.getCoreRowModel().rows.slice(0, maxRowsToProcess);

        columnsToResize.forEach((column) => {
            const columnId = column.id;
            if (columnId === "actions") {
                newColumnSizes[columnId] = 100;
            } else {
                const header = column.columnDef.header?.toString() || '';

                // Measure header text width
                let maxCellWidth = measureTextWidth(header, font);

                // Iterate over the limited number of rows to find the longest cell value for this column
                rowsToProcess.forEach((row) => {
                    const cellValue = row.getValue(columnId);
                    const cellText = String(cellValue || '');
                    const cellWidth = measureTextWidth(cellText, font);
                    if (cellWidth > maxCellWidth) {
                        maxCellWidth = cellWidth;
                    }
                });

                // Apply minimum and maximum column widths
                const estimatedWidth = Math.min(Math.max(100, maxCellWidth + 20), 300); // Adjust padding and limits
                newColumnSizes[columnId] = estimatedWidth;
            }
        });

        table.setColumnSizing(newColumnSizes); // Apply sizing for one or all columns

        setTimeout(() => {
            if (parentRef.current) {
                parentRef.current.style.tableLayout = 'fixed';
            }
        }, 0);


    } catch (error) {
        console.error('Error during auto-size columns:', error);
    }
};

export interface ITableState {

    sorting: SortingState;
    density: DensityState;
    columnsVisibility: IColumnsVisibility;
    selectedRowModel: RowSelectionState;
    tableEdit: TableEditState['tableEdit'];
    clipboard: ClipboardTableState['clipboard'];
    filteredRows: ITableRow[];
    tableData: TableDataState['tableData'];
    globalFilter: string;
}

// Extend the built-in Table with custom methods
export interface LYTableInstance<TData extends RowData> extends Table<TData> {
    clearGlobalFilter: () => void
    applyGlobalFilter: (filter: string, rows: ITableRow[]) => ITableRow[]

}


// Sample utility function to manage keyboard navigation (like DataGridPro)
export const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    rowId: string,
    cell: Cell<ITableRow, IContentValue>,
    columnIndex: number,
    table: LYTableInstance<ITableRow>,
    editingCell: { rowId: string; columnId: string, cell: Cell<ITableRow, IContentValue> } | null,
    handleCellClick: (rowId: string, columnId: string, cell: Cell<ITableRow, IContentValue>) => void,
    handleBlur: (params: OnTableEventParams) => void,
    handleRestore: (cell: Cell<ITableRow, IContentValue>) => void
) => {
    const visibleColumns = table.getVisibleLeafColumns();
    const allRows = table.getRowModel().rows;
    const currentCellIndex = columnIndex;
    let nextCellIndex = event.shiftKey ? currentCellIndex - 1 : currentCellIndex + 1;
    let nextRowIndex = allRows.findIndex((row) => row.id === rowId);

    switch (event.key) {
        case "Tab":
            event.preventDefault(); // Prevent default tab behavior
            const params = {
                row: cell.row,
                columnId: cell.column.id,
                value: cell.getValue()
            };

            handleBlur(params);
            // Handle column wrapping and row wrapping
            if (nextCellIndex >= visibleColumns.length) {
                nextCellIndex = 0;
                nextRowIndex = nextRowIndex + 1;
            } else if (nextCellIndex < 0) {
                nextCellIndex = visibleColumns.length - 1;
                nextRowIndex = nextRowIndex - 1;
            }

            // Ensure index is valid
            if (nextRowIndex >= 0 && nextRowIndex < allRows.length) {
                const nextRow = allRows[nextRowIndex];
                const nextCol = visibleColumns[nextCellIndex];

                if (nextRow && nextCol) {
                    // Here you need to manually manage the focus in your table
                    document.getElementById(`cell-${nextRow.id}-${nextCol.id}`)?.focus();
                }
            }

            break;
        case "Enter":
            event.preventDefault();
            if (editingCell === null) {
                handleCellClick(rowId, cell.column.id, cell);
            }
            else {
                const params = {
                    row: cell.row,
                    columnId: cell.column.id,
                    value: cell.getValue()
                };
    
                handleBlur(params);
                document.getElementById(`cell-${rowId}-${cell.column.id}`)?.focus();
            }
            break;
        case "Escape":
            event.preventDefault();
            handleRestore(cell);
            document.getElementById(`cell-${rowId}-${cell.column.id}`)?.focus();
            break;
        case "ArrowRight":
            if (editingCell === null) {
                event.preventDefault();
                if (nextCellIndex < visibleColumns.length) {
                    const nextCol = visibleColumns[nextCellIndex];
                    document.getElementById(`cell-${rowId}-${nextCol.id}`)?.focus();
                }
            }
            break;
        case "ArrowLeft":
            if (editingCell === null) {
                event.preventDefault();
                if (currentCellIndex > 0) {
                    const prevCol = visibleColumns[currentCellIndex - 1];
                    document.getElementById(`cell-${rowId}-${prevCol.id}`)?.focus();
                }
            }
            break;
        case "ArrowDown":
            if (editingCell === null) {
                event.preventDefault();
                if (nextRowIndex < allRows.length - 1) {
                    const nextRow = allRows[nextRowIndex + 1];
                    document.getElementById(`cell-${nextRow.id}-${visibleColumns[currentCellIndex].id}`)?.focus();
                }
            }
            break;
        case "ArrowUp":
            if (editingCell === null) {
                event.preventDefault();
                if (nextRowIndex > 0) {
                    const prevRow = allRows[nextRowIndex - 1];
                    document.getElementById(`cell-${prevRow.id}-${visibleColumns[currentCellIndex].id}`)?.focus();
                }
            }
            break;
        default:
            if (editingCell === null) {
                handleCellClick(rowId, cell.column.id, cell);
            }
    }



}

