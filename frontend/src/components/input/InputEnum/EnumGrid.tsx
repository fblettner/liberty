/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useEffect, useRef, useState } from "react";

//Custom Import
import { EEnumValues } from "@ly_types/lyEnums";
import { OnChangeFunction, OnCloseFunction } from "@ly_components/input/InputEnum/utils/commonUtils";
import { IEnumOption } from "@ly_types/lyEnums";
import { IColumnMetadata } from "@ly_types/lyQuery";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@ly_components/common/Table";
import { TableContainer, TableRow_Header, TableRow_Selected } from "@ly_components/styles/Table";
import { DefaultZIndex } from "@ly_components/types/common";
import { useDeviceDetection, useMediaQuery } from "@ly_components/common/UseMediaQuery";


export interface IEnumGrid {
    id: string;
    isLoading: boolean;
    columns: IColumnMetadata[];
    data: IEnumOption[];
    inputRef: React.RefObject<HTMLInputElement>;
    setSelectedOption: React.Dispatch<React.SetStateAction<IEnumOption | null>>;
    onChange: OnChangeFunction;
    onClose: OnCloseFunction;
}


export const EnumGrid = (props: IEnumGrid) => {
    const { id, isLoading, columns, data, setSelectedOption, onChange, onClose, inputRef } = props;
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const isMobile = useDeviceDetection();
    
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
                    onChange({ id: id, value: selectedOption[EEnumValues.value], label: selectedOption[EEnumValues.label], data: selectedOption });
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
    }, [data, selectedIndex, setSelectedOption, onChange, id]);

    useEffect(() => {
        if (selectedIndex >= 0 && rowRefs.current[selectedIndex]) {
            rowRefs.current[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [selectedIndex]);

    if (!isLoading)
        return (
            <Paper_Popup elevation={3}>
                <TableContainer style={{ maxHeight: (isMobile || isSmallScreen) ? "100%" : 325 }}>
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
                                    }}>
                                    {columns.filter((item: IColumnMetadata) => item.field === EEnumValues.value)[0]["header"]}
                                </TableCell>
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
                                    {columns.filter((item: IColumnMetadata) => item.field === EEnumValues.label)[0]["header"]}
                                </TableCell>
                            </TableRow_Header>
                        </TableHead>
                        <TableBody>
                            {data.map((option: IEnumOption, optionIndex: number) => (
                                <TableRow_Selected
                                    key={optionIndex}
                                    id={id}
                                    ref={(el) => (rowRefs.current[optionIndex] = el)}
                                    isSelected={selectedIndex === optionIndex}
                                    onMouseDown={(event) => {
                                        setSelectedOption(option);
                                        if (typeof (onChange) === "function")
                                            onChange({ id: id, value: option[EEnumValues.value], label: option[EEnumValues.label], data: option });
                                        onClose(event);
                                    }}>
                                    <TableCell>
                                        {option[EEnumValues.value]}</TableCell>
                                    <TableCell>
                                        {option[EEnumValues.label]}</TableCell>
                                </TableRow_Selected>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper_Popup>
        )
}