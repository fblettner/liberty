/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { useCallback } from "react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";

// MUI Import

// Custom Import
import { getAppsProperties, getUserProperties, getReserveStatus, getModules } from "@ly_features/global";
import { IAppsProps } from "@ly_types/lyApplications";
import { ComponentProperties, LYComponentEvent, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { CDialogContent, EDialogDetails, EDialogTabs, EDialogHeader, IDialogDetails, IDialogHeader } from "@ly_types/lyDialogs";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { IUsersProps } from "@ly_types/lyUsers";
import { ConfirmationDialog } from "@ly_components/common/ConfirmationDialog";
import { DialogHelp } from "@ly_components/forms/FormsDialog/dialogs/DialogHelp";
import { DialogToolbar } from "@ly_components/forms/FormsDialog/toolbar/DialogToolbar";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { LoadingIndicator } from "@ly_components/common/LoadingIndicator";
import { DialogForms } from "@ly_components/forms/FormsDialog/render/DialogForms";
import { initDialog, ISaveDataAPIParams, saveDataAPI } from "@ly_components/forms/FormsDialog/utils/apiUtils";
import { onActionEndHandler, updateContentValueHandler } from "@ly_components/forms/FormsDialog/utils/dialogUtils";
import { ActionsType, ESeverity, IContentValue, IDialogAction, IErrorState, IReserveStatus, OnChangeParams } from "@ly_utils/commonUtils";
import { IDialogsTab } from "@ly_types/lyDialogs";
import { getRecordHandler } from "@ly_components/forms/FormsDialog/utils/recordUtils";
import { IActionsStatus } from "@ly_types/lyActions";
import { OnCloseFunction } from "@ly_components/forms/FormsDialog/utils/commonUtils";
import Logger from "@ly_services/lyLogging";
import { IModulesProps } from "@ly_types/lyModules";
import { lyGetEventsComponent } from "@ly_services/lyEvents";
import { InputAction, InputActionProps } from "@ly_components/input/InputAction";
import { EEventComponent, IEventComponent, IEventComponentsProps } from "@ly_types/lyEvents";
import { ResultStatus } from "@ly_types/lyQuery";
import { Paper_Dialogs } from "@ly_components/styles/Paper";
import { Stack_Dialogs } from "@ly_components/styles/Stack";


type Props = Readonly<{
    componentProperties: ComponentProperties;
    onClose: OnCloseFunction;
}>;

export function FormsDialog(props: Props) {
    const { componentProperties, onClose } = props;
    const dispatch = useDispatch()
    const appsProperties: IAppsProps = useSelector(getAppsProperties)
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);
    const reserveStatus: IReserveStatus = useSelector(getReserveStatus);

    // Declare variables
    const [activeTab, setActiveTab] = useState(componentProperties.id + '-tab-id-1');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tabs, setTabs] = useState<IDialogsTab[]>([]);
    const [dialogContent, setDialogContent] = useState<CDialogContent>(new CDialogContent());
    const [dialogComponent, setDialogComponent] = useState<CDialogContent>(new CDialogContent());
    const [dialogsMode, setDialogsMode] = useState<LYComponentMode>(componentProperties.componentMode);
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false, severity:  ESeverity.info });
    const [sendAction, setSendAction] = useState<IDialogAction>({ event: LYComponentEvent.none, keys: null, message: "" });
    const [openHelpDialog, setOpenHelpDialog] = useState(false);
    const [isModified, setIsModified] = useState<boolean>(false)
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [maxRows, setMaxRows] = useState(15)

    const componentRef = useRef<ComponentProperties>(componentProperties);
    const [eventState, setEventState] = useState<InputActionProps[]|null>(null);

    const dialogDetailsRef = useRef<IDialogDetails[]>([]);
    const dialogHeaderRef = useRef<IDialogHeader>({
        [EDialogHeader.id]: '',
        [EDialogHeader.label]: '',
        [EDialogHeader.pool]: '',
        [EDialogHeader.queryID]: 0,
        [EDialogHeader.language]: ''
    });
    const refPaper = useRef<HTMLDivElement>(null)


    // Calculate the max number of rows for a multiline text field
    useEffect(() => {
        if (refPaper.current) {
            setMaxRows(Math.round(refPaper.current.clientHeight / 45))
        }
    }, [])

    const getRecord = useCallback(() => {
        const params = {
            dialogDetailsRef,
            dialogContent,
            dialogHeaderRef,
            appsProperties
        }
        return getRecordHandler(params)
    }, [dialogContent, dialogDetailsRef, dialogHeaderRef, appsProperties])

    const reserveRecord = useCallback(() => {
        const logger = new Logger({
            transactionName: "FormsDialog.reserveRecord",
            data: getRecord(),
            modulesProperties: modulesProperties
        });
        logger.logMessage("Socket: Reserve Record");
        dispatch({ type: 'reserve', payload: getRecord() })
    }, [dispatch, getRecord]);

    const releaseRecord = useCallback(() => {
        const logger = new Logger({
            transactionName: "FormsDialog.releaseRecord",
            data: getRecord(),
            modulesProperties: modulesProperties
        });
        logger.logMessage("Socket: Release Record");
        dispatch({ type: 'release', payload: getRecord() })
    }, [dispatch, getRecord]);

    const fetchData = useCallback(async () => {
        const params = {
            setIsLoading,
            dialogHeaderRef,
            componentProperties: componentRef.current,
            appsProperties,
            userProperties,
            modulesProperties,
            dialogsMode,
            dialogContent,
            setDialogContent,
            dialogDetailsRef,
            dialogComponent,
            setDialogComponent,
            setDialogsMode,
            isModified,
            setTabs,
            setActiveTab,
            reserveRecord,
        }
        await initDialog(params);
    }, [componentRef.current, dialogsMode, isModified, reserveRecord, setActiveTab, setDialogComponent, setDialogContent, setDialogsMode, setTabs, userProperties, appsProperties, modulesProperties,
        dialogContent, dialogDetailsRef, dialogComponent, dialogHeaderRef, setIsLoading]
    );
    useEffect(() => {
        const init = async () => {
            componentRef.current = props.componentProperties
            await fetchData();
        };
        init();
        return () => {
            setTabs([]);
            releaseRecord();
        };
    }, [props.componentProperties.id]);

    useEffect(() => {
        setIsLoading(true);
        const init = async () => {
            await fetchData();
        }
        init();
    }, [dialogsMode]);

    useEffect(() => {
        // Dispatch an action when data is updated
        if (reserveStatus !== null) {
            if (reserveStatus.status) {
                setErrorState({ open: true, message: "Record Reserved" + reserveStatus.user, severity:  ESeverity.error })
            } else
                setErrorState({ open: false, message: "", severity: ESeverity.info })
        }
    }, [reserveStatus]);


    const handleCloseDialog = useCallback(() => {
        if (isModified) {
            setOpenSaveDialog(true);
        } else {
            onClose({ event: LYComponentEvent.Cancel, message: "", keys: null });
        }
    }, [isModified, setOpenSaveDialog, onClose]);


    const handleTabChanged = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    }, []);


    const updateContentValue = useCallback((id: string, value: IContentValue, refreshTab: boolean) => {
        const params = {
            id,
            value,
            refreshTab,
            setDialogContent,
            componentProperties: componentRef.current,
            appsProperties,
            userProperties,
            modulesProperties,
            isModified,
            setTabs,
            setActiveTab,
            dialogDetailsRef,
            setDialogComponent,
        };
        updateContentValueHandler(params);
    }, [
        setDialogContent,
        componentRef.current,
        appsProperties,
        userProperties,
        modulesProperties,
        isModified,
        setTabs,
        setActiveTab,
        dialogDetailsRef,
        setDialogComponent
    ]);

    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        let refreshTab = false;
        setIsModified(true);
        tabs.forEach((item: IDialogsTab) => {
            if (item[EDialogTabs.params] !== null && item[EDialogTabs.params].includes(event.target.id)) {
                refreshTab = true;
            }
        });

        updateContentValue(event.target.id, event.target.value, refreshTab)
    }, [tabs, updateContentValue]);


    const onCheckboxChange = useCallback((event: OnChangeParams) => {
        let refreshTab = false;
        setIsModified(true);
        tabs.forEach((item: IDialogsTab) => {
            if (item[EDialogTabs.params] !== null && item[EDialogTabs.params].includes(event.id)) {
                refreshTab = true;
            }
        });

        updateContentValue(event.id, event.value, refreshTab)
    }, [tabs, updateContentValue]);

    const onAutoCompleteChange = useCallback((event: OnChangeParams) => {
        let refreshTab = false;
        setIsModified(true);
        tabs.forEach((item: IDialogsTab) => {
            if (item[EDialogTabs.params] !== null && item[EDialogTabs.params].includes(event.id)) {
                refreshTab = true;
            }
        });

        if (dialogContent.fields[event.id][EDialogDetails.output_params] !== undefined && dialogContent.fields[event.id][EDialogDetails.output_params] !== null && event.data !== undefined && event.data !== null) {
            const params = dialogContent.fields[event.id][EDialogDetails.output_params].split(';');

            params.forEach((param: string) => {
                const [inputKey, outputKey] = param.split('=');
                if (
                    inputKey &&
                    outputKey &&
                    inputKey in event.data && // Check if the key exists
                    event.data[inputKey as keyof typeof event.data] !== undefined
                ) {
                    // Update the corresponding value in the updateData object
                    updateContentValue(
                        outputKey,
                        event.data[inputKey as keyof typeof event.data],
                        false
                    );
                }
            });
        }

        updateContentValue(event.id, event.value, refreshTab)

    }, [tabs, updateContentValue, setIsModified]);


    const onActionEnd = useCallback((event: IActionsStatus) => {
        const params = {
            event,
            setErrorState,
            dialogContent,
            setDialogContent,
            dialogDetailsRef,
            appsProperties,
            modulesProperties,
            setDialogComponent
        }
        onActionEndHandler(params)
    }, [dialogContent, dialogDetailsRef, appsProperties, modulesProperties, setDialogContent, setDialogComponent, setErrorState]);


    const onEventEnd = useCallback((event: IActionsStatus) => {
        setEventState(null);
    }, [setEventState]);


    const handleSaveDialog = useCallback(async () => {
        const saveParams: ISaveDataAPIParams = {
            dialogContent,
            appsProperties,
            userProperties,
            modulesProperties,
            dialogsMode,
            componentProperties: componentRef.current,
            isChildren: false,
            dialogHeaderRef,
            dialogDetailsRef,
            parentKey: null,
            setIsModified,
            setErrorState
        }
        const result = await saveDataAPI(saveParams);
        if (result.status === ResultStatus.success) {
            let childrenComponent = dialogDetailsRef.current.filter(component => component[EDialogDetails.component] === LYComponentType.FormsDialog)
            if (childrenComponent.length > 0)
                setSendAction({ event: LYComponentEvent.Save, keys: result.keys, message: "" });


            let filtersDLG: IFiltersProperties[] = [];
            dialogDetailsRef.current.filter(keyField => keyField[EDialogDetails.key] === "Y").forEach((item) => {
                if (item[EDialogDetails.target] !== null)
                    filtersDLG.push({
                        header: "",
                        field: item[EDialogDetails.target],
                        value: dialogContent.fields[item[EDialogDetails.target]].value,
                        type: "string",
                        operator: "=",
                        defined: true,
                        rules: "",
                        disabled: true,
                        values: "",
                    });
            });

            let currentComponent = {
                id: componentRef.current.id,
                type: componentRef.current.type,
                label: componentRef.current.label,
                filters: filtersDLG,
                previous: componentRef.current.previous,
                componentMode: LYComponentMode.edit,
                initialState: componentRef.current.initialState,
                showPreviousButton: componentRef.current.showPreviousButton,
                isChildren: componentRef.current.isChildren

            };

            componentRef.current = currentComponent;
            setDialogsMode(LYComponentMode.edit)

            // Get Event Component
            const getEvents = await lyGetEventsComponent({
                appsProperties,
                userProperties,
                modulesProperties,
                [EEventComponent.component]: componentRef.current.type,
                [EEventComponent.componentID]: componentRef.current.id,
                [EEventComponent.eventID]: 1
            });
            
            if (getEvents.status === ResultStatus.success && getEvents.items.length > 0) {
                let eventComponent: InputActionProps[] = []
                getEvents.items.forEach((item: IEventComponent) => {
                    eventComponent.push({
                        id: item[EEventComponent.eventID],
                        actionID: item[EEventComponent.actionID],
                        type: ActionsType.event,
                        dialogContent: dialogContent,
                        dynamic_params: "",
                        fixed_params: "",
                        label: "On save",
                        status: onEventEnd,
                        disabled: false,
                        component: componentRef.current
                    });
                });
                setEventState( eventComponent);
            }
        }
    }, [
        dialogContent,
        dialogDetailsRef,
        componentRef,
        appsProperties,
        userProperties,
        modulesProperties,
        dialogsMode,
        dialogHeaderRef,
        setIsModified,
        setErrorState,
        saveDataAPI,
        setDialogsMode,
        setSendAction,
    ]);

    const handleOpenHelp = useCallback(() => { setOpenHelpDialog(true) }, [setOpenHelpDialog]);
    const handleDiscardConfirm = useCallback(() => { setOpenSaveDialog(true) }, [setOpenSaveDialog]);
    const handleDiscardDecline = useCallback(() => { setOpenSaveDialog(false) }, [setOpenSaveDialog]);
    const handleDiscardAccept = useCallback(() => {
        setOpenSaveDialog(false);
        onClose({ event: LYComponentEvent.Cancel, message: "", keys: null })
    }, [setOpenSaveDialog, onClose]
    );


    const handleMessageClose = useCallback(() => {
        setErrorState({ open: false, message: "", severity:  ESeverity.info })
    }, [setErrorState]);

    if (isLoading) return <LoadingIndicator />
    else
        return (
            <Stack_Dialogs>
                <Paper_Dialogs elevation={0} ref={refPaper} >
                    <DialogHelp
                        open={openHelpDialog}
                        setOpen={setOpenHelpDialog}
                        componentProperties={componentRef.current}
                        dialogHeaderRef={dialogHeaderRef}
                    />
                    <ConfirmationDialog
                        open={openSaveDialog}
                        title={t("dialogs.dataNotSaved")}
                        content={t('dialogs.confirmCloseDialog')}
                        onClose={handleDiscardConfirm}
                        onDecline={handleDiscardDecline}
                        onAccept={handleDiscardAccept}
                    />
                    <DialogToolbar
                        reserveStatus={reserveStatus}
                        isModified={isModified}
                        onCancel={handleCloseDialog}
                        onSave={handleSaveDialog}
                        onHelp={handleOpenHelp}
                    />
                    <AlertMessage
                        open={errorState.open}
                        severity={errorState.severity}
                        message={errorState.message}
                        onClose={handleMessageClose}
                    />
                    {eventState !== null && eventState.length > 0 &&
                        eventState.map((item: InputActionProps) => (
                            <InputAction
                                key={item.id} // Add a unique key
                                id={item.id}
                                actionID={item.actionID}
                                type={item.type}
                                dialogContent={item.dialogContent}
                                dynamic_params={item.dynamic_params}
                                fixed_params={item.fixed_params}
                                label={item.label}
                                status={item.status}
                                disabled={item.disabled}
                                component={item.component}
                            />
                        ))
                    }
                    <DialogForms
                        tabs={tabs}
                        activeTab={activeTab}
                        dialogDetailsRef={dialogDetailsRef}
                        onTabChange={handleTabChanged}
                        componentProperties={componentRef.current}
                        dialogContent={dialogContent}
                        dialogComponent={dialogComponent}
                        reserveStatus={reserveStatus}
                        onActionEnd={onActionEnd}
                        onInputChange={onChange}
                        onAutocompleteChange={onAutoCompleteChange}
                        onCheckboxChange={onCheckboxChange}
                        maxRows={maxRows}
                        dialogsMode={dialogsMode}
                        isModified={isModified}
                        setIsModified={setIsModified}
                        sendAction={sendAction}
                        setErrorState={setErrorState}
                    />
                </Paper_Dialogs>
            </Stack_Dialogs>
        )
}
