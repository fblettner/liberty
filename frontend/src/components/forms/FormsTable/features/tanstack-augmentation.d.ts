// react-table-augmentation.d.ts
import { CellContext, Table } from '@tanstack/react-table';
import React from 'react';

declare module '@tanstack/react-table' {
  // Extend ColumnDef
  interface ColumnDef<TData, TValue> {
    accessorKey?: string;
    meta?: {
      align?: 'left' | 'right' | 'center';
    };
    rules?: string;
    rulesValues?: string;
    type: string | null;
    header: string;
    field: string;
    target?: string;
    output_params?: string;
    aggregatedCell?: (context: CellContext<ITableRow, IContentValue>) => React.ReactNode;
    cell: (context: CellContext<ITableRow, IContentValue>) => React.ReactNode;
    editCell: (params: IEditCell) => JSX.Element;
  }

  // Extend Column to use TExtendedColumnDef
  interface Column<TData extends ITableRow, TValue> {
    columnDef: ColumnDef<ITableRow, TValue>;
  }
  
}


