/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { footerHeight, headerHeight } from '@ly_utils/commonUtils';

// Application Content, move the content right when the drawer is open
export const Main_Content = styled('main') (({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    width: '100%',
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom:  theme.spacing(1),
  }));


  export const Main_Login = styled('main') (({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    width: '100%',
    overflow: 'auto',
    height: '100%',
    position: 'relative',
    flexDirection: 'column',
  }));  