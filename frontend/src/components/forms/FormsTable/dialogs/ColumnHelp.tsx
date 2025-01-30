/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";
import { useCallback } from "react";

// Custom Import
import { Button } from "@ly_components/common/Button";
import { Column } from "@tanstack/react-table";
import { IContentValue } from "@ly_utils/commonUtils";
import { ITableRow } from "@ly_types/lyTables";
import { LYCancelIcon, LYReactIcon } from "@ly_styles/icons";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { Dialog_Actions, Dialog_Content, Dialog_Title } from "@ly_components/styles/Dialog";
import { Dialog } from "@ly_components/common/Dialog";
import { List, ListItem, ListItemText } from "@ly_components/common/List";

export interface IColumnHelp {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    column: Column<ITableRow, IContentValue>;
}

export const ColumnHelp = (params: IColumnHelp) => {
    const { open, setOpen, column } = params;

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    
    return (
        <Dialog open={open} onClose={handleClose}>
            <Paper_Popup>
                <Dialog_Title>{t("columns.help")}</Dialog_Title>
                <Dialog_Content>
                    <List padding={false}>
                        <ListItem>
                            <ListItemText primary={`${t('columns.name')}${column.columnDef.header}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('columns.dictionary')}${column.columnDef.field}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('columns.target')}${column.columnDef.target}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('columns.type')}${column.columnDef.type}`} />
                        </ListItem>                        
                        <ListItem>
                            <ListItemText primary={`${t('columns.rules')}${column.columnDef.rules}`} />
                        </ListItem>   
                        <ListItem>
                            <ListItemText primary={`${t('columns.rulesValues')}${column.columnDef.rulesValues}`} />
                        </ListItem> 
                    </List>
                </Dialog_Content>
                <Dialog_Actions>
                    <Button variant="outlined" onClick={handleClose} startIcon={LYCancelIcon} >
                        {t('button.close')}
                    </Button>
                </Dialog_Actions>
            </Paper_Popup>
        </Dialog>

    )
}