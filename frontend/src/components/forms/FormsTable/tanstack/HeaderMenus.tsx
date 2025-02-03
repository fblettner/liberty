/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Fragment, useRef, useState } from 'react';
import { t } from 'i18next';
import { Column } from '@tanstack/react-table';

// Custom Import
import { ColumnHelp } from '@ly_components/forms/FormsTable/dialogs/ColumnHelp';
import { ITableRow } from '@ly_types/lyTables';
import { IContentValue } from '@ly_utils/commonUtils';
import { LYArrowDownwardIcon, LYArrowUpwardIcon, LYAutoAwesomeIcon, LYFilterListIcon, LYGroupIcon, LYGroupOffIcon, LYHelpIcon, LYMoreVertIcon, LYPushPinIcon, LYUnfoldMoreIcon, LYViewColumnIcon, LYVisibilityOffIcon } from '@ly_styles/icons';
import { Divider } from "@ly_components/common/Divider";
import { IconButton } from '@ly_components/common/IconButton';
import { Menu, MenuItem, SubMenu } from '@ly_components/common/Menus';
import { Popper } from '@ly_components/common/Popper';
import { Paper_Popup } from '@ly_components/styles/Paper';

// Define the types for your props
interface HeaderMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  column: Column<ITableRow, IContentValue>; // Type for the column
  onSortAsc: (column: Column<ITableRow, IContentValue>) => void;
  onSortDesc: (column: Column<ITableRow, IContentValue>) => void;
  onSortClear: (column: Column<ITableRow, IContentValue>) => void;
  onPinColumn: (column: Column<ITableRow, IContentValue>, pinPosition: false | 'left' | 'right') => void;
  onAutosizeColumn: (column: Column<ITableRow, IContentValue>) => void;
  onAutosizeAllColumns: () => void;
  onGroupBy: (column: Column<ITableRow, IContentValue>) => void;
  onClearGroupBy: (column: Column<ITableRow, IContentValue>) => void;
  onFilter: (column: Column<ITableRow, IContentValue>) => void;
  onManageColumns: (column: Column<ITableRow, IContentValue>) => void;
  onHideColumn: (column: Column<ITableRow, IContentValue>) => void;
  handleOpenProperties: (columnId: string) => void
}

export const HeaderMenus = ({
  anchorEl,
  onClose,
  column,
  onSortAsc,
  onSortDesc,
  onSortClear,
  onPinColumn,
  onAutosizeColumn,
  onAutosizeAllColumns,
  onGroupBy,
  onClearGroupBy,
  onFilter,
  onManageColumns,
  onHideColumn,
  handleOpenProperties
}: HeaderMenuProps) => {

  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      placement="bottom-end"
      modal

    >
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} placement='bottom-end'>
        {(column.getIsSorted() === "desc" || !column.getIsSorted()) &&
          <MenuItem onClick={() => { onClose(); onSortAsc(column); }} startIcon={LYArrowUpwardIcon}>
            {t("button.sort_asc")}
          </MenuItem>
        }
        {(column.getIsSorted() === "asc" || !column.getIsSorted()) &&
          <MenuItem onClick={() => { onClose(); onSortDesc(column); }} startIcon={LYArrowDownwardIcon}>
            {t("button.sort_desc")}
          </MenuItem>
        }
        {!!column.getIsSorted() &&
          <MenuItem onClick={() => { onClose(); onSortClear(column); }} startIcon={LYUnfoldMoreIcon}>
            {t("button.sort_clear")}
          </MenuItem>
        }
        <Divider />
        <SubMenu label="Pin Column" startIcon={LYPushPinIcon}>
          {column.getIsPinned() &&
            <MenuItem onClick={() => { onClose(); onPinColumn(column, false); }}>
              {t("button.unpin_column")}
            </MenuItem>
          }
          {column.getIsPinned() !== 'left' &&
            <MenuItem onClick={() => { onClose(); onPinColumn(column, 'left'); }}>
              {t("button.pin_left")}
            </MenuItem>
          }
          {column.getIsPinned() !== 'right' &&
            <MenuItem onClick={() => { onClose(); onPinColumn(column, 'right'); }}>
              {t("button.pin_right")}
            </MenuItem>
          }
        </SubMenu>
        <Divider />
        <MenuItem onClick={() => { onClose(); onAutosizeColumn(column); }} startIcon={LYAutoAwesomeIcon}>
          {t("button.autosize_column")}
        </MenuItem>
        <MenuItem onClick={() => { onClose(); onAutosizeAllColumns(); }} startIcon={LYAutoAwesomeIcon}>
          {t("button.autosize_all_columns")}
        </MenuItem>
        <Divider />
        {!column.getIsGrouped() &&
          <MenuItem onClick={() => { onClose(); onGroupBy(column); }} startIcon={LYGroupIcon}>
            {t("button.group_by")}
          </MenuItem>
        }
        {column.getIsGrouped() &&
          <MenuItem onClick={() => { onClose(); onClearGroupBy(column); }} startIcon={LYGroupOffIcon}>
            {t("button.ungroup_by")}
          </MenuItem>
        }
        <Divider />
        <MenuItem onClick={() => { onClose(); onFilter(column); }} startIcon={LYFilterListIcon}>
          {t("button.filters.title")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onClose(); onHideColumn(column); }} startIcon={LYVisibilityOffIcon}>
          {t("button.hide_column")}
        </MenuItem>
        <MenuItem onClick={() => { onClose();; onManageColumns(column); }} startIcon={LYViewColumnIcon}>
          {t("button.manage_columns")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onClose(); handleOpenProperties(column.id) }} startIcon={LYHelpIcon}>
          {t("button.properties")}
        </MenuItem>
      </Menu >

    </Popper>
  );
};

