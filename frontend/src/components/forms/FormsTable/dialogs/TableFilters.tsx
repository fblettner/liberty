/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import ReactDOM from "react-dom";
import dayjs from "dayjs";

// Custom Import
import { Div_DialogWidgetContent, Div_DialogWidgetTitleButtons, Div_ResizeBox, Div_DialogWidget, Div_DialogWidgetTitle, Div_DialogWidgetButtons, Backdrop } from '@ly_components/styles/Div';
import { DIALOG_WIDGET_DIMENSION } from '@ly_utils/commonUtils';
import { ETableHeader, IColumnsProperties, ITableHeader } from "@ly_types/lyTables";
import { CColumnsFilter, IFiltersProperties } from "@ly_types/lyFilters";
import { InputCheckbox } from "@ly_components/input/InputCheckbox";
import { InputEnum } from "@ly_components/input/InputEnum/InputEnum";
import { InputLookup } from "@ly_components/input/InputLookup/InputLookup";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { ComponentProperties } from "@ly_types/lyComponents";
import { IContentValue } from "@ly_utils/commonUtils";
import { LYAddIcon, LYCancelIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYPlayCircleOutlineIcon, LYReactIcon, LYResetIcon, LYThumbDownOffIcon, LYThumbUpIcon } from "@ly_styles/icons";
import { Paper_Dialogs, Paper_Popup } from "@ly_components/styles/Paper";
import { Dialog_Actions, Dialog_Content, Dialog_Title } from "@ly_components/styles/Dialog";
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { Dialog } from "@ly_components/common/Dialog";
import { Button } from "@ly_components/common/Button";
import { IconButton_Contrast } from "@ly_components/styles/IconButton";
import { Input } from "@ly_components/common/Input";
import { DefaultZIndex } from "@ly_components/types/common";
import { DatePicker } from "@ly_components/input/InputDate";
import { GridFlexContainer, GridItem } from "@ly_components/common/Grid";
import { Select } from "@ly_components/common/Select";

export interface ITableFilters {
    open: boolean;
    tableColumns: IColumnsProperties[];
    componentProperties: ComponentProperties
    tableProperties: ITableHeader;
    columnsFilter: CColumnsFilter;
    setColumnsFilters: React.Dispatch<React.SetStateAction<CColumnsFilter>>;
    handleCancel: () => void;
    handleApply: () => void;
}

type FilterValue = IContentValue;

const stringOperators = [
    { value: 'like', label: 'Like' },
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
];

const booleanOperators = [
    { value: '=', label: 'Is' },
];

const dateOperators = [
    { value: '=', label: 'Equals' },
    { value: '>', label: 'Greater' },
    { value: '<', label: 'Less' },
];

const numberOperators = [
    { value: '=', label: 'Equals' },
    { value: '>', label: 'Greater' },
    { value: '<', label: 'Less' },
];

export const TableFilters = (params: ITableFilters) => {
    const { componentProperties, open, tableProperties, columnsFilter, setColumnsFilters, handleCancel, handleApply, tableColumns } = params;
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState("");
    const unfilteredColumns = useMemo(() => tableColumns.filter((col) => !(col.accessorKey in columnsFilter.fields)), [tableColumns, columnsFilter]);

    const columnOptions = useMemo(() =>
        unfilteredColumns.map((col) => ({
            value: col.accessorKey, 
            label: col.header + " (" + col.accessorKey + ")", 
        })),
        [unfilteredColumns]
    );

    const isSmallScreen = useMediaQuery("(max-width: 600px)");

    const [isFullScreen, setIsFullScreen] = useState(() => isSmallScreen); // Set fullscreen initially if small screen
    const [dimensions, setDimensions] = useState({ width: DIALOG_WIDGET_DIMENSION.width, height: DIALOG_WIDGET_DIMENSION.height });
    const resizeRef = useRef<HTMLDivElement | null>(null);
    const titleBarRef = useRef<HTMLDivElement | null>(null); // Add ref for the title bar

    const updateContentDPValue = useCallback((id: string, value: FilterValue, label: string) => {
        setColumnsFilters((prevColumnsFilter) => {
            const newContentDP = {
                ...prevColumnsFilter,
                fields: {
                    ...prevColumnsFilter.fields,
                    [id]: {
                        ...prevColumnsFilter.fields[id],
                        value: value,
                        label: label,
                    },
                },
            };
            return newContentDP;
        });
    }, [setColumnsFilters]);

    const resetAllFiltersValues = useCallback(() => {
        setColumnsFilters((prevColumnsFilter) => {
            const newFields = Object.keys(prevColumnsFilter.fields).reduce((acc, key) => {
                acc[key] = {
                    ...prevColumnsFilter.fields[key],
                    value: null,
                };
                return acc;
            }, {} as typeof prevColumnsFilter.fields);

            return {
                ...prevColumnsFilter,
                fields: newFields,
            };
        });
    }, [setColumnsFilters]);

    const handleReset = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        resetAllFiltersValues();
    }, [resetAllFiltersValues]);

    const onFiltersAutoCompleteChanged = useCallback((event: { id: string; value: FilterValue, label: string }) => {
        updateContentDPValue(event.id, event.value, event.label);
    }, [updateContentDPValue]);

    const onFiltersChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        updateContentDPValue(event.target.id, event.target.value, "");
    }, [updateContentDPValue]);

    const onFiltersCheckboxChanged = useCallback((event: { id: string; value: FilterValue }) => {

        let column = tableColumns.find((col) => col.accessorKey === event.id);
        if (event.value && column)
            updateContentDPValue(event.id, column.rulesValues, "");
        else
            updateContentDPValue(event.id, null, "");

    }, [updateContentDPValue, tableColumns]);


    const handleOperatorChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        setColumnsFilters((prevColumnsFilter) => {
            const newContentDP = {
                ...prevColumnsFilter,
                fields: {
                    ...prevColumnsFilter.fields,
                    [id]: {
                        ...prevColumnsFilter.fields[id],
                        operator: option.value,
                    },
                },
            };
            return newContentDP;
        });
    };


    const handleDateChange = (id: string) => (value: string | null) => {
        updateContentDPValue(id, value, "");
    };


    const renderFieldComponent = (field: string, filterProperties: IFiltersProperties) => {
        if (filterProperties.rules === EDictionaryRules.enum && filterProperties.rulesValues) {
            return (
                <InputEnum
                    id={field}
                    key={`${field}-${filterProperties.value || ''}`}
                    enumID={parseInt(filterProperties.rulesValues)}
                    label={filterProperties.header}
                    defaultValue={columnsFilter.fields[field].value as string ?? null}
                    disabled={false}
                    variant="standard"
                    onChange={onFiltersAutoCompleteChanged}
                    freeSolo={false}
                    searchByLabel={false}
                />
            );
        }

        if (filterProperties.rules === EDictionaryRules.lookup && filterProperties.rulesValues) {
            return (
                <InputLookup
                    id={field}
                    key={`${field}-${filterProperties.value || ''}`}
                    lookupID={parseInt(filterProperties.rulesValues)}
                    label={filterProperties.header}
                    onChange={onFiltersAutoCompleteChanged}
                    disabled={false}
                    data={columnsFilter.fields}
                    defaultValue={filterProperties.value?.toString() as string ?? null}
                    dynamic_params={filterProperties.dynamic_params}
                    fixed_params={filterProperties.fixed_params}
                />
            );
        }

        switch (filterProperties.type) {
            case EDictionaryType.number:
                return (
                    <GridFlexContainer spacing={2} key={"grid-" + field} style={{ marginBottom: '8px' }} >
                        <GridItem size={2}>
                            <Select
                                label={filterProperties.header}
                                id={`filter-number-${field}`}
                                value={filterProperties.operator}
                                onChange={handleOperatorChange(field)}
                                variant='standard'
                                options={numberOperators}
                                disablePortal={false}
                                fullWidth
                                showClearButton={false}
                                selectOnly
                            />
                        </GridItem>
                        <GridItem size={10} style={{ display: 'flex', alignItems: 'center' }}>
                            <Input
                                id={field}
                                value={filterProperties.value as number ?? 0}
                                onChange={onFiltersChanged}
                                type="number"
                                label={filterProperties.header}
                                variant="standard"
                                fullWidth
                            />
                        </GridItem>
                    </GridFlexContainer>
                );
            case EDictionaryType.date:

                return (
                    <GridFlexContainer spacing={2} key={"grid-" + field} style={{ marginBottom: '8px' }} >
                        <GridItem size={2}>
                            <Select
                                label={filterProperties.header}
                                id={`filter-date-${field}`}
                                value={filterProperties.operator}
                                onChange={handleOperatorChange(field)}
                                variant='standard'
                                options={dateOperators}
                                disablePortal={false}
                                fullWidth
                                showClearButton={false}
                                selectOnly
                            />
                        </GridItem>
                        <GridItem size={10} style={{ display: 'flex', alignItems: 'center' }}>
                            <DatePicker
                                id={`filter-number-${field}`}
                                label="Value"
                                value={filterProperties.value ? dayjs(filterProperties.value as string) : null}
                                onChange={(newValue) => {
                                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                                    handleDateChange(field)(formattedDate);
                                }}
                            />

                        </GridItem>
                    </GridFlexContainer>

                );
            case EDictionaryType.boolean:
                return (
                    <InputCheckbox
                        id={field}
                        key={field}
                        label={filterProperties.header}
                        defaultValue={tableColumns.find((col) => col.accessorKey === field)?.rulesValues.includes(filterProperties.value?.toString() ?? '') ?? false}
                        onChange={onFiltersCheckboxChanged}
                    />
                );
            case EDictionaryType.text:
            case EDictionaryType.textarea:
                return (
                    <GridFlexContainer spacing={2} key={"grid-" + field} style={{ marginBottom: '8px' }} >
                        {/* Operator selector */}
                        <GridItem size={2}>
                            <Select
                                label={filterProperties.header}
                                id={`filter-string-${field}`}
                                value={filterProperties.operator}
                                onChange={handleOperatorChange(field)}
                                variant='standard'
                                options={stringOperators}
                                disablePortal={false}
                                fullWidth
                                showClearButton={false}
                                selectOnly
                            />
                        </GridItem>
                        <GridItem size={10} style={{ display: 'flex', alignItems: 'center' }}>
                            <Input
                                id={field}
                                value={filterProperties.value as string ?? ""}
                                onChange={onFiltersChanged}
                                label={filterProperties.header}
                                variant="standard"
                                fullWidth
                            />
                        </GridItem>

                    </GridFlexContainer>
                );
            default:
                return (
                    <Input
                        id={field}
                        value={filterProperties.value as string ?? ""}
                        onChange={onFiltersChanged}
                        label={filterProperties.header}
                        variant="standard"
                        fullWidth
                    />
                );
        }
    };

    const addFilter = () => {
        setOpenFilter(true);
    };

    const onDecline = () => {
        setSelectedColumn("");
        setOpenFilter(false);
    };

    const onAccept = () => {
        let column = tableColumns.find((col) => col.accessorKey === selectedColumn);
        setColumnsFilters((prevColumnsFilter) => {
            if (!column) return prevColumnsFilter;
            const newContentDP = {
                ...prevColumnsFilter,
                fields: {
                    ...prevColumnsFilter.fields,
                    [selectedColumn]: {
                        operator: "=",
                        header: column?.header,
                        value: null,
                        rules: column?.rules,
                        rulesValues: column?.rulesValues,
                        type: column?.type,
                        dynamic_params: column?.dynamic_params,
                        fixed_params: column?.fixed_params,
                        pool_params: column?.pool_params,
                        target: column?.target,
                        label: "",
                        field: column?.accessorKey,
                        disabled: false,
                        values: "",
                        defined: true,
                    },
                },
            };
            return newContentDP;
        });

        setSelectedColumn("");
        setOpenFilter(false);
    };

    const onCloseFilter = () => {
        setSelectedColumn("");
        setOpenFilter(false);
    };

    const handleColumnChange = (event: React.ChangeEvent<HTMLInputElement>, option: any) => {
        setSelectedColumn(option.value);
    };



    // Update fullscreen state based on screen size
    useEffect(() => {
        if (isSmallScreen) {
            setIsFullScreen(true);
        }
    }, [isSmallScreen]);


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
        if (!isSmallScreen) {
            setIsFullScreen((prev) => !prev);
        }
    };
    const refPaper = useRef<HTMLDivElement>(null)

    if (!open) return null;

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
                    userHeight={isFullScreen ? '100vh' : `${dimensions.height}px`}>
                    {/* Header */}
                    <Div_DialogWidgetTitle
                        ref={titleBarRef}
                        onDoubleClick={toggleFullScreen}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '1rem', fontVariant: 'small-caps' }}>
                            {t("filters.label")}
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
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    startIcon={LYCancelIcon}
                                >
                                    {t("button.cancel")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    startIcon={LYResetIcon}
                                >
                                    {t("button.reset")}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleApply}
                                    startIcon={LYPlayCircleOutlineIcon}
                                >
                                    {t("button.apply")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={LYAddIcon}
                                    onClick={addFilter}
                                >
                                    {t("button.dialogsMode.add")}
                                </Button>
                            </Div_DialogWidgetButtons>
                            <Div_DialogWidgetContent>
                                <GridFlexContainer key={tableProperties[ETableHeader.id] + '-grid'} spacing={2} px={1}>
                                    {Object.keys(columnsFilter.fields).map((field) =>
                                        <GridItem style={{ flexGrow: 0 }} size={12} key={field + '-filter'} >
                                            {renderFieldComponent(field, columnsFilter.fields[field])}
                                        </GridItem>
                                    )}
                                </GridFlexContainer>


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
            <Dialog open={openFilter} onClose={onCloseFilter}>
                <Paper_Popup>
                    <Dialog_Title>Add new column for filter</Dialog_Title>
                    <Dialog_Content>
                        <Select
                            label="Column"
                            id={`filter-column`}
                            value={selectedColumn || ''}
                            onChange={handleColumnChange}
                            variant='standard'
                            options={columnOptions}
                            disablePortal={false}
                            fullWidth
                            showClearButton={false}
                            selectOnly
                        />
                    </Dialog_Content>
                    <Dialog_Actions>
                        <Button variant="outlined" onClick={onDecline} startIcon={LYThumbDownOffIcon}>
                            {t('button.no')}
                        </Button>
                        <Button variant="outlined" onClick={onAccept} startIcon={LYThumbUpIcon} >
                            {t('button.yes')}
                        </Button>
                    </Dialog_Actions>
                </Paper_Popup>
            </Dialog>
        </Fragment>, document.body

    )
}