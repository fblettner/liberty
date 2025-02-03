/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';

// Custom Import
import { FormsAI } from '@ly_components/forms/FormsAI/FormsAI';
import { getChatMode, onChatOpenChanged } from '@ly_features/global';
import { LYComponentMode, LYComponentType } from '@ly_types/lyComponents';
import { Div_ChatContent, Div_DialogWidgetTitleButtons, Div, Div_ResizeBox, Div_ChatTitle, Div_DialogWidgetTitle } from '@ly_components/styles/Div';
import { LYCloseIcon, LYFullscreenExitIcon, LYFullscreenIcon, LYMaximizeIcon, LYMinimizeIcon } from '@ly_styles/icons';
import { IconButton_Contrast } from '@ly_components/styles/IconButton';
import { DefaultZIndex } from '@ly_components/types/common';


export function FormsChatbot() {
    const dispatch = useDispatch();
    const isChatOpen: boolean = useSelector(getChatMode);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [chatDimensions, setChatDimensions] = useState({ width: 500, height: 600 });
    const resizeRef = useRef<HTMLDivElement | null>(null);
    const titleBarRef = useRef<HTMLDivElement | null>(null); // Add ref for the title bar


    // Position state for the chatbot
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
                setChatDimensions({ width: newWidth, height: newHeight });
            } else if (!isMinimized && !isFullScreen) {
                if (titleBarRef.current && titleBarRef.current.contains(state.event.target as Node))
                    // Handle dragging
                    api.start({ x: state.offset[0], y: state.offset[1] });
            }
        },
        {
            from: (state) => {
                const isResizing = state.target === resizeRef.current;
                if (isResizing) {
                    return [chatDimensions.width, chatDimensions.height];
                } else {
                    return [x.get(), y.get()];
                }
            },
        }
    );

    const handleCloseChat = () => {
        dispatch(onChatOpenChanged(!isChatOpen));
    };

    const handleMinimizeChat = () => {
        if (isFullScreen) {
            setIsFullScreen(false);
        }
        setIsMinimized((prev) => !prev);
    };

    const toggleFullScreen = () => {
        if (isMinimized) {
            setIsMinimized(false);
        }
        setIsFullScreen((prev) => !prev);
    };

    return (
        <Div>
            {isChatOpen && (
                <animated.div
                    {...bindDrag()} // Attach drag gesture
                    style={{
                        x: isMinimized || isFullScreen ? 0 : x,
                        y: isMinimized || isFullScreen ? 0 : y,
                        position: 'fixed',
                        bottom: isFullScreen ? 0 : 10,
                        right: isFullScreen ? 0 : 10,
                        top: isFullScreen ? 0 : 'auto',
                        left: isFullScreen ? 0 : 'auto',
                        touchAction: 'none',
                        zIndex: DefaultZIndex.Dialog,
                    }}
                >
                    <Div_ChatTitle
                        minimized={isMinimized}
                        fullScreen={isFullScreen}
                        userWidth={isFullScreen ? '100vw' : `${chatDimensions.width}px`}
                        userHeight={isFullScreen ? '100vh' : `${chatDimensions.height}px`}
                    >
                        {/* Header */}
                        <Div_DialogWidgetTitle
                            ref={titleBarRef}
                            onDoubleClick={toggleFullScreen}
                        >
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {isMinimized ? 'Ly-AI' : 'Chat with Liberty AI'}
                            </span>
                            <Div_DialogWidgetTitleButtons>
                                <IconButton_Contrast 
                                    aria-label="minimize" 
                                    onClick={handleMinimizeChat} 
                                    icon={isMinimized ? LYMaximizeIcon : LYMinimizeIcon} 
                                /> 
                                <IconButton_Contrast 
                                    aria-label="toggle full screen" 
                                    onClick={toggleFullScreen}
                                    icon={isFullScreen ? LYFullscreenExitIcon : LYFullscreenIcon}
                                /> 
                                <IconButton_Contrast 
                                    aria-label="close" 
                                    onClick={handleCloseChat}
                                    icon={LYCloseIcon} 
                                />
                            </Div_DialogWidgetTitleButtons>
                        </Div_DialogWidgetTitle>

                        {/* Content */}
                        <Div_ChatContent>
                            <FormsAI 
                                componentProperties={{ 
                                    id: 9999, 
                                    componentMode: LYComponentMode.chat,
                                    type: LYComponentType.FormsAI,
                                    label: 'defaultLabel',
                                    filters: [],
                                    showPreviousButton: false,
                                    isChildren: false
                                }} />
                        </Div_ChatContent>

                        {/* Resize Handle */}
                        {!isFullScreen && (
                            <Div_ResizeBox
                                ref={resizeRef}
                            />
                        )}
                    </Div_ChatTitle>
                </animated.div>
            )}
        </Div>
    );
}