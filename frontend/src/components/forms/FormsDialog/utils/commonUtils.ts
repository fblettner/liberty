/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IDialogAction, OnChangeParams } from "@ly_utils/commonUtils";
import { IRefreshDisabledColumnsParams } from "@ly_components/forms/FormsDialog/utils/dialogUtils";
import { IActionsStatus } from "@ly_types/lyActions";
import { IComponentParameters } from "@ly_types/lyComponents";

export type RefreshDisabledColumnsFunction = (params: IRefreshDisabledColumnsParams) => void
export type OnActionEndFunction = (event: IActionsStatus) => void;
export type OnAutocompleteChangeFunction =  (event: OnChangeParams) => void;
export type OnInputChangeFunction = (event: React.ChangeEvent<HTMLInputElement>) => void
export type OnCheckboxChangeFunction = (event: OnChangeParams, params: IComponentParameters | undefined) => void;
export type OnTabChangeFunction = (event: React.SyntheticEvent, newValue: string) => void;

export type OnCloseFunction = (action: IDialogAction) => void;
export type OnCancelFunction = () => void;
export type OnSaveFunction = () => void;
export type OnHelpFunction = () => void;

export type OnReserveFunction = () => void;
export type OnReleaseFunction = () => void;

