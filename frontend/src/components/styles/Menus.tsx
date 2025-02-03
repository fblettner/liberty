/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Menu } from "@ly_components/common/Menus";


export const Menu_Filters = styled(Menu)<{ zIndex: number }>(({ theme, zIndex }) => ({
    zIndex: zIndex,
    maxHeight: "400px", // Approx height for 10 items (adjust as needed)
    overflowY: "auto", // Add scrollbar for overflow
  }));

