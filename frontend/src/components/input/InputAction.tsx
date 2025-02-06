/*Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { t } from 'i18next';
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import ReactDOM from "react-dom";

// Custom Import
import { ToolsDictionary } from '@ly_services/lyDictionary';
import { getAppsProperties, getModules, getUserProperties } from '@ly_features/global';
import { EUsers, IUsersProps } from '@ly_types/lyUsers';
import { EActionsHeader, EActionsDirection, EActionsTasks, EActionsParams, EActionsType, IActionsData, IActionsStatus, IActionsHeader, IActionsParams, IActionsTasks, IActionsTasksParams, EActionsTasksParams } from '@ly_types/lyActions';
import { ComponentProperties, LYComponentDisplayMode, LYComponentEvent, LYComponentMode, LYComponentType, LYComponentViewMode } from '@ly_types/lyComponents';
import { ActionsType, IContentValue, IDialogAction, IRestData, OnChangeParams } from "@ly_utils/commonUtils";
import { EApplications, IAppsProps } from '@ly_types/lyApplications';
import { EDictionaryRules } from '@ly_types/lyDictionary';
import { lyGetActionsHeader, lyGetActionsParams, lyGetActionsTasks, lyGetActionsTasksParams } from '@ly_services/lyActions';
import { IFiltersProperties } from '@ly_types/lyFilters';
import { lyCheckConditions } from '@ly_services/lyConditions';
import { QueryMethod, QuerySource, ResultStatus } from '@ly_types/lyQuery';
import { ToolsQuery } from '@ly_services/lyQuery';
import { ToolsAPI } from '@ly_services/lyApi';
import { InputEnum } from '@ly_components/input/InputEnum/InputEnum';
import { InputLookup } from '@ly_components/input/InputLookup/InputLookup';
import { InputCheckbox } from '@ly_components/input/InputCheckbox';
import { Div_ResizeBox, Div_DialogWidget, Div_DialogWidgetTitle, Div_DialogWidgetTitleButtons, Div_DialogWidgetContent, Div_DialogWidgetButtons, Backdrop } from '@ly_components/styles/Div';
import { DIALOG_WIDGET_DIMENSION } from '@ly_utils/commonUtils';
import { FormsTable } from '@ly_components/forms/FormsTable/FormsTable';
import { FormsDialog } from '@ly_components/forms/FormsDialog/FormsDialog';
import { FormsUpload } from '@ly_components/forms/FormsUpload/FormsUpload';
import { FormsChart } from '@ly_components/forms/FormsChart/FormsChart';
import { FormsDashboard } from '@ly_components/forms/FormsDashboard/FormsDashboard';
import { CDialogContent, EDialogDetails, IDialogContent } from '@ly_types/lyDialogs';
import { IModulesProps } from '@ly_types/lyModules';
import { EConditions } from '@ly_types/lyConditions';
import { ENextNumber } from '@ly_types/lyNextNum';
import { ESequence } from '@ly_types/lySequence';
import { LYCancelIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYPlayCircleOutlineIcon } from '@ly_styles/icons';
import { Typography } from '@ly_components/common/Typography';
import { Paper_Dialogs, Paper_Table } from '@ly_components/styles/Paper';
import { useDeviceDetection, useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { Button } from "@ly_components/common/Button";
import { IconButton_Contrast } from '@ly_components/styles/IconButton';
import { Input } from '@ly_components/common/Input';
import { DefaultZIndex } from '@ly_components/types/common';
import { GridContainer, GridItem } from '@ly_components/common/Grid';

export interface InputActionProps {
    id: number;
    actionID: number;
    label: string;
    type: ActionsType;
    dialogContent: CDialogContent;
    dynamic_params: string;
    fixed_params: string;
    status: (event: IActionsStatus) => void;
    overrideQueryPool?: string
    disabled: boolean;
    component: ComponentProperties
};

export const InputAction = (props: InputActionProps) => {
    const isSmallScreen = useMediaQuery("(max-width: 600px)");
    const isMobile = useDeviceDetection();
    const [isFullScreen, setIsFullScreen] = useState(() => isSmallScreen || isMobile); // Set fullscreen initially if small screen
    const [dimensions, setDimensions] = useState({ width: DIALOG_WIDGET_DIMENSION.width, height: DIALOG_WIDGET_DIMENSION.height });
    const resizeRef = useRef<HTMLDivElement | null>(null);
    const titleBarRef = useRef<HTMLDivElement | null>(null); // Add ref for the title bar

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const appsProperties: IAppsProps = useSelector(getAppsProperties)
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);

    const [actionsHeader, setActionsHeader] = useState<IActionsHeader[]>([]);
    const [actionsParams, setActionsParams] = useState<IActionsParams[]>([]);
    const [actionsTasks, setActionsEvents] = useState<IActionsTasks[]>([]);
    const [openParamsDialog, setOpenParamsDialog] = useState(false);
    const [openComponent, setOpenComponent] = useState(false);

    const [paramsDP, setParamsDP] = useState<CDialogContent>(new CDialogContent());
    const allParams = useRef<IActionsData>({});
    const currentBranch = useRef<number>()
    const dialogComponent = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: "",
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const resultHeader = await lyGetActionsHeader({
                appsProperties: appsProperties,
                userProperties: userProperties,
                [EActionsHeader.action_id]: props.actionID,
                modulesProperties: modulesProperties
            });
            setActionsHeader(resultHeader.data);

            const resultParams = await lyGetActionsParams({
                appsProperties: appsProperties,
                userProperties: userProperties,
                [EActionsParams.action_id]: props.actionID,
                modulesProperties: modulesProperties
            });
            for (const item of resultParams.data) {
                paramsDP.fields[item[EActionsParams.var_id]] = {
                    [EDialogDetails.id]: item[EActionsParams.var_id],
                    [EDialogDetails.rules]: item[EActionsParams.rules],
                    [EDialogDetails.rulesValues]: item[EActionsParams.rulesValues],
                    value: (props.dialogContent && props.dialogContent.fields[item[EActionsParams.var_id]] !== undefined)
                        ? props.dialogContent.fields[item[EActionsParams.var_id]].value
                        : (item[EActionsParams.default] !== null)
                            ? (item[EActionsParams.type] === "number")
                                ? Number(item[EActionsParams.default])
                                : item[EActionsParams.default]
                            : (item[EActionsParams.rules] === EDictionaryRules.boolean)
                                ? false
                                : null,
                    [EDialogDetails.target]: item[EActionsParams.var_id],
                    [EDialogDetails.disabled]: false,
                    [EDialogDetails.required]: true,
                    [EDialogDetails.visible]: true,
                    [EDialogDetails.key]: false,
                    [EDialogDetails.dynamic_params]: props.dynamic_params,
                    [EDialogDetails.fixed_params]: props.fixed_params,
                    [EDialogDetails.cdn_id]: null,
                    [EDialogDetails.cdn_dynamic_params]: null,
                    [EDialogDetails.cdn_fixed_params]: null,
                    [EDialogDetails.output_params]: "",
                    [EDialogDetails.type]: item[EActionsParams.type]
                };
            }
            setActionsParams(resultParams.data);
            const resultEvents = await lyGetActionsTasks({
                appsProperties: appsProperties,
                userProperties: userProperties,
                [EActionsTasks.action_id]: props.actionID,
                modulesProperties: modulesProperties
            });
            setActionsEvents(resultEvents.data);
            if (props.type === ActionsType.event) {
                setOpenParamsDialog(true);
            }
            setIsLoading(false);

        };

        fetchData();
    }, [props.actionID]);

    useEffect(() => {
        if (!isLoading) {
            for (const item of actionsParams) {
                paramsDP.fields[item[EActionsParams.var_id]] = {
                    [EDialogDetails.id]: item[EActionsParams.var_id],
                    [EDialogDetails.rules]: item[EActionsParams.rules],
                    [EDialogDetails.rulesValues]: item[EActionsParams.rulesValues],
                    value: (props.dialogContent.fields[item[EActionsParams.var_id]] !== undefined)
                        ? props.dialogContent.fields[item[EActionsParams.var_id]].value
                        : (item[EActionsParams.default] !== null)
                            ? (item[EActionsParams.type] === "number")
                                ? Number(item[EActionsParams.default])
                                : item[EActionsParams.default]
                            : (item[EActionsParams.rules] === EDictionaryRules.boolean)
                                ? false
                                : null,
                    [EDialogDetails.target]: item[EActionsParams.var_id],
                    [EDialogDetails.disabled]: false,
                    [EDialogDetails.required]: true,
                    [EDialogDetails.visible]: true,
                    [EDialogDetails.key]: false,
                    [EDialogDetails.dynamic_params]: props.dynamic_params,
                    [EDialogDetails.fixed_params]: props.fixed_params,
                    [EDialogDetails.cdn_id]: null,
                    [EDialogDetails.cdn_dynamic_params]: null,
                    [EDialogDetails.cdn_fixed_params]: null,
                    [EDialogDetails.output_params]: "",
                    [EDialogDetails.type]: item[EActionsParams.type]
                };
            }
        }
    }, [props.dialogContent]);

    const handleActionEvent = async () => {
        setOpenParamsDialog(true);
    }

    const getParamsValue = async (param: IActionsTasksParams | IActionsParams) => {
        let value;

        if (param[EActionsParams.default] !== null)
            value = param[EActionsParams.default]
        else
            switch (param[EActionsParams.rules]) {
                case EDictionaryRules.sequence:
                    const sequence = await ToolsDictionary.getSequence({
                        appsProperties: appsProperties,
                        [ESequence.id]: parseInt(paramsDP.fields[param[EActionsParams.var_id]][EDialogDetails.rulesValues] as string),
                        data: paramsDP.fields,
                        dynamic_params: props.dynamic_params,
                        fixed_params: props.fixed_params,
                        modulesProperties: modulesProperties
                    })
                    value = (paramsDP.fields[param[EActionsParams.var_id]].value !== null)
                        ? paramsDP.fields[param[EActionsParams.var_id]].value
                        : sequence;
                    break;
                case EDictionaryRules.nextNumber:
                    var nn = await ToolsDictionary.getNextNumber({
                        appsProperties: appsProperties,
                        userProperties: userProperties,
                        [ENextNumber.id]: paramsDP.fields[param[EActionsParams.var_id]][EDialogDetails.rulesValues] as string,
                        overrideQueryPool: props.overrideQueryPool,
                        modulesProperties: modulesProperties
                    })
                    value = (paramsDP.fields[param[EActionsParams.var_id]].value !== null)
                        ? paramsDP.fields[param[EActionsParams.var_id]].value
                        : nn;
                    break;
                case EDictionaryRules.boolean:
                    value =
                        (props.dialogContent.fields[param[EActionsParams.var_id]].value)
                            ? props.dialogContent.fields[param[EActionsParams.var_id]][EDialogDetails.rulesValues]
                            : "N";
                    break;
                case EDictionaryRules.login:
                    value = userProperties[EUsers.id];
                    break;
                case EDictionaryRules.sysdate:
                case EDictionaryRules.current_date:
                    value = new Date().toISOString();
                    break;
                case EDictionaryRules.default:
                    value = (paramsDP.fields[param[EActionsParams.var_id]].value !== null)
                        ? paramsDP.fields[param[EActionsParams.var_id]].value
                        : param[EActionsParams.default]
                    break;
                default:
                    value = paramsDP.fields[param[EActionsParams.var_id]].value
            }
        return value
    }

    const getNestedValue = (obj: IActionsData, path: string): IContentValue | undefined => {
        return path.split('.').reduce<IActionsData | undefined>((acc, part) => {
            if (acc && typeof acc === 'object') {
                // Find the key in the current object that matches the uppercase part
                const uppercasedPart = part.toUpperCase();
                const matchingKey = Object.keys(acc).find(key => key.toUpperCase() === uppercasedPart);

                if (matchingKey) {
                    return acc[matchingKey] as IActionsData; // Type assertion to navigate nested objects
                }
            }
            return undefined;
        }, obj) as IContentValue | undefined; // Final type casting for the result
    };

    const runTask = async () => {
        let filtersACT: IFiltersProperties[] = [];
        let filterStringACT: string = props.dynamic_params;
        if (filterStringACT !== null)
            filterStringACT.split(";").forEach((filters) => {
                let filter = filters.split("=")

                filtersACT.push({
                    header: "",
                    field: filter[0],
                    value: (props.dialogContent.fields[filter[1]]) ? props.dialogContent.fields[filter[1]].value : null,
                    type: "string",
                    operator: "=",
                    defined: true,
                    rules: "",
                    disabled: true,
                    values: "",
                });
            })

        filterStringACT = props.fixed_params;
        if (filterStringACT !== null)
            filterStringACT.split(";").forEach((filters) => {
                let filter = filters.split("=")

                filtersACT.push({
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

        let paramsValue: IRestData = {};

        await Promise.all(actionsParams.filter((action) => action[EActionsParams.direction] !== EActionsDirection.out).map(async (param) => {
            let value = filtersACT.filter((field: IFiltersProperties) => field.field === param[EActionsParams.var_id]);

            if (value.length > 0)
                paramsValue[param[EActionsParams.var_id]] = value[0].value
            else {
                paramsValue[param[EActionsParams.var_id]] = await getParamsValue(param)

            }
        }))


        allParams.current = { 'INPUT': paramsValue }
        for (const task of actionsTasks) {
            let result;

            if (task[EActionsTasks.branch_id] === currentBranch.current
                || task[EActionsTasks.branch_id] === undefined
                || task[EActionsTasks.branch_id] === null) {
                const taskParams = await lyGetActionsTasksParams({
                    appsProperties: appsProperties,
                    userProperties: userProperties,
                    [EActionsTasks.action_id]: task[EActionsTasks.action_id],
                    [EActionsTasks.task_id]: task[EActionsTasks.task_id],
                    modulesProperties: modulesProperties
                });
                let taskParamsValue: IRestData = {};
                let taskPool;

                await Promise.all(taskParams.data.filter(
                    (action: IActionsTasksParams) => action[EActionsTasksParams.direction] !== EActionsDirection.out
                ).map(async (param: IActionsTasksParams) => {
                    if (param[EActionsTasksParams.direction] === EActionsDirection.pool) {
                        if (param[EActionsTasksParams.value] !== undefined && param[EActionsTasksParams.value] !== null && param[EActionsTasksParams.value] !== "")
                            taskPool = getNestedValue(allParams.current, param[EActionsTasksParams.value]);
                        else
                            taskPool = await getParamsValue(param)
                    }
                    else {
                        if (param[EActionsTasksParams.value] !== undefined && param[EActionsTasksParams.value] !== null && param[EActionsTasksParams.value] !== "")
                            taskParamsValue[param[EActionsTasksParams.var_id]] = getNestedValue(allParams.current, param[EActionsTasksParams.value]) as IContentValue;
                        else
                            taskParamsValue[param[EActionsTasksParams.var_id]] = await getParamsValue(param)
                    }
                }))

                const taskFilters = filtersACT.filter((row) => taskParamsValue.hasOwnProperty(row.field));

                if (task[EActionsTasks.loop] === 'Y') {
                    const loopArray = getNestedValue(allParams.current, task[EActionsTasks.loop_array]);
                    if (Array.isArray(loopArray)) {
                        for (const loop of loopArray) {
                            taskParamsValue = { ...taskParamsValue, ...loop };
                            switch (task[EActionsTasks.type]) {
                                case EActionsType.query:
                                    result = await callQuery(task, taskParamsValue, taskPool, taskFilters);
                                    if (result.status !== ResultStatus.success) {
                                        if (typeof props.status === 'function') {
                                            props.status({ status: result.status, message: result.items[0].message });
                                        }
                                        return;
                                    }
                                    break;
                            }
                        }
                    }
                }
                else
                    switch (task[EActionsTasks.type]) {
                        case EActionsType.query:
                            result = await callQuery(task, taskParamsValue, taskPool, taskFilters);
                            if (result.status !== ResultStatus.success) {
                                if (typeof props.status === "function")
                                    props.status({ status: result.status, message: result.items[0].message });
                                return;
                            }
                            break;
                        case EActionsType.if:
                            result = await callCondition(task, taskParamsValue);
                            if (result.status !== ResultStatus.success) {
                                if (typeof props.status === "function")
                                    props.status({ status: result.status, message: result.message });
                                return;
                            }
                            break;
                        case EActionsType.api:
                            result = await callRest(task, taskParamsValue);
                            if (result.status !== ResultStatus.success) {
                                if (typeof props.status === "function")
                                    props.status({ status: result.status, message: result.items[0].message });
                                return;
                            }
                            break;
                        case EActionsType.return:
                            await Promise.all(taskParams.data.filter(
                                (action: IActionsParams) => action[EActionsParams.direction] === EActionsDirection.out || action[EActionsParams.direction] === EActionsDirection.both)
                                .map(async (param: IActionsParams) => {
                                    let value = getNestedValue(allParams.current, param[EActionsParams.value]) as IContentValue;
                                    paramsDP.fields[param[EActionsParams.var_id]].value = paramsDP.fields[param[EActionsParams.var_id]].value ?? value;
                                }));

                            break;
                        case EActionsType.component:

                            dialogComponent.current = {
                                id: task[EActionsTasks.component_id],
                                type: task[EActionsTasks.component],
                                filters: taskFilters,
                                label: props.component.label + " > " + task[EActionsTasks.label],
                                previous: props.component,
                                showPreviousButton: true,
                                isChildren: true,
                                componentMode: LYComponentMode.edit,

                            };
                            setOpenComponent(true);
                            break;
                    }
            }
        }

        if (typeof props.status === "function")
            props.status({ status: ResultStatus.success, message: t("run_ok") + actionsHeader[0][EActionsHeader.label], params: paramsDP });


    }

    function transformConditionData(obj: IRestData) {
        let transformedObj: IDialogContent = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                transformedObj[key] = {
                    [EDialogDetails.id]: key,
                    [EDialogDetails.rules]: null,
                    [EDialogDetails.rulesValues]: null,
                    value: obj[key],
                    [EDialogDetails.target]: null,
                    [EDialogDetails.disabled]: false,
                    [EDialogDetails.required]: false,
                    [EDialogDetails.visible]: true,
                    [EDialogDetails.key]: false,
                    [EDialogDetails.dynamic_params]: '',
                    [EDialogDetails.fixed_params]: '',
                    [EDialogDetails.cdn_id]: null,
                    [EDialogDetails.cdn_dynamic_params]: null,
                    [EDialogDetails.cdn_fixed_params]: null,
                    [EDialogDetails.output_params]: '',
                    [EDialogDetails.type]: 'string'
                };
            }
        }
        return transformedObj;
    }

    const callCondition = async (task: IActionsTasks, data: IRestData) => {
        let rest;
        rest = await lyCheckConditions({
            appsProperties: appsProperties,
            [EConditions.id]: task[EActionsTasks.condition],
            data: { fields: transformConditionData(data) },
            dynamic_params: "",
            fixed_params: "",
            modulesProperties: modulesProperties
        })
        if (rest)
            currentBranch.current = task[EActionsTasks.branch_false]
        else
            currentBranch.current = task[EActionsTasks.branch_true]
        return { status: ResultStatus.success, message: "" }

    }

    const callQuery = async (task: IActionsTasks, data: IRestData, pool: string | undefined, filtersACT: IFiltersProperties[]) => {
        let rest;
        if (task[EActionsTasks.queryID] === null || task[EActionsTasks.queryID] === undefined)
            return;

        switch (task[EActionsTasks.crud]) {
            case QueryMethod.delete:
                rest = await ToolsQuery.delete({
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: task[EActionsTasks.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    override_target_pool: pool ?? props.overrideQueryPool,
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                },
                    JSON.stringify(data));
                break;
            case QueryMethod.insert:
                rest = await ToolsQuery.post({
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: task[EActionsTasks.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    override_target_pool: pool ?? props.overrideQueryPool,
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                },
                    JSON.stringify(data));
                if (rest.status === ResultStatus.success) {
                    let result: IRestData = {};
                    result["TASK_" + task[EActionsParams.task_id]] = { RESULTS: rest.items }
                    allParams.current = { ...allParams.current, ...result }
                }
                break;
            case QueryMethod.update:
                rest = await ToolsQuery.put({
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: task[EActionsTasks.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    override_target_pool: pool ?? props.overrideQueryPool,
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                },
                    JSON.stringify(data));
                if (rest.status === ResultStatus.success) {
                    let result: IRestData = {};
                    result["TASK_" + task[EActionsParams.task_id]] = { RESULTS: rest.items }
                    allParams.current = { ...allParams.current, ...result }
                }
                break;
            case QueryMethod.select:
                rest = await ToolsQuery.get({
                    source: QuerySource.Query,
                    framework_pool: appsProperties[EApplications.pool],
                    query: task[EActionsTasks.queryID],
                    sessionMode: appsProperties[EApplications.session],
                    filters: filtersACT,
                    language: userProperties[EUsers.language],
                    offset: 0,
                    limit: appsProperties[EApplications.offset],
                    override_target_pool: pool ?? props.overrideQueryPool,
                    params: JSON.stringify(data),
                    modulesProperties: modulesProperties,
                    jwt_token: appsProperties[EApplications.jwt_token]
                })

                if (rest.status === ResultStatus.success) {
                    let result: IRestData = {};
                    result["TASK_" + task[EActionsParams.task_id]] = { RESULTS: rest.items }
                    allParams.current = { ...allParams.current, ...result }
                }
                break;
        }
        return rest
    }

    const callRest = async (task: IActionsTasks, data: IRestData) => {
        let rest;
        rest = await ToolsAPI.post({
            pool: appsProperties[EApplications.pool],
            api: task[EActionsTasks.api_id],
            sessionMode: appsProperties[EApplications.session],
            modulesProperties: modulesProperties,
            jwt_token: appsProperties[EApplications.jwt_token]
        },
            JSON.stringify(data));
        if (rest.status === ResultStatus.success) {
            let result: IRestData = {};
            result["TASK_" + task[EActionsTasks.task_id]] = { RESULTS: rest.items }
            allParams.current = { ...allParams.current, ...result }
        }
        return rest
    }

    const handleCancelTask = () => {
        setOpenParamsDialog(false);
        props.status({ status: ResultStatus.warning, message: t("run_cancel") });
    };

    const handleRunTask = () => {
        setOpenParamsDialog(false);
        runTask();
    };

    const onChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
        updateParamsDPValue(event.target.id, event.target.value);
    }

    const onCheckboxChanged = (event: OnChangeParams) => {
        updateParamsDPValue(event.id, event.value)
    }

    const onAutocompleteChanged = (event: OnChangeParams) => {
        updateParamsDPValue(event.id, event.value)
    }

    const updateParamsDPValue = (id: string, value: IContentValue) => {
        // Create a new copy of the fields object
        const updatedFields = {
            ...paramsDP.fields,
            [id]: {
                ...paramsDP.fields[id], // Copy the existing field properties
                value: value, // Update the specific value
            },
        };

        // Update the state with the new fields object
        setParamsDP((prevState) => ({
            ...prevState,
            fields: updatedFields,
        }));
    };

    const [maxRows, setMaxRoxs] = useState(15)

    const renderFields = (item: IActionsParams) => {
        switch (item[EActionsParams.rules]) {
            case EDictionaryRules.enum:
                return (
                    <InputEnum
                        id={item[EActionsParams.var_id]}
                        key={`${item[EActionsParams.var_id]}-${paramsDP.fields[item[EActionsParams.var_id]].value || ''}`} // Force a re-render by changing the key
                        enumID={parseInt(item[EActionsParams.rulesValues])}
                        label={item[EActionsParams.label]}
                        defaultValue={paramsDP.fields[item[EActionsParams.var_id]].value as string ?? null}
                        variant="standard"
                        onChange={onAutocompleteChanged}
                        freeSolo={false}
                        disabled={false}
                        searchByLabel={false}
                    />
                )
            case EDictionaryRules.lookup:
                return (
                    <InputLookup
                        id={item[EActionsParams.var_id]}
                        key={`${item[EActionsParams.var_id]}-${paramsDP.fields[item[EActionsParams.var_id]].value || ''}`} // Force a re-render by changing the key
                        lookupID={parseInt(item[EActionsParams.rulesValues])}
                        label={item[EActionsParams.label]}
                        disabled={false}
                        data={paramsDP.fields}
                        defaultValue={paramsDP.fields[item[EActionsParams.var_id]].value?.toString() as string ?? null}
                        onChange={onAutocompleteChanged}
                        dynamic_params={item[EActionsParams.dynamic_params]}
                        fixed_params={item[EActionsParams.fixed_params]}
                        overrideQueryPool={(item[EActionsParams.pool_params] === null)
                            ? undefined
                            : (paramsDP.fields[item[EActionsParams.pool_params]] !== undefined)
                                ? paramsDP.fields[item[EActionsParams.pool_params]].value as string
                                : item[EActionsParams.pool_params] as string
                        }
                    />
                )

            case EDictionaryRules.password:
            case EDictionaryRules.password_oracle:
                return (
                    <Input
                        id={item[EActionsParams.var_id]}
                        defaultValue={paramsDP.fields[item[EActionsParams.var_id]].value as string}
                        onChange={onChanged}
                        type="password"
                        label={item[EActionsParams.label]}
                        variant="standard"
                        fullWidth />
                )
            default:
                switch (item[EActionsParams.type]) {
                    case "number":
                        return (
                            <Input
                                id={item[EActionsParams.var_id]}
                                value={paramsDP.fields[item[EActionsParams.var_id]].value as number ?? 0}
                                onChange={onChanged}
                                type="number"
                                label={item[EActionsParams.label]}
                                variant="standard"
                                fullWidth />
                        )
                    case "date":
                        return (
                            <Input
                                id={item[EActionsParams.var_id]}
                                value={paramsDP.fields[item[EActionsParams.var_id]].value ? format(parseISO(paramsDP.fields[item[EActionsParams.var_id]].value as string), 'yyyy-MM-dd') : ""}
                                onChange={onChanged}
                                type="date"
                                label={item[EActionsParams.label]}
                                variant="standard"
                                fullWidth />
                        )
                    case "textarea":
                        return (
                            <Input
                                id={item[EActionsParams.var_id]}
                                value={paramsDP.fields[item[EActionsParams.var_id]].value as string ?? ""}
                                onChange={onChanged}
                                multiline
                                rows={(maxRows)}
                                label={item[EActionsParams.label]}
                                variant="standard"
                                fullWidth />
                        )
                    case "boolean":
                        return (
                            <InputCheckbox
                                id={item[EActionsParams.var_id]}
                                key={item[EActionsParams.var_id]}
                                label={item[EActionsParams.label]}
                                defaultValue={paramsDP.fields[item[EActionsParams.var_id]].value as boolean}
                                onChange={onCheckboxChanged}
                            />
                        )
                    default:
                        return (
                            <Input
                                id={item[EActionsParams.var_id]}
                                value={paramsDP.fields[item[EActionsParams.var_id]].value as string ?? ""}
                                onChange={onChanged}
                                label={item[EActionsParams.label]}
                                variant="standard"
                                fullWidth />
                        )
                }
        }
    }

    const displayComponent = (component: ComponentProperties) => {
        switch (component.type) {
            case LYComponentType.FormsTable:
                return (
                    <Fragment>
                        {component.id !== null &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsTable
                                    key={component.id + "-component"}
                                    viewMode={LYComponentViewMode.grid}
                                    displayMode={LYComponentDisplayMode.component}
                                    viewGrid={true}
                                    componentProperties={component}
                                    readonly={false}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            case LYComponentType.FormsTree:
                return (
                    <Fragment>
                        {component.id !== null &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsTable
                                    key={component.id + "-component"}
                                    viewMode={LYComponentViewMode.tree}
                                    displayMode={LYComponentDisplayMode.component}
                                    viewGrid={true}
                                    componentProperties={component}
                                    readonly={false}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            case LYComponentType.FormsList:
                return (
                    <Fragment>
                        {component.id !== null &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsTable
                                    key={component.id + "-component"}
                                    viewMode={LYComponentViewMode.list}
                                    displayMode={LYComponentDisplayMode.component}
                                    viewGrid={false}
                                    componentProperties={component}
                                    readonly={false}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            case LYComponentType.FormsDialog:
                return (
                    <FormsDialog
                        componentProperties={component}
                        onClose={onDialogClose}
                    />
                );
            case LYComponentType.FormsUpload:
                return (
                    <FormsUpload
                        componentProperties={component}
                    />
                );
            case LYComponentType.FormsChart:
                return (
                    <Fragment>
                        {component.id !== null &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsChart
                                    componentProperties={component}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            case LYComponentType.FormsDashboard:
                return (
                    <Fragment>
                        {component.id !== null && component.id > 0 &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsDashboard
                                    componentProperties={component}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            case LYComponentType.FormsGrid:
                return (
                    <Fragment>
                        {component.id !== null &&
                            <Paper_Table elevation={0} key={component.id + "-table"}>
                                <FormsTable
                                    key={component.id + "-component"}
                                    viewMode={LYComponentViewMode.grid}
                                    displayMode={LYComponentDisplayMode.component}
                                    viewGrid={true}
                                    componentProperties={component}
                                    readonly={false}
                                />
                            </Paper_Table>
                        }
                    </Fragment>
                );
            default:
                return;
        }
    }

    const handlePreviousComponent = () => {
        /* Component called when context menus is selected */
        setOpenComponent(false)
        //       return props.callBackAction({ event: LYComponentEvent.Cancel, status: "", message: "", keys: [] })
    }


    const onDialogClose = (action: IDialogAction) => {
        switch (action.event) {
            case LYComponentEvent.Cancel:
                setOpenComponent(false);
                break;
        }
    };

    // Update fullscreen state based on screen size
    useEffect(() => {
        if (isSmallScreen || isMobile) {
            setIsFullScreen(true);
        }
    }, [isSmallScreen, isMobile]);


    const [{ x, y }, api] = useSpring(() => ({
        x: 0,
        y: 0,
    }));

    // Gesture hook for dragging and resizing
    const bindDrag = useDrag(
        (state) => {
            const isResizing = state.event.target === resizeRef.current;

            if (isResizing) {
                // Handle resizing
                const newWidth = Math.max(300, state.offset[0]); // Minimum width
                const newHeight = Math.max(200, state.offset[1]); // Minimum height
                setDimensions({ width: newWidth, height: newHeight });
            } else if (!isFullScreen) {
                if (titleBarRef.current && titleBarRef.current.contains(state.event.target as Node))
                    // Handle dragging
                    api.start({ x: state.offset[0], y: state.offset[1] });
            }
        },
        {
            from: (state) => {
                const isResizing = state.target === resizeRef.current;
                if (isResizing) {
                    return [dimensions.width, dimensions.height];
                } else {
                    return [x.get(), y.get()];
                }
            },
        }
    );

    const toggleFullScreen = () => {
        if (!isSmallScreen && !isMobile) {
            setIsFullScreen((prev) => !prev);
        }
    };

    const refPaper = useRef<HTMLDivElement>(null)

    if (isLoading) {
        return null;
    } else
        if (openParamsDialog)
            return ReactDOM.createPortal(
                <Fragment>
                    <Backdrop />
                    <animated.div
                        {...bindDrag()} // Attach drag and resize functionality
                        style={{
                            x: isFullScreen ? 0 : x,
                            y: isFullScreen ? 0 : y,
                            position: 'fixed',
                            bottom: isFullScreen ? 0 : 'auto',
                            right: isFullScreen ? 0 : 'auto',
                            top: isFullScreen ? 0 : '50%',
                            left: isFullScreen ? 0 : '50%',
                            zIndex: DefaultZIndex.Dialog,
                        }}
                    >
                        <Div_DialogWidget fullScreen={isFullScreen} userWidth={isFullScreen ? '100vw' : `${dimensions.width}px`}
                            userHeight={isFullScreen ? '100dvh' : `${dimensions.height}px`}>
                            {/* Header */}
                            <Div_DialogWidgetTitle
                                ref={titleBarRef}
                                onDoubleClick={toggleFullScreen}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1rem', fontVariant: 'small-caps' }}>
                                    {t("tasks.confirm")}
                                </span>
                                <Div_DialogWidgetTitleButtons>
                                    <IconButton_Contrast 
                                        aria-label="toggle full screen" 
                                        onClick={toggleFullScreen} 
                                        icon={isFullScreen ? LYFullscreenExitIcon : LYFullscreenIcon} 
                                    />
                                </Div_DialogWidgetTitleButtons>
                            </Div_DialogWidgetTitle>
                            <Div_DialogWidgetContent>
                                <Paper_Dialogs elevation={0} ref={refPaper} >
                                    <Div_DialogWidgetButtons>
                                        <Button variant="outlined" onClick={handleCancelTask} startIcon={LYCancelIcon} >
                                            {t('tasks.cancel')}
                                        </Button>
                                        <Button variant="outlined" onClick={handleRunTask} startIcon={LYPlayCircleOutlineIcon}>
                                            {t('tasks.run')}
                                        </Button>
                                    </Div_DialogWidgetButtons>
                                    <Div_DialogWidgetContent>
                                        <GridContainer spacing={2}>
                                            {actionsParams.filter((param => param[EActionsParams.display] === "Y")).length > 0 &&
                                                <GridItem style={{ flexGrow: 0 }} key={"params_label"}>
                                                    <Typography component="div">
                                                        {t("tasks.params")}
                                                    </Typography>
                                                </GridItem>
                                            }
                                            {actionsParams.filter((param => param[EActionsParams.display] === "Y")).map((item) =>
                                                <GridItem  style={{ flexGrow: 0 }} key={item[EActionsParams.var_id]}>
                                                    {renderFields(item)}
                                                </GridItem>
                                            )}
                                        </GridContainer>
                                    </Div_DialogWidgetContent>
                                </Paper_Dialogs>
                            </Div_DialogWidgetContent>
                            {/* Resize handles */}
                            {!isFullScreen && (
                                <Div_ResizeBox
                                    ref={resizeRef}
                                />
                            )}


                        </Div_DialogWidget>
                    </animated.div>
                </Fragment>
                , document.body)
        else if (openComponent)
            return ReactDOM.createPortal(
                <Fragment>
                    <Backdrop />
                    <animated.div
                        {...bindDrag()} // Attach drag and resize functionality
                        style={{
                            x: isFullScreen ? 0 : x,
                            y: isFullScreen ? 0 : y,
                            position: 'fixed',
                            bottom: isFullScreen ? 0 : 'auto',
                            right: isFullScreen ? 0 : 'auto',
                            top: isFullScreen ? 0 : '50%',
                            left: isFullScreen ? 0 : '50%',
                            touchAction: 'none',
                            zIndex: DefaultZIndex.Dialog,
                        }}
                    >
                        <Div_DialogWidget fullScreen={isFullScreen} userWidth={isFullScreen ? '100vw' : `${dimensions.width}px`}
                            userHeight={isFullScreen ? '100dvh' : `${dimensions.height}px`}>
                            {/* Header */}
                            <Div_DialogWidgetTitle
                                ref={titleBarRef}
                                onDoubleClick={toggleFullScreen}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1rem', fontVariant: 'small-caps' }}>
                                    {dialogComponent.current.label}
                                </span>
                                <Div_DialogWidgetTitleButtons>
                                    <IconButton_Contrast 
                                        aria-label="toggle full screen" 
                                        onClick={toggleFullScreen} 
                                        icon={isFullScreen ? LYFullscreenExitIcon : LYFullscreenIcon} 
                                    />
                                </Div_DialogWidgetTitleButtons>
                            </Div_DialogWidgetTitle>
                            <Paper_Dialogs elevation={0} ref={refPaper} >
                                <Div_DialogWidgetButtons>
                                    <Button variant="outlined" onClick={handlePreviousComponent} startIcon={LYCancelIcon} >
                                        {t('tasks.cancel')}
                                    </Button>
                                </Div_DialogWidgetButtons>
                                <Div_DialogWidgetContent>
                                    {displayComponent(dialogComponent.current)}
                                </Div_DialogWidgetContent>
                            </Paper_Dialogs>
                            {/* Resize handles */}
                            {!isFullScreen && (
                                <Div_ResizeBox
                                    ref={resizeRef}
                                />
                            )}
                        </Div_DialogWidget>
                    </animated.div>
                </Fragment>
                , document.body)
        else if (props.type === ActionsType.button)
            return (
                <Button variant="outlined" onClick={handleActionEvent} disabled={props.disabled}>
                    {props.label}
                </Button>
            )

};


