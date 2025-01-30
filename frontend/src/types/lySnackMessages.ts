/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { ESeverity } from "@ly_utils/commonUtils";

export interface ISnackMessage {
    id: string; // Unique identifier
    message: string; // Message content
    severity:  ESeverity
    open: boolean; // Open state for the snackbar
  }