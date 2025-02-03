/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { CellContext, filterFns, FilterMeta, Row } from "@tanstack/react-table";

// Custom Import
import { InputEnum } from "@ly_components/input/InputEnum/InputEnum";
import { InputLookup } from "@ly_components/input/InputLookup/InputLookup";
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { IColumnsProperties, IEditCell, ITableRow, TablesGridHardCoded } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { convertRowtoContent } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ComponentProperties } from "@ly_types/lyComponents";
import { InputCheckbox } from "@ly_components/input/InputCheckbox";
import { EStandardColor, IContentValue } from "@ly_utils/commonUtils";
import { LYCheckIcon, LYCloseIcon, LYReactIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Div_CellColor, Div_CellText } from "@ly_components/styles/Div";
import { Input } from "@ly_components/common/Input";
import dayjs from "dayjs";
import { DatePicker } from "@ly_components/input/InputDate";

export interface IGetColumnPropertiesParams {
    columnProperties: IColumnsProperties,
    componentProperties: ComponentProperties
}

type TAddMeta = (meta: FilterMeta) => void;


interface FilterObject {
    operator?: string;
    value?: IContentValue;
    type: EDictionaryType;
}


// Helper function to map the operator to the correct filter function
const getDynamicFilterFn = (operator: string, type: EDictionaryType) => {
    switch (operator) {
        case 'equals':
            return (row: Row<ITableRow>, columnId: string, filterValue: IContentValue) => {
                const cellValue = row.getValue(columnId);
                const cellValueDate = dayjs.isDayjs(cellValue) ? cellValue : dayjs(cellValue as string | number | Date | null | undefined);
                const filterValueDate = dayjs.isDayjs(filterValue) ? filterValue : dayjs(filterValue as string | number | Date | null | undefined);
                if (filterValueDate.isValid() && type === EDictionaryType.jdedate) {
                    return cellValue === Number(ToolsDictionary.DateToJde(filterValue as string)); // JDE Date comparison
                }

                if (typeof cellValue === 'number' && typeof filterValue === 'number') {
                    return cellValue === filterValue; // Number comparison
                }

                if (cellValueDate.isValid() && filterValueDate.isValid()) {
                    return cellValueDate.isSame(filterValueDate, 'day'); // Date comparison
                }
                return cellValue === filterValue; // Fallback for other types (string, etc.)
            };
        case 'contains':
            return filterFns.includesString; // Case-insensitive substring matching
        case 'startsWith':
            return (row: Row<ITableRow>, columnId: string, filterValue: IContentValue) => {
                const cellValue = row.getValue(columnId);
                return typeof cellValue === 'string' &&
                    cellValue.toLowerCase().startsWith((filterValue as string).toLowerCase());
            };
        case 'isEmpty':
            return (row: Row<ITableRow>, columnId: string) => {
                const cellValue = row.getValue(columnId);
                return cellValue === null || cellValue === undefined || cellValue === '';
            };

        case 'isNotEmpty':
            return (row: Row<ITableRow>, columnId: string) => {
                const cellValue = row.getValue(columnId);
                return cellValue !== null && cellValue !== undefined && cellValue !== '';
            };
        case 'is':
            return (row: Row<ITableRow>, columnId: string, filterValue: IContentValue) => {
                const cellValue = row.getValue(columnId);

                if (!filterValue) {
                    return cellValue === 'N' || cellValue === null;
                }

                return cellValue !== null && cellValue !== 'N';

            };
        case 'greater':
            return (row: Row<ITableRow>, columnId: string, filterValue: IContentValue) => {
                const cellValue = row.getValue(columnId);
                const cellValueDate = dayjs.isDayjs(cellValue) ? cellValue : dayjs(cellValue as string | number | Date | null | undefined);
                const filterValueDate = dayjs.isDayjs(filterValue) ? filterValue : dayjs(filterValue as string | number | Date | null | undefined);

                if (filterValueDate.isValid() && type === EDictionaryType.jdedate) {
                    return (cellValue as number) > Number(ToolsDictionary.DateToJde(filterValue as string)); // JDE Date comparison
                }

                if (typeof cellValue === 'number' && typeof filterValue === 'number') {
                    return cellValue > filterValue; // Number comparison
                }

                if (cellValueDate.isValid() && filterValueDate.isValid()) {
                    return cellValueDate.isAfter(filterValueDate, 'day'); // Date comparison
                }


                return false; // Default to false if types don't match
            };

        case 'less':
            return (row: Row<ITableRow>, columnId: string, filterValue: IContentValue) => {
                const cellValue = row.getValue(columnId);
                const cellValueDate = dayjs.isDayjs(cellValue) ? cellValue : dayjs(cellValue as string | number | Date | null | undefined);
                const filterValueDate = dayjs.isDayjs(filterValue) ? filterValue : dayjs(filterValue as string | number | Date | null | undefined);

                if (filterValueDate.isValid() && type === EDictionaryType.jdedate) {
                    return (cellValue as number) < Number(ToolsDictionary.DateToJde(filterValue as string)); // JDE Date comparison
                }

                if (typeof cellValue === 'number' && typeof filterValue === 'number') {
                    return cellValue < filterValue; // Number comparison
                }

                if (cellValueDate.isValid() && filterValueDate.isValid()) {
                    return cellValueDate.isBefore(filterValueDate, 'day'); // Date comparison
                }

                return false; // Default to false if types don't match
            };
        default:
            return filterFns.includesString; // Default to contains
    }
};

// Utility function to get column properties based on rules
export const getColumnProperties = (params: IGetColumnPropertiesParams): IColumnsProperties[] => {
    const { columnProperties, componentProperties } = params;
    switch (columnProperties.rules) {
        case EDictionaryRules.color:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                filter: columnProperties.filter,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                meta: {
                    align: 'center',
                },
                cell: (cell: CellContext<ITableRow, IContentValue>) => {
                    const value = cell.getValue() as string;
                    if (value !== undefined && value !== null) {
                        return (
                            <Div_CellColor background={value} />
                        );
                    } else
                        return null;
                },

                editCell: (params: IEditCell) => {
                    return (
                        <Input
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            variant="standard"
                            value={params.value as string ?? ''}
                            onChange={(e) => {
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleChange(onChangeParams)
                            }
                            }
                            onBlur={(e) => {
                                const onBlurParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleBlur(onBlurParams)
                            }
                            }
                            fullWidth
                        />
                    );
                },
            }];
        case EDictionaryRules.enum:
            return [
                {
                    accessorKey: columnProperties.target ?? columnProperties.field,
                    header: columnProperties.header + " (ID)",
                    type: "string",
                    field: columnProperties.field,
                    target: columnProperties.target,
                    key: columnProperties.key,
                    rules: columnProperties.rules,
                    rulesValues: columnProperties.rulesValues,
                    default: columnProperties.default,
                    fixed_params: columnProperties.fixed_params,
                    dynamic_params: columnProperties.dynamic_params,
                    pool_params: columnProperties.pool_params,
                    filter: columnProperties.filter,
                    editable: false,
                    disabled: true,
                    required: columnProperties.required,
                    output_params: columnProperties.output_params,
                    col_cdn_id: columnProperties.col_cdn_id,
                    operator: columnProperties.operator,
                    visible: columnProperties.visible,
                    filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                        const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                        const filterValue = filterObj?.value; // Get filter value
                        const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                        return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                    },
                },
                {
                    header: columnProperties.header,
                    type: "string",
                    accessorKey: (columnProperties.target ?? columnProperties.field) + "_LABEL",
                    field: columnProperties.field + "_LABEL",
                    editable: !columnProperties.disabled,
                    rules: columnProperties.rules,
                    rulesValues: columnProperties.rulesValues,
                    default: columnProperties.default,
                    fixed_params: columnProperties.fixed_params,
                    dynamic_params: columnProperties.dynamic_params,
                    pool_params: columnProperties.pool_params,
                    disabled: columnProperties.disabled,
                    required: columnProperties.required,
                    output_params: columnProperties.output_params,
                    col_cdn_id: columnProperties.col_cdn_id,
                    visible: columnProperties.visible,
                    operator: columnProperties.operator,
                    key: columnProperties.key,
                    target: columnProperties.target,
                    filter: columnProperties.filter,
                    minWidth: 150,
                    maxWidth: 300,
                    cell: (cell: CellContext<ITableRow, IContentValue>) => {
                        const value = cell.getValue() as string;
                        if (value !== undefined && value !== null) {
                            if (value.length > 30)
                                return (
                                    <Div_CellText>
                                        {value}
                                    </Div_CellText>
                                );
                            else
                                return value;
                        } else
                            return null;
                    },
                    editCell: (params: IEditCell) => {
                        return (
                            <InputEnum
                                id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                                key={columnProperties.target ?? columnProperties.field}
                                enumID={parseInt(columnProperties.rulesValues)}
                                label={columnProperties.header}
                                defaultValue={params.value as string ?? ""}
                                disabled={columnProperties.disabled}
                                variant="standard"
                                onChange={(e) => {
                                    const onChangeParams = {
                                        cell: params.cell,
                                        value: e.value,
                                        label: e.label
                                    }
                                    params.handleAutoCompleteChange(onChangeParams)
                                }
                                }
                                freeSolo={false}
                                searchByLabel={true}
                                hideButton={true}
                                callFromTable={true}
                            />
                        )
                    },
                    filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                        const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                        const filterValue = filterObj?.value; // Get filter value
                        const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                        return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                    },
                }
            ];
        case EDictionaryRules.lookup:
            return [
                {
                    accessorKey: columnProperties.target ?? columnProperties.field,
                    header: columnProperties.header + " (ID)",
                    type: "string",
                    field: columnProperties.field,
                    filter: columnProperties.filter,
                    target: columnProperties.target,
                    key: columnProperties.key,
                    rules: columnProperties.rules,
                    rulesValues: columnProperties.rulesValues,
                    default: columnProperties.default,
                    fixed_params: columnProperties.fixed_params,
                    dynamic_params: columnProperties.dynamic_params,
                    pool_params: columnProperties.pool_params,
                    output_params: columnProperties.output_params,
                    editable: false,
                    disabled: true,
                    required: columnProperties.required,
                    col_cdn_id: columnProperties.col_cdn_id,
                    visible: columnProperties.visible,
                    operator: columnProperties.operator,
                    filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                        const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                        const filterValue = filterObj?.value; // Get filter value
                        const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                        return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                    },
                },
                {
                    accessorKey: (columnProperties.target ?? columnProperties.field) + "_LABEL",
                    header: columnProperties.header,
                    type: "string",
                    field: columnProperties.field + "_LABEL",
                    visible: columnProperties.visible,
                    operator: columnProperties.operator,
                    editable: !columnProperties.disabled,
                    key: columnProperties.key,
                    rules: columnProperties.rules,
                    rulesValues: columnProperties.rulesValues,
                    default: columnProperties.default,
                    fixed_params: columnProperties.fixed_params,
                    dynamic_params: columnProperties.dynamic_params,
                    output_params: columnProperties.output_params,
                    pool_params: columnProperties.pool_params,
                    disabled: columnProperties.disabled,
                    required: columnProperties.required,
                    col_cdn_id: columnProperties.col_cdn_id,
                    target: columnProperties.target,
                    filter: columnProperties.filter,
                    minWidth: 150,
                    maxWidth: 500,
                    cell: (cell: CellContext<ITableRow, IContentValue>) => {
                        const value = cell.getValue() as string;
                        if (value !== undefined && value !== null) {
                            if (value.length > 30)
                                return (
                                    <Div_CellText>
                                        {value}
                                    </Div_CellText>
                                );
                            else
                                return value;
                        } else
                            return null;
                    },
                    editCell: (params: IEditCell) => {
                        let originalRow = params.cell.row.original;
                        return (
                            <InputLookup
                                id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                                key={columnProperties.target ?? columnProperties.field}
                                lookupID={parseInt(columnProperties.rulesValues)}
                                label={columnProperties.header}
                                disabled={columnProperties.disabled}
                                onChange={(e) => {
                                    const onChangeParams = {
                                        cell: params.cell,
                                        value: e.value,
                                        label: e.label,
                                        data: e.data
                                    }
                                    params.handleAutoCompleteChange(onChangeParams)
                                }
                                }
                                data={convertRowtoContent(originalRow)}
                                defaultValue={params.value?.toString() ?? null}
                                dynamic_params={columnProperties.dynamic_params}
                                fixed_params={columnProperties.fixed_params}
                                overrideQueryPool={(columnProperties.pool_params === null)
                                    ? undefined
                                    : (originalRow[columnProperties.pool_params] !== undefined)
                                        ? originalRow[columnProperties.pool_params] as string
                                        : columnProperties.pool_params}
                                searchByLabel={true}
                                callFromTable={true}
                            />
                        )
                    },
                    filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                        const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                        const filterValue = filterObj?.value; // Get filter value
                        const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                        return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                    },
                }
            ];
        case EDictionaryRules.password:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: "string",
                field: columnProperties.field,
                target: columnProperties.target,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                filter: columnProperties.filter,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                cell: (info: CellContext<ITableRow, IContentValue>) => {
                    const passwordValue = info.getValue();
                    return '•••••'; // Mask password with dots
                },
                editCell: (params: IEditCell) => {
                    return (
                        <Input
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            type="password"
                            value={params.value as string ?? ''}
                            onChange={(e) => {
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleChange(onChangeParams)
                            }
                            }
                            onBlur={(e) => {
                                const onBlurParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleBlur(onBlurParams)
                            }
                            }
                            fullWidth
                        />
                    );
                },
            }];
        default:
            return getDefaultColumnProperties(columnProperties);
    }
};

// Utility function to get default column properties based on type
export const getDefaultColumnProperties = (columnProperties: IColumnsProperties): IColumnsProperties[] => {
    switch (columnProperties.type) {
        case EDictionaryType.jdedate:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                filter: columnProperties.filter,
                cell: (cell: CellContext<ITableRow, IContentValue>) => {
                    if (cell.getValue() !== null && cell.getValue() !== undefined) {
                        return ToolsDictionary.JdeToDate(cell.getValue() as number)?.toLocaleDateString();
                    }
                    else
                        null;
                },
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                // Render edit cell with MUI DatePicker
                editCell: (params: IEditCell) => {
                    const selectedDate = params.value ? dayjs(ToolsDictionary.JdeToDate(params.value as number)) : null
                    return (
                        <DatePicker
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} 
                            // Initialize the picker with the current cell value
                            value={selectedDate}
                            onChange={(newValue) => {
                                const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                                const jdeDate = formattedDate ? ToolsDictionary.DateToJde(formattedDate) : null;
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: jdeDate
                                }
                                params.handleChange(onChangeParams);
                            }}
                        />

                    );
                },
            }];
        case EDictionaryType.date:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                filter: columnProperties.filter,
                cell: (cell: CellContext<ITableRow, IContentValue>) => {
                    const value = cell.getValue();
                    return (value !== null && value !== undefined) ? new Date(cell.getValue() as string).toLocaleDateString() : null; // Format date
                },
                editCell: (params: IEditCell) => {
                    const selectedDate = params.value ? dayjs(params.value as Date) : null
                    return (
                        <DatePicker
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} 
                            // Initialize the picker with the current cell value
                            value={selectedDate}
                            onChange={(newValue) => {
                                const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: formattedDate
                                }
                                params.handleChange(onChangeParams);
                            }}
                        />
                    );
                },
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'equals'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
            }];
        case EDictionaryType.boolean:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                editable: !columnProperties.disabled,
                filter: columnProperties.filter,
                cell: (cell: CellContext<ITableRow, IContentValue>) => {
                    const isActive = (columnProperties.rulesValues.split(";").includes(cell.getValue() as string)) ? true : false;
                    return isActive ? <LYReactIcon icon={LYCheckIcon} color={EStandardColor.primary} size={LYIconSize.small} /> : <LYReactIcon icon={LYCloseIcon} color={EStandardColor.secondary} size={LYIconSize.small} />;
                },
                meta: {
                    align: 'center',
                },
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'is'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                editCell: (params: IEditCell) => {
                    return (
                        <InputCheckbox
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            label={params.cell.column.columnDef.header?.toString() ?? ""}
                            defaultValue={(columnProperties.rulesValues.split(";").includes(params.cell.getValue() as string)) ? true : false}
                            onChange={(e: { value: boolean; }) => {
                                let newValue = (e.value)
                                    ? columnProperties.rulesValues
                                    : "N";
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: newValue
                                }

                                params.handleBlur(onChangeParams)
                            }
                            }
                        />

                    );
                },
            }];
        case EDictionaryType.number:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                editable: !columnProperties.disabled,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                visible: columnProperties.visible,
                operator: columnProperties.operator,
                filter: columnProperties.filter,
                meta: {
                    align: 'right',
                },
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'equals'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                editCell: (params: IEditCell) => {
                    return (
                        <Input
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            variant="standard"
                            value={params.value as number}
                            onChange={(e) => {
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleChange(onChangeParams)
                            }
                            }
                            onBlur={(e) => {
                                const onBlurParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleBlur(onBlurParams)
                            }
                            }
                            fullWidth
                            type="number"
                        />
                    );
                },
            }];
        case EDictionaryType.textarea:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: "string",
                field: columnProperties.field,
                target: columnProperties.target,
                visible: columnProperties.visible,
                filter: columnProperties.filter,
                operator: columnProperties.operator,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                minWidth: 150,
                maxWidth: 300,
                cell: (cell: CellContext<ITableRow, IContentValue>) => {
                    const value = cell.getValue() as string;
                    if (value && value.length > 30) {
                        return (
                            <Div_CellText>
                                {value}
                            </Div_CellText>
                        );
                    }
                    return value;
                },
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                editCell: (params: IEditCell) => {
                    return (
                        <Input
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            variant="standard"
                            value={params.value as string}
                            onChange={(e) => {
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleChange(onChangeParams)
                            }
                            }
                            onBlur={(e) => {
                                const onBlurParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleBlur(onBlurParams)
                            }
                            }
                            fullWidth
                            multiline
                        />
                    );
                },
            }];
        default:
            return [{
                accessorKey: columnProperties.target ?? columnProperties.field,
                header: columnProperties.header,
                type: columnProperties.type,
                field: columnProperties.field,
                target: columnProperties.target,
                visible: columnProperties.visible,
                filter: columnProperties.filter,
                operator: columnProperties.operator,
                editable: !columnProperties.disabled,
                key: columnProperties.key,
                rules: columnProperties.rules,
                rulesValues: columnProperties.rulesValues,
                default: columnProperties.default,
                fixed_params: columnProperties.fixed_params,
                dynamic_params: columnProperties.dynamic_params,
                pool_params: columnProperties.pool_params,
                disabled: columnProperties.disabled,
                required: columnProperties.required,
                output_params: columnProperties.output_params,
                col_cdn_id: columnProperties.col_cdn_id,
                filterFn: (row: Row<ITableRow>, columnId: string, filterObj: FilterObject, addMeta: TAddMeta) => {
                    const operator = filterObj?.operator || 'contains'; // Get operator from filter object
                    const filterValue = filterObj?.value; // Get filter value
                    const dynamicFilterFn = getDynamicFilterFn(operator, filterObj?.type);
                    return dynamicFilterFn(row, columnId, filterValue, addMeta); // Use the correct filter function
                },
                editCell: (params: IEditCell) => {
                    return (
                        <Input
                            id={`input-${params.cell.row.id}-${params.cell.column.id}`} // Add a unique id based on row and column
                            variant="standard"
                            value={params.value as string ?? ''}
                            onChange={(e) => {
                                const onChangeParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleChange(onChangeParams)
                            }
                            }
                            onBlur={(e) => {
                                const onBlurParams = {
                                    row: params.cell.row,
                                    columnId: params.cell.column.id,
                                    value: e.target.value
                                }
                                params.handleBlur(onBlurParams)
                            }
                            }
                            fullWidth
                        />
                    );
                },
            }];
    }
};


// Utility function to get columns visibility
export const getColumnsVisibility = (columnProperties: IColumnsProperties) => {
    if (columnProperties.field === TablesGridHardCoded.row_id || columnProperties.field === "Actions") {
        return { [columnProperties.field]: false };
    }
    switch (columnProperties.rules) {
        case EDictionaryRules.enum:
            return {
                [columnProperties.target ?? columnProperties.field]: false,
                [(columnProperties.target ?? columnProperties.field) + "_LABEL"]: columnProperties.visible
            };
        case EDictionaryRules.lookup:
            return {
                [columnProperties.target ?? columnProperties.field]: columnProperties.visible,
                [(columnProperties.target ?? columnProperties.field) + "_LABEL"]: columnProperties.visible
            };
        default:
            return { [columnProperties.target ?? columnProperties.field]: columnProperties.visible };
    }
};


export interface IGetFiltersParams {
    columnsFilter: CColumnsFilter,
    componentProperties: ComponentProperties
}

// Utility function to get filters
export const getFilters = (params: IGetFiltersParams) => {
    const { columnsFilter: filtersDP, componentProperties } = params;
    let filtersTBL: IFiltersProperties[] = componentProperties.filters.length === 0 ? [] : [...componentProperties.filters];
    Object.keys(filtersDP.fields).forEach((field: string) => {
        if (filtersDP.fields[field].value !== null) {
            filtersTBL = filtersTBL.filter(item => item.field !== field);
            filtersTBL.push({
                header: "",
                field: filtersDP.fields[field].target,
                value: filtersDP.fields[field].value,
                type: filtersDP.fields[field].type,
                operator: filtersDP.fields[field].operator,
                defined: true,
                rules: "",
                disabled: true,
                values: "",
                label: filtersDP.fields[field].label
            });
        } else {
            filtersTBL = filtersTBL.filter(item => item.field !== field);
        }
    });
    return filtersTBL;
};