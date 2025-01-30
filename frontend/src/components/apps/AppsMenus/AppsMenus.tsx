import React, { useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useSelector, useDispatch } from "react-redux";
import {
  isMenusOpen,
  onToggleMenusDrawer,
  getAppsProperties,
  getUserProperties,
} from "@ly_features/global";
import { IAppsProps } from "@ly_types/lyApplications";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { Divider } from "@ly_components/common/Divider";
import { Typography } from "@ly_components/common/Typography";
import { IconButton_Contrast } from "@ly_components/styles/IconButton";
import { DashboardMenu } from "@ly_components/apps/AppsMenus/DashboardMenu";
import { DynamicMenus } from "@ly_components/apps/AppsMenus/DynamicMenus";
import { StaticMenus } from "@ly_components/apps/AppsMenus/StaticMenus";
import { LYMenuOpenIcon } from "@ly_styles/icons";
import { ComponentProperties } from "@ly_types/lyComponents";
import { Div_ContentWrapper, Div_DrawerContainer, Div_DrawerContent, Div_DrawerHeader, Div_DrawerOverlay, Div_DrawerPanel, Div_DrawerPanelDynamic } from "@ly_components/styles/Div";

interface IAppsMenus {
  onMenuSelect: (component: ComponentProperties) => void;
}

// Component Implementation
export function AppsMenus({ onMenuSelect }: IAppsMenus) {
  const isOpen = useSelector(isMenusOpen);
  const dispatch = useDispatch();
  const appsProperties: IAppsProps = useSelector(getAppsProperties);
  const userProperties: IUsersProps = useSelector(getUserProperties);

  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  useEffect(() => {
    setOpenMenus([])
  }, [appsProperties, userProperties[EUsers.language]]);

  const toggleDrawer = useCallback(() => {
    dispatch(onToggleMenusDrawer());
  }, [dispatch]);

  return (
    <>
      {/* Overlay for closing the drawer when clicking outside */}
      <Div_DrawerOverlay open={isOpen} onClick={toggleDrawer} />

      {/* Drawer */}
      <Div_DrawerContainer open={isOpen}>
        <Div_DrawerContent>
          <Div_DrawerHeader>
            <Typography variant="body2" align="center" component="a" href="https://nomana-it.fr/" target="_blank" rel="noopener noreferrer">
              Liberty © Nomana-IT {new Date().getFullYear()}.
            </Typography>
            <IconButton_Contrast onClick={toggleDrawer} icon={LYMenuOpenIcon} />
          </Div_DrawerHeader>
          <Div_ContentWrapper>
            <Div_DrawerPanel>
              <DashboardMenu
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onMenuSelect={onMenuSelect}
              />
            </Div_DrawerPanel>
            <Div_DrawerPanelDynamic>
              <DynamicMenus
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onMenuSelect={onMenuSelect}
              />
            </Div_DrawerPanelDynamic>
            <Div_DrawerPanel>
              <StaticMenus
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onMenuSelect={onMenuSelect}
              />
            </Div_DrawerPanel>
          </Div_ContentWrapper>
        </Div_DrawerContent>
      </Div_DrawerContainer>
    </>
  );
}