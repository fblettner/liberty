/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { ReactElement } from "react";
import styled from "@emotion/styled";
import { alpha } from "@ly_components/types/common";

interface TabProps {
    id: string;
    label: string | ReactElement | null;
    value: string | number;
    isActive?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    disabled?: boolean;
}

// Interfaces
interface StyledTabProps {
    isActive?: boolean;
}

// Styled button for Tab
const StyledTab = styled.span<StyledTabProps>(({ theme, isActive }) => ({
    padding: "8px 16px",
    margin: "4px",
    borderRadius: "12px",
    border: "none",
    background: isActive
          ? alpha(theme.palette.primary.main, 0.5)
          : theme.palette.background.paper,
    color: isActive ? theme.palette.text.primary : theme.palette.text.secondary,
    boxShadow: isActive ? theme.shadows[2] : theme.shadows[1],
    cursor: "pointer",
    fontWeight: isActive ? "bold" : "normal",
    textTransform: "none",
    fontVariant: "normal",
    ...(isActive
        ? {}
        : {
            "&:hover": {
              background: theme.palette.action.hover,
              boxShadow: theme.shadows[4],
              transform: "scale(1.03) translateY(-2px)", 
              color: theme.palette.text.primary,
            },
          }),

    "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
    },
}));

// Tab Component
export function Tab(props: TabProps) {
    const { label, isActive, onClick, ...rest } = props;
    return (
      <StyledTab
        isActive={isActive}
        onClick={onClick}
        role="tab"
        {...rest} // ✅ Forward other props like `disabled`, `id`, etc.
      >
        {label}
      </StyledTab>
    );
  };