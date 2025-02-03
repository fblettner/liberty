/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment, useState } from 'react';

// MUI Import

// Custom Import
import { ESessionMode } from '@ly_types/lyApplications';
import { EnumInput } from '@ly_components/input/InputEnum/EnumInput';
import { AlertMessage } from '@ly_components/common/AlertMessage';
import { OnChangeFunction } from '@ly_components/input/InputEnum/utils/commonUtils';
import { ITransformedObject } from '@ly_components/forms/FormsTable/utils/commonUtils';
import { IErrorState } from "@ly_utils/commonUtils";
import { IColumnsFilter } from "@ly_types/lyFilters";
import { TextFieldVariants } from '@ly_components/types/common';


export interface IInputEnumProps {
    id: string;
    enumID: number;
    label: string;
    defaultValue: string;
    disabled: boolean;
    variant: TextFieldVariants | undefined;
    freeSolo: boolean;
    searchByLabel: boolean
    data?: IColumnsFilter | ITransformedObject;
    dynamic_params?: string;
    fixed_params?: string;
    sessionMode?: ESessionMode;
    overrideQueryPool?: string;
    callFromTable?: boolean;
    hideButton?: boolean;
    onChange: OnChangeFunction;
}

export const InputEnum = (props: IInputEnumProps) => {
    const { id, enumID, label, defaultValue, onChange, disabled, variant, freeSolo, searchByLabel,data, dynamic_params, fixed_params, sessionMode, overrideQueryPool, callFromTable, hideButton } = props;
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });

    const onCloseError = () => {
        setErrorState({ open: false, message: '' });
    }

    return (
        <Fragment>
            {errorState.open &&
                <AlertMessage
                    open={errorState.open}
                    severity={errorState.severity}
                    message={errorState.message}
                    onClose={onCloseError}
                />
            }
            <EnumInput
                id={id}
                label={label}
                enumID={enumID}
                defaultValue={defaultValue}
                onChange={onChange}
                disabled={disabled}
                variant={variant}
                freeSolo={freeSolo}
                data={data}
                searchByLabel={searchByLabel}
                dynamic_params={dynamic_params}
                fixed_params={fixed_params}
                sessionMode={sessionMode}
                overrideQueryPool={overrideQueryPool}
                callFromTable={callFromTable}
                hideButton={hideButton}
                setErrorState={setErrorState}
            />
        </Fragment>
    );
};



