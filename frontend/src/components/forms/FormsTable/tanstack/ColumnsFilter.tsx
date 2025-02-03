/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { useState, useEffect, useMemo } from 'react';
import { Column } from '@tanstack/react-table';
import dayjs from 'dayjs';

// Custom Import
import { IFilterState } from '@ly_components/forms/FormsTable/utils/columnsUtils';
import { EDictionaryRules, EDictionaryType } from '@ly_types/lyDictionary';
import { InputEnum } from '@ly_components/input/InputEnum/InputEnum';
import { Button } from "@ly_components/common/Button";
import { t } from 'i18next';
import { LYTableInstance } from '@ly_components/forms/FormsTable/utils/tanstackUtils';
import { IContentValue } from '@ly_utils/commonUtils';
import { ITableRow } from '@ly_types/lyTables';
import { LYAddIcon, LYClearIcon, LYDeleteIcon, LYReactIcon } from '@ly_styles/icons';
import { LYIconSize } from "@ly_utils/commonUtils";
import { Div_ColumnsFilter, Div_TableFilters } from '@ly_components/styles/Div';
import { Input } from '@ly_components/common/Input';
import { Select } from '@ly_components/common/Select';
import { Popper } from '@ly_components/common/Popper';
import { Paper_Popup } from '@ly_components/styles/Paper';
import { DatePicker } from '@ly_components/input/InputDate';
import { IconButton } from '@ly_components/common/IconButton';
import { GridContainer, GridFlexContainer, GridItem } from '@ly_components/common/Grid';

// Define operators
const stringOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
];

const booleanOperators = [
    { value: 'is', label: 'Is' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
];

const enumOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
];


const dateOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater', label: 'Greater' },
    { value: 'less', label: 'Less' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
];

const numberOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater', label: 'Greater' },
    { value: 'less', label: 'Less' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
];

interface IColumnsFilter {
    table: LYTableInstance<ITableRow>;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    openFilters: IFilterState;
}

export const ColumnsFilter = (params: IColumnsFilter) => {
    const { table, anchorEl, onClose, openFilters } = params;
    interface IFilter {
        column: Column<ITableRow, IContentValue> | null;
        operator: string;
        operators: Array<{ value: string; label: string }>;
        value: IContentValue;
        type: string | null;
    }

    const [filters, setFilters] = useState<IFilter[]>([]);

    const columns = useMemo(() => table.getAllLeafColumns().filter(col => col.getCanFilter()), [table]);
    const columnOptions = useMemo(() =>
        columns.map((col) => ({
            value: col.id, // Use the column ID as the value
            label: col.columnDef.header?.toString() || "", // Use the column header as the label
        })),
        [columns]
    );

    useEffect(() => {
        const existingFilters = table.getState().columnFilters || [];
        let defaultOp: string = 'contains';
        let selectOp = stringOperators;
        let defaultType = null;
        if (openFilters.selectedColumn !== null) {
            defaultType = openFilters.selectedColumn.columnDef.type;
            const columnRules = openFilters.selectedColumn.columnDef.rules;
            if (columnRules === EDictionaryRules.enum) {
                defaultOp = 'equals';
                selectOp = enumOperators;
            } else
                switch (defaultType) {
                    case EDictionaryType.boolean:
                        defaultOp = 'is';
                        selectOp = booleanOperators;
                        break;
                    case EDictionaryType.date:
                    case EDictionaryType.jdedate:
                        defaultOp = 'equals';
                        selectOp = dateOperators;
                        break;
                    case EDictionaryType.number:
                        defaultOp = 'equals';
                        selectOp = numberOperators;
                        break;
                    default:
                        defaultOp = 'contains';
                        selectOp = stringOperators;
                }
        }

        if (existingFilters.length > 0) {
            const initializedFilters = existingFilters.map((filter) => {
                const column = columns.find(col => col.id === filter.id);
                const columnType = column ? column.columnDef.type : 'string';
                const columnRules = column ? column.columnDef.rules : null;
                const operators = getOperatorsByTypeOrRules(defaultType as string, columnRules as EDictionaryRules);
                return {
                    column: column || null,
                    operator: (filter.value as { operator: string }).operator || defaultOp,
                    operators,
                    value: (filter.value as { operator: string, value: IContentValue }).value || null,
                    type: columnType
                };
            });

            if (openFilters.selectedColumn !== null) {
                initializedFilters.push({ column: openFilters.selectedColumn, operator: defaultOp, operators: selectOp, value: null, type: defaultType });
            }
            setFilters(initializedFilters);
        } else {
            // Add a default empty filter row if no filters exist
            setFilters([{ column: openFilters.selectedColumn, operator: defaultOp, operators: selectOp, value: null, type: defaultType }]);
        }
    }, [table, columns]);

    const getOperatorsByTypeOrRules = (type: string | null, rules: EDictionaryRules) => {
        if (rules === EDictionaryRules.enum) {
            return enumOperators;
        } else
            switch (type) {
                case EDictionaryType.boolean:
                    return booleanOperators;
                case EDictionaryType.date:
                case EDictionaryType.jdedate:
                    return dateOperators;
                case EDictionaryType.number:
                    return numberOperators;
                default:
                    return stringOperators;
            }
    };

    const handleSelectColumn = (index: number) => (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        const column = columns.find(col => col.id === option.value);
        const updatedFilters = [...filters];
        const columnType = column ? column.columnDef.type : 'string';
        const columnRules = column ? column.columnDef.rules : null;

        updatedFilters[index] = {
            ...updatedFilters[index],
            column: column || null,
            operator: column ? getOperatorsByTypeOrRules(columnType, columnRules as EDictionaryRules)[0].value : '',
            operators: getOperatorsByTypeOrRules(columnType, columnRules as EDictionaryRules),
            type: columnType
        };
        setFilters(updatedFilters);
    };

    const handleOperatorChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        const updatedFilters = [...filters];
        updatedFilters[index].operator = option === null ? "" : option.value;
        setFilters(updatedFilters);
        table.setColumnFilters(
            updatedFilters.map((f) => ({
                id: f.column?.id || "",
                value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
            }))
        );
    };

    const handleBooleanChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        const updatedFilters = [...filters];
        updatedFilters[index].value = option === null ? null : option.value === 'true';
        setFilters(updatedFilters);

        // Automatically apply the filter when value is set
        if (updatedFilters[index].column) {
            table.setColumnFilters(
                updatedFilters.map((f) => ({
                    id: f.column?.id || "",
                    value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
                }))
            );
        }
    };

    const handleDateChange = (index: number) => (value: string | null) => {
        const updatedFilters = [...filters];
        updatedFilters[index].value = value;
        setFilters(updatedFilters);
        // Automatically apply the filter when value is set
        if (updatedFilters[index].column) {
            table.setColumnFilters(
                updatedFilters.map((f) => ({
                    id: f.column?.id || "",
                    value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
                }))
            );
        }
    };

    const handleEnumChange = (index: number) => (value: IContentValue) => {
        const updatedFilters = [...filters];
        updatedFilters[index].value = value;
        setFilters(updatedFilters);
        // Automatically apply the filter when value is set
        if (updatedFilters[index].column) {
            table.setColumnFilters(
                updatedFilters.map((f) => ({
                    id: (f.column?.id?.replace("_LABEL", "") || ""),
                    value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
                }))
            );
        }
    };

    const handleFilterValueChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const updatedFilters = [...filters];
        updatedFilters[index].value = event.target.value;
        setFilters(updatedFilters);
        // Automatically apply the filter when value is set
        if (updatedFilters[index].column && updatedFilters[index].value) {
            table.setColumnFilters(
                updatedFilters.map((f) => ({
                    id: f.column?.id || "",
                    value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
                }))
            );
        }
    };

    const handleNumberChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const updatedFilters = [...filters];
        const numericValue = event.target.value === '' ? null : Number(event.target.value); // Convert to number or set to null if empty

        updatedFilters[index].value = numericValue;
        setFilters(updatedFilters);

        // Automatically apply the filter when value is set
        if (updatedFilters[index].column && updatedFilters[index].value) {
            table.setColumnFilters(
                updatedFilters.map((f) => ({
                    id: f.column?.id || "",
                    value: { operator: f.operator, value: f.value, type: f.type }, // Store both operator and value in the filter object
                }))
            );
        }
    };

    const addFilter = () => {
        setFilters([...filters, { column: null, operator: '', operators: stringOperators, value: null, type: null }]);
    };

    const clearFilters = () => {
        table.resetColumnFilters();
        setFilters([{ column: null, operator: '', operators: stringOperators, value: null, type: null }]);
    };

    const removeFilter = (index: number) => () => {
        const updatedFilters = filters.filter((_, i) => i !== index);
        setFilters(updatedFilters.length > 0 ? updatedFilters : [{ column: null, operator: 'contains', operators: stringOperators, value: '', type: null }]);

        // Update the grid filters after removing a filter line
        table.setColumnFilters(
            updatedFilters.length > 0
                ? updatedFilters.map((f) => ({
                    id: f.column?.id || "",
                    value: { operator: f.operator, value: f.value }, // Store both operator and value in the filter object
                }))
                : [] // Clear filters if no filters remain
        );
    };

    // Determine if the "Add Filter" button should be enabled
    const isAddFilterEnabled = filters.some(f => f.column && f.value);

    return (
        <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            modal
            placement='bottom-start'
            style={{
                width: "600px", // Use column width if larger than minWidth (300)
            }}
        >
            <Paper_Popup>
                <Div_ColumnsFilter>
                    {/* Dynamically render filter rows */}
                    {filters.map((filter, index) => (
                        <GridFlexContainer spacing={2} key={index} style={{ marginBottom: '8px' }}>
                            {/* Remove filter button */}
                            <GridItem size={1} style={{
                                display: "flex",
                                alignItems: "center", // Align to the baseline of the TextField
                                justifyContent: "center", // Center align horizontally
                            }}>
                                <IconButton
                                    onClick={removeFilter(index)}
                                    disabled={!filter.column}
                                    icon={LYClearIcon}
                                    size={LYIconSize.medium}
                                >
                                </IconButton>
                            </GridItem>

                            {/* Column selector */}
                            <GridItem size={4}>
                                <Select
                                    label="Column"
                                    id={`select-${index}`}
                                    value={filter.column?.id || ''}
                                    onChange={handleSelectColumn(index)}
                                    variant='standard'
                                    disablePortal={true}
                                    options={columnOptions}
                                    fullWidth
                                    showClearButton={false}
                                    selectOnly
                                />
                            </GridItem>

                            {/* Operator selector */}
                            <GridItem size={3} >
                                <Select
                                    label="operator"
                                    id={`operator-${index}`}
                                    value={filter.operator}
                                    onChange={handleOperatorChange(index)}
                                    variant='standard'
                                    options={filter.operators}
                                    disablePortal={false}
                                    fullWidth
                                    disabled={!filter.column}
                                    showClearButton={false}
                                    selectOnly
                                />
                            </GridItem>

                            {/* Value input */}
                            {filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty' ? null : (
                            <GridItem size={4}>
                                {filter.column?.columnDef
                                    && filter.column.columnDef.rules === EDictionaryRules.enum
                                    ? (
                                        <InputEnum
                                            id={`input-${index}-${filter.column.id}`} // Add a unique id based on row and column
                                            key={filter.column.columnDef.target ?? filter.column.columnDef.field}
                                            enumID={parseInt(filter.column.columnDef.rulesValues as string)}
                                            label={filter.column.columnDef.header as string}
                                            defaultValue={filter.value as string ?? ""}
                                            disabled={false}
                                            variant="standard"
                                            onChange={(e) => handleEnumChange(index)(e.value)}
                                            freeSolo={false}
                                            searchByLabel={false}
                                            hideButton={true}
                                        />
                                    ) : filter.column?.columnDef && filter.column.columnDef.type === EDictionaryType.boolean ? (
                                        <Select
                                            label="Value"
                                            id={`input-${index}-${filter.column.id}`} // Add a unique id based on row and column
                                            value={filter.value === null || filter.value === undefined ? '' : filter.value ? 'true' : 'false'}
                                            onChange={handleBooleanChange(index)}
                                            variant='standard'
                                            options={[{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }]}
                                            fullWidth
                                        />
                                    ) : filter.column?.columnDef && filter.column.columnDef.type === EDictionaryType.number ? (
                                        <Input
                                            id={`input-${index}-${filter.column.id}`} // Add a unique id based on row and column
                                            label="Value"
                                            type="number"
                                            value={filter.value as number ?? ''}
                                            onChange={handleNumberChange(index)}
                                            fullWidth
                                            variant="standard"
                                        />
                                    ) : filter.column?.columnDef
                                        && (filter.column.columnDef.type === EDictionaryType.date
                                            || filter.column.columnDef.type === EDictionaryType.jdedate)
                                        ? (
                                            <DatePicker
                                                id={`input-${index}-${filter.column.id}`}
                                                // Initialize the picker with the current cell value
                                                label="Value"
                                                value={filter.value ? dayjs(filter.value as Date) : null}
                                                onChange={(newValue) => {
                                                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                                                    handleDateChange(index)(formattedDate);
                                                }}
                                            />
                                        ) : (
                                            <Input
                                                id={`input-${index}-${filter.column?.id}`} // Add a unique id based on row and column
                                                label="Value"
                                                value={filter.value as string ?? ''}
                                                onChange={handleFilterValueChange(index)}
                                                fullWidth
                                                variant="standard"
                                            />
                                        )}
                            </GridItem>
                            )}
                        </GridFlexContainer>
                    ))}

                    {/* Buttons */}
                    <Div_TableFilters>
                        <Button
                            variant="outlined"
                            startIcon={LYAddIcon}
                            onClick={addFilter}
                            disabled={!isAddFilterEnabled}
                        >
                            {t("button.filters.add")}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={LYDeleteIcon}
                            onClick={clearFilters}
                        >
                            {t("button.filters.remove_all")}
                        </Button>
                    </Div_TableFilters>
                </Div_ColumnsFilter>
            </Paper_Popup>
        </Popper>
    );
};                                       