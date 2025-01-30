/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React from "react";
import styled from "@emotion/styled";
import { Div } from "@ly_components/styles/Div";

// Types
export interface CardProps {
    children: React.ReactNode;
    isSelected?: boolean; // For styling selected state
    style?: React.CSSProperties;
}

interface CardHeaderProps {
    title: string;
    action?: React.ReactNode;
    style?: React.CSSProperties;
}

interface CardContentProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

interface CardActionAreaProps {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    href?: string; // Add href for navigation
    target?: "_blank" | "_self" | "_parent" | "_top";
    rel?: string;
}

// Styled Card
const StyledCard = styled(Div)<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    borderRadius: "12px",
    boxShadow: isSelected ? theme.shadows[4] : theme.shadows[2],
    overflow: "hidden",
    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
    "&:hover": {
        boxShadow: theme.shadows[6],
    },
    boxSizing: "border-box"
}));

// Styled Card Header
const StyledCardHeader = styled.div(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    justifyContent: "space-between",

}));

const Title = styled.div(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    fontVariant: 'small-caps',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
}));


// Styled Card Content
const StyledCardContent = styled.div(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    fontSize: "14px",
    color: theme.palette.text.secondary,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flex: "1 1 0px",
    boxSizing: "border-box",

}));

// Styled Card Action Area
const StyledCardActionArea = styled.button<CardActionAreaProps>(({ theme, disabled }) => ({
    border: "none",
    background: "inherit",
    width: "100%",
    display: "block",
    padding: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "inherit",
    "&:hover": !disabled && {
        boxShadow: theme.shadows[4],
        transform: "scale(1.03)", 
        background: theme.palette.action.hover,
    },
    boxSizing: "border-box",

}));

// Components
export const Card = (params: CardProps) => {
    const { isSelected, children, ...props } = params;
    return <StyledCard {...props} isSelected={isSelected}>{children}</StyledCard>;
};

export const CardHeader = (params: CardHeaderProps) => {
    const { title, action, ...props } = params;
    return (
        <StyledCardHeader {...props}>
            <Title>{title}</Title>
            {action && <div>{action}</div>} {/* Render the action if provided */}
        </StyledCardHeader>
    );
};

export const CardContent = (params: CardContentProps) => {
    const { children, ...props } = params;
    return <StyledCardContent {...props}>{children}</StyledCardContent>;
};

export const CardActionArea = (params: CardActionAreaProps) => {
    const { onClick, children, disabled, href, rel, target,...props } = params;

    if (href) {
        return (
            <StyledCardActionArea
                as="a"
                href={href}
                target={target}
                rel={rel}
                onClick={onClick} 
                disabled={disabled}
                {...props}
            >
                {children}
            </StyledCardActionArea>
        );
    }
    return <StyledCardActionArea type="button" onClick={onClick} disabled={disabled} {...props}>{children}</StyledCardActionArea>;
};

interface CardActionsProps {
    children: React.ReactNode;
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    style?: React.CSSProperties;
}

const StyledCardActions = styled.div<{ justifyContent: string }>(({ justifyContent, theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: justifyContent,
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const CardActions = (params: CardActionsProps) => {
    const { children, justifyContent = "flex-end", style } = params;
    return (
        <StyledCardActions justifyContent={justifyContent} style={style}>
            {children}
        </StyledCardActions>
    );
};