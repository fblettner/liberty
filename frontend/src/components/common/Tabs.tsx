/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports
import React, { ReactElement, SyntheticEvent, useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';
// Custom Imports
import { LYArrowLeftIcon, LYArrowRightIcon } from '@ly_styles/icons';
import { LYIconSize } from "@ly_utils/commonUtils";
import { IconButton_Contrast } from '@ly_components/styles/IconButton';

interface ChildrenTabProps {
    label: string;
    value: string;
    isActive?: boolean;
    onClick?: (event: SyntheticEvent<Element, Event>) => void;
}

interface TabsProps {
    value: string;
    onChange: (event: SyntheticEvent<Element, Event>, newValue: string) => void;
    variant?: 'standard' | 'scrollable';
    scrollButtons?: boolean;
    children: ReactElement<ChildrenTabProps>[];
}

// Styled container for the Tabs
const TabsContainer = styled.div(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    position: "relative",
    width: "100%",
    padding: theme.spacing(1)
}));

interface StyledTabsWrapperProps {
    isScrollable?: boolean;
}

// Styled wrapper for scrollable content
const TabsWrapper = styled.div<StyledTabsWrapperProps>(({ theme, isScrollable }) => ({
    display: "flex",
    overflowX: isScrollable ? "auto" : "visible",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
        display: "none"
    }
}));


// Tabs Component
export function Tabs(props: TabsProps) {
    const { value, onChange, variant = 'standard', scrollButtons = false, children } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    // Check scroll position to toggle button visibility
    const checkScrollButtons = () => {
        const container = containerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
        }
    };

    // Check scroll on mount and window resize
    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, [children]);

    return (
        <TabsContainer>
            <TabsWrapper isScrollable={variant === 'scrollable'} ref={containerRef} onScroll={checkScrollButtons}>
                {children.map((child) =>
                    React.cloneElement<ChildrenTabProps>(child, {
                        isActive: child.props.value === value,
                        onClick: (e) => onChange(e, child.props.value),
                    })
                )}
            </TabsWrapper>
        </TabsContainer>
    );
};