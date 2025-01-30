/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React, { forwardRef, ReactElement, ReactNode, useState } from "react";
import styled from "@emotion/styled";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  disabled?: boolean;
}

const StyledToggle = styled.button<ToggleProps>(({ theme, isActive, disabled }) => ({
    padding: theme.spacing(2),
    flex: 1,
    textTransform: 'none',
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: '12px',
    cursor: disabled ? "not-allowed" : "pointer",
    background: isActive ? theme.palette.primary.main : theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: "all 0.3s ease",
    "&:hover": {
      background: isActive ? theme.palette.primary.main : theme.palette.action.hover,
    },
    opacity: disabled ? 0.6 : 1,
}));

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ isActive = false, disabled = false, children, ...props }, ref) => (
    <StyledToggle ref={ref} isActive={isActive} disabled={disabled} {...props}>
      {children}
    </StyledToggle>
  )
);

interface ToggleGroupProps {
  children: ReactNode;
  value?: string;
  onChange?: (event: any, value: string) => void;
  exclusive?: boolean; // Allow only one toggle to be active
}

const StyledToggleGroup = styled.div({
  display: "flex",
  gap: "8px",
});

export const ToggleGroup = (params: ToggleGroupProps) => {
    const { children, value, onChange, exclusive = true} = params;
    const handleToggleClick = (event: any, val: string) => {
      if (exclusive) {
        onChange?.(event, value === val ? "" : val); // Toggle off if already selected
      } else {
        onChange?.(event, val); // No toggle-off behavior for non-exclusive mode
      }
    };
  
    // Clone children to pass `isActive` and `onClick` props
    const clonedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === Toggle) {
        const isActive = child.props.value === value;
        return React.cloneElement(child as ReactElement<any>, {
          isActive,
          onClick: (e: any) => handleToggleClick(e, child.props.value),
        });
      }
      return child;
    });
  
    return <StyledToggleGroup>{clonedChildren}</StyledToggleGroup>;
  };