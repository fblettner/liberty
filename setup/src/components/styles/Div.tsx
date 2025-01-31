import styled from "@emotion/styled";

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

export const Div_AppsLayout = styled('div')(({ theme }) => ({
    height: '100vh',
    width: '100%',
    display: 'flex',
}));