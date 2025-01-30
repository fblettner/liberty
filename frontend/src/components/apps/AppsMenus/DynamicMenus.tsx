/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Custom Import
import { ComponentProperties } from "@ly_types/lyComponents";
import { getAppsProperties, getModules, getUserProperties } from "@ly_features/global";
import { DynamicRecursiveMenus } from "@ly_components/apps/AppsMenus/DynamicRecursiveMenus";
import { lyGetMenus } from "@ly_services/lyMenus";
import { EMenus, IMenusItem } from "@ly_types/lyMenus";
import Logger from "@ly_services/lyLogging";
import { ResultStatus } from "@ly_types/lyQuery";
import { List } from "@ly_components/common/List";

// Define the types for the props
interface IDynamicMenusProps {
    openMenus: string[];
    setOpenMenus: React.Dispatch<React.SetStateAction<string[]>>;
    selectedIndex: string | null;
    setSelectedIndex: (index: string | null) => void;
    onMenuSelect: (component: ComponentProperties) => void;
  }
  
  export function DynamicMenus({
    openMenus,
    setOpenMenus,
    selectedIndex,
    setSelectedIndex,
    onMenuSelect,
  }: IDynamicMenusProps) {
    const [fetchedMenus, setFetchedMenus] = useState<IMenusItem[]>([]);
    const appsProperties = useSelector(getAppsProperties);
    const userProperties = useSelector(getUserProperties);
    const modulesProperties = useSelector(getModules);
  
    // Fetch Menus with REST API
    const getMenus = useCallback(async () => {
      try {
        const menusParams = {
          appsProperties: appsProperties,
          userProperties: userProperties,
          modulesProperties: modulesProperties,
        }
        const menus = await lyGetMenus(menusParams);

        if (menus.results.status === ResultStatus.error) {
          const logger = new Logger({
            transactionName: "DynamicMenus.getMenus",
            modulesProperties: modulesProperties,
            data: menus
          });
          logger.logException("Menus: Error fetching menus");
        }
        setFetchedMenus(menus.tree);
      } catch (error) {
        const logger = new Logger({
          transactionName: "DynamicMenus.getMenus",
          modulesProperties: modulesProperties,
          data: error
        });
        logger.logException("Menus: Error fetching menus");

      }
    }, [appsProperties, userProperties]);
  
    useEffect(() => {
      getMenus();
    }, [getMenus]);
  
    return (
      <List padding={false}>
        {fetchedMenus
          .filter((menu: IMenusItem) => menu[EMenus.visible] === "Y")
          .map((item: IMenusItem) => (
            <DynamicRecursiveMenus
              key={item[EMenus.key]}
              item={item}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onMenuSelect={onMenuSelect}
            />
          ))}
      </List>
    );
  }