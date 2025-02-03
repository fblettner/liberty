/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from "react";

// Custom Import
import { IGetLookup, ELookup, ILookupOption } from "@ly_types/lyLookup";
import { OnChangeFunction, OnCloseFunction } from "@ly_components/input/InputLookup/utils/commonUtils";
import { IColumnMetadata } from "@ly_types/lyQuery";
import { Typography } from "@ly_components/common/Typography";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { TableContainer, TableRow_Header, TableRow_Selected } from "@ly_components/styles/Table";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@ly_components/common/Table";
import { DefaultZIndex } from "@ly_components/types/common";


export interface ILookupGrid {
    isLoading: boolean;
    id: string;
    lookupState: IGetLookup;
    data: ILookupOption[];
    setSelectedOption: React.Dispatch<React.SetStateAction<ILookupOption | null>>;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: OnChangeFunction;
    onClose: OnCloseFunction;
}

export const LookupGrid = ({ isLoading, id, onChange, setSelectedOption, lookupState, data, onClose, inputRef }: ILookupGrid) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowDown") {
                setSelectedIndex((prevIndex) => (prevIndex + 1) % data.length);
            } else if (event.key === "ArrowUp") {
                setSelectedIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
            } else if (event.key === "Enter" && selectedIndex >= 0) {
                const selectedOption = data[selectedIndex];
                setSelectedOption(selectedOption);
                if (typeof onChange === "function") {
                    onChange({
                        id: id,
                        value: selectedOption[lookupState.header[ELookup.dd_id] as keyof ILookupOption],
                        label: selectedOption[lookupState.header[ELookup.dd_label] as keyof ILookupOption],
                        data: selectedOption

                    });
                }
                onClose(event); // Close the Popper when a value is selected
            }
        };

        const currentInput = inputRef.current;
        if (currentInput) {
            // Attach keydown event only when the input is focused
            currentInput.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            if (currentInput) {
                currentInput.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [data, selectedIndex, setSelectedOption, onChange, id, lookupState.header, onClose]);

    useEffect(() => {
        if (selectedIndex >= 0 && rowRefs.current[selectedIndex]) {
            rowRefs.current[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [selectedIndex]);

    if (!isLoading) {
        const groupedData = data.reduce<Record<string, ILookupOption[]>>((acc, option) => {
            const group = option[lookupState.header[ELookup.dd_group] as keyof ILookupOption]; // Retrieve the group

            // Use "undefined" as group if the group field is missing or empty
            const groupKey = group === undefined ? "undefined" : group.toString();

            // Initialize the group in the accumulator if not already present
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }

            // Add option to the group array if the length is less than 500
            if (acc[groupKey].length < 500) {
                acc[groupKey].push(option);
            }

            return acc;
        }, {});

        return (
            <Paper_Popup elevation={3}>
                <TableContainer style={{ maxHeight: 325 }}>
                    {lookupState.header !== undefined && lookupState.columns.length > 0 && (
                        <Table>
                            <TableHead>
                                <TableRow_Header>
                                    <TableCell
                                        style={{
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: DefaultZIndex.Component,
                                            background: "inherit",
                                            height: '48px',
                                            paddingRight: '12px',
                                            paddingTop: '0px',
                                            paddingBottom: '0px',
                                        }}
                                    >{lookupState.columns.filter((item: IColumnMetadata) => item.field === lookupState.header[ELookup.dd_id])[0]["header"]}</TableCell>
                                    {lookupState.header[ELookup.dd_label] !== null && (
                                        <TableCell
                                            style={{
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: DefaultZIndex.Component,
                                                background: "inherit",
                                                height: '48px',
                                                paddingRight: '12px',
                                                paddingTop: '0px',
                                                paddingBottom: '0px',
                                            }}>
                                            {lookupState.columns.filter((item: IColumnMetadata) => item.field === lookupState.header[ELookup.dd_label])[0]["header"]}</TableCell>
                                    )}
                                </TableRow_Header>
                            </TableHead>
                            <TableBody>
                                {Object.keys(groupedData).map((group, groupIndex) => (
                                    <Fragment key={groupIndex}>
                                        {group !== "undefined" && (
                                            <TableRow>
                                                <TableCell colSpan={2}>
                                                    <Typography variant="subtitle1" >
                                                        {group}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {groupedData[group].map((option: ILookupOption, optionIndex: number) => (
                                            <TableRow_Selected
                                                key={optionIndex}
                                                id={id}
                                                ref={(el) => (rowRefs.current[optionIndex] = el)}
                                                isSelected={selectedIndex === optionIndex}
                                                onMouseDown={(event) => {
                                                    setSelectedOption(option);
                                                    if (typeof onChange === "function") {
                                                        onChange({
                                                            id: id,
                                                            value: option[lookupState.header[ELookup.dd_id] as keyof ILookupOption],
                                                            label: option[lookupState.header[ELookup.dd_label] as keyof ILookupOption],
                                                            data: option
                                                        });
                                                    }
                                                    onClose(event); // Close the Popper when a value is selected
                                                }}
                                            >
                                                <TableCell>
                                                    {option[lookupState.header[ELookup.dd_id] as keyof ILookupOption]}
                                                </TableCell>
                                                {lookupState.header[ELookup.dd_label] !== null && (
                                                    <TableCell>
                                                        {option[lookupState.header[ELookup.dd_label] as keyof ILookupOption]}
                                                    </TableCell>
                                                )}
                                            </TableRow_Selected>
                                        ))}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Paper_Popup>
        );
    }
    return null;
};