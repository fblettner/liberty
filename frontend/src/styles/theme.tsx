/*
 * Copyright (c) 2025 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */

import { useEffect, useState } from "react";
import { IUsersProps, IAppsProps, EUsers, EApplications, IFiltersProperties, ToolsQuery, GlobalSettings, IModulesProps, ThemeColors, ThemeColorItem, Theme } from "@nomana-it/liberty-core";
import BackgroundLY from '@ly_assets/background_ly.jpg'

export interface IThemeProps {
    userProperties: IUsersProps;
    appsProperties: IAppsProps;
    modulesProperties: IModulesProps
}

export const useThemeConfig = (props: IThemeProps) => {
    const { userProperties, appsProperties, modulesProperties } = props;
    const [themeColors, setThemeColors] = useState<any>([]);

    const selectedTheme = userProperties?.[EUsers.theme] || appsProperties?.[EApplications.theme] || "liberty";

    // Define filters for theme query
    const filters: IFiltersProperties[] = [
        {
            header: "",
            field: "THM_NAME",
            value: selectedTheme,
            type: "text",
            operator: "=",
            defined: true,
            rules: null,
            disabled: false,
            values: "",
        },
    ];

    // Function to map query results to theme colors
    const mapThemeColors = (queryResult: ThemeColorItem[], darkMode: boolean) => {
        const colors: ThemeColors = {};

        queryResult.forEach(({ TCL_KEY, TCL_LIGHT, TCL_DARK }) => {
            const value = darkMode ? TCL_DARK : TCL_LIGHT;
            const keys = TCL_KEY.split(".");

            if (keys.length > 1) {
                if (!colors[keys[0]]) colors[keys[0]] = {};
                (colors[keys[0]] as Record<string, string>)[keys[1]] = value;
            } else {
                colors[TCL_KEY] = value;
            }
        });

        return colors;
    };

    useEffect(() => {
        const fetchThemeColors = async () => {
            try {
                const response = await ToolsQuery.themes(modulesProperties, filters, GlobalSettings.getDefaultPool);
                setThemeColors(response.items);
            } catch (error) {
                console.error('Error fetching theme colors:', error);
            }
        };
        fetchThemeColors();
    }, [selectedTheme, modulesProperties, appsProperties, userProperties]);

    const theme = (darkMode: boolean): Theme => {
        const mappedColors = mapThemeColors(themeColors, darkMode);
        return {
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: typeof mappedColors.primary === 'string'
                        ? mappedColors.primary
                        : (darkMode ? '#607d8b' : '#1976d2')
                },
                secondary: {
                    main: typeof mappedColors.secondary === 'string'
                        ? mappedColors.secondary
                        : (darkMode ? '#ffc107' : '#1976d2')
                },
                text: {
                    primary: darkMode
                        ? "rgba(255, 255, 255, 0.87)"
                        : "rgba(0, 0, 0, 0.87)",
                    secondary: darkMode
                        ? "rgba(255, 255, 255, 0.6)"
                        : "rgba(0, 0, 0, 0.6)",
                    disabled: darkMode
                        ? "rgba(255, 255, 255, 0.38)"
                        : "rgba(0, 0, 0, 0.38)",
                },
                background: {
                    default: darkMode ? "#121212" : "#ffffff",
                    paper: darkMode ? "#1d1d1d" : "#ffffff",
                },
                divider: darkMode
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(0, 0, 0, 0.12)",
                action: {
                    hover: darkMode
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.05)",
                    selected: darkMode
                        ? "rgba(255, 255, 255, 0.16)"
                        : "rgba(0, 0, 0, 0.08)",
                    disabled: darkMode
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(0, 0, 0, 0.26)",
                },
                grey: {
                    100: darkMode ? "#e0e0e0" : "#f5f5f5",
                    200: darkMode ? "#c7c7c7" : "#eeeeee",
                    300: darkMode ? "#a4a4a4" : "#e0e0e0",
                    400: darkMode ? "#8f8f8f" : "#bdbdbd",
                    500: darkMode ? "#757575" : "#9e9e9e",
                    600: darkMode ? "#626262" : "#757575",
                    700: darkMode ? "#515151" : "#616161",
                    800: darkMode ? "#3a3a3a" : "#424242",
                },
            },
            background: {
                default: typeof mappedColors.background === 'string'
                    ? mappedColors.background ?? (darkMode
                        ? 'linear-gradient(to left, #2C5364, #203A43, #0F2027)'
                        : 'linear-gradient(to left, #a1c4fd, #c2e9fb)')
                    : 'linear-gradient(to left, #2C5364, #203A43, #0F2027)',
                loginPage: darkMode
                    ? 'linear-gradient(to right, rgba(44, 83, 100, 0.7), rgba(32, 58, 67, 0.7), rgba(15, 32, 39, 0.7))'
                    : 'linear-gradient(to right, rgba(161, 196, 253, 0.7), rgba(194, 233, 251, 0.7))',
                loginImage: `url(${BackgroundLY})`
            },
            backgroundShades: {
                light: {
                    start: "#e0e0e0",
                    middle: "#f5f5f5",
                },
                dark: {
                    start: "#424242",
                    middle: "#303030",
                },
            },
            color: {
                default: typeof mappedColors.color === 'string'
                    ? mappedColors.color
                    : (darkMode ? '#E1D9D1' : '#333333'),
            },
            spacing: (factor: number) => `${8 * factor}px`,
            shadows: ["none", "0px 1px 3px rgba(0,0,0,0.2)", "0px 3px 6px rgba(0,0,0,0.3)"],
        }
    };

    return { theme };
};

