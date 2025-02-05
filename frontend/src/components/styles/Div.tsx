/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import BackgroundLY from '@ly_assets/background_ly.jpg'
import { DefaultZIndex } from '@ly_components/types/common';
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { alpha } from '@ly_components/types/common';
import { drawerWidth, footerHeight, headerHeight } from '@ly_utils/commonUtils';

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

export const Div_Users = styled(Div)(({ theme }) => ({
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(1),
}));

export const Div_DialogToolbar = styled(Div)(({ theme }) => ({
    display: 'flex',
    width: '100%',
}));


export const Div_TableToolbar = styled("div")(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
}));

export const Div_TableToolbarButtons = styled(Div)(({ theme }) => ({
    display: 'flex',
}));

export const Div_DialogToolbarButtons = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    gap: theme.spacing(1),
}));

export const Div_DialogToolbarButtonsEnd = styled(Div)(({ theme }) => ({
    display: 'flex',
    paddingRight: theme.spacing(1),
}));

export const Div_UISettings = styled(Div)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
}));

export const Div_AppsLogin = styled(Div)(({ theme }) => ({
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

export const Div_ColumnsFilter = styled(Div)(({ theme }) => ({
    padding: '16px',
    width: '600px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '12px'
}));

interface Div_CellColorProps {
    background?: string;
}

export const Div_CellColor = styled(Div)<Div_CellColorProps>(({ theme, background }) => ({
    background: background,
    width: '50%', // Half width
    height: '75%',
    margin: '0 auto', // Center horizontally
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
}));

export const Div_CellText = styled(Div)(({ theme }) => ({
    whiteSpace: 'normal',
    wordWrap: 'break-word'
}));

export const Div_TableExpander = styled(Div)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

export const Div_TableSearch = styled(Div)(({ theme }) => ({
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
}));

export const Div_TableColumnsChooser = styled(Div)(({ theme }) => ({
    maxHeight: "300px",
    overflowY: "auto",
    width: "350px",
    padding: theme.spacing(1),
    overflow: "auto", // Prevent overflow
}));

export const Div_TableAllColumnsChooser = styled(Div)(({ theme }) => ({
    padding: theme.spacing(1),
}));

export const Div_TableProgress = styled(Div)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: DefaultZIndex.Dialog + 10,
}));

export const Div_TableHeaderContent = styled(Div)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: '32px',
    padding: '0px',
}));

export const Div_TableHeaderButtons = styled(Div)(({ theme }) => ({
    position: 'absolute',
    right: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
}));

export const Div_TableHeaderReisze = styled(Div)(({ theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    width: '5px',
    height: '100%',
    cursor: 'col-resize',
    zIndex: 1,
    borderRight: `1px solid ${theme.palette.divider}`,
}));

export const Div_TableResultsOverlay = styled(Div)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    textAlign: 'center',
    overflow: 'hidden',
    height: '100%'
}));

export const Div_TableFooter = styled("div")(({ theme }) => ({
    background: theme.palette.background.default,
    color: theme.color.default,
    display: 'flex',
    width: '100%',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const Div_TableFooterContent = styled(Div)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'right',
    overflow: 'hidden',
    height: "40px",
    padding: '8px'
}));

export const Div_TableCell = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
}));

export const Div_TableFab = styled(Div)(({ theme }) => ({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: DefaultZIndex.Dialog + 10
}));

export const Div_Export = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
}));

export const Div_Loading = styled(Div)(({ theme }) => ({
    paddingTop: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
}));

export const Div_Markdown = styled(Div)(({ theme }) => ({
    background: theme.background.default,
    color: '#fff',
    padding: '4px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
}));

export const Div_AIProgress = styled(Div)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export const Div_AIError = styled(Div)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export const Div_Header = styled(Div)(({ theme }) => ({
    marginRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
}));

// Styled component for Drawer Header
export const Div_HeaderDrawer = styled('div')(({ theme }) => ({
    background: theme.background.default,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}))

export const Div_HeaderIcons = styled(Div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: 0.5,
}));

interface Div_DivFormsChatProps {
    sender?: string;
}

export const DivFormsChat = styled(Div)<Div_DivFormsChatProps>(({ theme, sender }) => ({
    display: "flex",
    justifyContent: sender === 'User' ? 'flex-end' : 'flex-start',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
}));

export const Div_InputChat = styled(Div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
    role: "form"
}));

export const Div_AutoComplete = styled(Div)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    flex: 1
}));

export const Div_AutoCompleteInput = styled(Div)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end'
}));

export const Div_ChatScrollButtons = styled(Div)(({ theme }) => ({
    position: "absolute",
    bottom: "10%",
    width: "100%",
    display: "flex",
    justifyContent: "center"
}));

export const Div_ChatActions = styled(Div)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
}));


interface Div_ChatContentProps {
    isMinimized?: string;
}

export const Div_ChatContent = styled(Div)<Div_ChatContentProps>(({ theme, isMinimized }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    display: isMinimized ? 'none' : 'block',
    padding: theme.spacing(1),
}));

interface Div_DialogWidgetProps {
    minimized?: boolean;
    fullScreen?: boolean;
    userWidth?: string | number;
    userHeight?: string | number;
}

export const Div_ChatTitle = styled(Div)<Div_DialogWidgetProps>(({ theme, minimized, fullScreen, userWidth, userHeight }) => ({
    position: 'fixed',
    bottom: fullScreen ? 0 : minimized ? 10 : 10,
    right: fullScreen ? 0 : minimized ? 10 : 10,
    top: fullScreen ? 0 : 'auto',
    left: fullScreen ? 0 : 'auto',
    height: fullScreen ? '100vh' : minimized ? '50px' : userHeight,
    width: fullScreen ? '100vw' : minimized ? '300px' : userWidth,
    borderRadius: fullScreen ? '0px' : '12px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: DefaultZIndex.Component,
    background: theme.background.default,
    boxShadow: fullScreen ? 'none' : theme.shadows[5],
    overflow: 'hidden',
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
}));

export const Div_DialogWidget = styled(Div)<Div_DialogWidgetProps>(({ theme, minimized, fullScreen, userWidth, userHeight }) => ({
    position: 'fixed',
    top: fullScreen ? 0 : minimized ? 'auto' : '50%',
    left: fullScreen ? 0 : minimized ? 'auto' : '50%',
    transform: fullScreen || minimized ? 'none' : 'translate(-50%, -50%)',
    bottom: fullScreen ? 0 : minimized ? 10 : 'auto',
    right: fullScreen ? 0 : minimized ? 10 : 'auto',
    height: fullScreen ? '100vh' : minimized ? '50px' : userHeight,
    width: fullScreen ? '100vw' : minimized ? '300px' : userWidth,
    borderRadius: fullScreen ? '0px' : '12px',
    display: 'flex',
    flexDirection: 'column',
    background: theme.background.default,
    boxShadow: fullScreen ? 'none' : theme.shadows[5],
    overflow: 'hidden',
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
}));

export const Div_DialogWidgetTitle = styled(Div)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    cursor: 'move',
    background: theme.background.default,
    color: theme.palette.text.primary,
    borderBottomColor: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
}));

export const Div_DialogWidgetTitleButtons = styled(Div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
}));

export const Div_DialogWidgetContent = styled(Div)(({ theme }) => ({
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    padding: theme.spacing(1),
    boxSizing: 'border-box',
}));

export const Div_DialogWidgetButtons = styled(Div)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    justifyContent: "flex-start"
}));

export const Div_ColorPicker = styled(Div)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%"
}));

export const Div_ColorPickerPreview = styled(Div)<Div_CellColorProps>(({ theme, background }) => ({
    width: '30px',
    height: '30px',
    background: background,
    border: '1px solid #ccc',
    borderRadius: '12px',
}));

export const Div_InputColor = styled(Div)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

interface Div_FormsListViewProps {
    selected: boolean;
}

export const Div_TableGrid = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    border: `1px solid ${theme.palette.divider}`,
    overflowX: 'auto', // Allow horizontal scrolling if the table exceeds available width
    boxSizing: 'border-box',
    borderRadius: '12px',
    background: theme.palette.background.default,
    boxShadow: 'none',
}))

interface Div_TableGridContentProps {
    rowCount: number;
}

export const Div_TableGridContent = styled(Div)<Div_TableGridContentProps>(({ theme, rowCount }) => ({
    display: 'flex',
    width: '100%',
    flexGrow: 1,
    overflow: rowCount > 0 ? 'auto' : 'none',
    position: 'relative',
}))

export const Div_FormsListView = styled(Div)<Div_FormsListViewProps>(({ theme, selected }) => ({
    width: "100%",
    cursor: 'pointer',
    padding: theme.spacing(1),
    touchAction: 'none',
}));

export const Div_TableList = styled(Div)(({ theme }) => ({
    width: '100%',
    overflow: 'auto',
}));

export const Div_ListItem = styled(Div)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '12px',
}));

export const Div_ListItemText = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column'
}));

export const Div_TableTreeTitle = styled(Div)(({ theme }) => ({
    alignItems: 'center',
    background: theme.background.default,
    color: theme.color.default,
    textAlign: 'left',
    fontVariant: 'small-caps',
    fontSize: "16px",
    padding: theme.spacing(1),
}));

export const Div_ResizeBox = styled(Div)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '20px',
    height: '20px',
    background: 'rgba(0, 0, 0, 0.1)',
    cursor: 'nwse-resize',
    borderRadius: '50%',
}));

export const Div_ExportGroup = styled(Div)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    padding: '16px',
    borderRadius: '12px',
}));

interface TabPanelProps {
    hidden: boolean;
}

export const Div_DialogTabPanel = styled(Div)<TabPanelProps>(({ hidden }) => ({
    width: "100%",
    height: "100%",
    display: hidden ? 'none' : 'flex',  // Apply 'none' when hidden
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
}));

export const Div_AppsLayout = styled('div')(({ theme }) => ({
    height: '100vh',
    width: '100%',
    display: 'flex',
}));


export const Div_AppsTabsHeader = styled(Div)(({ theme }) => ({
    display: "flex",
}));

export const Div_AppsDialogTabPanel = styled(Div)(({ theme }) => ({
    width: `calc(100% - ${theme.spacing(2)})`, // Subtract horizontal margin
    height: `calc(100% - ${headerHeight}px - ${footerHeight}px - 64px - ${theme.spacing(2)}) `,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    borderRadius: "12px",
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
}));

export const Div_TabPanelContent = styled(Div)(({ theme }) => ({
    width: "100%",
    height: "100%",
    flex: 1,
    overflow: 'auto',
    overflowX: 'hidden'
}));

export const Div_StyledGridOverlay = styled((Div))(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-results-primary': {
        fill: theme.palette.primary.main,
    },
    '& .no-results-secondary': {
        fill: theme.palette.primary.main,
    },
}));

export const Div_FormsToolsCard = styled(Div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
}));



export const Div_Login = styled(Div)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: `url(${BackgroundLY})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
}));

export const Backdrop = styled(Div)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    zIndex: DefaultZIndex.Component - 2, // Below the modal box
}));

interface Div_InlineProps {
    position?: "start" | "end"
}



export const Div_Inline = styled.div<Div_InlineProps>(({ theme, position }) => ({
    margin: 0,
    padding: 0,
    fontWeight: 400,
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    maxHeight: "2em",
    marginRight: "8px",

    [position === "start" ? "left" : "right"]: "8px",

}));


export const Div_TableFilters = styled.div({
    display: "flex",
    justifyContent: "space-between", // Align buttons to the left and right
    marginTop: "16px", // Add spacing above the buttons
});

export const Div_HeaderToolbar = styled.div(({ theme }) => ({
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    minHeight: "64px",
    boxSizing: "border-box",
    [`@media (min-width: 600px)`]: {
        minHeight: "56px",
    },
}));

interface AppBarProps {
    open?: boolean;
}

export const Div_HeaderAppBar = styled.div<AppBarProps>(({ theme, open }) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: headerHeight,
    background: theme.background.default,
    boxShadow: theme.shadows[3],
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,

    }),
}));

// Updated Styled Components for a Modern Drawer
export const Div_DrawerOverlay = styled.div<{ open: boolean }>(({ open }) => ({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.3)", // Softer overlay for modern look
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity 0.3s ease",
    zIndex: 999,
}));


export const Div_DrawerContainer = styled.div<{ open: boolean }>(({ theme, open }) => {
    const isMobile = useMediaQuery("(max-width: 600px)");
    return {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isMobile ? '100%' : drawerWidth, 
        background: alpha(theme.palette.primary.main, 0.1),
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,        
        overflow: "hidden"
    }
});

export const Div_DrawerContent = styled(Div)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    background: theme.background.default,
    borderRadius: "12px", // Rounded top corners
    boxShadow: theme.shadows[6], 
    overflow: "auto",
    maxHeight: "100vh",
    scrollbarGutter: "stable", // Keeps space for the scrollbar to avoid layout shift

 
}));

export const Div_DrawerHeader = styled.div(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1),
    background: theme.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: "12px", // Rounded top corners
    boxShadow: theme.shadows[2],
    marginBottom: theme.spacing(1.5)
}));

export const Div_ContentWrapper = styled.div(({ theme }) => ({
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));


// Modern Styled Panel for Drawer Sections
export const Div_DrawerPanel = styled.div(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: "12px", // Rounded corners for individual panels
    boxShadow: theme.shadows[3],
    padding: theme.spacing(1),
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
        transform: "scale(1.02)", // Slight grow on hover
        boxShadow: theme.shadows[4], // Enhanced shadow on hover
    },
}));

// Modern Styled Panel for Drawer Sections
export const Div_DrawerPanelDynamic = styled.div(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: "12px", // Rounded corners for individual panels
    boxShadow: theme.shadows[3],
    padding: theme.spacing(1),
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
}));