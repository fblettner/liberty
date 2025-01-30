/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import

// Custom Import
import { css } from '@emotion/css';
import { Div_AppsDialogTabPanel, Div_TabPanelContent } from '@ly_components/styles/Div';

interface ITabPanelProps {
    children: React.ReactNode;
    value: string;
    index: string;
}

export const TabPanel = ({ children, value, index }: ITabPanelProps) => (
        <Div_AppsDialogTabPanel
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            className={
                css({
                  position: 'absolute',
                  zIndex: value === index ? 1 : 0,
                  visibility: value === index ? 'visible' : 'hidden',
                })
              }
        >
            <Div_TabPanelContent>
                {children}
            </Div_TabPanelContent>
        </Div_AppsDialogTabPanel>

);

