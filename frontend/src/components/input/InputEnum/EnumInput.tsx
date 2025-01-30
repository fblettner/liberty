/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "i18next";
import { useSelector } from "react-redux";

// Custom Import
import { ComponentProperties, LYComponentEvent, LYComponentMode, LYComponentType } from "@ly_types/lyComponents"
import { EEnumValues, EEnumHeader, IEnumOption } from "@ly_types/lyEnums";
import { EnumPopper } from "@ly_components/input/InputEnum/EnumPopper";
import { OnChangeFunction } from "@ly_components/input/InputEnum/utils/commonUtils";
import { IEnumsResult } from "@ly_types/lyEnums";
import { getAppsProperties, getModules, getUserProperties } from "@ly_features/global";
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { IAppsProps, ESessionMode, EApplications } from "@ly_types/lyApplications";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ResultStatus } from "@ly_types/lyQuery";
import { IUsersProps } from "@ly_types/lyUsers";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ITransformedObject } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ESeverity, IDialogAction } from "@ly_utils/commonUtils";
import { IErrorState } from "@ly_utils/commonUtils";
import { IColumnsFilter } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import Logger from "@ly_services/lyLogging";
import { DialogWidget } from "@ly_components/forms/FormsDialog/dialogs/DialogWidget";
import { LYAddIcon, LYEditIcon } from "@ly_styles/icons";
import { Div_AutoComplete } from "@ly_components/styles/Div";
import { IconButton } from "@ly_components/common/IconButton";
import { Select } from "@ly_components/common/Select";
import { TextFieldVariants } from "@ly_components/types/common";

export interface IEnumInput {
    id: string;
    label: string;
    enumID: number;
    defaultValue: string;
    disabled: boolean;
    variant: TextFieldVariants | undefined;
    freeSolo: boolean;
    searchByLabel?: boolean;
    data?: IColumnsFilter | ITransformedObject;
    dynamic_params?: string;
    fixed_params?: string;
    sessionMode?: ESessionMode;
    overrideQueryPool?: string;
    callFromTable?: boolean;
    hideButton?: boolean;
    onChange: OnChangeFunction;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
}

export const EnumInput = (props: IEnumInput) => {
    const { id, label, enumID, defaultValue, disabled, variant, freeSolo, searchByLabel, data, dynamic_params, fixed_params, sessionMode, overrideQueryPool, callFromTable, onChange, setErrorState, hideButton } = props;

    const appsProperties: IAppsProps = useSelector(getAppsProperties)
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);

    const [searchValue, setSearchValue] = useState("");
    const [filteredData, setFilteredData] = useState<IEnumOption[]>([]);

    const [popperOpen, setPopperOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [enumState, setEnumState] = useState<IEnumsResult>({
        data: [],
        columns: [],
        header: {},
    });
    const [selectedOption, setSelectedOption] = useState<IEnumOption | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: label,
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });

    const fetchEnumData = useCallback(async (getAllValues: boolean) => {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(true);
        try {
            const results = await ToolsDictionary.getEnums({
                appsProperties: appsProperties,
                userProperties: userProperties,
                [EEnumHeader.id]: enumID,
                sessionMode: sessionMode ?? appsProperties[EApplications.session],
                modulesProperties
            });
            if (results.status === ResultStatus.success) {
                setEnumState({
                    data: results.data,
                    columns: results.columns,
                    header: results.header
                })

                if (getAllValues) {
                    setFilteredData(results.data);
                }

                if (!getAllValues && defaultValue) {
                    const selectedEnum = findSelectedOption(results, searchByLabel, defaultValue);
                    setSelectedOption(selectedEnum ?? null);
                }
                setIsLoading(false)
            }
            else {
                setErrorState({ open: true, message: label + ": " + t("unexpectedError"), severity: ESeverity.error });
                const logger = new Logger({
                    transactionName: "EnumInput.fetchEnumData",
                    modulesProperties: modulesProperties,
                    data: results
                  });
                  logger.logException("EnumInput: Failed to fetch enum data");
            }
        } catch (error) {
            const logger = new Logger({
                transactionName: "EnumInput.fetchEnumData",
                modulesProperties: modulesProperties,
                data: error
              });
              logger.logException("EnumInput: Failed to fetch enum data");
            setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error });

            // Optional: Set an error state to show a message to the user
        }
    }, [enumID, dynamic_params, fixed_params, sessionMode, overrideQueryPool, searchByLabel, defaultValue, selectedOption]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!callFromTable) {
                setIsLoading(true)
                await fetchEnumData(false);
            }
        };
        fetchData();
    }, [enumID]);

    const handleFocus = useCallback(async () => {
        setIsLoading(true)
        await fetchEnumData(true);
        setPopperOpen(true);
    }, [fetchEnumData, defaultValue, callFromTable]);


    // Event listener for keydown when input is focused
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (!popperOpen) {
                    handleFocus();
                }
            } else if (event.key === "Escape")
                setPopperOpen(false);
            else if (event.key === "Enter") {
                if (!popperOpen) {
                    handleFocus();
                } 
            }
        };

        const currentInput = inputRef.current;
        if (currentInput) {
            // Attach keydown event only when the input is focused
            currentInput.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            if (currentInput) {
                currentInput.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [popperOpen, handleFocus]);

    const findSelectedOption = useCallback((options: IEnumsResult, isByLabel: boolean | undefined, value: string | null) => {
        if (!value) return null;
        return isByLabel
            ? options.data.find((item: IEnumOption) => item[EEnumValues.label] === defaultValue)
            : options.data.find((item: IEnumOption) => item[EEnumValues.value] === defaultValue);
    }, []);



    const handleOpen = useCallback(async () => {
        setPopperOpen(true);
    }, [setPopperOpen]);


    const onInputChange = useCallback((event: SyntheticEvent<Element, Event>, value: string, reason?: string) => {
        if (reason === 'clear') {
            setSelectedOption(null);  // Clear the selected option
            setSearchValue('');  // Clear the search value
            if (typeof onChange === "function") {
                onChange({ id: id, value: null, label: "", data: [] });  // Notify that value is cleared
            }
        } else {
            const filtered = enumState.data.filter((option: IEnumOption) =>
                Object.values(option).some((columnValue) =>
                    String(columnValue).toLowerCase().includes(value.toLowerCase())
                )
            );
            setFilteredData(filtered);
            setSearchValue(value);
        }
    }, [onChange, id, isLoading]);


    // Handle popper close when losing focus
    const handleBlur = useCallback((event: React.FocusEvent) => {
        // Only close the popper if focus moves outside the input or the popper itself
        if (!event.relatedTarget || !inputRef.current?.contains(event.relatedTarget)) {
            setPopperOpen(false);
        }
    }, []);

    const onClose = useCallback((event: KeyboardEvent | React.MouseEvent<HTMLTableRowElement>) => {
        setPopperOpen(false);
    }, []);

    const onDialogClose = useCallback((action: IDialogAction) => {
        if (action.event === LYComponentEvent.Cancel) {
            setOpenDialog(false);
        }
        setPopperOpen(false);
    }, []);


    const onDialogOpen = useCallback((mode: LYComponentMode) => {
        let filtersDLG: IFiltersProperties[] = [];
        filtersDLG.push({
            header: "",
            field: EEnumValues.id,
            value: enumID,
            type: "string",
            operator: "=",
            defined: true,
            rules: "",
            disabled: true,
            values: "",
        });

        if (mode !== LYComponentMode.add) {
            filtersDLG.push({
                header: "",
                field: EEnumValues.value,
                value: selectedOption ? selectedOption[EEnumValues.value] : null,
                type: "string",
                operator: "=",
                defined: true,
                rules: "",
                disabled: true,
                values: "",
            });
        }
        dialogRef.current = {
            id: GlobalSettings.getFramework.enums_dialog,
            type: LYComponentType.FormsDialog,
            label: label,
            filters: filtersDLG,
            componentMode: mode,
            showPreviousButton: false,
            isChildren: false,
        };
        setOpenDialog(true);

        setPopperOpen(false);
        setOpenDialog(true);

    }, [selectedOption, enumID]);

    const getOptionLabel = useMemo(() => (option: string | IEnumOption) => {
        if (typeof option === "string") {
            return option;
        }
        return option[EEnumValues.value] + " (" + option[EEnumValues.label] + ")";
    }, []);

    return (
        <Fragment>
            <DialogWidget
                open={openDialog}
                componentProperties={dialogRef.current}
                onClose={onDialogClose}
            />
            <Div_AutoComplete>
                <Select
                    ref={inputRef}
                    label={label}
                    freeSolo={freeSolo}
                    id={id}
                    fullWidth
                    options={filteredData}
                    loading={isLoading}
                    onOpen={handleOpen}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    getOptionLabel={getOptionLabel}
                    variant={variant}
                    value={selectedOption || null}
                    onInputChange={onInputChange}
                    PopperComponent={(props) => (
                            <EnumPopper
                                popperProps={props}  // Passing the props from Autocomplete to EnumPopper
                                isLoading={isLoading}
                                id={id}
                                onChange={onChange}
                                setSelectedOption={setSelectedOption}
                                columns={enumState.columns}
                                data={filteredData}
                                inputRef={inputRef}
                                onClose={onClose}
                                open={popperOpen}
                            />
                    )}
                />
                {enumState.header[EEnumHeader.display_add] === "Y" && !disabled && !callFromTable && !hideButton &&
                    <IconButton
                        onClick={() => { onDialogOpen(LYComponentMode.add) }}
                        aria-label="edit"
                        icon={LYAddIcon} 
                        />
                }
                {selectedOption !== null && enumState.header[EEnumHeader.display_add] === "Y" && !disabled && !callFromTable && !hideButton &&
                    <IconButton
                        onClick={() => { onDialogOpen(LYComponentMode.edit) }}
                        aria-label="edit" icon={LYEditIcon} 
                    />
                }
            </Div_AutoComplete>
        </Fragment>
    )
}
