/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Button } from "@ly_components/common/Button";
import { alpha } from '@ly_components/types/common';

export const Button_Login = styled(Button)(({ theme, variant }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.primary,
  "&:hover":  {
    boxShadow: theme.shadows[4],
    background: theme.palette.primary.main,
    transform: "scale(1.03)", 
},
}));

export const Button_UISettings = styled(Button)(({ theme, variant }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,

}));

export const Button_TableImport = styled(Button)(({ theme, variant }) => ({
  margin: theme.spacing(1),
  color: theme.palette.text.primary,
}));

export const Button_Tools = styled(Button)(({ theme, variant, disabled }) => ({
  background: theme.palette.primary.main,
  textTransform: "uppercase",
  margin: theme.spacing(1),
  color: theme.palette.text.primary,
  borderRadius: '12px', 
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  paddingTop: theme.spacing(1),
  textDecoration: "none",
  transform: "scale(1)", 
  boxSizing: "border-box",
  "&:hover": !disabled && {
      boxShadow: theme.shadows[4],
      transform: "scale(1.05)", // Slightly increase size on hover
      background: theme.palette.action.hover,

  },
}));
