/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */

import React, { InputHTMLAttributes, forwardRef } from "react";
import styled from "@emotion/styled";

// Define custom Checkbox props
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string; // Add a label prop
  labelPlacement?: "start" | "end" | "top" | "bottom"; // Label placement
}

// Styled Checkbox to match MUI styling
const StyledCheckbox = styled.input<{ disabled?: boolean; indeterminate?: boolean }>(
  ({ theme, disabled, indeterminate }) => ({
    width: 18,
    height: 18,
    cursor: disabled ? "not-allowed" : "pointer",
    accentColor: theme.palette.primary.main,
    appearance: "none",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 4,
    display: "inline-block",
    position: "relative",
    background: disabled ? theme.palette.action.disabled : "transparent",
    transition: "all 0.2s ease",
    "&:checked": {
      background: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
    },
    "&:checked::after": {
      content: '""',
      position: "absolute",
      top: "2px",
      left: "6px",
      width: "4px",
      height: "8px",
      border: "solid white",
      borderWidth: "0 2px 2px 0",
      transform: "rotate(45deg)",
    },
    ...(indeterminate && {
      background: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      "&::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "10px",
        height: "2px",
        background: "white",
        transform: "translate(-50%, -50%)",
      },
    }),
    "&:disabled": {
      opacity: 0.5,
      cursor: "default",
    },
    "&:hover": !disabled && {
      borderColor: theme.palette.text.primary,
  },
  })
);

// Styled container for Checkbox and Label
const CheckboxContainer = styled.div<{ labelPlacement: "start" | "end" | "top" | "bottom" }>(({ theme, labelPlacement }) => {
  const labelStyles: Record<string, { flexDirection: React.CSSProperties["flexDirection"] }> = {
    start: { flexDirection: "row-reverse" },
    end: { flexDirection: "row" },
    top: { flexDirection: "column-reverse" },
    bottom: { flexDirection: "column" },
  };

  return {
    display: "flex",
    alignItems: labelPlacement === "top" || labelPlacement === "bottom" ? "center" : "flex-start",
    gap: theme.spacing(1),
    borderRadius: "12px",
    ...labelStyles[labelPlacement],
  };
});

// Styled Label
const StyledLabel = styled.label<{ disabled?: boolean }>(({ theme, disabled }) => ({
  fontSize: "0.875rem",
  color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
  cursor: disabled ? "not-allowed" : "pointer",
}));

const StyledCheckboxContainer = styled.label(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  cursor: "pointer",
}));

// Custom Checkbox Component with Label
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((params, ref) => {
  const {
    checked,
    disabled,
    indeterminate,
    onChange,
    label,
    labelPlacement = "end",
    ...props
  } = params;

  return (
    <CheckboxContainer labelPlacement={labelPlacement}>
      <StyledCheckboxContainer>
        <StyledCheckbox
          ref={ref}
          id={props.id} // Ensure a unique `id`
          type="checkbox"
          checked={checked}
          disabled={disabled}
          indeterminate={indeterminate}
          onChange={(e) => {
            e.stopPropagation(); // Prevents double trigger
            onChange?.(e);
          }}
          {...props}
        />
        {label && (
          <StyledLabel
            htmlFor={props.id} // Link the label to the checkbox
            disabled={disabled}
          >
            {label}
          </StyledLabel>
        )}
      </StyledCheckboxContainer>
    </CheckboxContainer>
  );
});