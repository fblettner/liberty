/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

// Custom Import
import { Div_DialogWidgetContent, Div_DialogWidgetTitleButtons, Div_ResizeBox, Div_DialogWidget, Div_DialogWidgetTitle, Backdrop } from '@ly_components/styles/Div';
import { DIALOG_WIDGET_DIMENSION } from '@ly_utils/commonUtils';
import { ComponentProperties, LYComponentDisplayMode, LYComponentViewMode } from "@ly_types/lyComponents";
import { FormsTable } from "@ly_components/forms/FormsTable/FormsTable";
import { ISelectedRow } from "@ly_components/forms/FormsTable/utils/dataGridUtils";
import { LYCloseIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYReactIcon } from "@ly_styles/icons";
import { Paper_TableDialog } from "@ly_components/styles/Paper";
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { IconButton_Contrast } from "@ly_components/styles/IconButton";
import { DefaultZIndex } from "@ly_components/types/common";

// Custom Import
interface ITableDialog {
    open: boolean;
    componentProperties: ComponentProperties;
    onClose: () => void
    onSelectRow: (action: ISelectedRow) => void,
}

export const TableDialog = (params: ITableDialog) => {
    const { open, componentProperties, onClose, onSelectRow } = params;
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
                            {componentProperties.label}
                        </span>
                        <Div_DialogWidgetTitleButtons>
                            <IconButton_Contrast 
                                aria-label="toggle full screen" 
                                onClick={toggleFullScreen} 
                                icon={isFullScreen ? LYFullscreenExitIcon : LYFullscreenIcon} 
                            />
                            <IconButton_Contrast
                                onClick={onClose}
                                aria-label="close"
                                icon={LYCloseIcon} 
                            />
                        </Div_DialogWidgetTitleButtons>
                    </Div_DialogWidgetTitle>
                    <Div_DialogWidgetContent>
                        <Paper_TableDialog elevation={0}>
                            <FormsTable
                                componentProperties={componentProperties}
                                viewGrid={true}
                                viewMode={LYComponentViewMode.table}
                                displayMode={LYComponentDisplayMode.component}
                                onSelectRow={onSelectRow}
                                readonly={false}
                            />
                        </Paper_TableDialog>
                    </Div_DialogWidgetContent>
                    {/* Resize handles */}
                    {!isFullScreen && (
                        <Div_ResizeBox
                            ref={resizeRef}
                        />
                    )}


                </Div_DialogWidget>
            </animated.div>
        </Fragment>,
        document.body
    );
}
