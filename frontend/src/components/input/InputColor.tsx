/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { Fragment, useEffect, useRef, useState } from 'react';
import ColorPicker from 'react-best-gradient-color-picker'
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import ReactDOM from "react-dom";
import { t } from 'i18next';

// Custom Import
import { Div_ResizeBox, Div_DialogWidget, Div_DialogWidgetTitle, Div_DialogWidgetTitleButtons, Div_DialogWidgetContent, Div_DialogWidgetButtons, Div_ColorPicker, 
    Div_ColorPickerPreview, Div_InputColor, Backdrop } from '@ly_components/styles/Div';
import { OnInputChangeFunction } from '@ly_components/forms/FormsDialog/utils/commonUtils';
import { LYCancelIcon, LYColorLensIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYPlayCircleOutlineIcon } from '@ly_styles/icons';
import { Typography } from '@ly_components/common/Typography';
import { Paper_Dialogs } from '@ly_components/styles/Paper';
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { Button } from "@ly_components/common/Button";
import { IconButton } from '@ly_components/common/IconButton';
import { IconButton_Contrast } from '@ly_components/styles/IconButton';
import { Input } from '@ly_components/common/Input';
import { DefaultZIndex } from '@ly_components/types/common';

interface IColorProps {
    id: string;
    label: string;
    onChange: OnInputChangeFunction;
    value: string;
    disabled?: boolean;
}

interface IColorDialogProps {
    id: string;
    label: string;
    onChange: OnInputChangeFunction;
    value: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputColorDialog = (props: IColorDialogProps) => {
    const { id, label, value, open, onChange, setOpen } = props;
    const [color, setColor] = useState(value);

    const isSmallScreen = useMediaQuery("(max-width: 600px)");
    const [isFullScreen, setIsFullScreen] = useState(() => isSmallScreen); // Set fullscreen initially if small screen
    const [dimensions, setDimensions] = useState({ width: 350, height: 750 });
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

    const onApply = () => {
        onChange({ target: { id: id, value: color } } as React.ChangeEvent<HTMLInputElement>)
        setOpen(false);
    }

    const onCancel = () => {
        setOpen(false);
    }

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
                            {label}
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
                        <Paper_Dialogs elevation={0}  >
                            <Div_DialogWidgetButtons>
                                <Button
                                    variant="outlined"
                                    onClick={onCancel}
                                    startIcon={LYCancelIcon}
                                >
                                    {t("button.cancel")}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={onApply}
                                    startIcon={LYPlayCircleOutlineIcon}
                                >
                                    {t("button.apply")}
                                </Button>
                            </Div_DialogWidgetButtons>
                            <Div_ColorPicker>
                                <ColorPicker
                                    value={color}
                                    onChange={setColor}
                                />
                            </Div_ColorPicker>
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
    );

}

export const InputColor = (props: IColorProps) => {
    const { id, label, value, disabled, onChange } = props;

    const [showDialog, setShowDialog] = useState(false);
    const handleOpenDialog = () => setShowDialog(true);


    return (
        <Div_InputColor>
            <Typography variant="subtitle1">
                {label}
            </Typography>

            <Div_DialogWidgetTitleButtons>
                {/* Open Picker Button */}
                <IconButton 
                    onClick={handleOpenDialog} 
                    icon={LYColorLensIcon} 
                />
                <Input
                    id={id}
                    value={value ?? ''}
                    disabled={disabled}
                    onChange={onChange}
                    multiline={false}
                    label={label}
                    variant="standard"
                    fullWidth
                />

                {/* Small Color Preview */}
                <Div_ColorPickerPreview background={value}/>
            </Div_DialogWidgetTitleButtons>

            {/* Color Picker Dialog */}
            <InputColorDialog
                id={id}
                label={label}
                value={value}
                open={showDialog}
                setOpen={setShowDialog}
                onChange={onChange}
            />
        </Div_InputColor>
    );
};