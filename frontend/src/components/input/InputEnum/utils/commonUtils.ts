/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IDialogAction, OnChangeParams } from "@ly_utils/commonUtils";
import { LYComponentMode } from "@ly_types/lyComponents";

export type OnChangeFunction = (event: OnChangeParams) => void;
export type OnCloseFunction = (event: KeyboardEvent | React.MouseEvent<HTMLTableRowElement>) => void;
export type OnOpenDialogFunction = (mode: LYComponentMode) => void; 
export type onCloseDialogFunction = (action: IDialogAction) => void;

