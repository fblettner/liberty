/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { List, ListItemButton } from '@ly_components/common/List';
import { alpha } from '@ly_components/types/common';

export const List_StaticMenus = styled(List)(({ theme }) => ({
    overflow: 'hidden',
  }));

export const ListItemButton_DynamicMenus = styled(ListItemButton)<{open?: boolean}>(({ theme, open }) => ({
  background: open ? alpha(theme.palette.primary.main, 0.2) : "",
}));
