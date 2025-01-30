/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { MutableRefObject } from "react";
import { format, parseISO } from "date-fns";

// Custom Import
import { ComponentProperties, LYComponentType, LYComponentMode } from "@ly_types/lyComponents";
import { EContextMenus } from "@ly_types/lyContextual";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { IColumnsProperties, ITableRow, ITableHeader, ETableHeader } from "@ly_types/lyTables";
import { ITableDisplayView } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { EDictionaryType } from "@ly_types/lyDictionary";

export interface IGetMenuItemComponent {
    apiRef: MutableRefObject<TableGridRef | undefined>;
    displayView: ITableDisplayView;
    componentProperties: ComponentProperties;
    tableProperties: ITableHeader;
    menuID: number;
    filters: IFiltersProperties[];
    columns: IColumnsProperties[];
    table: LYTableInstance<ITableRow>;
}

export const getMenuItemComponent = (params: IGetMenuItemComponent) => {
    const { apiRef, displayView, componentProperties, tableProperties, menuID, filters, columns, table } = params

    const selectedRow = table.getFirstSelectedRow() as ITableRow

    let menuComponent : ComponentProperties;
    let filtersCTX: IFiltersProperties[] = [];
    let index = tableProperties[ETableHeader.contextMenusID].findIndex((menuItem ) => menuItem[EContextMenus.componentID] === menuID);

    /* Create filter from table row, maping are coming from LY_CTX_FILTERS */
    let filterString: string = tableProperties[ETableHeader.contextMenusID][index][EContextMenus.dynamic_params];
    if (filterString !== null && selectedRow !== undefined && selectedRow !== null)
        filterString.split(";").map((filters) => {
            let filter = filters.split("=")
            let field = columns.find((column): column is IColumnsProperties => {
                return 'field' in column && column.field === filter[0];
            });
            let value = selectedRow[filter[1]];
            if (field !== undefined)
                if (field.type === EDictionaryType.date) {
                    const dateObj = parseISO(selectedRow[filter[1]] as string);
                    const formattedDate = format(dateObj, 'yyyy-MM-dd');
                    value = formattedDate;
                }
            filtersCTX.push({
                header: "",
                field: filter[0],
                value: value,
                type: "string",
                operator: "=",
                defined: true,
                rules: "",
                disabled: true,
                values: "",
            });
        })

    /* Create filter for fixed values defined into LY_CTX_FILTERS */
    filterString = tableProperties[ETableHeader.contextMenusID][index][EContextMenus.fixed_params];
    if (filterString !== null)
        filterString.split(";").forEach((filters) => {
            let filter = filters.split("=")

            filtersCTX.push({
                header: "",
                field: filter[0],
                value: filter[1],
                type: "string",
                operator: "=",
                defined: true,
                rules: "",
                disabled: true,
                values: "",
            });
        })

    /* Save current component settings into previous component */
    let currentComponent: ComponentProperties = {
        id: componentProperties.id,
        type: componentProperties.type,
        label: componentProperties.label,
        filters: filters,
        previous: componentProperties.previous,
        initialState: (displayView.table) && apiRef.current ? apiRef.current.exportState() : undefined,
        isChildren: false,
        componentMode: componentProperties.componentMode,
        showPreviousButton: componentProperties.showPreviousButton,
        overrideQueryPool: componentProperties.overrideQueryPool
    };

    if (componentProperties.previous !== undefined) {
        if (componentProperties.previous.type === LYComponentType.FormsDialog)
            currentComponent = componentProperties.previous;
    }

    const secondArrayFields = new Set(filtersCTX.map((item: IFiltersProperties) => item.field));
    filtersCTX = filtersCTX.concat(filters.filter((item: IFiltersProperties) => !secondArrayFields.has(item.field)))

    /* Component called when context menus is selected */
    if ((tableProperties[ETableHeader.contextMenusID][index][EContextMenus.component] === LYComponentType.FormsTable)) {
        let pool = tableProperties[ETableHeader.contextMenusID][index][EContextMenus.pool_params];

        const filterLabel: string = ` (${filtersCTX.map(item => item.value).join(', ')})`;

        menuComponent = {
            id: menuID,
            type: tableProperties[ETableHeader.contextMenusID][index][EContextMenus.component],
            label: componentProperties.label + " > " + tableProperties[ETableHeader.contextMenusID][index][EContextMenus.label] + filterLabel,
            filters: filtersCTX,
            previous: currentComponent,
            showPreviousButton: true,
            isChildren: true,
            componentMode: LYComponentMode.edit,
            overrideQueryPool: (pool === null)
                ? undefined
                : (selectedRow[pool] !== undefined)
                    ? selectedRow[pool] as string
                    : pool
        };
        return menuComponent
    }
    else {
        let pool = tableProperties[ETableHeader.contextMenusID][index][EContextMenus.pool_params];

        menuComponent = {
            id: menuID,
            type: LYComponentType.FormsDialog,
            label: componentProperties.label + " > " + tableProperties[ETableHeader.contextMenusID][index][EContextMenus.label],
            filters: filtersCTX,
            previous: currentComponent,
            componentMode: LYComponentMode.edit,
            tableProperties: tableProperties,
            showPreviousButton: false,
            isChildren: false,
            params: componentProperties.filters.filter((item: IFiltersProperties) => !secondArrayFields.has(item.field)),
            overrideQueryPool: (pool === null)
                ? undefined
                : (selectedRow[pool] !== undefined)
                    ? selectedRow[pool] as string
                    : pool
        }
        return menuComponent
    }
};