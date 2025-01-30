/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports
import { flushSync } from "react-dom";

// Custom Imports
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { EApplications, IAppsProps } from "@ly_types/lyApplications";
import { EDictionaryRules } from "@ly_types/lyDictionary";
import { ELookup, ILookupOption } from "@ly_types/lyLookup";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { parseDynamicParams } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EEnumHeader, EEnumValues } from "@ly_types/lyEnums";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { IColumnsProperties, ITableRow, ITableHeader, IColumnsVisibility, TablesGridHardCoded, ETableHeader } from "@ly_types/lyTables";
import { CColumnsFilter } from "@ly_types/lyFilters";
import { ComponentProperties, LYComponentDisplayMode } from "@ly_types/lyComponents";
import { fetchTableProperties } from "@ly_components/forms/FormsTable/utils/apiUtils";
import { setColumnProperties, setColumnVisibility } from "@ly_components/forms/FormsTable/utils/columnsUtils";
import { IGetFiltersParams } from "@ly_components/forms/FormsTable/features/ColumnsProperties";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IModulesProps } from "@ly_types/lyModules";
import { TableGridRef } from "@ly_components/forms/FormsTable/views/TableGrid";
import { ITablesProperties } from "@ly_types/lyTables";
import { IGetTableProperties } from "@ly_services/lyTables";
import { IContentValue } from "@ly_utils/commonUtils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to process promises in batches with limited concurrency
async function processInBatches<T>(
    tasks: Promise<T>[],
    batchSize: number
): Promise<PromiseSettledResult<T>[]> {
    let results: PromiseSettledResult<T>[] = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch);
        results = results.concat(batchResults); // Accumulate the results
    }
    return results;
}

type TEnumDataItem = {
    [key: string]: IContentValue; // Represents the structure of individual enum entries, e.g., { value: string, label: string }
};
type TEnumDataMap = Record<string, TEnumDataItem[]>

// Fetch enum data
async function fetchEnumData(
    columns: IColumnsProperties[],
    batchSize: number,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps
): Promise<Record<string, TEnumDataItem[]>> {
    const enumColumns = columns.filter((column: IColumnsProperties) => column.rules === EDictionaryRules.enum);
    const enumDataPromises = enumColumns.map((field: IColumnsProperties) =>
        ToolsDictionary.getEnums({
            appsProperties: appsProperties,
            userProperties: userProperties,
            [EEnumHeader.id]: parseInt(field.rulesValues),
            sessionMode: appsProperties[EApplications.session],
            modulesProperties
        })
            .then((enumData) => ({
                field: field.accessorKey,
                data: enumData.data,
            }))
    );

    const enumDataArray = await processInBatches(enumDataPromises, batchSize);
    return enumDataArray.reduce((map: Record<string, TEnumDataItem[]>, enumData) => {
        if (enumData.status === 'fulfilled') {
            map[enumData.value.field] = enumData.value.data;
        }
        return map;
    }, {});
}

type TMapData = {
    idMap: Map<string | number, Record<string, string>>; // Map IDs (string or number) to corresponding values
    labelKey: string; // Key used to represent labels in the lookup data
};

type TPrecomputedMap = Map<string, TMapData>;


// Fetch lookup data
async function fetchLookupData(
    columns: IColumnsProperties[],
    batchSize: number,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps
) {
    const lookupColumns = columns.filter((column: IColumnsProperties) => column.rules === EDictionaryRules.lookup);
    const lookupDataPromises = lookupColumns.map((field: IColumnsProperties) =>
        ToolsDictionary.getLookup({
            appsProperties: appsProperties,
            userProperties: userProperties,
            [ELookup.id]: parseInt(field.rulesValues),
            getAllValues: true,
            fixed_params: field.fixed_params,
            modulesProperties
        })
            .then((lookupData) => ({
                field: field.accessorKey,
                data: lookupData,
                dynamic_params: field.dynamic_params
            }))
            .catch((error) => ({
                field: field.accessorKey,
                data: undefined, 
                dynamic_params: "",
                error: error, 
            }))
    );

    const lookupDataArray = await processInBatches(lookupDataPromises, batchSize);
    const precomputedLookupMap: TPrecomputedMap = new Map();

    lookupDataArray.forEach((lookupData) => {
        if (lookupData.status === 'fulfilled') {
            const field = lookupData.value.field;
            if (lookupData.value.data !== undefined) {
                const lookupID = lookupData.value.data.header[ELookup.dd_id];
                const lookupLabelID = lookupData.value.data.header[ELookup.dd_label] ?? "";

                if (lookupID) {
                    const idMap = new Map();
                    lookupData.value.data.data.forEach((item: ILookupOption) => {
                        let idValue = item[lookupID as keyof ILookupOption];
                        if (lookupData.value.dynamic_params) {
                            const dynamicParamsMap = parseDynamicParams(lookupData.value.dynamic_params);
                            dynamicParamsMap.forEach((field, key) => {
                                if (item[key as keyof ILookupOption] !== undefined) {
                                    idValue += ";" + item[key as keyof ILookupOption]; 
                                }
                            });
                        }
                        if (idValue !== undefined) {
                            idMap.set(idValue, item);
                        }
                    });
                    precomputedLookupMap.set(field, { idMap, labelKey: lookupLabelID });
                }
            }
        }
    });
    return precomputedLookupMap;
}

interface IFetchAndProcessDataInParallel {
    columns: IColumnsProperties[],
    filters: IFiltersProperties[],
    initialOffset: number,
    enumDataMap: TEnumDataMap,
    precomputedLookupMap: TPrecomputedMap,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    tableProperties: ITableHeader,
    component: ComponentProperties,
    cancelQueryStatus: React.MutableRefObject<boolean>,
    parallelCount: number // Number of parallel requests,
    setRowCount: React.Dispatch<React.SetStateAction<number>>;
}

async function fetchAndProcessDataInParallel(props: IFetchAndProcessDataInParallel) {
    const { columns, filters, initialOffset, enumDataMap, precomputedLookupMap, appsProperties, userProperties, modulesProperties, tableProperties, component, cancelQueryStatus, parallelCount, setRowCount } = props;
    let allResults: ITableRow[] = [];
    let currentOffset = initialOffset;
    let overallHasMore = true;

    while (currentOffset < appsProperties[EApplications.limit] && !cancelQueryStatus.current && overallHasMore) {
        // Generate offsets for the next batch of parallel requests
        const offsets = [];
        let offsetBatchCount = 0;
        while (offsetBatchCount < parallelCount && !cancelQueryStatus.current && overallHasMore && currentOffset < appsProperties[EApplications.limit]) {
            offsets.push(currentOffset);
            currentOffset += appsProperties[EApplications.offset];
            offsetBatchCount++;
        }

        // Fetch and process data for each offset in parallel
        const results = await Promise.all(
            offsets.map((offset) =>
                fetchAndProcessData(
                    columns,
                    filters,
                    offset,
                    enumDataMap,
                    precomputedLookupMap,
                    appsProperties,
                    userProperties,
                    modulesProperties,
                    tableProperties,
                    component,
                    cancelQueryStatus
                )
            )
        );

        // Type guard to ensure result has items and hasMore properties
        function isValidResult(
            result: unknown
        ): result is { items: ITableRow[]; hasMore: boolean } {
            return (
                typeof result === "object" &&
                result !== null &&
                "items" in result &&
                Array.isArray((result).items) &&
                "hasMore" in result
            );
        }

        // Combine results from the current batch of parallel executions
        const combinedBatchItems = results
            .filter(isValidResult) // Only include valid results
            .flatMap((result) => result.items);
        allResults = allResults.concat(combinedBatchItems);

        setRowCount(allResults.length);
        overallHasMore = results.every((result) => isValidResult(result) && result.hasMore);

        // If cancelQueryStatus is set, stop the loop
        if (cancelQueryStatus.current) {
            break;
        }
    }

    return allResults;
}

// Fetch and process data
async function fetchAndProcessData(
    columns: IColumnsProperties[],
    filters: IFiltersProperties[],
    currentOffset: number,
    enumDataMap: TEnumDataMap,
    precomputedLookupMap: TPrecomputedMap,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    tableProperties: ITableHeader,
    component: ComponentProperties,
    cancelQueryStatus: React.MutableRefObject<boolean>,
) {
    if (currentOffset >= appsProperties[EApplications.limit] || cancelQueryStatus.current) {
        return [];
    }

    const rest = await ToolsQuery.get({
        source: QuerySource.Query,
        framework_pool: appsProperties[EApplications.pool],
        query: tableProperties[ETableHeader.queryID],
        sessionMode: appsProperties[EApplications.session],
        filters: filters,
        language: userProperties[EUsers.language],
        offset: currentOffset,
        limit: appsProperties[EApplications.offset],
        override_target_pool: component.overrideQueryPool,
        modulesProperties,
        jwt_token: appsProperties[EApplications.jwt_token]
    });

    if (rest.status !== ResultStatus.success) {
        return [];
    }

    const processedRows: ITableRow[] = await Promise.all(
        rest.items.map(async (row: ITableRow) => {
            const rowValue: ITableRow = {
                [TablesGridHardCoded.row_id]: row[TablesGridHardCoded.row_id].toString()
            };

            await Promise.all(
                Object.keys(row).map(async (column: string) => {
                    const columnProperties: IColumnsProperties | undefined = columns.find(
                        (props: IColumnsProperties) => props.target === column
                    ) as IColumnsProperties;

                    if (columnProperties) {
                        switch (columnProperties.rules) {
                            case EDictionaryRules.enum:
                                const enumLabel = enumDataMap[column]?.find(
                                    (enumValue) => enumValue[EEnumValues.value] === row[column]
                                );
                                rowValue[column] = row[column];
                                if (enumLabel) {
                                    rowValue[column + "_LABEL"] = enumLabel[EEnumValues.label];
                                }
                                break;
                            case EDictionaryRules.lookup:
                                const precomputedLookup = precomputedLookupMap.get(columnProperties.accessorKey);
                                if (precomputedLookup !== undefined) {
                                    const lookupLabelID = precomputedLookup.labelKey as string;
                                    let lookupLabel: Record<string, string> | undefined;

                                    const idMap = precomputedLookup.idMap;

                                    let value = typeof row[column] === 'string' ? row[column].trim() as string : row[column] as number;

                                    if (columnProperties.dynamic_params !== null && columnProperties.dynamic_params !== "" && columnProperties.dynamic_params !== undefined) {

                                        const dynamicParamsMap = parseDynamicParams(columnProperties.dynamic_params);
                                        dynamicParamsMap.forEach((field, key) => {
                                            const targetKey: IColumnsProperties | undefined = columns.find((props: IColumnsProperties) => (props.accessorKey) === field);
                                            if (targetKey && row[targetKey.target] !== undefined) {
                                                value += ";" + row[targetKey.target]; // Concatenate with a separator
                                            }
                                        });
                                        lookupLabel = idMap.get(value);
                                    } else {
                                        lookupLabel = idMap.get(value);
                                    }
                                    rowValue[column] = typeof row[column] === 'string' ? row[column].trim() : row[column];
                                    if (lookupLabel) {
                                        rowValue[column + "_LABEL"] = lookupLabel[lookupLabelID]?.trim() ?? lookupLabel[lookupLabelID]
                                            ;
                                    }
                                }
                                break;
                            default:
                                let columnID = columnProperties.target ?? columnProperties.field;
                                if (columnID === TablesGridHardCoded.row_id)
                                    rowValue[columnID] = row[columnID].toString();
                                else
                                    rowValue[columnID] = typeof row[columnID] === 'string' ? row[columnID].trim() : row[columnID];
                                break;
                        }
                    } else {
                        if (column === TablesGridHardCoded.row_id)
                            rowValue[column] = row[column].toString();
                        else
                            rowValue[column] = typeof row[column] === 'string' ? row[column].trim() : row[column];
                    }
                })
            );

            return rowValue;
        })
    );

    return {
        items: processedRows,
        hasMore: rest.hasMore
    };
}

interface IGetEntireDataParams {
    columns: IColumnsProperties[],
    offset: number,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    tableProperties: ITableHeader,
    rowsFilter: IFiltersProperties[],
    component: ComponentProperties,
    cancelQueryStatus: React.MutableRefObject<boolean>,
    setRowCount: React.Dispatch<React.SetStateAction<number>>;
}

// Fetch data
const getEntireData = async (props: IGetEntireDataParams) => {
    const { columns, offset, appsProperties, userProperties, modulesProperties, tableProperties, rowsFilter, component, cancelQueryStatus, setRowCount } = props;
    let rows: ITableRow[] = [];

    const secondArrayFields = new Set(columns.map((columnProperties: IColumnsProperties) => columnProperties.target ?? columnProperties.field));
    let filters = rowsFilter.filter((filterProperties: IFiltersProperties) => secondArrayFields.has(filterProperties.field));
    const batchSize = 3; // Number of concurrent requests at a time
    const parallelQuery = 1  // Number of parallel requests

    // Fetch enum and lookup data
    const [enumDataMap, precomputedLookupMap] = await Promise.all([
        fetchEnumData(columns, batchSize, appsProperties, userProperties, modulesProperties),
        fetchLookupData(columns, batchSize, appsProperties, userProperties, modulesProperties)
    ]);

    // Fetch and process data
    const fetchAndProcessDataParams = {
        columns,
        filters,
        initialOffset: offset,
        enumDataMap,
        precomputedLookupMap,
        appsProperties,
        userProperties,
        tableProperties,
        component,
        cancelQueryStatus,
        parallelCount: parallelQuery,
        modulesProperties,
        setRowCount: setRowCount

    }
    rows = await fetchAndProcessDataInParallel(fetchAndProcessDataParams);

    return rows;
};

interface IFetchEntireDataParams {
    tables: IGetTableProperties,
    componentProperties: ComponentProperties,
    columnsFilter: CColumnsFilter,
    rowsFilterRef: React.MutableRefObject<IFiltersProperties[]>,
    cancelQueryStatus: React.MutableRefObject<boolean>,
    loadDataRef: React.MutableRefObject<boolean>,
    getFilters: (params: IGetFiltersParams) => IFiltersProperties[],
    setOpenFilters: React.Dispatch<React.SetStateAction<boolean>>,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    setRowCount: React.Dispatch<React.SetStateAction<number>>;
}

const fetchEntireData = async (props: IFetchEntireDataParams) => {
    const { tables, componentProperties, columnsFilter, rowsFilterRef, cancelQueryStatus, loadDataRef, getFilters, setOpenFilters, appsProperties, userProperties, modulesProperties, setRowCount } = props;
    let entireData: ITableRow[] = [];

    if (loadDataRef.current || tables.tableProperties[ETableHeader.autoLoad]) {
        rowsFilterRef.current = getFilters({ columnsFilter: columnsFilter, componentProperties });
        const getEntireDataParams = {
            columns: tables.columns,
            offset: 0,
            appsProperties: appsProperties,
            userProperties: userProperties,
            modulesProperties: modulesProperties,
            tableProperties: tables.tableProperties,
            rowsFilter: rowsFilterRef.current,
            component: componentProperties,
            cancelQueryStatus: cancelQueryStatus,
            setRowCount: setRowCount
        }
        entireData = await getEntireData(getEntireDataParams);
    } else {
        entireData = [];
        rowsFilterRef.current = componentProperties.filters;
        setOpenFilters(true);
        cancelQueryStatus.current = false;
        const getEntireDataParams = {
            columns: tables.columns,
            offset: 0,
            appsProperties: appsProperties,
            userProperties: userProperties,
            modulesProperties: modulesProperties,
            tableProperties: tables.tableProperties,
            rowsFilter: rowsFilterRef.current,
            component: componentProperties,
            cancelQueryStatus: cancelQueryStatus,
            setRowCount: setRowCount
        }
        if (componentProperties.initialState !== undefined) {
            entireData = await getEntireData(getEntireDataParams);
        }
    }
    cancelQueryStatus.current = false;
    return entireData;
};


interface IGetDataFromAPIParams {
    componentProperties: ComponentProperties,
    tablePropertiesRef: React.MutableRefObject<ITableHeader>,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    displayMode: LYComponentDisplayMode,
    readonly: boolean,
    tableState: ITableState,
    ActionsForGrid: IColumnsProperties;
    ActionsForTable: IColumnsProperties;
    ActionsNone: IColumnsProperties,
    getColumnsVisibility: (item: IColumnsProperties) => IColumnsVisibility,
    columnsFilter: CColumnsFilter,
    rowsFilterRef: React.MutableRefObject<IFiltersProperties[]>,
    cancelQueryStatus: React.MutableRefObject<boolean>,
    loadDataRef: React.MutableRefObject<boolean>,
    getFilters: (params: IGetFiltersParams) => IFiltersProperties[],
    setOpenFilters: React.Dispatch<React.SetStateAction<boolean>>,
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void;
    setFilters: (
        tables: ITablesProperties,
        component: ComponentProperties,
        columnsFilter: CColumnsFilter
    ) => void;
    setRowCount: React.Dispatch<React.SetStateAction<number>>;
}


const getDataFromAPI = (async (params: IGetDataFromAPIParams) => {
    const {
        componentProperties,
        tablePropertiesRef,
        appsProperties,
        userProperties,
        modulesProperties,
        displayMode,
        readonly,
        tableState,
        ActionsForGrid,
        ActionsForTable,
        ActionsNone,
        getColumnsVisibility,
        columnsFilter,
        rowsFilterRef,
        cancelQueryStatus,
        loadDataRef,
        getFilters,
        setOpenFilters,
        updateTableState,
        setFilters,
        setRowCount
    } = params;
    return new Promise(async (resolve) => {
        const tables = await fetchTableProperties({
            table_id: componentProperties.id, appsProperties: appsProperties, userProperties: userProperties,
            getAllColumns: true, columnsFilter, rowsFilterRef, modulesProperties
        });
        tablePropertiesRef.current = tables.tableProperties;

        const columnsPropertiesParams = {
            tables,
            tableState,
            componentProperties,
            displayMode,
            readonly,
            ActionsForGrid,
            ActionsForTable,
            ActionsNone,
        }
        const columnsProperties = setColumnProperties(columnsPropertiesParams);
        const columnsVisibility = setColumnVisibility(tables, getColumnsVisibility);

        const fetchEntireDataParams = {
            tables,
            componentProperties,
            columnsFilter,
            rowsFilterRef,
            cancelQueryStatus,
            loadDataRef,
            getFilters,
            setOpenFilters,
            appsProperties,
            userProperties,
            modulesProperties,
            setRowCount
        }

        const entireData = await fetchEntireData(fetchEntireDataParams);
        updateTableState("tableData", {table_id: componentProperties.id,  rows: entireData, columns: tables.columns, columnsVisibility: columnsVisibility });
        setFilters(tables, componentProperties, columnsFilter);

        resolve({ table_id: componentProperties.id, rows: entireData, columns: columnsProperties, columnsVisibility: columnsVisibility });
    });
});

export interface FetchDataParams {
    componentProperties: ComponentProperties;
    apiRef: React.MutableRefObject<TableGridRef | undefined>;
    displayMode: LYComponentDisplayMode;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    tablePropertiesRef: React.MutableRefObject<ITableHeader>;
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps;
    readonly: boolean;
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void;
    setOpenFilters: React.Dispatch<React.SetStateAction<boolean>>;
    tableState: ITableState;
    ActionsForGrid: IColumnsProperties;
    ActionsForTable: IColumnsProperties;
    ActionsNone: IColumnsProperties;
    columnsFilter: CColumnsFilter;
    rowsFilterRef: React.MutableRefObject<IFiltersProperties[]>;
    cancelQueryStatus: React.MutableRefObject<boolean>;
    loadDataRef: React.MutableRefObject<boolean>;
    getFilters: (params: IGetFiltersParams) => IFiltersProperties[],
    setFilters: (
        tables: ITablesProperties,
        component: ComponentProperties,
        columnsFilter: CColumnsFilter
    ) => void;
    getColumnsVisibility: (item: IColumnsProperties) => IColumnsVisibility;
    dialogComponent: React.MutableRefObject<ComponentProperties>;
    restoreState: boolean;
    setRowCount: React.Dispatch<React.SetStateAction<number>>;
}

export const fetchDataHandler = async (params: FetchDataParams) => {
    const {
        componentProperties,
        apiRef,
        displayMode,
        setIsLoading,
        tablePropertiesRef,
        appsProperties,
        userProperties,
        modulesProperties,
        readonly,
        updateTableState,
        setOpenFilters,
        tableState,
        ActionsForGrid,
        ActionsForTable,
        ActionsNone,
        columnsFilter,
        rowsFilterRef,
        cancelQueryStatus,
        loadDataRef,
        getFilters,
        setFilters,
        getColumnsVisibility,
        dialogComponent,
        restoreState,
        setRowCount
    } = params;

    setIsLoading(true);

    const getDataFromAPIParams = {
        componentProperties,
        tablePropertiesRef,
        appsProperties,
        userProperties,
        modulesProperties,
        displayMode,
        readonly,
        tableState,
        ActionsForGrid,
        ActionsForTable,
        ActionsNone,
        getColumnsVisibility,
        columnsFilter,
        rowsFilterRef,
        cancelQueryStatus,
        loadDataRef,
        getFilters,
        setOpenFilters,
        updateTableState,
        setFilters,
        setRowCount
    }
    const data = await getDataFromAPI(getDataFromAPIParams);
    flushSync(async () => {
        updateTableState("tableData", data as { table_id: number;rows: ITableRow[]; columns: IColumnsProperties[]; columnsVisibility: IColumnsVisibility });
        await sleep(0);
        if (apiRef.current !== null && apiRef.current !== undefined) {
            // check the condition for restore state
            if (restoreState) {
                if (dialogComponent.current.previous && dialogComponent.current.previous.initialState) {
                    if (dialogComponent.current.previous.initialState !== undefined && dialogComponent.current.previous.initialState !== null)
                        apiRef.current.restoreState(dialogComponent.current.previous.initialState);
                } else
                    if (componentProperties.initialState !== undefined && componentProperties.initialState !== null)
                        apiRef.current.restoreState(componentProperties.initialState);
            }
            apiRef.current.autosizeColumns();
        }
        setIsLoading(false);
    });


};
