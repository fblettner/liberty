/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import styled from '@emotion/styled';
import '@emotion/react';
import { Card, CardActionArea, CardProps } from '@ly_components/common/Card';



export const Card_AppsLogin = styled(Card)<CardProps>(
    ({ theme, isSelected }) => ({
        background: theme.background.default,
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
        height: "100%",
        borderRadius: "12px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth transition for hover
        "&:hover": {
            transform: "scale(1.03)", // Grow the card slightly on hover
            boxShadow: theme.shadows[6],
            background: theme.palette.primary.main,
        },
        boxSizing: 'border-box',
    }))


export const Card_Dashboard = styled(Card)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    boxSizing: 'border-box',
    flex: "1 1 0px",
}))

export const CardActionArea_FormsTools = styled(CardActionArea)(({ theme }) => ({
    padding: theme.spacing(2),

}))