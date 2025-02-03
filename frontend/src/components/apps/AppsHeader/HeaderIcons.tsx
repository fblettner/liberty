/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { memo } from "react";
import { useAuth } from "react-oidc-context";
import { useDispatch, useSelector } from "react-redux";

// Custom Import
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { EApplications, ESessionMode, IAppsProps } from "@ly_types/lyApplications";
import { getAppsProperties, onAppsPropertiesChanged, onChatOpenChanged, onUserPropertiesChanged } from "@ly_features/global";
import { GlobalSettings, UIDisplayMode } from "@ly_utils/GlobalSettings";
import { LYAccountCircleIcon, LYDarkModeIcon, LYLightModeIcon, LYLogoutIcon, LYNotificationsIcon, LYSmartToyIcon } from "@ly_styles/icons";
import { Div_HeaderIcons } from "@ly_components/styles/Div";
import { IconButton_Contrast } from "@ly_components/styles/IconButton";

interface IHeaderIcons {
  handleSupportAgent: React.MouseEventHandler<HTMLButtonElement>;
  toggleColorMode: React.MouseEventHandler<HTMLButtonElement>;
  darkMode: boolean;
  userProperties: IUsersProps;
  handleProfileMenuOpen: React.MouseEventHandler<HTMLButtonElement>;
}

export const HeaderIcons = memo(({ handleSupportAgent, toggleColorMode, darkMode, userProperties, handleProfileMenuOpen }: IHeaderIcons) => {
  const appsProperties: IAppsProps = useSelector(getAppsProperties);

  const dispatch = useDispatch();
  const auth = useAuth();

  const handleSignout = () => {
    if (auth.isAuthenticated) {
      auth.removeUser().catch(console.error);
      auth.revokeTokens().catch(console.error);
    }
    dispatch(onAppsPropertiesChanged({
      [EApplications.id]: 0,
      [EApplications.pool]: GlobalSettings.getDefaultPool,
      [EApplications.name]: "LIBERTY",
      [EApplications.description]: "Liberty Framework",
      [EApplications.offset]: 5000,
      [EApplications.limit]: 5000,
      [EApplications.version]: GlobalSettings.getVersion,
      [EApplications.session]: ESessionMode.session,
      [EApplications.dashboard]: -1,
      [EApplications.theme]: "liberty",
      [EApplications.jwt_token]: ""
    }));
    dispatch(onUserPropertiesChanged({
      [EUsers.status]: false,
      [EUsers.id]: "",
      [EUsers.name]: "",
      [EUsers.email]: "",
      [EUsers.password]: "",
      [EUsers.admin]: "N",
      [EUsers.language]: "en",
      [EUsers.displayMode]: UIDisplayMode.dark,
      [EUsers.darkMode]: true,
      [EUsers.theme]: "liberty",
      [EUsers.dashboard]: -1,
      [EUsers.readonly]: "Y",
    }));
    // setSelectedIndex(null);
    dispatch(onChatOpenChanged(false));
    dispatch({ type: 'signout', payload: { user: userProperties[EUsers.id], application: appsProperties[EApplications.id] } })
  }

  return (
    <Div_HeaderIcons>
      <IconButton_Contrast
        aria-label="Toggle Dark Mode"
        onClick={toggleColorMode}
        icon={darkMode ? LYLightModeIcon : LYDarkModeIcon}
      />
      {userProperties[EUsers.status] && userProperties[EUsers.id] !== 'anonymous' && (
        <IconButton_Contrast
          onClick={handleSupportAgent}
          icon={LYSmartToyIcon}
        />
      )}

      {userProperties[EUsers.status] && (
        <IconButton_Contrast
           icon={LYNotificationsIcon} 
        />
      )}
      {userProperties[EUsers.status] && userProperties[EUsers.id] !== 'anonymous' && (
        <IconButton_Contrast
          onClick={handleProfileMenuOpen}
          icon={LYAccountCircleIcon} 
        />
      )}
      {userProperties[EUsers.status] && userProperties[EUsers.id] !== 'anonymous' && (
        <IconButton_Contrast
          onClick={handleSignout}
          icon={LYLogoutIcon} 
        />
      )}
    </Div_HeaderIcons>
  );
});