/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import { getDarkMode } from "@ly_features/global";

type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  flexItem?: boolean;
};

const StyledDivider = styled.div<{ orientation: 'horizontal' | 'vertical'; flexItem: boolean; darkMode: boolean }>(
  ({ orientation, flexItem, darkMode, theme }) => ({
    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    width: orientation === 'vertical' ? '1px' : '100%',
    height: orientation === 'vertical' ? '100%' : '1px',
    flexShrink: 0,
    alignSelf: flexItem ? 'stretch' : 'center',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
  })
);

export function Divider({ orientation = 'horizontal', flexItem = false }: DividerProps) {
  const darkMode = useSelector(getDarkMode);

  return (
    <StyledDivider
      orientation={orientation}
      flexItem={flexItem}
      darkMode={darkMode}
    />
  );
}