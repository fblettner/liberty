/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { useEffect } from "react";

// Custom Import
import { IAlertMessage } from "@ly_types/lyAlertMessages";
import { ESeverity } from "@ly_utils/commonUtils";
import { Collapse } from "@ly_components/common/Collapse";
import { Alert } from "@ly_components/common/Alert";


export const AlertMessage = ({open, severity, message, onClose} : IAlertMessage) => {

    useEffect(() => {
        if (open && severity !== ESeverity.error) {
            // Set a timer to automatically close the alert after 10 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            // Cleanup the timer when the component unmounts or when `open` changes
            return () => clearTimeout(timer);
        }
    }, [open, onClose]);
    
    return (
        <Collapse in={open} timeout={300}>
            <Alert
                variant={severity ?? "info"}
                onClose={onClose}
                dismissible
            >
                {message}
            </Alert>
        </Collapse>
    );
}
