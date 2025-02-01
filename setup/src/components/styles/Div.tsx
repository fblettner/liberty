import styled from "@emotion/styled";
import BackgroundLY from '@ly_assets/background_ly.jpg'
import { alpha } from "@ly_utils/commonUtils";

// Define elevation shadows similar to Material-UI
const elevationShadows: string[] = [
    'none',
    '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)', // elevation 1
    '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',  // elevation 2
    '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)', // elevation 3
    '0px 14px 28px rgba(0,0,0,0.25), 0px 10px 10px rgba(0,0,0,0.22)', // elevation 4
    '0px 19px 38px rgba(0,0,0,0.30), 0px 15px 12px rgba(0,0,0,0.22)', // elevation 5
    // Extend up to 24 if needed
];

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

interface DivProps {
    display?: string;  // Allow passing 'flex', 'grid', etc.
    flexDirection?: FlexDirection;
    justifyContent?: string;
    alignItems?: string;
    gap?: string | number;
    padding?: string | number;
    margin?: string | number;
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    width?: string | number;
    elevation?: number;
}

export const Div = styled.div<DivProps>(
    ({ display = 'block', flexDirection, justifyContent, alignItems, gap, padding, margin, position, width, elevation }) => ({
        display,                 // Default to 'block' if not provided
        flexDirection,
        justifyContent,
        alignItems,
        gap,
        padding,
        margin,
        position,
        width,
        boxShadow: elevationShadows[elevation ?? 0],
    })
);

export const Div_SetupLayout = styled('div')(({ theme }) => ({
    height: '100vh',
    width: '100%',
    display: 'flex',
}));

export const Main_Content = styled('main') (({ theme }) => ({
    flexGrow: 1,
    width: '100%',
    overflow: 'auto',
    height: '100%',
  }));

export const Div_Setup = styled(Div)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: `url(${BackgroundLY})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
}));

export const Paper_Setup = styled(Div)(({ theme }) => ({
    padding: "8px",
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: alpha(theme.palette.background.default, 0.8),
    borderRadius: '0px',
    height: '100%',
    width: '100%',
    '@media (min-width:600px)': {
        width: '500px', // For `sm` breakpoint and up
        height: 'auto',
        borderRadius: '12px',
    },
}));

export const Div_AppsSetup = styled(Div)(({ theme }) => ({
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}));

export const Div_Logs = styled(Div)(({ theme }) => ({
    marginTop: "10p",
    padding: "10px",
    background: theme.palette.background.paper,
    borderRadius: "6px",
    fontSize: "0.9rem",
    maxHeight: "100px",
    overflowY: "auto"
}));

export const Div_DialogToolbar = styled(Div)(({ theme }) => ({
    display: 'flex',
    width: '100%',
}));

export const Div_DialogToolbarButtons = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    gap: theme.spacing(1),
}));