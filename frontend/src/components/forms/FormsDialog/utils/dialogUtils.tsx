/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { lyCheckConditions } from "@ly_services/lyConditions";
import { ComponentProperties, LYComponentType } from "@ly_types/lyComponents";
import { CDialogContent, EDialogDetails, IDialogContent, IDialogDetails, IDialogsTab } from "@ly_types/lyDialogs";
import { getDistinctTab } from "@ly_components/forms/FormsDialog/utils/apiUtils";
import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import React from "react";
import { ESeverity, IContentValue, IErrorState } from "@ly_utils/commonUtils";
import { IActionsStatus } from "@ly_types/lyActions";
import { IModulesProps } from "@ly_types/lyModules";
import { ResultStatus } from "@ly_types/lyQuery";
import { EConditions } from "@ly_types/lyConditions";


export interface IRefreshDisabledColumnsParams {
    appsProperties: IAppsProps,
    modulesProperties: IModulesProps;
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    dialogContent: CDialogContent,
    setDialogContent: React.Dispatch<React.SetStateAction<CDialogContent>>,
    setDialogComponent: React.Dispatch<React.SetStateAction<CDialogContent>>
}

export const refreshDisabledColumnsHandler = async (params: IRefreshDisabledColumnsParams) => {
    const {
        dialogDetailsRef,
        dialogContent,
        appsProperties,
        modulesProperties,
        setDialogContent,
        setDialogComponent
    } = params
    
    await Promise.all(
        dialogDetailsRef.current
            .filter((keyField: IDialogDetails) => keyField[EDialogDetails.cdn_id] !== null)
            .map(async (item: IDialogDetails) => {
                let hidden = await lyCheckConditions({
                    appsProperties: appsProperties,
                    [EConditions.id]: item[EDialogDetails.cdn_id],
                    data: dialogContent,
                    dynamic_params: item[EDialogDetails.cdn_dynamic_params],
                    fixed_params: item[EDialogDetails.cdn_fixed_params],
                    modulesProperties: modulesProperties
                });

                switch (item[EDialogDetails.component]) {
                    case LYComponentType.Dictionary:
                        updateContentDisable(
                            item[EDialogDetails.target] === null
                                ? item[EDialogDetails.dictionaryID]
                                : item[EDialogDetails.target],
                            hidden,
                            setDialogContent,
                        );
                        break;
                    case LYComponentType.InputAction:
                        updateComponent(
                            item[EDialogDetails.id], 
                            hidden,
                            setDialogComponent
                        );
                        break;
                }
            })
    );
}

export interface IUpdateContentValue {
    id: string, 
    value: IContentValue, 
    refreshTab: boolean,
    setDialogContent: React.Dispatch<React.SetStateAction<CDialogContent>>,
    componentProperties: ComponentProperties,
    appsProperties: IAppsProps,
    userProperties: IUsersProps,
    modulesProperties: IModulesProps,
    isModified: boolean,
    setTabs: React.Dispatch<React.SetStateAction<IDialogsTab[]>>,
    setActiveTab: React.Dispatch<React.SetStateAction<string>>,
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    setDialogComponent: React.Dispatch<React.SetStateAction<CDialogContent>>

}
export const updateContentValueHandler = (params: IUpdateContentValue) => {
    const {
        id, 
        value, 
        refreshTab,
        setDialogContent,
        componentProperties,
        appsProperties,
        userProperties,
        modulesProperties,
        isModified,
        setTabs,
        setActiveTab,
        dialogDetailsRef,
        setDialogComponent
    } = params;
    setDialogContent((prevContentDP: CDialogContent) => {
        const newContentDP = {
            ...prevContentDP,
            fields: {
                ...prevContentDP.fields,
                [id]: {
                    ...prevContentDP.fields[id],
                    value: value
                },
            },
        };

        if (refreshTab) {
            const params = {
                mode: componentProperties.componentMode, 
                content: newContentDP,
                appsProperties,
                userProperties,
                modulesProperties,
                componentProperties,
                isModified,
                setTabs,
                setActiveTab
            }
            
            getDistinctTab(params); 
        }
        const refreshDisabledColumnsParams = {
            appsProperties,
            modulesProperties,
            dialogDetailsRef,
            dialogContent: newContentDP,
            setDialogContent,
            setDialogComponent
        }
        refreshDisabledColumnsHandler(refreshDisabledColumnsParams);
        return newContentDP;
    });
};

const updateContentDisable = (
    id: string, 
    disabled: boolean,
    setDialogContent: React.Dispatch<React.SetStateAction<CDialogContent>>
) => {
    setDialogContent((prevContentDP: CDialogContent) => ({
        ...prevContentDP,
        fields: {
            ...prevContentDP.fields,
            [id]: {
                ...prevContentDP.fields[id],
                [EDialogDetails.visible]: !disabled,
            },
        },
    }));
};

const updateComponent = (
    id: string, 
    hidden: boolean,
    setDialogComponent: React.Dispatch<React.SetStateAction<CDialogContent>>
) => {
    setDialogComponent((prevComponentDP: CDialogContent) => ({
        ...prevComponentDP,
        fields: {
            ...prevComponentDP.fields,
            [id]: {
                ...prevComponentDP.fields[id],
                [EDialogDetails.visible]: !hidden,
            },
        },
    }));
};



export interface IActionEndHandlerParams {
    event: IActionsStatus,
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>,
    dialogContent: CDialogContent,
    setDialogContent: React.Dispatch<React.SetStateAction<CDialogContent>>,
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    appsProperties: IAppsProps,
    modulesProperties: IModulesProps,
    setDialogComponent: React.Dispatch<React.SetStateAction<CDialogContent>>,
}

export const onActionEndHandler = async (params: IActionEndHandlerParams) => {
    const {event, setErrorState, dialogContent, setDialogContent, dialogDetailsRef, appsProperties, setDialogComponent, modulesProperties} = params;
    setErrorState({ open: true, severity: (event.status === ResultStatus.error) ? ESeverity.error : (event.status === ResultStatus.warning) ? ESeverity.warning : ESeverity.success, message: event.message });

    if (event.params) {
        const updatedFields: IDialogContent = { ...dialogContent.fields }
        await Promise.all(Object.keys(event.params.fields).map(async (item: string) => {
            if (updatedFields[item] && event.params) {
                updatedFields[item].value = event.params.fields[item].value
            }
        }));
        setDialogContent((prevState: CDialogContent) => ({
            ...prevState,
            fields: { ...updatedFields },
        }));
        
        const refreshDisabledColumnsParams = {
            appsProperties,
            modulesProperties,
            dialogDetailsRef,
            dialogContent: { fields: { ...updatedFields } },
            setDialogContent,
            setDialogComponent
        }

        refreshDisabledColumnsHandler(refreshDisabledColumnsParams);
    }
}
