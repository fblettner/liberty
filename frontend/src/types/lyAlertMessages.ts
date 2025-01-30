/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { ESeverity } from "@ly_utils/commonUtils";

export interface IAlertMessage {
    open: boolean;
    severity?: ESeverity;
    message: string;
    onClose: () => void;
}


export interface IAlertAppsMessage {
    open: boolean;
    message: string;
}