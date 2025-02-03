/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { t } from "i18next";

// Custom Import
import {  LYThumbDownOffIcon, LYThumbUpIcon } from "@ly_styles/icons";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { Dialog_Actions, Dialog_Content, Dialog_Title } from "@ly_components/styles/Dialog";
import { Button } from "@ly_components/common/Button";
import { Dialog } from "@ly_components/common/Dialog";

// Custom Import

interface IConfirmationDialog {
    open: boolean;
    title: string;
    content: string;
    onClose: () => void;
    onAccept: () => void;
    onDecline: () => void;
}

export const ConfirmationDialog = ({
    open,
    title,
    content,
    onClose,
    onAccept,
    onDecline
}: IConfirmationDialog) => {

    return (
        <Dialog open={open} onClose={onClose}>
            <Paper_Popup>
                <Dialog_Title>{title}</Dialog_Title>
                <Dialog_Content>
                    {content}
                </Dialog_Content>
                <Dialog_Actions>
                    <Button variant="outlined" onClick={onDecline} startIcon={LYThumbDownOffIcon}>
                        {t('button.no')}
                    </Button>
                    <Button variant="outlined" onClick={onAccept} startIcon={LYThumbUpIcon}>
                        {t('button.yes')}
                    </Button>
                </Dialog_Actions>
            </Paper_Popup>
        </Dialog>
    );
}
