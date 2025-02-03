/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Typography } from '@ly_components/common/Typography';
import { Div } from '@ly_components/styles/Div';


export const Dialog_Title = styled(Typography)(({ theme }) => ({
    background: theme.background.default,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    textAlign: "left",
    fontSize: "18px",
    fontWeight: "bold",
    fontVariant: 'small-caps',
}));  

export const Dialog_Content = styled(Div)(({ theme }) => ({
    padding: theme.spacing(2),
    background: theme.palette.background.default,
    overflowY: 'auto',            
    flex: '1 1 auto',            
    WebkitOverflowScrolling: 'touch', 
}));

export const Dialog_Actions = styled(Div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end", 
    padding: theme.spacing(2),
    gap: theme.spacing(2), 
    background: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.divider}`,
  }));