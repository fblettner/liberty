/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports
import styled from "@emotion/styled";
import { Tab } from "@ly_components/common/Tab";
import { Tabs } from "@ly_components/common/Tabs";

export const Tabs_Dialogs = styled(Tabs)(({ theme }) => ({
  width: "100%",
  borderRadius: "12px",
  padding: "8px",
  display: "flex",
}));

export const Tab_Dialogs = styled(Tab)(({ theme }) => ({
  height: "auto",
  textTransform: "none",
  fontVariant: "small-caps",
  fontSize: "16px",
  padding: "8px 16px",
  margin: "4px",
  borderRadius: "12px",
  boxShadow: theme.shadows[1],
}));  
