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
import { ComponentProperties } from "@ly_types/lyComponents";
import { EDialogHeader, IDialogHeader } from "@ly_types/lyDialogs";
import { ETableHeader } from "@ly_types/lyTables";
import { LYCancelIcon, LYReactIcon } from "@ly_styles/icons";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { Dialog_Actions, Dialog_Content, Dialog_Title } from "@ly_components/styles/Dialog";
import { Dialog } from "@ly_components/common/Dialog";
import { List, ListItem, ListItemText } from "@ly_components/common/List";

export interface IDialogHelp {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    componentProperties: ComponentProperties;
    dialogHeaderRef: React.MutableRefObject<IDialogHeader>;
}

export const DialogHelp = (props: IDialogHelp) => {
    const { open, setOpen, componentProperties, dialogHeaderRef } = props;

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog open={open} onClose={handleClose}>
            <Paper_Popup>
                <Dialog_Title>{t("dialogs.help")}</Dialog_Title>
                <Dialog_Content>
                    <List padding={false}>
                        <ListItem>
                            <ListItemText primary={`${t('dialogs.component')}${componentProperties.type}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('dialogs.id')}${componentProperties.id}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('dialogs.mode')}${componentProperties.componentMode}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('tables.id')}${componentProperties.tableProperties?.[ETableHeader.id]}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('tables.description')}${componentProperties.tableProperties?.[ETableHeader.description]}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={`${t('tables.query')}${dialogHeaderRef.current[EDialogHeader.queryID]}`} />
                        </ListItem>
                    </List>
                </Dialog_Content>
                <Dialog_Actions>
                    <Button 
                        variant="outlined" 
                        onClick={handleClose} 
                        startIcon={LYCancelIcon}
                        >
                        {t('button.close')}
                    </Button>
                </Dialog_Actions>
            </Paper_Popup>
        </Dialog>

    )
}