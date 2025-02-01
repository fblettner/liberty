import React, { ButtonHTMLAttributes, ReactNode, forwardRef, isValidElement } from "react";
import styled from "@emotion/styled";
import { LYReactIcon } from "@ly_styles/icons";
import { alpha, getThemeColor, variantTextColors } from "@ly_utils/commonUtils";

// Define the types for button variants
type ButtonVariant = "contained" | "outlined" | "text";

// Props for the Button component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: ButtonVariant;
    fullWidth?: boolean;
    disabled?: boolean;
    startIcon?: ReactNode | React.ElementType;   
    endIcon?: ReactNode | React.ElementType;    
    color?: string;
    href?: string; // Add href for navigation
    target?: "_blank" | "_self" | "_parent" | "_top";
    rel?: string;
    badgeContent?: ReactNode; // Badge content for the icon
    badgeColor?: string; // Badge color
}

// Icon Wrapper for consistent styling
const IconWrapper = styled.span`
  position: relative; 
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
`;

// Styled Button using Emotion
const StyledButton = styled.button<ButtonProps>(({ theme, variant = "contained", fullWidth, disabled, color }) => ({
    fontWeight: "500",
    fontSize: "0.875rem",
    lineHeight: "1.75",
    textTransform: "none",
    borderRadius: "12px",
    padding: "6px 12px",
    width: fullWidth ? "100%" : "auto",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: variant === "outlined" ? `1px solid ${theme.palette.primary.main}` : "none",
    background: variant === "contained" ? theme.background.default : "transparent",
    color: color ? getThemeColor(theme, color) : theme.palette.primary.main,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    transition: "all 0.3s ease",
    boxSizing: "border-box", 
    "&:hover": !disabled && {
        boxShadow: theme.shadows[2],
        background: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.text.primary,
    },


    "&:not(:disabled)": {
        background: variant === "text" ? "transparent" : undefined,
    }
}));

const Badge = styled.span<{ color?: string }>(({ theme, color }) => {
  const mode = theme.palette.mode === "dark" ? "dark" : "light";

  return {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: color || variantTextColors[mode]["warning"],
    color: theme.palette.text.primary,
    fontSize: "0.75rem",
    minWidth: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px",
    lineHeight: 1,
  }
});
  
// Helper function to handle icon rendering
const renderIcon = (
    icon: ReactNode | React.ElementType,
    badgeContent?: ReactNode,
    badgeColor?: string
  ) => {
    if (!icon) return null;
  
    return (
      <IconWrapper>
        {/* Render badge if present */}
        {badgeContent && <Badge color={badgeColor}>{badgeContent}</Badge>}
        {isValidElement(icon) ? (
          icon
        ) : (
          <LYReactIcon icon={icon as React.ElementType} color="inherit" />
        )}
      </IconWrapper>
    );
  };

// Custom Button Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((params: ButtonProps, ref) => {
    const { children, variant, fullWidth, disabled, startIcon, endIcon, color, href, target, rel, badgeContent, badgeColor, ...props } = params;

        if (href) {
            return (
                <StyledButton
                    as="a"
                    href={href}
                    target={target}
                    rel={rel}
                    ref={ref}
                    variant={variant}
                    fullWidth={fullWidth}
                    disabled={disabled}
                    color={color}
                    {...props}
                >
                    {renderIcon(startIcon, badgeContent, badgeColor)}
                    {children}
                    {renderIcon(endIcon)}
                </StyledButton>
            );
        }
        return (
        <StyledButton
            ref={ref}
            variant={variant}
            fullWidth={fullWidth}
            disabled={disabled}
            color={color}
            {...props}
        >
            {renderIcon(startIcon, badgeContent, badgeColor)}
            {children}
            {renderIcon(endIcon)}
        </StyledButton>
    );
});