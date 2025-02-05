/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import styled from "@emotion/styled";
import { LYReactIcon } from "@ly_styles/icons";

interface ListProps {
    children: ReactNode;
    dense?: boolean;
    padding?: boolean;
}

const StyledList = styled.ul<{ dense?: boolean; padding?: boolean }>(
    ({ theme, dense, padding }) => ({
        listStyle: "none",
        margin: 0,
        paddingLeft: padding ? theme.spacing(3) : 0,
        paddingRight: padding ? theme.spacing(2) : 0,

        overflow: "auto",
        ...(dense && {
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
        }),
    })
);

export const List = (props: ListProps) => {
    const { children, dense = false, padding = true } = props;
    return (
        <StyledList dense={dense} padding={padding} {...props}>
            {children}
        </StyledList>
    );
};

interface ListItemProps {
    children: ReactNode;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }
  
const StyledListItem = styled.li<{ selected?: boolean; disabled?: boolean }>(
    ({ theme, selected, disabled }) => ({
      display: "flex",
      alignItems: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      width: '100%',
      borderRadius: "12px",
      '&:hover': {
        background: selected
          ? theme.background.default
          : theme.palette.action.hover,
        boxShadow: theme.shadows[3],
       
      },
      background: selected
        ? theme.background.default
        : 'inherit',
    })
  );
  
  export const ListItem = (props: ListItemProps) => {
    const { children, selected = false, disabled = false, onClick } = props;
    return (
      <StyledListItem selected={selected} disabled={disabled} onClick={onClick}>
        {children}
      </StyledListItem>
    );
  };


  interface ListItemTextProps {
    primary: ReactNode;
    secondary?: string;
  }

  const StyledListItemText = styled.div(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    marginLeft: theme.spacing(1),
    overflow: "hidden",
    padding: theme.spacing(0.5),
  }));
  
  const PrimaryText = styled.span(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }));
  
  const SecondaryText = styled.span(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  }));
  

  export const ListItemText = (props: ListItemTextProps) => {  
    const { primary, secondary } = props
    return (
      <StyledListItemText>
        <PrimaryText>{primary}</PrimaryText>
        {secondary && <SecondaryText>{secondary}</SecondaryText>}
      </StyledListItemText>
    );
  };

  interface ListItemIconProps {
    children: ReactNode;
  }
  
  const StyledListItemIcon = styled.div(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: theme.spacing(4),
    color: theme.palette.text.secondary,
  }));
  
  export const ListItemIcon = (props: ListItemIconProps) => {  
    const { children } = props;
    return <StyledListItemIcon>{children}</StyledListItemIcon>;
  };

  // Define the types for button variants
type ButtonVariant = "contained" | "outlined" | "text";

// Props for the ListItemButton
interface ListItemButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  startIcon?: ReactNode | React.ElementType;
  endIcon?: ReactNode | React.ElementType;
  selected?: boolean;
}

// Styled ListItemButton
const StyledListItemButton = styled.button<ListItemButtonProps>(
  ({ theme, variant = "text", fullWidth, disabled, selected }) => ({
    width: fullWidth ? "100%" : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
    border: "none",
    textAlign: "left",
    cursor: disabled ? "not-allowed" : "pointer",
    color: theme.palette.text.primary,
    background:  "transparent",
    transition: "background-color 0.3s ease, color 0.3s ease",
    borderRadius: "12px",
    "&:hover": !disabled && {
        background: theme.palette.action.hover,
        boxShadow: theme.shadows[2],
        color: theme.color.default,
    },

    "&:disabled": {
      opacity: 0.5,
      cursor: "default",
    },

    ...(variant === "outlined" && {
      border: `1px solid ${theme.palette.primary.main}`,
    }),

    ...(variant === "contained" && {
        background: theme.palette.primary.main,
      color: theme.palette.text.secondary,
      "&:hover": {
        background: theme.palette.primary.main,
      },
    }),
  })
);

// Helper function to render icons
const renderIcon = (icon: ReactNode | React.ElementType) => {
  if (!icon) return null;
  return <LYReactIcon icon={icon as React.ElementType} color="inherit" />;
};

// Custom ListItemButton Component
export const ListItemButton = forwardRef<HTMLButtonElement, ListItemButtonProps>(
  ({ children, variant = "text", fullWidth, disabled, startIcon, endIcon, selected, ...props }, ref) => {
    return (
      <StyledListItemButton
        ref={ref}
        variant={variant}
        fullWidth={fullWidth}
        disabled={disabled}
        selected={selected}
        {...props}
      >
        {renderIcon(startIcon)}
        {children}
        {renderIcon(endIcon)}
      </StyledListItemButton>
    );
  }
);