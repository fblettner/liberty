/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
import React, { ReactNode, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { LYReactIcon, variantIcons } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { LYCloseIcon } from "@ly_styles/icons";
import { IconButton_Alert } from "@ly_components/styles/IconButton";
import { Div } from "@ly_components/styles/Div";
import { useTheme } from "@emotion/react";
import { variantBackgroundColors, variantTextColors } from '@ly_utils/commonUtils';
import { ThemeMode, SeverityVariant } from '@ly_components/types/common';

// Alert Variants

// Alert Props
interface AlertProps {
  variant?: SeverityVariant;
  children: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
}



// Styled Alert Container
const StyledAlert = styled(Div)<{ variant: SeverityVariant; mode: ThemeMode }>(
    ({ theme, variant, mode }) => ({
      display: "flex",
      alignItems: "center",
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),   
      borderRadius: "12px",
      background: variantBackgroundColors[mode][variant],
      color: variantTextColors[mode][variant],

      position: "relative",
      boxShadow: theme.shadows[3],
      fontSize: "14px",
      width: "100%",
    })
  );

// Styled Icon Wrapper
const IconWrapper = styled.div({
  display: "flex",
  alignItems: "center",
  marginRight: "8px",
  fontSize: "20px",
});

// Alert Component
export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  children,
  dismissible = false,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const Icon = variantIcons[variant];

  useEffect(() => {
    setVisible(true);
  }, [children]);

  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  const theme = useTheme();
  const mode: ThemeMode = theme.palette.mode === "dark" ? "dark" : "light";

  return (
    <StyledAlert variant={variant} mode={mode}>
      <IconWrapper>
        <LYReactIcon icon={Icon} size={LYIconSize.small} color={variantTextColors[mode][variant]}/>
      </IconWrapper>
      {children}
      {dismissible && (
        <IconButton_Alert 
            onClick={handleClose} 
            aria-label="Close alert"
            icon={LYCloseIcon}
            size={LYIconSize.small}
            />
      )}
    </StyledAlert>
  );
};