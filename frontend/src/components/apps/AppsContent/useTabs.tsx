/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import
import { useState, useMemo } from 'react';

// Custom Import
import { ComponentProperties, LYComponentDisplayMode, LYComponentType, LYComponentViewMode } from '@ly_types/lyComponents';
import { FormsAI } from '@ly_components/forms/FormsAI/FormsAI';
import { FormsChart } from '@ly_components/forms/FormsChart/FormsChart';
import { FormsDashboard } from '@ly_components/forms/FormsDashboard/FormsDashboard';
import { FormsDialog } from '@ly_components/forms/FormsDialog/FormsDialog';
import { FormsTable } from '@ly_components/forms/FormsTable/FormsTable';
import { FormsUpload } from '@ly_components/forms/FormsUpload/FormsUpload';
import { IDialogAction } from '@ly_utils/commonUtils';
import { FormsTools } from '@ly_components/forms/FormsTools/FormsTools';
import { EDialogTabs } from '@ly_types/lyDialogs';
import { Paper_Table } from '@ly_components/styles/Paper';

const TAB_PREFIX = 'tab-id-';
const TAB_TABLE_SUFFIX = '-table';
const TAB_COMPONENT_SUFFIX = '-component';

export const useTabs = (initialTab?: ComponentProperties) => {
  const [tabs, setTabs] = useState<{ [EDialogTabs.sequence]: string; [EDialogTabs.component]: ComponentProperties }[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab ? `${TAB_PREFIX}${initialTab.type}-${initialTab.id}` : '');

  
  const addTab = (component: ComponentProperties) => {
    const tabSeq = `${TAB_PREFIX}${component.type}-${component.id}`;

    // Check if the tab is already open
    const existingTab = tabs.find(tab => tab[EDialogTabs.component].id === component.id && tab[EDialogTabs.component].type === component.type);
    if (existingTab) {
      // If the tab exists, make it the active tab
      setActiveTab(existingTab[EDialogTabs.sequence]);
    } else {
      // If the tab doesn't exist, add a new tab
      const newTab = {
        [EDialogTabs.sequence]: tabSeq,
        [EDialogTabs.component]: component,
      };

      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTab(tabSeq); // Set the new tab as the active one
    }
  };

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab[EDialogTabs.sequence] !== tabId);
      
      // If the closed tab was the active one, set the next available tab as active
      if (tabId === activeTab && newTabs.length > 0) {
        const nextTab = newTabs[0][EDialogTabs.sequence] || '';
        setActiveTab(nextTab);
      }
  
      return newTabs;
    });
  };

  // New function to clear all tabs
  const clearTabs = () => {
    setTabs([]);
    setActiveTab('');
  };


  const memoizedContent = useMemo(() => {
    return tabs.map(tab => ({
      ...tab,
      content: getPageContent(tab[EDialogTabs.component]), // Function to generate content based on the component
    }));
  }, [tabs]);

  return {
    tabs,
    activeTab,
    addTab,
    closeTab,
    clearTabs,
    setActiveTab,
    memoizedContent,
  };
};

// Helper function to render FormsTable
const renderFormsTable = (component: ComponentProperties, viewMode: LYComponentViewMode) => (
  <Paper_Table elevation={0} key={component.id + TAB_TABLE_SUFFIX}>
    <FormsTable
      key={component.id + TAB_COMPONENT_SUFFIX}
      viewMode={viewMode}
      displayMode={LYComponentDisplayMode.component}
      viewGrid={viewMode === LYComponentViewMode.list ? false : true}  
      componentProperties={component}
      readonly={false}
    />
  </Paper_Table>
);

const onDialogClose = (action: IDialogAction) => {
};

// Utility function for content rendering based on the component type
const getPageContent = (component: ComponentProperties) => {
  switch (component.type) {
    case LYComponentType.FormsTable:
      return renderFormsTable(component, LYComponentViewMode.table);
    case LYComponentType.FormsTree:
      return renderFormsTable(component, LYComponentViewMode.tree);
    case LYComponentType.FormsList:
      return renderFormsTable(component, LYComponentViewMode.list);
    case LYComponentType.FormsDialog:
      return <FormsDialog componentProperties={component} onClose={onDialogClose}/>;
    case LYComponentType.FormsUpload:
      return <FormsUpload componentProperties={component} />;
    case LYComponentType.FormsChart:
      return <FormsChart componentProperties={component} />;
    case LYComponentType.FormsDashboard:
      return <FormsDashboard componentProperties={component} />;
    case LYComponentType.FormsAI:
      return <FormsAI componentProperties={component} />;
    case LYComponentType.FormsTools:
      return <FormsTools />;
    default:
      return null;
  }
};