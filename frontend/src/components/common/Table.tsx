// components/Table.tsx
import React, { ReactNode, HTMLAttributes, TdHTMLAttributes, forwardRef } from "react";
import '@emotion/react';
import styled from '@emotion/styled';
import { darken } from "polished";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";

// Table Props
interface TableProps extends HTMLAttributes<HTMLTableElement> {
    children: ReactNode;
}

interface TableBodyProps extends HTMLAttributes<HTMLTableElement> {
    children: ReactNode;
}

// Table Head Props
interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
    children: ReactNode;
}



// Table Cell Props
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    children?: ReactNode;
    align?: "left" | "center" | "right";
    colSpan?: number;
    rowSpan?: number;
}

const StyledTable = styled.table<{ isSelected?: boolean; status?: string }>(({ theme, isSelected, status }) => ({
    tableLayout: "auto",
    height: "100%",
    display: "table",
    width: "100%",
    borderCollapse: "collapse",
    borderSpacing: 0,
}));

// Table Component
export function Table(props: TableProps) {
    const { children } = props;
    return (
        <StyledTable {...props}>
            {children}
        </StyledTable>
    )
};

export function TableBody(props: TableBodyProps) {
    const { children } = props;
    return (
        <tbody >
            {children}
        </tbody>
    )
};

// Table Head Component
export function TableHead(props: TableHeadProps) {
    const { children } = props;
    return <thead {...props}>{children}</thead>;
};

// Table Row Props
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    children: ReactNode;
    isSelected?: boolean;
    status?: "removed" | "edited" | "error";
}

const StyledTableRow = styled.tr<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    background: isSelected ? theme.background.default : "inherit",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    
    "&:hover": {
        background: isSelected
            ? theme.palette.action.selected
            : theme.palette.action.hover,
    },

    '&.row--removed': {
        background: theme.palette.mode === 'light'
            ? 'rgba(255, 102, 102, 0.3)' // Soft coral red for light mode
            : darken(0.6, 'rgba(255, 102, 102, 1)'), // Darker coral red for dark mode
    },
    '&.row--edited': {
        background: theme.palette.mode === 'light'
            ? 'rgba(245, 203, 92, 0.3)' // Soft, muted gold for light mode
            : darken(0.5, 'rgba(245, 203, 92, 1)'), // Darker muted gold for dark mode
    },
    '&.row--error': {
        background: theme.palette.mode === 'light'
            ? 'rgba(255, 102, 102, 0.3)' // Soft coral red for light mode
            : darken(0.6, 'rgba(255, 102, 102, 1)',), // Darker coral red for dark mode
    },
}));

// Table Row Component
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
    ({ children, isSelected = false, status, ...props }, ref) => {
        return (
            <StyledTableRow
                ref={ref}
                isSelected={isSelected}
                {...props}
            >
                {children}
            </StyledTableRow>
        );
    }
);

const StyledTableCell = styled.td<{ align?: string }>(
    ({ theme, align = "left" }) => ({
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        verticalAlign: "middle",
        fontSize: "0.875rem",
    })
);

// Table Cell Component
export function TableCell(props: TableCellProps) {
    const { children, align = "left", colSpan, rowSpan } = props;
    return (
        <StyledTableCell align={align} colSpan={colSpan} rowSpan={rowSpan} {...props}>
            {children}
        </StyledTableCell>
    );
};


// Sort Label Props
interface SortLabelProps {
    active: boolean;
    direction: "asc" | "desc";
    onClick?: (event: unknown) => void;
    children: React.ReactNode;
}

// Styled Sort Label
const StyledSortLabel = styled.button<{ active: boolean }>(
    ({ theme, active }) => ({
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        color: active ? theme.palette.text.primary : "inherit",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "color 0.3s ease",

        "&:hover": {
            color: theme.palette.text.primary,
        },
    })
);

// Custom Sortable Label Component
export const TableSortLabel = forwardRef<HTMLButtonElement, SortLabelProps>(
    ({ active, direction, onClick, children }, ref) => {
        return (
            <StyledSortLabel active={active} onClick={onClick} ref={ref}>
                {children}
                {active ? (
                    direction === "asc" ? <FaSortUp style={{ marginLeft: 4 }} /> : <FaSortDown style={{ marginLeft: 4 }} />
                ) : (
                    <FaSort style={{ marginLeft: 4, opacity: 0.5 }} />
                )}
            </StyledSortLabel>
        );
    }
);