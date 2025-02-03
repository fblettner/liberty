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
    flexGrow: 1,
    width: '100%',
    overflow: 'auto',
    height: `calc(100% - ${headerHeight}px - ${footerHeight}px)`,
    marginTop: headerHeight,
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(0),

  }));