/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import styled from "@emotion/styled";
import { Typography } from "@ly_components/common/Typography";
import { EStandardColor } from "@ly_utils/commonUtils";

interface StyledTypographyProps {
    color?: EStandardColor | string;
    isThemeColor?: boolean;
}

export const Typo_Loading = styled(Typography)<StyledTypographyProps>(({ theme, color, isThemeColor }) => ({
    variant: 'body2',
    marginTop: theme.spacing(1),
    color: !isThemeColor ? color : EStandardColor.inherit,
}));

export const Typo_ListItemText = styled(Typography)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: '100%',
    fontSize: 16,
    fontVariant: 'small-caps',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    color: selected
        ? theme.palette.primary.main
        : theme.palette.text.primary,
    fontWeight: selected ? 'bold' : 'normal',
}));

export const Typo_ExportTitle = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: 'small-caps',
    marginBottom: theme.spacing(1),
}));

export const Typo_AppsName = styled(Typography)(({ theme }) => ({
    fontFamily: 'Georgia',
    color: theme.color.default,
    marginLeft: theme.spacing(1),
    display: 'flex',
    fontSize: '20px',
}));

