/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports

// Custom Imports
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { IAppsProps } from "@ly_types/lyApplications";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { IModulesProps } from "@ly_types/lyModules";
import { IColumnsProperties, ITableRow } from "@ly_types/lyTables";
import { IColumnsFilter } from "@ly_types/lyFilters";
import { Excel } from "@ly_utils/JSExcelUtils";
import { ESeverity, IErrorState } from "@ly_utils/commonUtils";
import { ComponentProperties } from "@ly_types/lyComponents";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { ELookup, ILookupOption } from "@ly_types/lyLookup";
import { EEnumHeader, EEnumValues } from "@ly_types/lyEnums";
import { ResultStatus } from "@ly_types/lyQuery";
import { ITransformedObject } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ENextNumber } from "@ly_types/lyNextNum";
import { ESequence } from "@ly_types/lySequence";

export interface IFileListenerProps {
    files: File[]
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps;
    importColumns: IColumnsProperties[];
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    tableState: ITableState;
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void;
    component: ComponentProperties;
}


export const importExcelFiles = async (props: IFileListenerProps) => {
    const { files, appsProperties, userProperties, modulesProperties, importColumns, setErrorState, setIsLoading, updateTableState, tableState, component } = props;

    var file = files[0];
    let importData = await Excel.import(file);
    let sysdate = new Date().toISOString();

    // Get Sequence value for all the file to be imported. Sequence will not change during the import
    let dictionaryRules = importColumns.filter((columns: IColumnsProperties) => columns.rules === EDictionaryRules.sequence);
    let value: { [key: string]: ITableRow } = {};
    await Promise.all(dictionaryRules.map(async (column: IColumnsProperties) => {
        value[(column.target === null) ? column.field : column.target] = await ToolsDictionary.getSequence({
            appsProperties: appsProperties,
            [ESequence.id]: parseInt(column.rulesValues),
            data: {},
            modulesProperties: modulesProperties
        })
    }))

    // Read all the grid to set dictionary value and default value for column not in the excel files
    if (!importData) {
        setErrorState({ open: true, message: "Failed to import data from the file.", severity: ESeverity.error });
        return [];
    }
    
    await Promise.all(importData.map(async (item) => {
        await Promise.all(importColumns.map(async (column) => {
            const target = column.accessorKey.replace("_LABEL", "");
            if (target !== undefined && target !== null && column.editable)
                switch (column.rules) {
                    case EDictionaryRules.lookup:
                        if (item[target] !== null && item[target] !== undefined) {
                            let data = Object.keys(item).reduce((acc, key) => {
                                acc[key] = { value: item[key] };
                                return acc;
                            }, {} as  IColumnsFilter | ITransformedObject );

                            const results = await ToolsDictionary.getLookup({
                                appsProperties,
                                userProperties,
                                [ELookup.id]: parseInt(column.rulesValues),
                                data: data,
                                dynamic_params: column.dynamic_params,
                                fixed_params: column.fixed_params,
                                getAllValues: false,
                                modulesProperties,
                                value: item[target],
                            });
                            if (results.status === ResultStatus.success && results.data !== undefined && results.data !== null && results.data.length > 0) {
                                const dd_id = results.header[ELookup.dd_id] as keyof ILookupOption;
                                const dd_label = results.header[ELookup.dd_label] as keyof ILookupOption;
                                item[target + "_LABEL"] = results.data[0][dd_label];
                                if (column.output_params !== undefined && column.output_params !== null) {
                                    // Parse the output_params (e.g., SY=SY;RT=RT)
                                    const params = column.output_params.split(';');
                                    params.forEach((param: string) => {
                                        const [inputKey, outputKey] = param.split('=');
                                        if (inputKey && outputKey && inputKey in results.data[0]) {
                                            item[outputKey] = results.data[0][inputKey as keyof ILookupOption];
                                        }
                                    });
                                }
                            } else {
                                setErrorState({ open: true, message: "Check imported data, some values were not found... ", severity:  ESeverity.error })
                                item["error"] = true
                            }
                        } else
                            item[target] = null;
                        break;
                    case EDictionaryRules.enum:
                        if (item[target] !== null && item[target] !== undefined) {
                            const results = await ToolsDictionary.getEnums({
                                appsProperties: appsProperties,
                                userProperties: userProperties,
                                [EEnumHeader.id]: parseInt(column.rulesValues),
                                modulesProperties
                            });
                            if (results.status === ResultStatus.success && results.data !== undefined && results.data !== null && results.data.length > 0) {
                                const enumLabel = results.data.find((enumData: ITableRow) => enumData[EEnumValues.value] === item[target])
                                item[target + "_LABEL"] = enumLabel[EEnumValues.label];
                            } else {
                                setErrorState({ open: true, message: "Check imported data, some values were not found... ", severity:  ESeverity.error })
                                item["error"] = true
                            }
                        } else
                            item[target] = null;
                        break;
                    case EDictionaryRules.login:
                        item[target] = item[target] ?? userProperties[EUsers.id];
                        break;
                    case EDictionaryRules.sysdate:
                    case EDictionaryRules.current_date:
                        if (column.type === EDictionaryType.jdedate)
                            item[target] = item[target] ?? ToolsDictionary.DateToJde(sysdate);
                        else
                            item[target] = item[target] ?? sysdate;
                        break;
                    case EDictionaryRules.sequence:
                        item[target] = item[target] ?? value[column["field"]];
                        break;
                    case EDictionaryRules.nextNumber:
                        item[target] = item[target] ?? await ToolsDictionary.getNextNumber({
                            appsProperties: appsProperties,
                            userProperties: userProperties,
                            [ENextNumber.id]: column.rulesValues,
                            overrideQueryPool: component.overrideQueryPool,
                            modulesProperties: modulesProperties
                        })
                        break;
                    case EDictionaryRules.default:
                        item[target] = item[target] ?? column.rulesValues;
                        break;
                    default:
                        item[target] = item[target] ?? (value[target] ?? column.default);
                        break
                }

        }));

        return item;
    })
    );

    return importData;
}