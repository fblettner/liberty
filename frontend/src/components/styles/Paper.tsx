/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Div } from '@ly_components/styles/Div';
import { alpha } from '@ly_components/types/common';
import { footerHeight, headerHeight, tabHeight, toolbarHeight, toolbarWidth, uploadFileHeight } from '@ly_utils/commonUtils';
import { IChatMessage } from '@ly_types/lyChat';
import { ReactNode } from 'react';

export const Paper_Login = styled(Div)(({ theme }) => ({
    padding: theme.spacing(2),
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: alpha(theme.palette.background.default, 0.8),
    borderRadius: '0px',
    boxShadow: theme.shadows[5],
    height: '100%',
    width: '100%',
    '@media (min-width:600px)': {
        width: '500px', // For `sm` breakpoint and up
        height: 'auto',
        borderRadius: '12px',
    },
}));

export const Paper_Table = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',

}))


export const Paper_TableDialog = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    background: theme.background.default,
}))

export const Paper_Dialogs = styled(Div)(({ theme }) => ({
    borderRadius: '12px',
    height: '100%',
    width: '100%',
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.primary.main}`,
    boxSizing: 'border-box',
}))

export const Paper_Dashboard = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    borderRadius: "12px", 
}))


export const Paper_UploadFile = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 2,
    marginTop: 2,
    marginBottom: 2,
    height: `${uploadFileHeight}px`
}))


// Paper for FormsAI
export const Paper_FormsAI = styled(Div)(({ theme }) => ({
    borderRadius: '12px',
    height: '600px',
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.primary.main}`,
    boxSizing: 'border-box',
    flexGrow: 1,
    overflowY: 'auto',
    position: 'relative',
    padding: 2,
}));


// Paper for Table Toolbar
export const Paper_TableToolbar = styled(Div)(({ theme }) => ({
    width: `${toolbarWidth}px`,
    marginRight: 4,
    background: theme.palette.background.default,
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    position: 'sticky',
    top: 0,
}));

export const Paper_DialogToolbar = styled(Div)(({ theme }) => ({
    height: `${toolbarHeight}px`,
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2),
    background: theme.palette.background.default,
}));


export const Paper_FormsChart = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    background: "transparent",
}))

export const Paper_Popup = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    background: theme.palette.background.paper,
    borderRadius: "12px", // Rounded corners
    boxShadow: theme.shadows[3],

}))


interface Paper_FormsChatProps {
    chat: IChatMessage;
}

// Paper for FormsChat
export const Paper_FormsChat = styled(Div)<Paper_FormsChatProps>(({ theme, chat }) => ({
    borderRadius: '12px',
    background: chat.sender === 'User'
        ? alpha(theme.palette.primary.main, 0.2) // White background for user messages
        : theme.palette.background.default, // Black to dark gray gradient for non-user messages
    color: theme.palette.text.primary,
    maxWidth: chat.sender === 'User' ? '75%' : '100%',
    position: 'relative',
    paddingTop: chat.sender === 'User' ? theme.spacing(1) : theme.spacing(0),
    paddingBottom: chat.sender === 'User' ? theme.spacing(1) : theme.spacing(0),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    boxSizing: 'border-box',
}))


interface Paper_TableTreeProps {
    displayGrid: boolean;
    children?: ReactNode;
    elevation?: number;
}

export const Paper_TableTree = styled(Div)<Paper_TableTreeProps>(({ theme, displayGrid }) => ({
    width: '100%', 
    overflow: 'auto', 
    borderRadius: "12px", 
    boxSizing: 'border-box', 
    marginRight: displayGrid ? theme.spacing(0.5) : 0,
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    height: "100%"
}));


