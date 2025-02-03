/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
// Custom Import
import { EExportType } from "@ly_utils/commonUtils";
import { Popper } from "@ly_components/common/Popper";
import { Menu, MenuItem } from "@ly_components/common/Menus";
import { LYCSVIcon, LYExcelIcon, LYPDFIcon, LYReactIcon } from "@ly_styles/icons";
import { ListItemIcon, ListItemText } from "@ly_components/common/List";

interface IOpenExport {
    anchorEl: HTMLElement | null;
    open: boolean;
}

export interface IToolbarExport {
    openExport: {
        anchorEl: HTMLElement | null;
        open: boolean;
    };
    onClose: () => void;
    openExportDialog: (exportType: EExportType) => void;
}

export const ToolbarExport = (params: IToolbarExport) => {
    const { openExport, onClose, openExportDialog } = params;

    


    return (
            <Popper
                open={openExport.open}
                anchorEl={openExport.anchorEl}
                onClose={onClose}
                placement="bottom-end"
                modal
            >
                <Menu
                    open={openExport.open}
                    anchorEl={openExport.anchorEl}
                    onClose={onClose}
                    placement="top-start"
                >
                    <MenuItem onClick={() => openExportDialog(EExportType.excel)} >
                        <ListItemIcon>
                            <LYReactIcon icon={LYExcelIcon} />
                        </ListItemIcon>
                        <ListItemText primary="Export Excel" />
                    </MenuItem>
                    <MenuItem onClick={() => openExportDialog(EExportType.pdf)} >
                        <ListItemIcon>
                            <LYReactIcon icon={LYPDFIcon} />
                        </ListItemIcon>
                        <ListItemText primary="Export PDF" />
                    </MenuItem>
                    <MenuItem onClick={() => openExportDialog(EExportType.csv)} >
                        <ListItemIcon>
                            <LYReactIcon icon={LYCSVIcon} />
                        </ListItemIcon>
                        <ListItemText primary="Export CSV" />
                    </MenuItem>
                </Menu>
            </Popper>
    )
}


