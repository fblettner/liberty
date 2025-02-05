/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

// Custom Import
import {
  getAppsProperties, getDarkMode, getModules, getChatMode,
  getUserProperties, isMenusOpen, onDarkModeChanged,
  onToggleMenusDrawer, onToggleUserSettings,
  onChatOpenChanged,
} from "@ly_features/global";

import { HeaderIcons } from "@ly_components/apps/AppsHeader/HeaderIcons";
import { RootState } from "@ly_app/store";
import { LYLogoIcon, LYMenuIcon } from "@ly_styles/icons";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";
import { Div, Div_Header, Div_HeaderAppBar, Div_HeaderToolbar } from "@ly_components/styles/Div";
import { Divider } from "@ly_components/common/Divider";
import { Typo_AppsName } from "@ly_components/styles/Typography";
import { IconButton_Contrast } from "@ly_components/styles/IconButton"; import { useMediaQuery } from "@ly_components/common/UseMediaQuery";
;


export function AppsHeader() {

  // Redux dispatcher
  const dispatch = useDispatch()

  // Selectors optimized with shallowEqual
  const {
    isOpen,
    appsProperties,
    userProperties,
    modules,
    darkMode,
    isChatOpen,
  } = useSelector((state: RootState) => ({
    isOpen: isMenusOpen(state),
    appsProperties: getAppsProperties(state),
    userProperties: getUserProperties(state),
    modules: getModules(state),
    darkMode: getDarkMode(state),
    isChatOpen: getChatMode(state),
  }), shallowEqual);

  // Event Handlers
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    dispatch(onToggleMenusDrawer());
  }, [dispatch]);

  const handleProfileMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    dispatch(onToggleUserSettings());
  }, [dispatch]);

  const toggleColorMode = useCallback(() => {
    dispatch(onDarkModeChanged(!darkMode));
  }, [dispatch, darkMode]);

  const handleSupportAgent = useCallback(() => {
    dispatch(onChatOpenChanged(!isChatOpen));
  }, [dispatch, isChatOpen]);

  const shouldShowMenusIcon = modules.menus && modules.menus.enabled && userProperties[EUsers.status];
  const isSmallScreen = useMediaQuery("(min-width: 600px)");
  const isMediumScreen = useMediaQuery("(min-width: 960px)");
  const isLargeScreen = useMediaQuery("(min-width: 1280px)");

  return (
      <Div_HeaderAppBar open={isOpen}>
        {/* Position the Menu Icon Absolutely */}
        {shouldShowMenusIcon && (
          <IconButton_Contrast
            onClick={handleMenuOpen}
            icon={LYMenuIcon}
            style={{ marginLeft: "8px" }}
          />
        )}

        {/* Centered Content */}
        <Div_HeaderToolbar>
          {/* Left Section */}
          <Div_Header>
            <LYLogoIcon width="32px" height="32px" />
            {(isMediumScreen || isLargeScreen) &&
              <Typo_AppsName noWrap>
                {appsProperties[EApplications.name]}
              </Typo_AppsName>
            }
          </Div_Header>

          <Divider orientation="vertical" flexItem />
          <HeaderIcons
            handleSupportAgent={handleSupportAgent}
            toggleColorMode={toggleColorMode}
            darkMode={darkMode}
            userProperties={userProperties}
            handleProfileMenuOpen={handleProfileMenuOpen}
          />
        </Div_HeaderToolbar>

      </Div_HeaderAppBar>
  );
}
