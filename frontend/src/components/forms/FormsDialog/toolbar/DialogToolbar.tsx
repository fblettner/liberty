/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";

// Custom Import
import { EStandardColor, IReserveStatus } from "@ly_utils/commonUtils";
import { OnCancelFunction, OnSaveFunction } from "@ly_components/forms/FormsDialog/utils/commonUtils";
import { LYCancelIcon, LYHelpIcon, LYReactIcon, LYSaveIcon } from "@ly_styles/icons";
import { Div_DialogToolbar, Div_DialogToolbarButtons, Div_DialogToolbarButtonsEnd } from "@ly_components/styles/Div";
import { Paper_DialogToolbar } from "@ly_components/styles/Paper";
import { Button } from "@ly_components/common/Button";

export interface IDialogToolbar {
    reserveStatus: IReserveStatus;
    isModified: boolean;
    onCancel: OnCancelFunction;
    onSave: OnSaveFunction;
    onHelp: OnCancelFunction
}

export const DialogToolbar = (props: IDialogToolbar) => {
    const { reserveStatus, isModified, onCancel, onSave, onHelp } = props;

    return (
        <Paper_DialogToolbar elevation={0}>
            <Div_DialogToolbar>
                <Div_DialogToolbarButtons>
                    <Button
                        disabled={false}
                        variant="outlined" // Use 'outlined' for a modern, clean look
                        startIcon={LYCancelIcon}
                        onClick={onCancel}
                        color={isModified ? EStandardColor.error : EStandardColor.primary}
                    >
                        {t('button.cancel')}
                    </Button>
                    <Button
                        disabled={reserveStatus.status || !isModified}
                        variant="outlined" // Use 'outlined' for a modern, clean look
                        startIcon={LYSaveIcon}
                        onClick={onSave}
                        color={isModified ? EStandardColor.success : EStandardColor.primary}
                    >
                        {t('button.save')}
                    </Button>
                </Div_DialogToolbarButtons>
                <Div_DialogToolbarButtonsEnd>
                    <Button
                        disabled={false}
                        variant="outlined" // Use 'outlined' for a modern, clean look
                        onClick={onHelp}
                    >
                        <LYReactIcon icon={LYHelpIcon} />
                    </Button>
                </Div_DialogToolbarButtonsEnd>
            </Div_DialogToolbar>
        </Paper_DialogToolbar>
    )
}