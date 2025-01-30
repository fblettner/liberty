/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import

// Import Custom
import { CDialogContent, EDialogDetails, EDialogTabs, IDialogDetails, IDialogsTab } from '@ly_types/lyDialogs';
import { FormsTable } from '@ly_components/forms/FormsTable/FormsTable';
import { LYComponentType, LYComponentMode, LYComponentViewMode, LYComponentDisplayMode, ComponentProperties } from '@ly_types/lyComponents';
import { IFiltersProperties } from '@ly_types/lyFilters';
import { DialogFields } from '@ly_components/forms/FormsDialog/render/DialogFields';
import { DialogActions } from '@ly_components/forms/FormsDialog/render/DialogActions';
import { DialogChildren } from '@ly_components/forms/FormsDialog/render/DialogChildren';
import { OnActionEndFunction, OnAutocompleteChangeFunction, OnCheckboxChangeFunction, OnInputChangeFunction } from '@ly_components/forms/FormsDialog/utils/commonUtils';
import { IDialogAction, IErrorState, IReserveStatus } from '@ly_utils/commonUtils';
import { GridItem } from '@ly_components/common/Grid';

interface IDialogTab {
    item: IDialogDetails;
    tab: IDialogsTab;
    dialogContent: CDialogContent;
    dialogComponent: CDialogContent;
    componentProperties: ComponentProperties
    reserveStatus: IReserveStatus;
    maxRows: number
    onAutocompleteChange: OnAutocompleteChangeFunction;
    onInputChange: OnInputChangeFunction;
    onCheckboxChange: OnCheckboxChangeFunction;
    onActionEnd: OnActionEndFunction;
    dialogsMode: LYComponentMode;
    isModified: boolean;
    setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
    sendAction?: IDialogAction;
    setSendAction?: React.Dispatch<React.SetStateAction<IDialogAction>>;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
    activeTab: string;
    parentActiveTab?: string;
    parentTabIndex?: string;
}

export const DialogTab = ({ item, tab, dialogContent, dialogComponent, componentProperties, reserveStatus, maxRows, onAutocompleteChange,
    onInputChange, onCheckboxChange, onActionEnd, dialogsMode, isModified, setIsModified, sendAction, setSendAction, setErrorState, activeTab, parentActiveTab, parentTabIndex }: IDialogTab) => {
    switch (item[EDialogDetails.component]) {
        case LYComponentType.Dictionary:
            if (dialogContent.fields[item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID]][EDialogDetails.visible])
                return (
            
                    <GridItem
                        style={{ flexGrow: 0 }}
                        size={{ xs: 12, sm: (12 / tab[EDialogTabs.cols]) * item[EDialogDetails.colspan] }}
                        key={item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID]}>
                                        <form 
                                            style={{ height: "100%", width: "100%" }}
                                            id={`dialog-form-${componentProperties.id}-${item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID]}`} 
                                            onSubmit={(e) => e.preventDefault()} 
                                        >
                        <DialogFields
                            item={item}
                            dialogContent={dialogContent}
                            reserveStatus={reserveStatus}
                            maxRows={maxRows}
                            onAutocompleteChange={onAutocompleteChange}
                            onCheckboxChange={onCheckboxChange}
                            onInputChange={onInputChange}
                        />
                        </form>
                    </GridItem>
                );
            break;
        case LYComponentType.InputAction:
            return (
                dialogComponent.fields[item[EDialogDetails.id]][EDialogDetails.visible] &&
                <GridItem
                    style={{ flexGrow: 0 }}
                    size={{ xs: 12, sm: (12 / tab[EDialogTabs.cols]) * item[EDialogDetails.colspan] }}
                    key={item[EDialogDetails.componentID]}>
                    <DialogActions
                        item={item}
                        dialogContent={dialogContent}
                        componentContent={dialogComponent}
                        reserveStatus={reserveStatus}
                        onActionEnd={onActionEnd}
                        component={componentProperties}
                    />
                </GridItem>
            );
            break;
        case LYComponentType.FormsTable:
        case LYComponentType.FormsTree:
        case LYComponentType.FormsList:
        case LYComponentType.FormsGrid:
            if (activeTab !== tab[EDialogTabs.sequence])
                return null;
            if (parentActiveTab !== parentTabIndex)
                return null;
            let filtersTBL: IFiltersProperties[] = [];
            /* Create filter from dialog content, maping are coming from LY_DLG_FILTERS */
            let filterStringTBL: string = item[EDialogDetails.dynamic_params];
            if (filterStringTBL !== null)
                filterStringTBL.split(";").forEach((filters) => {
                    let filter = filters.split("=")

                    filtersTBL.push({
                        header: "",
                        field: filter[0],
                        value: dialogContent.fields[filter[1]].value,
                        type: "string",
                        operator: "=",
                        defined: true,
                        rules: "",
                        disabled: true,
                        values: "",
                    });
                })

            /* Create filter for fixed values defined into LY_DLG_FILTERS */
            filterStringTBL = item[EDialogDetails.fixed_params];
            if (filterStringTBL !== null)
                filterStringTBL.split(";").forEach((filters) => {
                    let filter = filters.split("=")

                    filtersTBL.push({
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

            let targetFormsTable = {
                id: item[EDialogDetails.componentID],
                type: item[EDialogDetails.component],
                label: componentProperties.label + " > " + tab[EDialogTabs.label],
                filters: filtersTBL,
                previous: componentProperties.isChildren ? componentProperties.previous : componentProperties,
                componentMode: LYComponentMode.find,
                showPreviousButton: false,
                isChildren: true,
                currentTab: componentProperties.isChildren ? undefined : tab,
                overrideQueryPool: (item[EDialogDetails.pool_params] === null)
                    ? undefined
                    : (dialogContent.fields[item[EDialogDetails.pool_params]] !== undefined)
                        ? dialogContent.fields[item[EDialogDetails.pool_params]].value as string
                        : item[EDialogDetails.pool_params]

            };

            let view = LYComponentViewMode.table;
            switch (item[EDialogDetails.component]) {
                case LYComponentType.FormsTree:
                    view = LYComponentViewMode.tree;
                    break;
                case LYComponentType.FormsList:
                    view = LYComponentViewMode.list;
                    break;
                case LYComponentType.FormsGrid:
                    view = LYComponentViewMode.grid;
                    break;
            }
            return (
                <GridItem style={{ height: "100%", width: "100%" }} size={12} key={item[EDialogDetails.componentID]} >
                    <FormsTable
                        componentProperties={targetFormsTable}
                        viewMode={view}
                        displayMode={LYComponentDisplayMode.component}
                        viewGrid={true}
                        readonly={isModified || reserveStatus.status}
                    />
                </GridItem>
            );
        case LYComponentType.FormsDialog:
            let filtersDLG: IFiltersProperties[] = [];
            /* Create filter from dialog content, maping are coming from LY_DLG_FILTERS */
            let filterStringDLG: string = item[EDialogDetails.dynamic_params];
            if (filterStringDLG !== null)
                filterStringDLG.split(";").forEach((filters) => {
                    let filter = filters.split("=")
                    let value = null
                    if (dialogsMode !== LYComponentMode.edit) {
                        if (componentProperties.filters.length > 0)
                            componentProperties.filters.filter((keyField: IFiltersProperties) => keyField["field"] === filter[1]).forEach((field: IFiltersProperties) => {
                                value = field.value;
                            })
                    }
                    filtersDLG.push({
                        header: "",
                        field: filter[0],
                        value: value ?? dialogContent.fields[filter[1]].value,
                        type: "string",
                        operator: "=",
                        defined: true,
                        rules: "",
                        disabled: true,
                        values: "",
                    });
                })

            /* Create filter for fixed values defined into LY_DLG_FILTERS */
            filterStringDLG = item[EDialogDetails.fixed_params];
            if (filterStringDLG !== null)
                filterStringDLG.split(";").forEach((filters) => {
                    let filter = filters.split("=")

                    filtersDLG.push({
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

            let currentComponent = {
                id: componentProperties.id,
                type: componentProperties.type,
                label: componentProperties.label,
                filters: componentProperties.filters,
                previous: componentProperties.previous,
                componentMode: componentProperties.componentMode,
                showPreviousButton: componentProperties.showPreviousButton,
                isChildren: componentProperties.isChildren,
                currentTab: tab,
                overrideQueryPool: componentProperties.overrideQueryPool
            }

            let targetFormsDialog = {
                id: item[EDialogDetails.componentID],
                type: item[EDialogDetails.component],
                label: item[EDialogDetails.label],
                filters: filtersDLG,
                previous: currentComponent,
                componentMode: componentProperties.componentMode,
                showPreviousButton: false,
                isChildren: true,
                filterStringDLG: item[EDialogDetails.dynamic_params],
                overrideQueryPool: (item[EDialogDetails.pool_params] === null)
                    ? undefined
                    : (dialogContent.fields[item[EDialogDetails.pool_params]] !== undefined)
                        ? dialogContent.fields[item[EDialogDetails.pool_params]].value as string
                        : item[EDialogDetails.pool_params]

            };
            return (
                <GridItem style={{ height: "100%" }} size={12} key={item[EDialogDetails.componentID]} >
                    <DialogChildren
                        componentProperties={targetFormsDialog}
                        sendAction={sendAction}
                        setSendAction={setSendAction}
                        isModified={isModified}
                        setIsModified={setIsModified}
                        setErrorState={setErrorState}
                        parentActiveTab={activeTab}
                        parentTabIndex={tab[EDialogTabs.sequence]}
                    />
                </GridItem>
            );
    }

}