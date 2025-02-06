/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Div } from '@ly_components/styles/Div';
import { DefaultZIndex } from '@ly_components/types/common';

// Styled component Stack for FormsTable
export const Stack_FormsTable = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    display: 'flex',
}))

export const Stack_Table = styled(Div)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    overflowY: 'auto',
}))


export const Stack_Dialogs = styled(Div)(({ theme }) => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}))


// Styled component Stack for FormsAI
export const Stack_FormsAI = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    margin: "0 auto",
    overflow: 'hidden',
    paddingBottom: '10px',
    boxSizing: 'border-box',
}))

export const Stack_FormsChart = styled(Div)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  }))

  export const Stack_SnackMessage = styled(Div)(({ theme }) => ({
    position: 'fixed', 
    bottom: 16, 
    right: 16, 
    zIndex: DefaultZIndex.Snack
}))