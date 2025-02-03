import React, { ButtonHTMLAttributes, ElementType, ReactNode } from "react";
import styled from "@emotion/styled";
import { LYReactIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ElementType;
    isSelected?: boolean;
    size?: LYIconSize;
    disabled?: boolean;
    color?: string;
    component?: ElementType;
}

// Styled IconButton with alignment fixes
const StyledIconButton = styled.button<IconButtonProps>(
    ({ theme, isSelected, size = LYIconSize.medium, disabled, color }) => {
        return {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            outline: "none",
            border: "none",
            padding: theme.spacing(1),
            borderRadius: "50%",
            fontSize: size,
            cursor: disabled ? "not-allowed" : "pointer",
            color: isSelected ? theme.palette.text.primary : theme.palette.primary.main,
            transition: "color 0.3s ease",
      
            "&:hover svg": {
              color: theme.palette.text.primary,
              transform: "scale(1.3)"
            },
      
            "&:disabled": {
              opacity: 0.5,
              cursor: "default",
            },
        };
    }
);

// Custom IconButton Component
export function IconButton(params: IconButtonProps) {
    const {
        icon,
        isSelected = false,
        size = LYIconSize.medium,
        disabled = false,
        color = "primary",
        component: Component = "button",
        ...props
    } = params;

    return (
        <StyledIconButton
            as={Component}
            isSelected={isSelected}
            size={size}
            disabled={disabled}
            color={color}
            icon={icon}
            {...props}
        >
            <LYReactIcon icon={icon} color="inherit" size={size}/>
        </StyledIconButton>
    );
};