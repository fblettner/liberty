/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Fragment, useEffect, useState } from 'react';

// Custom Import
import { Checkbox } from '@ly_components/common/Checkbox';

interface ICheckboxProps  {
    id: string,
    label: string,
    onChange: Function,
    defaultValue: boolean,
    disabled?: boolean,
};

export const InputCheckbox = (props: ICheckboxProps) => {
    const [checked, setChecked] = useState(props.defaultValue);

    useEffect(() => {
    }, [ props.defaultValue]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        props.onChange({ id: props.id, value: event.target.checked });
    };

    return (
        <Fragment>
            <Checkbox 
                id={props.id} 
                checked={checked} 
                onChange={handleChange} 
                label={props.label}
                disabled={props.disabled}
                labelPlacement="end"
                />
        </Fragment>
    );
}


