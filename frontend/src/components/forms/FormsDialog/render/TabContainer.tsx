/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import
import React from 'react';

// Import Custom
import { EDialogTabs } from '@ly_types/lyDialogs';
import { IDialogsTab } from "@ly_types/lyDialogs";
import { Tab_Dialogs, Tabs_Dialogs } from '@ly_components/styles/Tabs';

interface ITabContainerProps {
  tabs: IDialogsTab[];
  activeTab: string;
  onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

export const TabContainer = ({ tabs, activeTab, onTabChange }: ITabContainerProps) => {
  
  return (
    <Tabs_Dialogs 
        variant="scrollable" 
        scrollButtons
        value={activeTab} 
        onChange={onTabChange}
        >
    {tabs.filter((tab) => tab[EDialogTabs.hide] !== true).map((tab: IDialogsTab, index: number) => (
        <Tab_Dialogs
            key={index}
            label={tab[EDialogTabs.label]}
            value={tab[EDialogTabs.sequence]}
            id={`tab-${tab[EDialogTabs.sequence]}`}
            disabled={tab[EDialogTabs.hide]} />

    ))}
</Tabs_Dialogs>
);
}


