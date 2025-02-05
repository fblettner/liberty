/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";

// Custom Import
import { Div_DialogWidgetContent, Div_DialogWidgetTitleButtons, Div_ResizeBox, Div_DialogWidget, Div_DialogWidgetTitle, Backdrop } from '@ly_components/styles/Div';
import { DIALOG_WIDGET_DIMENSION } from '@ly_utils/commonUtils';
import { ITableState, LYTableInstance } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IAppsProps } from "@ly_types/lyApplications";
import { getAppsProperties, getUserProperties, getModules } from "@ly_features/global";
import { IModulesProps } from "@ly_types/lyModules";
import { IUsersProps } from "@ly_types/lyUsers";
import { importExcelFiles } from "@ly_components/forms/FormsTable/utils/importUtils";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { IErrorState } from "@ly_utils/commonUtils";
import { ComponentProperties } from "@ly_types/lyComponents";
import { ITableRow, TablesGridHardCoded } from "@ly_types/lyTables";
import { LYCancelIcon, LYCloudUploadIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYReactIcon, LYSaveIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { Typography } from "@ly_components/common/Typography";
import { Paper_Dialogs, Paper_UploadFile } from "@ly_components/styles/Paper";
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { Button_TableImport } from "@ly_components/styles/Button";
import { IconButton_Contrast } from "@ly_components/styles/IconButton";
import { CircularProgress } from "@ly_components/common/CircularProgress";
import { DefaultZIndex } from "@ly_components/types/common";

export interface ITableImport{
    open: boolean;
    onClose: () => void;
    table: LYTableInstance<ITableRow>;
    tableState: ITableState;
    updateTableState: <K extends keyof ITableState>(key: K, value: ITableState[K]) => void;
    componentProperties: ComponentProperties;
}

export const TableImport = (params: ITableImport) => {
    const { open, onClose, table, tableState, updateTableState, componentProperties } = params;
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const appsProperties: IAppsProps = useSelector(getAppsProperties);
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);
    const isSmallScreen = useMediaQuery("(max-width: 600px)");

    const [isFullScreen, setIsFullScreen] = useState(() => isSmallScreen); // Set fullscreen initially if small screen
    const [dimensions, setDimensions] = useState({ width: DIALOG_WIDGET_DIMENSION.width, height: DIALOG_WIDGET_DIMENSION.height });
    const resizeRef = useRef<HTMLDivElement | null>(null);
    const titleBarRef = useRef<HTMLDivElement | null>(null); // Add ref for the title bar

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

    useEffect(() => {
        setErrorState({ message: '', open: false });
    }, [open]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Handle dropped files here, e.g., upload or process them
        _fileListener(acceptedFiles);
    }, [tableState.tableData.columns]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    });

    const _fileListener = async (files: File[]) => {
        setIsLoading(true)
        const params = {
            files: files,
            appsProperties: appsProperties,
            userProperties: userProperties,
            modulesProperties: modulesProperties,
            importColumns: tableState.tableData.columns,
            setErrorState: setErrorState,
            setIsLoading: setIsLoading,
            updateTableState: updateTableState,
            tableState: tableState,
            component: componentProperties
        }
        const importData = await importExcelFiles(params);
        const currentRows = table.options.data.length + 1;
        const arrayWithRowIds = importData.map((item, index) => ({
            ...item,
            [TablesGridHardCoded.row_id]: (currentRows + index).toString(),
        }));
        table.addRows(arrayWithRowIds)
        setIsLoading(false)
        onClose();
    }

    const handleMessageClose = useCallback(() => { }, [setErrorState]);

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
                            {t("button.upload")}
                        </span>
                        <AlertMessage severity={errorState.severity} message={errorState.message} open={errorState.open} onClose={handleMessageClose} />
                        <Div_DialogWidgetTitleButtons>
                            <IconButton_Contrast 
                                aria-label="toggle full screen" 
                                onClick={toggleFullScreen} 
                                icon={isFullScreen ? LYFullscreenExitIcon : LYFullscreenIcon} 
                            /> 
                        </Div_DialogWidgetTitleButtons>
                    </Div_DialogWidgetTitle>
                    <Div_DialogWidgetContent>
                        <Paper_Dialogs elevation={0}>
                            <Button_TableImport variant="outlined" onClick={onClose} startIcon={LYCancelIcon}>
                                {t('button.cancel')}
                            </Button_TableImport>
                            <Paper_UploadFile
                                elevation={0}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <Typography variant="subtitle1" >Drop the file here</Typography>
                                ) : (
                                    <Typography variant="subtitle1">Drag and drop a file here or click to select</Typography>
                                )}
                                {isLoading ? <CircularProgress  /> : <LYReactIcon icon={LYCloudUploadIcon} size={LYIconSize.extra_large} /> }

                            </Paper_UploadFile>
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
        </Fragment>, document.body



    )
}