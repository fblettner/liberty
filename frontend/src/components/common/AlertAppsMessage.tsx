/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { useDispatch, useSelector } from 'react-redux';

// Custom Import
import { getAlertMessage, onMessageChanged } from '@ly_features/global';
import { ESeverity } from '@ly_utils/commonUtils';
import { LYCloseIcon } from '@ly_styles/icons';
import { LYIconSize } from "@ly_utils/commonUtils";
import { IconButton } from "@ly_components/common/IconButton";
import { Collapse } from '@ly_components/common/Collapse';
import { Alert } from '@ly_components/common/Alert';

export const AlertAppsMessage = () => {

    const dispatch = useDispatch();
    const alertMessage = useSelector(getAlertMessage);

    const onClose = () => {
        dispatch(onMessageChanged({ message: "", open: false }));
    }

    return (
        <Collapse in={alertMessage.open}>
            <Alert
                variant={ESeverity.error}
                onClose={onClose}
                dismissible
            >
                {alertMessage.message}
            </Alert>
        </Collapse>
    );
}
