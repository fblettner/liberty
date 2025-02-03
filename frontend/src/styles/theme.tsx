/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// Import React
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// Import Custom
import { getAppsProperties, getDarkMode, getModules, getUserProperties } from '@ly_features/global';
import { IFiltersProperties } from '@ly_types/lyFilters';
import { ToolsQuery } from '@ly_services/lyQuery';
import { QuerySource } from '@ly_types/lyQuery';
import { GlobalSettings } from '@ly_utils/GlobalSettings';
import { EApplications, ESessionMode, IAppsProps } from '@ly_types/lyApplications';
import { EUsers, IUsersProps } from '@ly_types/lyUsers';
import '@ly_styles/custom.css';
import { css, Global, ThemeProvider } from '@emotion/react';


declare module '@emotion/react' {
  export interface Theme {
    mixins: {
      toolbar: {
        minHeight: number;
      };
    };

    palette: {
      primary: { main: string };
      secondary: { main: string };
      text: { primary: string; secondary: string; disabled: string };
      background: { default: string, paper: string };
      divider: string;
      mode: string
      action: {
        hover: string;
        selected: string;
        disabled: string;
      };
      grey: {
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
      };
    };
    background: {
      default: string;
      loginPage: string;
    };
    backgroundShades: {
      light: {
        start: string;
        middle: string;
      },
      dark: {
        start: string;
        middle: string;
      };
    };
    color: {
      default: string;
    };
    shadows: string[];
    spacing: (factor: number) => string;
  }
}

interface ThemeProviderProps {
  children: ReactNode;
}


interface ThemeColorItem {
  TCL_KEY: string; // Represents the key, e.g., 'background.default'
  TCL_LIGHT: string; // Light mode color
  TCL_DARK: string;  // Dark mode color
}
type ThemeColors = Record<string, string | Record<string, string>>;


const mapThemeColors = (queryResult: ThemeColorItem[], darkMode: boolean) => {
  const themeColors: ThemeColors = {};

  queryResult.forEach((item) => {
    const { TCL_KEY, TCL_LIGHT, TCL_DARK } = item;

    // Use dark mode or light mode color
    const value = darkMode ? TCL_DARK : TCL_LIGHT;

    // Handle nested keys 
    const keys = TCL_KEY.split('.'); // Split the key on '.'
    if (keys.length > 1) {
      // Create nested structure
      if (!themeColors[keys[0]]) themeColors[keys[0]] = {};
      (themeColors[keys[0]] as Record<string, string>)[keys[1]] = value;
    } else {
      themeColors[TCL_KEY] = value;
    }
  });

  return themeColors;
};

// Define Global Styles
const GlobalStyles = ({ darkMode, theme }: { darkMode: boolean, theme: any }) => (
  <Global
    styles={css`
      /* Ensure consistent box-sizing across the application */
      *, *::before, *::after {
        box-sizing: border-box;
      }

      /* Apply touch-action globally */
      * {
        touch-action: none;
      }
                
      /* Scrollbar customization */
      ::-webkit-scrollbar {
        width: 10px; /* Width of the scrollbar */
        height: 10px; /* Height of the scrollbar (for horizontal scrolling) */
      }

      ::-webkit-scrollbar-track {
        background: ${theme.palette.background.paper}; /* Track color */
        border-radius: 8px; /* Rounded corners */
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.palette.primary.main}; /* Thumb color (theme primary) */
        border-radius: 8px; /* Rounded corners */
        border: 2px solid ${theme.palette.background.paper}; /* Add space around thumb */
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.palette.primary.dark}; /* Darker color on hover */
      }

      ::-webkit-scrollbar-corner {
        background: ${theme.palette.background.paper}; /* Corner color for scrollable divs */
      }

      /* Firefox scrollbar styling */
      scrollbar-width: thin; /* Make scrollbar thinner */
      scrollbar-color: ${theme.palette.primary.main} ${theme.palette.background.paper};

      /* Reset default margins and padding */
      body, h1, h2, h3, h4, h5, h6, p, blockquote, pre,
      dl, dd, ol, ul, figure, hr, fieldset, legend,
      button, input, textarea {
        margin: 0;
        padding: 0;
      }

      html, body {
        line-height: 1.5; /* Set the default line height */
        height: 100%; /* Ensure the body spans the viewport */
        width: 100%; /* Ensure the body spans the viewport */
        overflow-x: hidden; /* Prevent horizontal scrolling */
      }

      body {
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 400;
        background-color: ${darkMode ? "#121212" : "#ffffff"};
        color: ${darkMode ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color-scheme: ${darkMode ? "dark" : "light"};
        font-size: 1rem;
        line-height: 1.5;
        letter-spacing: 0.00938em;
      }

      /* Remove list style for lists */
      ol, ul {
        list-style: none;
      }

      /* Remove underline from anchor tags */
      a {
        text-decoration: none;
      }

      /* Ensure tables render consistently */
      table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
      }

      th, td {
        text-align: left; 
        vertical-align: middle; 
        line-height: 2.2;
        border-bottom: 1px solid ${darkMode ? "rgba(81, 81, 81, 1)" : "rgba(224, 224, 224, 1)"};
        font-size: 0.875rem;
      }
  
      /* Prevent overflow of root elements */
      #root, #app {
        height: 100%;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
    `}
  />
);



// Provider Theme for the application
//---------------------------------------------
export const LYThemeProvider = ({ children }: ThemeProviderProps) => {
  const darkMode = useSelector(getDarkMode)
  const userProperties: IUsersProps = useSelector(getUserProperties)
  const appsProperties: IAppsProps = useSelector(getAppsProperties)
  const modulesProperties = useSelector(getModules);

  const selectedTheme = userProperties?.[EUsers.theme] || appsProperties?.[EApplications.theme] || 'liberty';
  const language = userProperties?.[EUsers.language] || 'en'; // Default language
  const [themeColors, setThemeColors] = useState<ThemeColors>({});

  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: "THM_NAME",
    value: selectedTheme,
    type: "text",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  useEffect(() => {
    const fetchThemeColors = async () => {
      try {
        const response = await ToolsQuery.themes(modulesProperties, filters, GlobalSettings.getDefaultPool);
        const mappedColors = mapThemeColors(response.items, darkMode);
        setThemeColors(mappedColors);
      } catch (error) {
        console.error('Error fetching theme colors:', error);
      }
    };

    fetchThemeColors();
  }, [darkMode, selectedTheme]);

  // Create theme dynamically
  const theme = useMemo(() => {
    return {
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: typeof themeColors.primary === 'string'
            ? themeColors.primary
            : (darkMode ? '#607d8b' : '#1976d2')
        },
        secondary: {
          main: typeof themeColors.secondary === 'string'
            ? themeColors.secondary
            : (darkMode ? '#ffc107' : '#1976d2')
        },
        text: {
          primary: darkMode
            ? "rgba(255, 255, 255, 0.87)"
            : "rgba(0, 0, 0, 0.87)", // High-emphasis text
          secondary: darkMode
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(0, 0, 0, 0.6)", // Medium-emphasis text
          disabled: darkMode
            ? "rgba(255, 255, 255, 0.38)"
            : "rgba(0, 0, 0, 0.38)", // Disabled text
        },
        background: {
          default: darkMode ? "#121212" : "#ffffff", // Default background
          paper: darkMode ? "#1d1d1d" : "#ffffff", // Surfaces like cards, modals, etc.
        },
        divider: darkMode
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.12)",
        action: {
          hover: darkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)", // Hover state for buttons, lists, etc.
          selected: darkMode
            ? "rgba(255, 255, 255, 0.16)"
            : "rgba(0, 0, 0, 0.08)", // Selected state
          disabled: darkMode
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 0, 0, 0.26)", // Disabled action state
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
        default: typeof themeColors.background === 'string'
          ? themeColors.background ?? (darkMode
            ? 'linear-gradient(to left, #2C5364, #203A43, #0F2027)'
            : 'linear-gradient(to left, #a1c4fd, #c2e9fb)')
          : 'linear-gradient(to left, #2C5364, #203A43, #0F2027)',
        loginPage: darkMode
          ? 'linear-gradient(to right, rgba(44, 83, 100, 0.7), rgba(32, 58, 67, 0.7), rgba(15, 32, 39, 0.7))'
          : 'linear-gradient(to right, rgba(161, 196, 253, 0.7), rgba(194, 233, 251, 0.7))',
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
      text: themeColors.color || (darkMode ? "#E1D9D1" : "#333333"),
      color: {
        default: typeof themeColors.color === 'string'
          ? themeColors.color
          : (darkMode ? '#E1D9D1' : '#333333'),
      },
      spacing: (factor: number) => `${8 * factor}px`,
      shadows: ["none", "0px 1px 3px rgba(0,0,0,0.2)", "0px 3px 6px rgba(0,0,0,0.3)"],
    }

  }, [themeColors, darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles darkMode={darkMode} theme={theme} />
      {children}
    </ThemeProvider>
  );
};

