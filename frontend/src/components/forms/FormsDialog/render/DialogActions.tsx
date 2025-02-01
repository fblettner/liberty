/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import
// Import MUI
// Import Custom
import { CDialogContent, EDialogDetails, IDialogDetails } from '@ly_types/lyDialogs';
import { InputAction } from '@ly_components/input/InputAction';
import { ActionsType, IReserveStatus } from "@ly_utils/commonUtils";
import { ComponentProperties } from '@ly_types/lyComponents';
import { OnActionEndFunction } from '@ly_components/forms/FormsDialog/utils/commonUtils';

interface IDialogActions {
    item: IDialogDetails;
    dialogContent: CDialogContent;
    componentContent: CDialogContent
    reserveStatus: IReserveStatus;
    component: ComponentProperties
    onActionEnd: OnActionEndFunction;
}


export const DialogActions = ({ item, dialogContent, reserveStatus, component, componentContent, onActionEnd }: IDialogActions) => {
    return (
        <InputAction
            id={item[EDialogDetails.componentID]}
            actionID={item[EDialogDetails.componentID]}
            type={ActionsType.button}
            dialogContent={dialogContent}
            dynamic_params={item[EDialogDetails.dynamic_params]}
            fixed_params={item[EDialogDetails.fixed_params]}
            label={item[EDialogDetails.label]}
            status={onActionEnd}
            disabled={componentContent.fields[item[EDialogDetails.id]][EDialogDetails.disabled] || reserveStatus.status}
            overrideQueryPool={(item[EDialogDetails.pool_params] === null)
                ? undefined
                : (dialogContent.fields[item[EDialogDetails.pool_params]] !== undefined)
                    ? dialogContent.fields[item[EDialogDetails.pool_params]].value as string
                    : item[EDialogDetails.pool_params]}
            component={component}
        />
    )

}