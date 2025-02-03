/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports
import React from "react";

// Custom Imports
import { LookupGrid } from "@ly_components/input/InputLookup/LookupGrid";
import { OnChangeFunction, OnCloseFunction } from "@ly_components/input/InputLookup/utils/commonUtils";
import { IGetLookup, ILookupOption } from "@ly_types/lyLookup";
import { getBoundingClientRectSafe } from "@ly_utils/commonUtils";
import { Popper, PopperProps } from "@ly_components/common/Popper";

export interface ILookupPopper {
    popperProps: PopperProps;
    isLoading: boolean;
    id: string;
    setSelectedOption: React.Dispatch<React.SetStateAction<ILookupOption | null>>;
    lookupState: IGetLookup;
    data: ILookupOption[];
    open: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: OnChangeFunction;
    onClose: OnCloseFunction;
}

export const LookupPopper = ({ popperProps, isLoading, id, onChange, setSelectedOption, lookupState, data, onClose, open, inputRef}: ILookupPopper) => {
    const anchorEl = popperProps.anchorEl;
    const boundingRect = getBoundingClientRectSafe(anchorEl);
    const columnWidth = boundingRect ? boundingRect.width : 0;

    if (!isLoading && open) {
        return (
            <Popper
                {...popperProps}
                style={{
                    width: Math.max(420, columnWidth + 18), 
                }}
                placement="bottom-start"
                open={open} // Control the open state of the Popper
            >
                <LookupGrid
                    isLoading={isLoading}
                    lookupState={lookupState}
                    data={data}
                    id={id}
                    onChange={onChange}
                    setSelectedOption={setSelectedOption}
                    inputRef={inputRef}
                    onClose={onClose}
                />
            </Popper>
        );
    }
    return null;
};