/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import
// Custom Import
import { Div_DialogTabPanel, Div_TabPanelContent } from '@ly_components/styles/Div';
import { Fragment } from 'react/jsx-runtime';


interface ITabPanelProps {
    children: React.ReactNode;
    value: string;
    index: string;
}

export const TabPanel = ({ children, value, index, ...other }: ITabPanelProps) => (
    <Fragment>
        
            <Div_DialogTabPanel
                role="tabpanel"
                hidden={value !== index}
                id={`tabpanel-${index}`}
                aria-labelledby={`tab-${index}`}
                {...other}
            >
                <Div_TabPanelContent >
                    {children}
                </Div_TabPanelContent>
            </Div_DialogTabPanel>

    </Fragment>
);

