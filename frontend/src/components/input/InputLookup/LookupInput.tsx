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
import { ComponentProperties, LYComponentEvent, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { IGetLookup, ELookup, ILookupOption } from "@ly_types/lyLookup";
import { LookupPopper } from "@ly_components/input/InputLookup/LookupPopper";
import { OnChangeFunction } from "@ly_components/input/InputLookup/utils/commonUtils";
import { getAppsProperties, getModules, getUserProperties } from "@ly_features/global";
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { IAppsProps, ESessionMode } from "@ly_types/lyApplications";
import { ResultStatus } from "@ly_types/lyQuery";
import { IUsersProps } from "@ly_types/lyUsers";
import { LoadingIndicator } from "@ly_components/common/LoadingIndicator";
import { ITransformedObject } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ESeverity, IContentValue, IDialogAction } from "@ly_utils/commonUtils";
import { IErrorState } from "@ly_utils/commonUtils";
import { buildDynamicFilters, buildFixedFilters } from "@ly_utils/filterUtils";
import { LookupSearch } from "@ly_components/input/InputLookup/LookupSearch";
import { IColumnsFilter } from "@ly_types/lyFilters";
import { IModulesProps } from "@ly_types/lyModules";
import Logger from "@ly_services/lyLogging";
import { DialogWidget } from "@ly_components/forms/FormsDialog/dialogs/DialogWidget";
import { ISelectedRow } from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { LYAddIcon, LYEditIcon, LYSearchIcon } from "@ly_styles/icons";
import { Div_AutoComplete } from "@ly_components/styles/Div";
import { IconButton } from "@ly_components/common/IconButton";
import { Select } from "@ly_components/common/Select";
import { TextFieldVariants } from "@ly_components/types/common";

export interface ILookupInput {
    id: string;
    label?: string;
    lookupID: number;
    lookupLabel?: string;
    disabled?: boolean;
    defaultValue?: IContentValue;
    displayWhite?: boolean;
    variant: TextFieldVariants | undefined;
    searchByLabel?: boolean;
    data?: IColumnsFilter | ITransformedObject;
    dynamic_params?: string;
    fixed_params?: string;
    sessionMode?: ESessionMode;
    overrideQueryPool?: string;
    callFromTable?: boolean;
    onChange: OnChangeFunction;
    setErrorState: React.Dispatch<React.SetStateAction<IErrorState>>;
}


export const LookupInput = (props: ILookupInput) => {
    const { id, label, lookupID, lookupLabel, onChange, disabled, displayWhite, variant, defaultValue, searchByLabel, data, dynamic_params, fixed_params, sessionMode, overrideQueryPool, callFromTable, setErrorState } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchValue, setSearchValue] = useState("");
    const [filteredData, setFilteredData] = useState<ILookupOption[]>([]);

    const [popperOpen, setPopperOpen] = useState(false);

    const appsProperties: IAppsProps = useSelector(getAppsProperties);
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);

    const [selectedOption, setSelectedOption] = useState<ILookupOption | null>(null);
    const [lookupState, setLookupState] = useState<IGetLookup>({
        data: [],
        columns: [],
        header: {},
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const dialogRef = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: label!,
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });
    const searchRef = useRef<ComponentProperties>({
        id: -1,
        type: LYComponentType.FormsDialog,
        label: label!,
        filters: [],
        componentMode: LYComponentMode.add,
        showPreviousButton: false,
        isChildren: true
    });

    const fetchLookupData = useCallback(async (getAllValues: boolean) => {
        setIsLoading(true);
        try {
            // await new Promise(resolve => setTimeout(resolve, 1000));
            const results = await ToolsDictionary.getLookup({
                appsProperties,
                userProperties,
                [ELookup.id]: lookupID,
                data: data,
                dynamic_params: dynamic_params,
                fixed_params: fixed_params,
                getAllValues,
                sessionMode: sessionMode,
                overrideQueryPool: overrideQueryPool,
                modulesProperties,
                searchbyLabel: searchByLabel,
                value: defaultValue

            });

            if (results.status === ResultStatus.success) {

                setLookupState({
                    data: results.data,
                    columns: results.columns,
                    header: results.header
                });
                if (getAllValues) {
                    setFilteredData(results.data);
                }

                if (!getAllValues && defaultValue) {
                    const selectedLookup = findSelectedOption(results, searchByLabel, defaultValue);
                    setSelectedOption(selectedLookup ?? null);
                }
                setIsLoading(false)
            } else {
                setErrorState({ open: true, message: label + ": " + t("unexpectedError"), severity: ESeverity.error });
                const logger = new Logger({
                    transactionName: "LookupInput.fetchLookupData",
                    modulesProperties: modulesProperties,
                    data: results
                });
                logger.logException("LookupInput: Failed to fetch enum data");
            }
        } catch (error) {
            const logger = new Logger({
                transactionName: "LookupInput.fetchLookupData",
                modulesProperties: modulesProperties,
                data: error
            });
            logger.logException("LookupInput: Failed to fetch lookup data");
            setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error });
        }
    }, [lookupID, data, dynamic_params, fixed_params, sessionMode, overrideQueryPool, searchByLabel, defaultValue, selectedOption]);

    useEffect(() => {
        const fetchData = async () => {
            if (!callFromTable) {
                setIsLoading(true);
                await fetchLookupData(false);
            }
        };
        fetchData();
    }, [lookupID]);

    const handleFocus = useCallback(async () => {
        setIsLoading(true)
        await fetchLookupData(true);
        setPopperOpen(true);
    }, [fetchLookupData, setIsLoading, setPopperOpen, isLoading]);

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

    const findSelectedOption = useCallback((options: IGetLookup, isByLabel: boolean | undefined, value: IContentValue) => {
        if (!value) return null;
        const dd_label = options.header[ELookup.dd_label];
        const dd_id = options.header[ELookup.dd_id]

        return isByLabel
            ? options.data.find((item: ILookupOption) => (item[dd_label as keyof ILookupOption]).toString() === value.toString())
            : options.data.find((item: ILookupOption) => (item[dd_id as keyof ILookupOption]).toString() === value.toString());
    }, []);


    const handleOpen = useCallback(async () => {
        setPopperOpen(true);
    }, [setPopperOpen]);

    const onInputChange = useCallback((event: SyntheticEvent<Element, Event>, value: string, reason: string) => {
        if (reason === 'clear') {
            setSelectedOption(null);  // Clear the selected option
            setSearchValue('');  // Clear the search value
            if (typeof onChange === "function") {
                onChange({ id: id, value: null, label: "", data: [] });  // Notify that value is cleared
            }
        } else {
            const filtered = lookupState.data.filter((option: ILookupOption) =>
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
        if (selectedOption === null && searchValue !== '') {
            const dd_id = lookupState.header[ELookup.dd_id] as keyof ILookupOption;
            const dd_label = lookupState.header[ELookup.dd_label] as keyof ILookupOption;
            const selected = lookupState.data.find((column) => column[dd_id] === searchValue);
            if (selected !== undefined && dd_id !== undefined && dd_label !== undefined) {
                setSelectedOption(selected)
                if (typeof onChange === "function") {
                    onChange({ id: id, value: selected[dd_id], label: selected[dd_label], data: selected });
                }
            }
        }

        if (!event.relatedTarget || !inputRef.current?.contains(event.relatedTarget)) {
            setPopperOpen(false);
        }
    }, [setPopperOpen, selectedOption, searchValue, lookupState.data]);


    const onDialogClose = useCallback((action: IDialogAction) => {
        if (action.event === LYComponentEvent.Cancel) {
            setOpenDialog(false);
        }
        setPopperOpen(false);
    }, []);

    const onSearchClose = useCallback(() => {
        setOpenSearch(false);
    }, []);


    const onSearchChange = useCallback((action: ISelectedRow) => {
        const ddId = lookupState.header?.[ELookup.dd_id];
        const ddLabel = lookupState.header?.[ELookup.dd_label] ?? "";

        if (ddId !== undefined && action.keys[ddId] !== undefined) {
            let selected = action.keys as unknown as ILookupOption;
            setSelectedOption(selected);
            if (typeof onChange === "function") {
                onChange({ id: id, value: action.keys[ddId], label: action.keys[ddLabel] as string, data: selected });
            }
            setPopperOpen(false);
            setOpenSearch(false);
        }

    }, [lookupState, onChange, id]);

    const baseFilters = useMemo(() => {
        return [
            ...buildDynamicFilters(dynamic_params, data),
            ...buildFixedFilters(fixed_params)
        ];
    }, [dynamic_params, fixed_params, data]);

    const filtersForAdd = useMemo(() => {
        return baseFilters.filter((item) => item.field !== lookupState.header?.[ELookup.dd_id]);
    }, [baseFilters, lookupState.header?.[ELookup.dd_id]]);

    const filtersForEdit = useMemo(() => {
        return baseFilters;
    }, [baseFilters]);

    const filtersForSearch = useMemo(() => {
        return baseFilters.filter((item) => item.field !== lookupState.header?.[ELookup.dd_id]);
    }, [baseFilters, lookupState.header?.[ELookup.dd_id]]);

    const onDialogOpen = useCallback((mode: LYComponentMode) => {
        const filtersDLG = mode === LYComponentMode.add ? filtersForAdd : filtersForEdit;
        const frm_id = lookupState.header?.[ELookup.frm_id];

        if (frm_id !== undefined) {
            dialogRef.current = {
                id: parseInt(frm_id),
                type: LYComponentType.FormsDialog,
                label: label!,
                filters: filtersDLG,
                componentMode: mode,
                showPreviousButton: false,
                isChildren: false,
            };

            setPopperOpen(false);
            setOpenDialog(true);
        }
    }, [lookupState, label, filtersForAdd, filtersForEdit]);

    const onSearchOpen = useCallback(() => {
        const tbl_id = lookupState.header?.[ELookup.tbl_id];

        if (tbl_id !== undefined) {
            searchRef.current = {
                id: parseInt(tbl_id),
                type: LYComponentType.FormsTable,
                label: t('tables.findSelect') + label,
                filters: filtersForSearch,
                componentMode: LYComponentMode.search,
                showPreviousButton: false,
                isChildren: true,
            };
            setPopperOpen(false);
            setOpenSearch(true);
        }
    }, [lookupState, filtersForSearch, label]);


    const onClose = useCallback((event: KeyboardEvent | React.MouseEvent<HTMLTableRowElement>) => {
        setPopperOpen(false);
    }, []);

    const getOptionLabel = useMemo(() => (option: string | ILookupOption) => {
        if (typeof option === "string") {
            return option;
        }
        const dd_group = lookupState.header[ELookup.dd_group] as keyof ILookupOption;
        const dd_label = lookupState.header[ELookup.dd_label] as keyof ILookupOption;
        const dd_id = lookupState.header[ELookup.dd_id] as keyof ILookupOption;

        if (dd_group !== undefined && dd_label !== undefined && dd_id !== undefined) {
            return (option[dd_group] === undefined)
                ? (option[dd_label] === undefined)
                    ? option[dd_id]
                    : option[dd_id] + " - " + option[dd_label] + ""
                : (option[dd_label] === undefined)
                    ? option[dd_id] + " - " + option[dd_group]
                    : option[dd_id] + " - " + option[dd_group] + " - " + option[dd_label] + ""
        }

        return "";
    }, [lookupState.header]);

    return (
        <Fragment>
            <DialogWidget
                open={openDialog}
                componentProperties={dialogRef.current}
                onClose={onDialogClose}
            />
            <LookupSearch
                open={openSearch}
                componentProperties={searchRef.current}
                onChange={onSearchChange}
                onClose={onSearchClose}
            />
            <Div_AutoComplete>
                <Select
                    ref={inputRef}
                    label={label}
                    fullWidth
                    id={id}
                    options={filteredData}
                    loading={isLoading}
                    onOpen={handleOpen}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    variant={variant}
                    getOptionLabel={getOptionLabel}
                    value={selectedOption || null}
                    onInputChange={onInputChange}
                    PopperComponent={(props) => (
                        <LookupPopper
                            popperProps={props} // Passing the props from Autocomplete to EnumPopper
                            isLoading={isLoading}
                            id={id}
                            onChange={onChange}
                            setSelectedOption={setSelectedOption}
                            lookupState={lookupState}
                            data={filteredData}
                            open={popperOpen}
                            onClose={onClose}
                            inputRef={inputRef}
                        />

                    )}

                />
                {lookupState.header !== undefined && lookupState.header[ELookup.display_search] === "Y" && !disabled &&
                    <IconButton
                        onClick={() => { onSearchOpen() }}
                        aria-label="search"
                        icon={LYSearchIcon}
                    />
                }
                {lookupState.header !== undefined && lookupState.header[ELookup.display_add] === "Y" && !disabled &&
                    <IconButton
                        onClick={() => { onDialogOpen(LYComponentMode.add) }}
                        aria-label="edit"
                        icon={LYAddIcon}
                    />
                }
                {lookupState.header !== undefined && selectedOption !== null && lookupState.header[ELookup.display_add] === "Y" && !disabled &&
                    <IconButton
                        onClick={() => { onDialogOpen(LYComponentMode.edit) }}
                        aria-label="edit"
                        icon={LYEditIcon}
                    />
                }
            </Div_AutoComplete>
        </Fragment>
    )

}