/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { RowData } from "@tanstack/react-table";

// Custom Import
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications, IAppsProps } from "@ly_types/lyApplications";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { IColumnsProperties, ITableRow, ITableHeader, TablesGridHardCoded, ETableHeader } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { convertRowtoContent } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ESeverity, IErrorState, IRestData } from "@ly_utils/commonUtils";
import { ComponentProperties } from "@ly_types/lyComponents";
import { lyGetTableProperties } from "@ly_services/lyTables";
import { IDialogContent } from "@ly_types/lyDialogs";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { LYTableInstance, ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IModulesProps } from "@ly_types/lyModules";
import { ENextNumber } from "@ly_types/lyNextNum";
import { ESequence } from "@ly_types/lySequence";


export interface IRowDelete {
    rowValue: ITableRow,
    tableProperties: ITableHeader,
    columns: IColumnsProperties[],
    userProperties: IUsersProps,
    appsProperties: IAppsProps,
    modulesProperties: IModulesProps,
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>,
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    setTableState: React.Dispatch<React.SetStateAction<ITableState>>;
    updateTableState: <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
      ) => void;
}
export const rowDelete = async (params: IRowDelete) => {
    const { rowValue, tableProperties, columns, userProperties, appsProperties, modulesProperties, setErrorState, table, tableState, setTableState, updateTableState} = params;
    let restData: IRestData = {};
    tableProperties[ETableHeader.key].forEach((key) => {
        const column = columns.find((column): column is IColumnsProperties => {
            return 'field' in column && (column.target ?? column.field) === key; // Ensures the column has a `field`
        });

        if (column) {
            restData[column.target] = rowValue[key]; // Now safe to access `target`
        }
    });

    // If audit is enabled, save the record before deleting
    if (tableProperties[ETableHeader.audit]) {
        let result;
        result = await ToolsQuery.audit(
            tableProperties[ETableHeader.dbName],
            userProperties[EUsers.id],
            {
                source: QuerySource.Query,
                framework_pool: appsProperties[EApplications.pool],
                query: tableProperties[ETableHeader.queryID],
                sessionMode: appsProperties[EApplications.session],
                modulesProperties: modulesProperties,
                jwt_token: appsProperties[EApplications.jwt_token]
            },
            JSON.stringify(restData));
    }

    let result = await ToolsQuery.delete({
        source: QuerySource.Query,
        framework_pool: appsProperties[EApplications.pool],
        query: tableProperties[ETableHeader.queryID],
        sessionMode: appsProperties[EApplications.session],
        modulesProperties: modulesProperties,
        jwt_token: appsProperties[EApplications.jwt_token]
    },
        JSON.stringify(restData));

    if (result.status === ResultStatus.error) {
        setErrorState({ open: true, message: result.items[0].message, severity:  ESeverity.error });
    } else {
        const updatedRows = tableState.tableData.rows.filter((row) => row[TablesGridHardCoded.row_id] !== rowValue[TablesGridHardCoded.row_id]);
        updateTableState("tableData", (prevTableData: ITableState["tableData"]) => ({
            ...prevTableData,
            rows: prevTableData.rows.filter(
              (row) => row[TablesGridHardCoded.row_id] !== rowValue[TablesGridHardCoded.row_id]
            ),
          }));

        setTableState((prevState) => {
            const updatedIsNew = { ...prevState.tableEdit.isNew };
            const updatedUnsavedRows = { ...prevState.tableEdit.unsavedRows };
            const updatedRowsBeforeChange = { ...prevState.tableEdit.rowsBeforeChange };
    
            // Remove the row ID from each relevant property
            delete updatedIsNew[rowValue[TablesGridHardCoded.row_id]];
            delete updatedUnsavedRows[rowValue[TablesGridHardCoded.row_id]];
            delete updatedRowsBeforeChange[rowValue[TablesGridHardCoded.row_id]];
    
            // Return the updated state with modified `tableEdit`
            return {
                ...prevState,
                tableEdit: {
                    ...prevState.tableEdit,
                    isNew: updatedIsNew,
                    unsavedRows: updatedUnsavedRows,
                    rowsBeforeChange: updatedRowsBeforeChange,
                    hasUnsavedRows: Object.keys(updatedUnsavedRows).length > 0, // Recalculate as needed
                }
            };
        });
    }
    return result.status

}


export interface IRowUpdate {
    rowValue: ITableRow,
    tableProperties: ITableHeader,
    columns: IColumnsProperties[],
    userProperties: IUsersProps,
    appsProperties: IAppsProps,
    modulesProperties: IModulesProps,
    component: ComponentProperties,
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>,
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    setTableState: React.Dispatch<React.SetStateAction<ITableState>>;
    updateTableState: <K extends keyof ITableState>(
        key: K,
        value: ITableState[K] | ((prevValue: ITableState[K]) => ITableState[K])
      ) => void;
}
export const rowUpdate = async (params: IRowUpdate) => {
    const { rowValue, tableProperties, columns, userProperties, appsProperties, modulesProperties,component, setErrorState, table, tableState, setTableState, updateTableState } = params;
    let restData: IRestData = {};
    tableProperties[ETableHeader.key].forEach((key) => {
        restData[columns.filter((columns: IColumnsProperties) => (columns.target ?? columns.field) === key)[0].target] = rowValue[key];
    });

    let result;

    // If audit is enabled, save the record before deleting
    if (tableProperties[ETableHeader.audit]) {

        result = await ToolsQuery.audit(
            tableProperties[ETableHeader.dbName],
            userProperties[EUsers.id],
            {
                source: QuerySource.Query,
                framework_pool: appsProperties[EApplications.pool],
                query: tableProperties[ETableHeader.queryID],
                sessionMode: appsProperties[EApplications.session],
                modulesProperties: modulesProperties,
                jwt_token: appsProperties[EApplications.jwt_token]
            },
            JSON.stringify(restData));
    }

    restData = {};
    
    await Promise.all(Object.keys(rowValue).map(async (col: string) => {
        let column = columns.find((item: IColumnsProperties) => item.target === col);

        if (column !== undefined)
            if (column.target !== null && column.target !== undefined)
                switch (column.rules) {
                    case EDictionaryRules.sequence:
                        const sequence = await ToolsDictionary.getSequence({
                            appsProperties: appsProperties,
                            [ESequence.id]: parseInt(column.rulesValues),
                            data: convertRowtoContent(rowValue) as IDialogContent,
                            dynamic_params: column.dynamic_params,
                            fixed_params: column.fixed_params,
                            modulesProperties: modulesProperties,
                        });
                        restData[column.target] =
                            (rowValue[col] !== "" && rowValue[col] !== null)
                                ? rowValue[col] : sequence;
                        break;
                    case EDictionaryRules.nextNumber:
                        if (tableState.tableEdit.isNew[rowValue[TablesGridHardCoded.row_id]] === true)
                            var nn = await ToolsDictionary.getNextNumber({
                                appsProperties: appsProperties,
                                userProperties: userProperties,
                                [ENextNumber.id]: column.rulesValues,
                                overrideQueryPool: component.overrideQueryPool,
                                modulesProperties: modulesProperties,
                            });

                        else
                            nn = rowValue[col];
                        restData[column.target] = nn;

                        break;
                    case EDictionaryRules.boolean:
                        restData[column.target] = rowValue[col] ?? "N";
                        break;
                    case EDictionaryRules.login:
                        restData[column.target] = userProperties[EUsers.id];
                        break;
                    case EDictionaryRules.sysdate:
                    case EDictionaryRules.current_date:
                        if (column.type === EDictionaryType.jdedate)
                            restData[column.target] = ToolsDictionary.DateToJde(new Date().toISOString());
                        else
                            restData[column.target] = new Date().toISOString();
                        break;
                    case EDictionaryRules.password:
                        restData[column.target] = await ToolsQuery.encrypt(rowValue[col] as string, modulesProperties);
                        break;
                    default:
                        restData[column.target] = rowValue[col];
                }


    }));

    await Promise.all(Object.keys(rowValue).map(async (col: string) => {
        let column = columns.find((item: IColumnsProperties) => item.target === col);
        if (column !== undefined)
            if (column.target !== null && column.target !== undefined)
                switch (column.rules) {
                    case EDictionaryRules.default:
                        restData[column.target] = (rowValue[col] !== null)
                            ? rowValue[col]
                            : column.rulesValues;
                        break;
                }
    }));

    if (tableState.tableEdit.isNew[rowValue[TablesGridHardCoded.row_id]] === true) {
        result = await ToolsQuery.post({
            source: QuerySource.Query,
            framework_pool: appsProperties[EApplications.pool],
            query: tableProperties[ETableHeader.queryID],
            sessionMode: appsProperties[EApplications.session],
            override_target_pool: component.overrideQueryPool,
            modulesProperties: modulesProperties,
            jwt_token: appsProperties[EApplications.jwt_token]
        },
            JSON.stringify(restData));
    } else {
        result = await ToolsQuery.put({
            source: QuerySource.Query,
            framework_pool: appsProperties[EApplications.pool],
            query: tableProperties[ETableHeader.queryID],
            sessionMode: appsProperties[EApplications.session],
            override_target_pool: component.overrideQueryPool,
            modulesProperties: modulesProperties,
            jwt_token: appsProperties[EApplications.jwt_token]
        },
            JSON.stringify(restData));
    }

    if (result.status === ResultStatus.error) {
        setErrorState({ open: true, message: result.items[0].message, severity:  ESeverity.error });
    }
    else {
        updateTableState(
            "tableData",
            (prevTableData: ITableState["tableData"]): ITableState["tableData"] => ({
              ...prevTableData,
              rows: prevTableData.rows.map((row: ITableRow) =>
                row[TablesGridHardCoded.row_id] === rowValue[TablesGridHardCoded.row_id]
                  ? { ...row, ...rowValue }
                  : row
              ),
            })
          );

        setTableState((prevState) => {
            const updatedIsNew = { ...prevState.tableEdit.isNew };
            const updatedUnsavedRows = { ...prevState.tableEdit.unsavedRows };
            const updatedRowsBeforeChange = { ...prevState.tableEdit.rowsBeforeChange };
    
            // Remove the row ID from each relevant property
            delete updatedIsNew[rowValue[TablesGridHardCoded.row_id]];
            delete updatedUnsavedRows[rowValue[TablesGridHardCoded.row_id]];
            delete updatedRowsBeforeChange[rowValue[TablesGridHardCoded.row_id]];
    
            // Return the updated state with modified `tableEdit`
            return {
                ...prevState,
                tableEdit: {
                    ...prevState.tableEdit,
                    isNew: updatedIsNew,
                    unsavedRows: updatedUnsavedRows,
                    rowsBeforeChange: updatedRowsBeforeChange,
                    hasUnsavedRows: Object.keys(updatedUnsavedRows).length > 0, // Recalculate as needed
                }
            };
        });

    }
    return result.status
};



export interface IFetchTableProperties {
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    table_id: number,
    getAllColumns: boolean,
    columnsFilter: CColumnsFilter,
    rowsFilterRef: React.MutableRefObject<IFiltersProperties[]>
}

// Fetch table properties
export const fetchTableProperties = async (params: IFetchTableProperties) => {
    const { appsProperties, userProperties, modulesProperties, table_id, getAllColumns = true, columnsFilter, rowsFilterRef } = params;
    return await lyGetTableProperties({
        appsProperties,
        userProperties,
        [ETableHeader.id]: table_id,
        getAllColumns,
        columnsFilter,
        rowsFilterRef,
        modulesProperties
    });
};

