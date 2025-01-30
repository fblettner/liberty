/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { TableCell, TableRow } from '@ly_components/common/Table';
import { LYTableInstance } from '@ly_components/forms/FormsTable/utils/tanstackUtils';
import { Div } from '@ly_components/styles/Div';
import { DefaultZIndex } from '@ly_components/types/common';
import { ITableRow } from '@ly_types/lyTables';
import { Cell } from '@tanstack/react-table';

export const TableContainer = styled(Div)(({ theme }) => ({
  width: "100%",
  overflowX: "auto", // Enable horizontal scrolling
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px",
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
}));

export const TableRow_Header = styled(TableRow)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.primary.main,
  "&:hover": {
    background: theme.palette.background.default,
},
}));

export const TableCell_HeaderCheckbox = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  left: 0,
  zIndex: DefaultZIndex.Component + 10,
  width: '48px',                
  textAlign: 'center',         
  alignItems: 'center',      
  backgroundColor: theme.palette.background.paper, 
  borderRight: `1px solid ${theme.palette.divider}`,
  paddingTop: '12px',
  paddingBottom: '12px',
}));

export const TableCell_Checkbox = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  width: '48px',                
  textAlign: 'center',         
  alignItems: 'center',     
  backgroundColor: theme.palette.background.paper, 
  borderRight: `1px solid ${theme.palette.divider}`,
  paddingTop: '6px',
  paddingBottom: '6px',
}));

interface StyledTableRowProps {
  isSelected: boolean;
}

export const TableRow_Selected = styled(TableRow)<StyledTableRowProps>(({ theme, isSelected }) => ({
  cursor: "pointer",
  background: isSelected
    ? theme.background.default
    : "inherit",
  '&:hover': {
    background: theme.background.default,
    color: theme.color.default,
  },
}));


interface StyledTableCellProps {
  table: LYTableInstance<ITableRow>;
  cell: Cell<ITableRow, unknown>
}

export const TableCell_Tanstack = styled(TableCell)<StyledTableCellProps>(({ theme, table, cell }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  paddingTop: table.getState().density === 'sm' ? '6px' : table.getState().density === 'md' ? '12px' : '16px',
  paddingBottom: table.getState().density === 'sm' ? '6px' : table.getState().density === 'md' ? '12px' : '16px',
  paddingLeft: '10px',
  paddingRight: '10px',
  textAlign: cell.column.columnDef.meta?.align || 'left',
  width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
  fontSize: '14px',
}));    