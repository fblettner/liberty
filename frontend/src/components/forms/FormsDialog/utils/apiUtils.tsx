/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { lyGetDialogDetails, lyGetDialogHeader, lyGetDialogTab } from "@ly_services/lyDialogs";
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications, IAppsProps } from "@ly_types/lyApplications";
import { ComponentProperties, IComponentParameters, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { CDialogContent, EDialogDetails, EDialogTabs, EDialogHeader, DialogKeys, IDialogDetails, IDialogHeader, IDialogsTab } from "@ly_types/lyDialogs";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { t } from "i18next";
import { refreshDisabledColumnsHandler } from "@ly_components/forms/FormsDialog/utils/dialogUtils";
import React from "react";
import { ESeverity, IErrorState, IRestData } from "@ly_utils/commonUtils";
import { OnReserveFunction } from "@ly_components/forms/FormsDialog/utils/commonUtils";
import { IModulesProps } from "@ly_types/lyModules";
import { ETableHeader, IColumnsProperties } from "@ly_types/lyTables";
import { ENextNumber } from "@ly_types/lyNextNum";
import { ESequence } from "@ly_types/lySequence";

export interface ISaveDataAPIParams {
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    dialogsMode: LYComponentMode,
    componentProperties: ComponentProperties,
    isChildren: boolean,
    dialogContent: CDialogContent,
    dialogHeaderRef: React.MutableRefObject<IDialogHeader>,
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    parentKey: DialogKeys,
    setIsModified: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>
}

export const saveDataAPI = async (params: ISaveDataAPIParams) => {
    const { dialogContent, appsProperties, userProperties, modulesProperties, dialogsMode, componentProperties, isChildren, dialogHeaderRef, dialogDetailsRef, parentKey, setIsModified, setErrorState } = params;

    let restData: IRestData = {};
    await Promise.all(Object.keys(dialogContent.fields).map(async (item: string) => {
        if (dialogContent.fields[item][EDialogDetails.target] !== null)
            switch (dialogContent.fields[item][EDialogDetails.rules]) {
                case EDictionaryRules.sequence:
                    let sequence;
                    if (dialogContent.fields[item][EDialogDetails.rulesValues] !== null) {
                        sequence = await ToolsDictionary.getSequence({
                            appsProperties: appsProperties,
                            [ESequence.id]: parseInt(dialogContent.fields[item][EDialogDetails.rulesValues]),
                            data: dialogContent.fields,
                            dynamic_params: dialogContent.fields[item][EDialogDetails.dynamic_params],
                            fixed_params: dialogContent.fields[item][EDialogDetails.fixed_params],
                            modulesProperties: modulesProperties
                        });
                        restData[dialogContent.fields[item][EDialogDetails.target]] =
                            (dialogContent.fields[item].value !== "" && dialogContent.fields[item].value !== null)
                                ? dialogContent.fields[item].value : sequence;

                    } else
                        restData[dialogContent.fields[item][EDialogDetails.target]] = dialogContent.fields[item].value;
                    dialogContent.fields[item].value = restData[dialogContent.fields[item][EDialogDetails.target]]
                    break;
                case EDictionaryRules.nextNumber:
                    let nextNumber;
                    if (dialogsMode === LYComponentMode.add || dialogsMode === LYComponentMode.copy) {
                        if (dialogContent.fields[item][EDialogDetails.rulesValues] !== null) {
                            nextNumber = await ToolsDictionary.getNextNumber({
                                appsProperties: appsProperties,
                                userProperties: userProperties,
                                [ENextNumber.id]: dialogContent.fields[item][EDialogDetails.rulesValues],
                                overrideQueryPool: componentProperties.overrideQueryPool,
                                modulesProperties: modulesProperties
                            })
                        }
                        else
                        nextNumber = dialogContent.fields[item].value;
                    }
                    else
                        nextNumber = dialogContent.fields[item].value;
                    restData[dialogContent.fields[item][EDialogDetails.target]] = nextNumber;
                    dialogContent.fields[item].value = restData[dialogContent.fields[item][EDialogDetails.target]]
                    break;
                case EDictionaryRules.boolean:
                    restData[dialogContent.fields[item][EDialogDetails.target]] =
                        (dialogContent.fields[item].value)
                            ? dialogContent.fields[item][EDialogDetails.rulesValues]
                            : "N";
                    break
                case EDictionaryRules.login:
                    restData[dialogContent.fields[item][EDialogDetails.target]] = userProperties[EUsers.id];
                    dialogContent.fields[item].value = restData[dialogContent.fields[item][EDialogDetails.target]]
                    break;
                case EDictionaryRules.sysdate:
                case EDictionaryRules.current_date:
                    if (dialogContent.fields[item][EDialogDetails.type] === EDictionaryType.jdedate)
                        restData[dialogContent.fields[item][EDialogDetails.target]] = ToolsDictionary.DateToJde(new Date().toISOString());
                    else
                        restData[dialogContent.fields[item][EDialogDetails.target]] = new Date().toISOString();
                    dialogContent.fields[item].value = restData[dialogContent.fields[item][EDialogDetails.target]]
                    break;
                case EDictionaryRules.password:
                    dialogContent.fields[item].value = (dialogContent.fields[item].value !== null && dialogContent.fields[item].value !== "")
                        ? await ToolsQuery.encrypt(dialogContent.fields[item].value as string, modulesProperties) 
                        : null;
                    restData[dialogContent.fields[item][EDialogDetails.target]] = dialogContent.fields[item].value
                    break
                default:
                    restData[dialogContent.fields[item][EDialogDetails.target]] = dialogContent.fields[item].value
            }

    }));

    await Promise.all(Object.keys(dialogContent.fields).map(async (item) => {
        if (dialogContent.fields[item][EDialogDetails.target] !== null)
            switch (dialogContent.fields[item][EDialogDetails.rules]) {
                case EDictionaryRules.default:
                    restData[dialogContent.fields[item][EDialogDetails.target]] = (dialogContent.fields[item].value !== null)
                        ? dialogContent.fields[item].value
                        : (dialogContent.fields[item][EDialogDetails.rulesValues] !== null) ? dialogContent.fields[dialogContent.fields[item][EDialogDetails.rulesValues]].value : null;
                    break;
            }
    }));

    let keyDLG:DialogKeys = {}
    if (!isChildren)
        dialogDetailsRef.current.filter((keyField: IDialogDetails) => keyField[EDialogDetails.key] === "Y").forEach((item: IDialogDetails) => {
            if (item[EDialogDetails.target] !== null)
                keyDLG[item[EDialogDetails.target]] = restData[item[EDialogDetails.target]];
        });
    else {
        dialogDetailsRef.current.filter((keyField: IDialogDetails) => keyField[EDialogDetails.key] === "Y").forEach((item: IDialogDetails) => {
            if (componentProperties.filterStringDLG !== null && componentProperties.filterStringDLG !== undefined) {

                componentProperties.filterStringDLG.split(";").forEach((filters: string) => {
                    let filter = filters.split("=")
                    if (parentKey!== null && parentKey[filter[1]] !== undefined)
                        restData[filter[0]] = parentKey[filter[1]]
                })
            } else
                if (parentKey!== null && parentKey[item[EDialogDetails.target]] !== undefined)
                    restData[item[EDialogDetails.target]] = parentKey[item[EDialogDetails.target]]
        });
    }

    if (componentProperties.tableProperties && dialogsMode === LYComponentMode.edit) {

        // If audit is enabled, save record before modifying
        if (componentProperties.tableProperties[ETableHeader.audit]) {
            let restAudit: IRestData = {};

            componentProperties.tableProperties[ETableHeader.key].forEach((key: string) => {
                restAudit[key] = restData[key]
            })

            let result;
            result = await ToolsQuery.audit(
                componentProperties.tableProperties[ETableHeader.dbName],
                userProperties[EUsers.id],
                {
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: componentProperties.tableProperties[ETableHeader.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                },
                JSON.stringify(restAudit));
        }
    }

    let result;

    if (dialogsMode === LYComponentMode.add || dialogsMode === LYComponentMode.copy) {
        result = await ToolsQuery.post({
            source: QuerySource.Query,
            framework_pool: appsProperties[EApplications.pool],
            query: dialogHeaderRef.current[EDialogHeader.queryID],
            sessionMode: appsProperties[EApplications.session],
            override_target_pool: componentProperties.overrideQueryPool,
            modulesProperties: modulesProperties,
            jwt_token: appsProperties[EApplications.jwt_token]
        },
            JSON.stringify(restData));
    } else {
        result = await ToolsQuery.put({
            source: QuerySource.Query,
            framework_pool: appsProperties[EApplications.pool],
            query: dialogHeaderRef.current[EDialogHeader.queryID],
            sessionMode: appsProperties[EApplications.session],
            override_target_pool: componentProperties.overrideQueryPool,
            modulesProperties: modulesProperties,
            jwt_token: appsProperties[EApplications.jwt_token]
        },
            JSON.stringify(restData));
    }

    if (result.status === ResultStatus.error)
        setErrorState({ open: true, message: result.items[0].message, severity:   ESeverity.error })
    else {
        setErrorState({ open: true, message: t("save_ok"), severity: ESeverity.success })
        setIsModified(false);
    }

    return { status: result.status, message: (result.status === ResultStatus.error) ? result.items[0].message : {}, keys: (componentProperties.isChildren) ? parentKey : keyDLG }
}

interface IGetDialogParams {
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    componentProperties: ComponentProperties,
    dialogsMode: LYComponentMode,
    dialogContent: CDialogContent,
    dialogComponent: CDialogContent
}

export const getDialogProperties = async (params: IGetDialogParams) => {
    const { dialogDetailsRef, appsProperties, userProperties, componentProperties, dialogsMode, dialogContent, dialogComponent, modulesProperties } = params;
    dialogDetailsRef.current = await lyGetDialogDetails({
        appsProperties: appsProperties,
        userProperties: userProperties,
        dialogID: componentProperties.id,
        modulesProperties: modulesProperties
    })
    for (const item of dialogDetailsRef.current
        .filter((dictionary: IDialogDetails) => dictionary[EDialogDetails.component] === LYComponentType.Dictionary)) {
        /* Set Field properties */
        let value = null

        if (dialogsMode !== LYComponentMode.edit) {
            if (componentProperties.filters.length > 0) {
                let target = item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID];
                componentProperties.filters.filter((keyField: IFiltersProperties) => keyField["field"] === target).forEach((field: IFiltersProperties) => {
                    value = field.value
                })
            }
        }

        if (dialogsMode === LYComponentMode.edit) {
            value = null
            if (componentProperties.params)
                if (componentProperties.params.length > 0) {
                    let target = item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID];
                    componentProperties.params.filter((keyField: IComponentParameters) => keyField["field"] === target).forEach((field: IComponentParameters) => {
                        value = field.value
                    })
                }
        }

        dialogContent.fields[item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID]] = {
            [EDialogDetails.id]: item[EDialogDetails.dictionaryID],
            [EDialogDetails.rules]: item[EDialogDetails.rules],
            [EDialogDetails.rulesValues]: item[EDialogDetails.rulesValues],
            value: (value !== null)
                ? (item[EDialogDetails.type] === "number")
                    ? Number(value)
                    : (item[EDialogDetails.rules] === EDictionaryRules.boolean)
                        ? (item[EDialogDetails.rulesValues] === value) ? true : false
                        : value
                : (item[EDialogDetails.default] !== null && item[EDialogDetails.default] !== "" && value !== "")
                    ? (item[EDialogDetails.type] === "number")
                        ? Number(item[EDialogDetails.default])
                        : (item[EDialogDetails.rules] === EDictionaryRules.boolean)
                            ? (item[EDialogDetails.rulesValues] === item[EDialogDetails.default]) ? true : false
                            : item[EDialogDetails.default]
                    : (item[EDialogDetails.rules] === EDictionaryRules.boolean)
                        ? false
                        : null,
            [EDialogDetails.target]: item[EDialogDetails.target],
            [EDialogDetails.disabled]: (item[EDialogDetails.disabled] === "Y") 
                ? true 
                : (item[EDialogDetails.key] === "Y" && componentProperties.componentMode === LYComponentMode.edit) 
                    ? true 
                    : false,
            [EDialogDetails.required]: (item[EDialogDetails.required] === "Y") ? true : false,
            [EDialogDetails.visible]: (item[EDialogDetails.visible] === "Y") ? true : false,
            [EDialogDetails.key]: (item[EDialogDetails.key] === "Y") ? true : false,
            [EDialogDetails.dynamic_params]: item[EDialogDetails.dynamic_params],
            [EDialogDetails.fixed_params]: item[EDialogDetails.fixed_params],
            [EDialogDetails.output_params]: item[EDialogDetails.output_params],
            [EDialogDetails.cdn_id]: item[EDialogDetails.cdn_id],
            [EDialogDetails.cdn_dynamic_params]: item[EDialogDetails.cdn_dynamic_params],
            [EDialogDetails.cdn_fixed_params]: item[EDialogDetails.cdn_fixed_params],
            [EDialogDetails.type]: item[EDialogDetails.type]
        };
    }

    for (const item of dialogDetailsRef.current
        .filter((dictionary: IDialogDetails) => dictionary[EDialogDetails.component] !== LYComponentType.Dictionary)) {
        dialogComponent.fields[item[EDialogDetails.id]] = {
            [EDialogDetails.id]: item[EDialogDetails.id],
            [EDialogDetails.rules]: null,
            [EDialogDetails.rulesValues]: null,
            value: null,
            [EDialogDetails.target]: null,
            [EDialogDetails.disabled]: false,
            [EDialogDetails.required]: false,
            [EDialogDetails.visible]: true,
            [EDialogDetails.key]: false,
            [EDialogDetails.dynamic_params]: item[EDialogDetails.dynamic_params],
            [EDialogDetails.fixed_params]: item[EDialogDetails.fixed_params],
            [EDialogDetails.output_params]: item[EDialogDetails.output_params],
            [EDialogDetails.cdn_id]: item[EDialogDetails.cdn_id],
            [EDialogDetails.cdn_dynamic_params]: item[EDialogDetails.cdn_dynamic_params],
            [EDialogDetails.cdn_fixed_params]: item[EDialogDetails.cdn_fixed_params],
            [EDialogDetails.type]: item[EDialogDetails.type]
        };
    }

}

export interface IGetDistinctTabParams {
    mode: LYComponentMode,
    content: CDialogContent,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    componentProperties: ComponentProperties,
    isModified: boolean,
    setTabs: React.Dispatch<React.SetStateAction<IDialogsTab[]>>,
    setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

export const getDistinctTab = async (params: IGetDistinctTabParams) => {
    const { mode, content, appsProperties, userProperties, componentProperties, isModified, setTabs, setActiveTab, modulesProperties } = params;
    let result = await lyGetDialogTab({
        appsProperties: appsProperties,
        userProperties: userProperties,
        dialogID: componentProperties.id,
        componentMode: mode,
        data: content,
        isModified: isModified,
        modulesProperties: modulesProperties
    }
    );
    setTabs(result);
    if (componentProperties.currentTab !== undefined)
        setActiveTab(componentProperties.currentTab[EDialogTabs.sequence])
    else
        setActiveTab(componentProperties.id + '-tab-id-1');
}
const isRecordExists = async (
    dialogHeaderRef: React.MutableRefObject<IDialogHeader>,
    componentProperties: ComponentProperties,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps
) => {
    let rest = await ToolsQuery.get({
        source: QuerySource.Query,
        framework_pool: appsProperties[EApplications.pool],
        query: dialogHeaderRef.current[EDialogHeader.queryID],
        sessionMode: appsProperties[EApplications.session],
        filters: componentProperties.filters,
        language: userProperties[EUsers.language],
        override_target_pool: componentProperties.overrideQueryPool,
        modulesProperties: modulesProperties,
        jwt_token: appsProperties[EApplications.jwt_token]
    })
    return rest;
}

export interface IInitDialogProps {
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    componentProperties: ComponentProperties,
    dialogsMode: LYComponentMode,
    setDialogsMode: React.Dispatch<React.SetStateAction<LYComponentMode>>,
    dialogContent: CDialogContent,
    setDialogContent: React.Dispatch<React.SetStateAction<CDialogContent>>,
    dialogHeaderRef: React.MutableRefObject<IDialogHeader>,
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    dialogComponent: CDialogContent,
    setDialogComponent: React.Dispatch<React.SetStateAction<CDialogContent>>,
    isModified: boolean,
    setTabs: React.Dispatch<React.SetStateAction<IDialogsTab[]>>,
    setActiveTab: React.Dispatch<React.SetStateAction<string>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    reserveRecord: OnReserveFunction
}

// Declare functions
export const initDialog = async (params: IInitDialogProps) => {
    const { setIsLoading, dialogHeaderRef, componentProperties, appsProperties, userProperties, modulesProperties, dialogsMode, dialogContent, dialogDetailsRef, dialogComponent,
        setDialogsMode, isModified, setTabs, setActiveTab, reserveRecord, setDialogContent, setDialogComponent } = params;

    setIsLoading(true);
    dialogHeaderRef.current = await lyGetDialogHeader({
        appsProperties: appsProperties,
        dialogID: componentProperties.id,
        modulesProperties: modulesProperties
    })

    const dialogPropertiesParams: IGetDialogParams = {
        dialogDetailsRef,
        appsProperties,
        userProperties,
        modulesProperties,
        componentProperties,
        dialogsMode,
        dialogContent,
        dialogComponent
    }
    switch (componentProperties.componentMode) {
        case LYComponentMode.add:
            await getDialogProperties(dialogPropertiesParams);
            setDialogsMode(LYComponentMode.add)
            break;
        case LYComponentMode.copy:
            let restCopy = await isRecordExists(
                dialogHeaderRef,
                componentProperties,
                appsProperties,
                userProperties,
                modulesProperties
            );
            await getDialogProperties(dialogPropertiesParams);
            if (restCopy.count > 0) {
                restCopy.metadata.forEach((item: IColumnsProperties) => {
                    if (dialogContent.fields[item.field]) {
                        dialogContent.fields[item.field].value =
                            (dialogContent.fields[item.field][EDialogDetails.rules] === EDictionaryRules.sequence
                                || dialogContent.fields[item.field][EDialogDetails.rules] === EDictionaryRules.nextNumber
                                || dialogContent.fields[item.field][EDialogDetails.rules] === EDictionaryRules.default)
                                ? null
                                : (dialogContent.fields[item.field][EDialogDetails.rules] === EDictionaryRules.boolean)
                                    ? (dialogContent.fields[item.field][EDialogDetails.rulesValues] === restCopy.items[0][item.field]) ? true : false
                                    : restCopy.items[0][item.field];

                    }
                });
            }
            setDialogsMode(LYComponentMode.copy)
            break;
        case LYComponentMode.edit:
            let restEdit = await isRecordExists(
                dialogHeaderRef,
                componentProperties,
                appsProperties,
                userProperties,
                modulesProperties
            );
            await getDialogProperties(dialogPropertiesParams);
            if (restEdit.count > 0) {
                restEdit.metadata.forEach((item: IColumnsProperties) => {
                    if (dialogContent.fields[item.field]) {
                        dialogContent.fields[item.field].value =
                            (dialogContent.fields[item.field][EDialogDetails.rules] === EDictionaryRules.boolean)
                                ? (dialogContent.fields[item.field][EDialogDetails.rulesValues] === restEdit.items[0][item.field]) ? true : false
                                : restEdit.items[0][item.field];
                    }
                });
                setDialogsMode(LYComponentMode.edit)
                reserveRecord();
            } else
                setDialogsMode(LYComponentMode.add);
            break;
    }

    const getDistinctTabParams: IGetDistinctTabParams = {
        mode: componentProperties.componentMode,
        content: dialogContent,
        appsProperties,
        userProperties,
        modulesProperties,
        componentProperties,
        isModified,
        setTabs,
        setActiveTab
    }
    await getDistinctTab(getDistinctTabParams);

    const refreshDisabledColumnsParams = {
        appsProperties,
        modulesProperties,
        dialogDetailsRef,
        dialogContent,
        setDialogContent,
        setDialogComponent
    }

    refreshDisabledColumnsHandler(refreshDisabledColumnsParams);
    setIsLoading(false);

}