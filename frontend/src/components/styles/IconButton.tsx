/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { IconButton } from '@ly_components/common/IconButton';
import { variantBackgroundColors } from '@ly_utils/commonUtils';


export const IconButton_Contrast = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.primary,
    "&:hover svg": {

        transform: "scale(1.3)"
      },
}));

export const IconButton_Menus = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    left: 20,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    color: theme.palette.text.primary,
    "&:hover svg": {
        color: theme.palette.action.hover,
      },
}));

export const IconButton_ListBottom = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    textTransform: "none",
    borderRadius: "8px",
    padding: "6px 12px",
}));

export const IconButton_TabClose = styled(IconButton)(({ theme }) => {
    const mode = theme.palette.mode === "dark" ? "dark" : "light";
    return {
        marginLeft: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        "&:hover": {
            borderRadius: '50%',
            background: variantBackgroundColors[mode]["error"],
            transform: 'scale(1.1)', // Slight zoom effect on hover
        },
        "&:hover svg": {
            color: theme.palette.text.primary,
        }
    }
});


export const IconButton_Alert = styled(IconButton)(({ theme }) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    color: "inherit"
}));


