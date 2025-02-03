/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useMemo } from "react";
import { t } from "i18next";
import { useSelector } from "react-redux";

// Custom Import
import { StaticRecursiveMenus } from "@ly_components/apps/AppsMenus/StaticRecursiveMenus";
import { ComponentProperties } from "@ly_types/lyComponents";
import { getAppsProperties, getUserProperties } from "@ly_features/global";
import { LYLinkIcon, LYLocalLibraryIcon, LYLogoutIcon, LYSettingsIcon, LYSmartToyIcon } from "@ly_styles/icons";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";
import { EMenus } from "@ly_types/lyMenus";
import { List } from "@ly_components/common/List";
import { List_StaticMenus } from "@ly_components/styles/List";

// Define the types for the props
interface IStaticMenusProps {
  openMenus: string[];
  setOpenMenus: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIndex: string | null; // Typed explicitly as string or null
  setSelectedIndex: (index: string | null) => void; // Typed setter function
  onMenuSelect: (component: ComponentProperties) => void;
}

export function StaticMenus({
  openMenus,
  setOpenMenus,
  selectedIndex,
  setSelectedIndex,
  onMenuSelect,
}: IStaticMenusProps) {

  const appsProperties = useSelector(getAppsProperties);
  const userProperties = useSelector(getUserProperties);

  // Fixed data for the menu bottom
  const memoizedData = useMemo(
    () => [
      { [EMenus.key]: "lyAI", [EMenus.label]: "Liberty AI", menuIcon: LYSmartToyIcon, [EMenus.visible]: true, children: [] },
      { [EMenus.key]: "documentation", [EMenus.label]: "Documentation", menuIcon: LYLocalLibraryIcon, [EMenus.visible]: true, children: [] },
      { [EMenus.key]: "lyTools", [EMenus.label]: "Liberty Tools", menuIcon: LYLinkIcon, [EMenus.visible]: true, children: [] },
      { [EMenus.key]: "admin", [EMenus.label]: t("admin"), menuIcon: LYSettingsIcon, [EMenus.visible]: userProperties[EUsers.admin] === "Y", children: [] },
      { [EMenus.key]: "signout", [EMenus.label]: t("signout"), menuIcon: LYLogoutIcon, [EMenus.visible]: true, children: [] },
    ],
    [userProperties, appsProperties[EApplications.session]]
  );

  return (
    <List_StaticMenus padding={false}>
      {memoizedData.filter((menu) => menu[EMenus.visible]).map((item) => (
        <StaticRecursiveMenus
          key={item[EMenus.key]}
          item={item}
          openMenus={openMenus}
          setOpenMenus={setOpenMenus}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onMenuSelect={onMenuSelect}
        />
      ))}
    </List_StaticMenus>
  );
}