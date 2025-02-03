/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports

// Custom Imports
import { LYComponentMode } from '@ly_types/lyComponents';
import { LYTableInstance } from '@ly_components/forms/FormsTable/utils/tanstackUtils';
import { ITableRow, TablesGridHardCoded } from '@ly_types/lyTables';
import { LYContentCopyIcon, LYDeleteIcon, LYEditIcon, LYReactIcon, LYRestoreIcon } from '@ly_styles/icons';
import { LYIconSize } from "@ly_utils/commonUtils";
import { Div_TableToolbarButtons } from '@ly_components/styles/Div';
import { IconButton_Contrast } from '@ly_components/styles/IconButton';

interface IActionsTableProps {
  handleOpenDialog: (mode: LYComponentMode, row: ITableRow) => void;
  handleDelete: () => void;
}

interface IActionsGridProps {
  table: LYTableInstance<ITableRow>;
}

export const getActionsForTable = (params: IActionsTableProps) => {
  const { handleOpenDialog, handleDelete } = params;

  return {
    accessorKey: 'actions', // This will be your actions column
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
    enableColumnFilter: false, 
    minSize: 120,
    cell: ({ row }: { row: { original: ITableRow } }) => (
      <Div_TableToolbarButtons>
        <IconButton_Contrast size={LYIconSize.small} onClick={() => handleOpenDialog(LYComponentMode.edit, row.original)} icon={LYEditIcon} />
        <IconButton_Contrast size={LYIconSize.small} onClick={() => handleOpenDialog(LYComponentMode.copy, row.original)}  icon={LYContentCopyIcon} />
        <IconButton_Contrast size={LYIconSize.small} onClick={handleDelete} icon={LYDeleteIcon} />
      </Div_TableToolbarButtons>
    ),
    enableSorting: false, // Disable sorting for actions column if needed
  };
};


export const getActionsForGrid = (params: IActionsGridProps) => {
  const { table } = params;

  return {
    accessorKey: 'actions',
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
    enableColumnFilter: false, 
    minSize: 120,
    cell: ({ row }: { row: { original: ITableRow } }) => {
      const id = row.original[TablesGridHardCoded.row_id];

      const handleRestore = () => {
        table.restoreRow(id);
      };

      const handleDelete = () => {
        table.deleteRow(id);
      };

      return (
        <Div_TableToolbarButtons>
          <IconButton_Contrast size={LYIconSize.small} onClick={handleRestore} disabled={!table.isRowChanged(id)} icon={LYRestoreIcon} />
          <IconButton_Contrast size={LYIconSize.small} onClick={handleDelete} icon={LYDeleteIcon} />
        </Div_TableToolbarButtons>
      );
    },
    enableSorting: false,
  };
};