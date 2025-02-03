/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { useCallback } from "react";

// Custom Import
import { ComponentProperties, LYComponentMode } from "@ly_types/lyComponents";
import { IContextMenus, EContextMenus } from "@ly_types/lyContextual";
import { ETableHeader, ITableHeader } from "@ly_types/lyTables";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IconType } from "react-icons/lib";
import { LYReactIcon } from "@ly_styles/icons";
import { Divider } from "@ly_components/common/Divider";
import { Menu, MenuItem } from "@ly_components/common/Menus";
import { AnchorPosition } from "@ly_components/types/common";
import { Popper } from "@ly_components/common/Popper";

interface IDefaultItem {
    text: string;
    icon: IconType;  // Icon is optional
    handler: () => void;        // Function to handle the click
}

// Custom Import
interface ITableContextMenus {
    contextMenuState: {
        open: boolean;
        anchorEl: AnchorPosition | undefined;
    };
    componentProperties: ComponentProperties;
    tableProperties: ITableHeader;
    defaultMenus: IDefaultItem[];
    readonly: boolean;
    tableState: ITableState
    onContextMenuClose: () => void
    onMenuItemClick: (componentID: number) => void
    onMenuDefaultItemClick: (handler: () => void) => void
}

export const TableContextMenus = (params: ITableContextMenus) => {
    const { contextMenuState, componentProperties, tableProperties: tableProperties, defaultMenus, readonly, tableState, onContextMenuClose, onMenuItemClick, onMenuDefaultItemClick } = params;

    const displayDefault = tableProperties[ETableHeader.editable]
        && componentProperties.componentMode !== LYComponentMode.search
        && !readonly && !tableState.tableEdit.editMode
        && tableProperties[ETableHeader.formID] !== null
        && tableProperties[ETableHeader.formID] !== undefined;


    return (
        <Popper
            open={contextMenuState.open}
            onClose={onContextMenuClose}
            placement="bottom-end"
            modal
        >
            <Menu
                open={contextMenuState.open}
                onClose={onContextMenuClose}
                preventBrowserContextMenu
                anchorPosition={contextMenuState.anchorEl}
            >
                {componentProperties.componentMode !== LYComponentMode.search &&
                    !tableState.tableEdit.editMode &&
                    tableProperties[ETableHeader.contextMenusID].map((contextMenuItem: IContextMenus) => (
                        <MenuItem key={contextMenuItem[EContextMenus.id]} onClick={() => onMenuItemClick(contextMenuItem[EContextMenus.componentID])} >{contextMenuItem[EContextMenus.label]}</MenuItem>
                    ))
                }
                {tableProperties[ETableHeader.editable] && !tableState.tableEdit.editMode &&
                    <Divider />
                }
                {displayDefault &&
                    defaultMenus.map((item, index) => (
                        <MenuItem key={index} onClick={() => onMenuDefaultItemClick(item.handler)}>
                            <LYReactIcon icon={item.icon} className="menu-item-icon" />
                            {item.text}
                        </MenuItem>
                    ))
                }
            </Menu>
        </Popper>

    )
}