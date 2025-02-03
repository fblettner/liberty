/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { t } from 'i18next';

// Custom Import
import { AppsMenus } from '@ly_components/apps/AppsMenus/AppsMenus';
import { AppsLogin } from '@ly_components/apps/AppsLogin/AppsLogin';
import { getAppsProperties, getUserProperties } from '@ly_features/global';
import { LYComponentType, ComponentProperties, LYComponentMode } from '@ly_types/lyComponents';
import { AlertAppsMessage } from '@ly_components/common/AlertAppsMessage';
import { useTabs } from '@ly_components/apps/AppsContent/useTabs';
import { TabContainer } from '@ly_components/apps/AppsContent/TabContainer';
import { TabPanel } from '@ly_components/apps/AppsContent/TabPanel';
import { SnackMessage } from '@ly_components/common/SnackMessage';
import { EDialogTabs } from '@ly_types/lyDialogs';
import { EApplications } from '@ly_types/lyApplications';
import { EUsers } from '@ly_types/lyUsers';
import { Main_Content } from '@ly_components/styles/Main';

export function AppsContent() {
  const { tabs, activeTab, addTab, closeTab, setActiveTab, memoizedContent, clearTabs } = useTabs();
  const [tabsCleared, setTabsCleared] = useState(false); // New flag to track when tabs are cleared
  // Selectors optimized with shallowEqual
  const appsProperties = useSelector(getAppsProperties);
  const userProperties = useSelector(getUserProperties);

  // Helper function to add the default dashboard tab
  const addDefaultDashboard = () => {
    const defaultDashboardId = userProperties[EUsers.dashboard] || appsProperties[EApplications.dashboard];
    if (defaultDashboardId) {
      const defaultTab: ComponentProperties = {
        id: defaultDashboardId,
        type: LYComponentType.FormsDashboard,
        label: t("dashboard"),
        filters: [],
        showPreviousButton: false,
        componentMode: LYComponentMode.find,
        isChildren: false,
      };
      addTab(defaultTab);
    }
  };

  // Track when tabs are cleared, and add the default dashboard afterward
  useEffect(() => {
    if (tabs.length === 0 && tabsCleared) {
      if (userProperties[EUsers.status]) {
        addDefaultDashboard(); // Re-add the default dashboard
      }
      setTabsCleared(false); // Reset the flag
    }
  }, [tabs, tabsCleared, userProperties[EUsers.status]]);

  // Clear tabs and set the cleared flag when session mode changes
  useEffect(() => {
    clearTabs(); // Clear all tabs when the session mode changes
    setTabsCleared(true); // Set the flag to indicate tabs are being cleared

  }, [appsProperties[EApplications.session], userProperties[EUsers.status]]);


  const handleMenuClick = (component: ComponentProperties) => addTab(component);
  const handleTabChanged = (event: React.SyntheticEvent, newValue: string) => setActiveTab(newValue);

  return (
    <Main_Content>
      {userProperties[EUsers.status] &&
      <AppsMenus onMenuSelect={handleMenuClick} />
      }
      <AlertAppsMessage />
      <SnackMessage />
      {tabs.length > 0 &&
        <TabContainer
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChanged}
          onCloseTab={closeTab}
        />
      }
      {memoizedContent.map(tab => (
        <TabPanel key={tab[EDialogTabs.sequence]} value={activeTab} index={tab[EDialogTabs.sequence]}>
          {tab.content}
        </TabPanel>
      ))}
      {!userProperties[EUsers.status] && <AppsLogin />}
    </Main_Content>
  );
}