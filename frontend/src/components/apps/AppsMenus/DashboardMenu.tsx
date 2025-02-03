/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";

// Custom Import
import { getAppsProperties, getUserProperties, onToggleMenusDrawer } from "@ly_features/global";
import { ComponentProperties, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { EApplications } from "@ly_types/lyApplications";
import { EUsers } from "@ly_types/lyUsers";
import { LYDashboardIcon } from "@ly_styles/icons";
import { ListItemButton } from "@ly_components/common/List";

// Define type for the props
interface DashboardMenuProps {
    selectedIndex: string | null;
    setSelectedIndex: (index: string) => void;
    onMenuSelect: (component: ComponentProperties) => void;
}

export function DashboardMenu({
    selectedIndex,
    setSelectedIndex,
    onMenuSelect,
}: DashboardMenuProps) {
    const dispatch = useDispatch();
    const appsProperties = useSelector(getAppsProperties);
    const userProperties = useSelector(getUserProperties);

    // Determine the target dashboard ID
    const dashboardTargetId = userProperties[EUsers.dashboard] || appsProperties[EApplications.dashboard];
    // Memoized button props
    const buttonProps = useMemo(
        () => ({
            selected: selectedIndex === "dashboard",
            onClick: () => {
                if (dashboardTargetId != null) {
                    const targetComponent: ComponentProperties = {
                        id: dashboardTargetId,
                        type: LYComponentType.FormsDashboard,
                        label: t("dashboard"),  // The label is translated only for display
                        filters: [],
                        showPreviousButton: false,
                        componentMode: LYComponentMode.find,
                        isChildren: false,
                    };

                    setSelectedIndex("dashboard");
                    dispatch(onToggleMenusDrawer());
                    onMenuSelect(targetComponent);
                }
            },
            disabled: dashboardTargetId == null,  // Disable the button if no valid dashboard ID
        }),
        [selectedIndex, setSelectedIndex, dashboardTargetId, dispatch, onMenuSelect]
    );

    return (
        <ListItemButton
            variant="text"
            fullWidth
            {...buttonProps}
            startIcon={LYDashboardIcon}
        >
            {t("dashboard")}
        </ListItemButton>
    );
}