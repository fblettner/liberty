/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { t } from "i18next";
import { Fragment, useCallback, useRef } from "react";

// Custom Import
import { Div_FormsListView, Div_ListItem, Div_ListItemText, Div_TableList } from '@ly_components/styles/Div';
import { getRowId } from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { scrollToFirstItem } from "@ly_utils/scrollUtils";
import { IColumnsProperties, ITableRow } from "@ly_types/lyTables";
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { LYArrowCircleUpIcon, LYChevronUpIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Typography } from "@ly_components/common/Typography";
import { IconButton_ListBottom } from "@ly_components/styles/IconButton";
import { List, ListItem, ListItemText } from "@ly_components/common/List";


/**
 * Represents the props for the TableList component.
 */
interface ITableList {
    table: LYTableInstance<ITableRow>;
    tableState: ITableState
    onDoubleClick: (event: React.MouseEvent<HTMLDivElement>, node: ITableRow) => void
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>, node: ITableRow) => void
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>, node: ITableRow) => void
    onTouchEnd: () => void
}

export const TableList = ({
    table,
    tableState,
    onDoubleClick,
    onMouseDown,
    onTouchStart,
    onTouchEnd
}: ITableList) => {

    const firstItemRef = useRef<HTMLDivElement>(null);

    /**
     * Determines if a row is selected in the table.
     * 
     * @param row - The row to check for selection.
     * @returns True if the row is selected, false otherwise.
     */
    const listRowSelected = useCallback((row: ITableRow) => {
        const firstSelectedRow = table.getFirstSelectedRow() as ITableRow;
        if (firstSelectedRow) {
            return getRowId(firstSelectedRow) === getRowId(row);
        } else {
            return false;
        }
    }, [table]);

    return (
        <Div_TableList>
            <List>
                {tableState.tableData.rows.slice(0, 100).map((row: ITableRow, index: number) => (
                    <Fragment key={index}>
                        <Div_FormsListView
                            onDoubleClick={(event) => onDoubleClick(event, row)}
                            onMouseDown={(event) => onMouseDown(event, row)}
                            onTouchStart={(event) => onTouchStart(event, row)}
                            onTouchEnd={onTouchEnd}
                            selected={listRowSelected(row)}
                            ref={index === 0 ? firstItemRef : null}
                        >
                            <ListItem selected={listRowSelected(row)} >
                                <Div_ListItem>
                                    {tableState.tableData.columns.filter((item: IColumnsProperties) => tableState.tableData.columnsVisibility[item.target ?? item.field] === true && row[item.target ?? item.field] !== null && row[item.target ?? item.field] !== undefined).map((column: IColumnsProperties) => (
                                        <Div_ListItemText key={`${row.id}-${column.field}`}>
                                            <ListItemText 
                                                primary={
                                                    <Typography component="span">
                                                        <Typography component="span" fontWeight="bold" variant="overline">
                                                            {column.header}
                                                        </Typography >
                                                        <Typography component="span" fontWeight="bold" variant="caption">
                                                        {`: ${row[column.target ?? column.field]}`}
                                                        </Typography >
                                                        
                                                    </Typography>
                                                }
                                                
                                            />
                                        </Div_ListItemText>
                                    ))}
                                </Div_ListItem>
                            </ListItem>
                        </Div_FormsListView>
                    </Fragment>
                ))}
            </List>
            <IconButton_ListBottom
                onClick={() => scrollToFirstItem(firstItemRef)}
                icon={LYChevronUpIcon} 
                size={LYIconSize.large}
            />
        </Div_TableList>
    )
}