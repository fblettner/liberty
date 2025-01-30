/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// MUI Import
import { Fragment, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "react-oidc-context";

// Custom Import
import { getAppsProperties, getSessionMode, getUserProperties } from "@ly_features/global";
import { ComponentProperties } from "@ly_types/lyComponents";
import { handleMenuAction } from "@ly_services/lyMenus";
import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { EMenus } from "@ly_types/lyMenus";
import { LYMenusExpandLessIcon, LYMenusExpandMoreIcon, LYReactIcon } from "@ly_styles/icons";
import { IconType } from "react-icons/lib";
import { Typo_ListItemText } from "@ly_components/styles/Typography";
import { List, ListItem, ListItemButton, ListItemText } from "@ly_components/common/List";
import { Collapse } from "@ly_components/common/Collapse";

// Define type for menu items
interface IStaticMenuItem {
  [EMenus.key]: string;
  [EMenus.label]: string;
  menuIcon?: IconType;
  children?: IStaticMenuItem[];
}

interface IStaticRecursiveMenus {
  item: IStaticMenuItem;
  openMenus: string[];
  setOpenMenus: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIndex: string | null;
  setSelectedIndex: (index: string | null) => void;
  onMenuSelect: (component: ComponentProperties) => void;
}

export function StaticRecursiveMenus({
  item,
  openMenus,
  setOpenMenus,
  selectedIndex,
  setSelectedIndex,
  onMenuSelect,
}: IStaticRecursiveMenus) {
  const appsProperties: IAppsProps = useSelector(getAppsProperties);
  const userProperties: IUsersProps = useSelector(getUserProperties);

  const dispatch = useDispatch();
  const sessionMode = useSelector(getSessionMode);
  const [openChildren, setOpenChildren] = useState(openMenus.includes(item[EMenus.key]));
  const auth = useAuth();

  const toggleMenu = useCallback(
    (value: string) => {
      setOpenMenus((prevOpenMenus) =>
        openChildren ? prevOpenMenus.filter((menu) => menu !== value) : [...prevOpenMenus, value]
      );
      setOpenChildren(!openChildren);
    },
    [openChildren, setOpenMenus]
  );

  const handleMenu = useCallback(
    (value: string) => {
      handleMenuAction(value, sessionMode, setSelectedIndex, dispatch, onMenuSelect, auth, appsProperties, userProperties); // Call utility function for action handling
      if (!["admin", "signout", "lyAI", "lyTools"].includes(value)) {
        toggleMenu(value);
      }
    },
    [sessionMode, setSelectedIndex, dispatch, onMenuSelect, toggleMenu, auth, appsProperties, userProperties]
  );

  const buttonProps = useMemo(
    () => ({
      selected: selectedIndex === item[EMenus.key],
      onClick: () => handleMenu(item[EMenus.key]),
    }),
    [selectedIndex, item[EMenus.key], handleMenu]
  );

  const hasChildren = useMemo(() => Array.isArray(item.children) && item.children.length > 0, [item.children]);

  return (
    <Fragment>
      <ListItem key={item[EMenus.key]}>
        {!hasChildren &&
          <ListItemButton
            variant="text"
            fullWidth
            {...buttonProps}
            startIcon={item.menuIcon}
          >
            <Typo_ListItemText>
              {item[EMenus.label]}
            </Typo_ListItemText>
          </ListItemButton>
        }
        {hasChildren &&
          <ListItemButton
            variant="text"
            fullWidth
            {...buttonProps}
            startIcon={item.menuIcon}
            endIcon={openChildren ? LYMenusExpandLessIcon : LYMenusExpandMoreIcon}
          >
            <Typo_ListItemText>
              {item[EMenus.label]}
            </Typo_ListItemText>
          </ListItemButton>
        }
      </ListItem>

      {hasChildren && (
        <Collapse in={openChildren}>
          <List padding={false}>
            {item.children?.map((child) => (
              <StaticRecursiveMenus
                key={child[EMenus.key]}
                item={child}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                onMenuSelect={onMenuSelect}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Fragment>
  );
}