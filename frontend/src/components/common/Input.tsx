import React, { InputHTMLAttributes, ReactNode, forwardRef, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { LYCloseIcon, LYReactIcon } from "@ly_styles/icons";
import { LYIconSize } from "@ly_utils/commonUtils";
import { TextFieldVariants, ThemeMode } from "@ly_components/types/common";
import { variantTextColors } from '@ly_utils/commonUtils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label?: string;
    variant?: TextFieldVariants;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    onClear?: () => void;
    showClearButton?: boolean;
}

// Wrapper for the entire input field
const Wrapper = styled.div<{ fullWidth?: boolean, disabled?: boolean }>(({ theme, fullWidth, disabled }) => ({
    width: fullWidth ? "100%" : "300px",
    cursor: disabled ? "not-allowed" : "text",
    display: "flex",
    flexDirection: "column",
    position: "relative",
}));

// Label that floats above the input
const Label = styled.label<{
    focused: boolean;
    filled: boolean;
    error?: boolean;
    disabled?: boolean;
    variant: TextFieldVariants;
    
}>(({ theme, focused, filled, error, disabled, variant }) => {

    const mode: ThemeMode = theme.palette.mode === "dark" ? "dark" : "light";
    return {
        position: "absolute",
        top: focused || filled ? -4 : "65%", // Adjust the position for outlined variant
        left: variant === "outlined" ? 12 : 0, // Add padding for outlined variant
        color: error
            ? variantTextColors[mode]["error"]
            : disabled
                ? theme.palette.text.disabled
                : focused
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
        transform: focused || filled ? "translateY(0)" : "translateY(-50%)",
        transition: "all 0.2s ease",
        background: variant === "outlined" ? theme.background.default : "transparent", // Background for outlined variant
        padding: variant === "outlined" ? "0 4px" : "0", // Padding for outlined variant
        pointerEvents: "none",

        fontSize:  focused || filled ? "0.75rem" : "14px",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        letterSpacing: "0.15px",
        lineHeight: 1.5,
    }
});

// Container for the input and adornments
const InputContainer = styled.div<{
    variant: TextFieldVariants;
    error?: boolean;
    disabled?: boolean;
}>(({ theme, variant, error, disabled }) => {
    const mode: ThemeMode = theme.palette.mode === "dark" ? "dark" : "light";

    const commonStyles = {
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: "none",
        outline: "none",
        padding: variant === "standard" ? "14px 0px 2px 0px" : "20px 6px 4px 6px", // Default padding
        transition: "border-color 0.3s ease",
        background: "inherit",
        color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    };

    const variants = {
        outlined: {
            ...commonStyles,
            border: `1px solid ${error ? variantTextColors[mode]["error"] : theme.palette.primary.main}`,
            borderRadius: "12px",
            "&:hover": {
                borderColor: theme.palette.divider,
            },
        },
        filled: {
            ...commonStyles,
            background: theme.palette.action.hover,
            borderBottom: `2px solid ${error ? variantTextColors[mode]["error"] : theme.palette.divider}`,
            "&:hover": {
                borderBottomColor: theme.palette.divider,
            },
        },
        standard: {
            ...commonStyles,
            borderBottom: `1px solid ${error ? variantTextColors[mode]["error"] : theme.palette.divider}`,
            "&:focus-within": {
                borderBottomColor: theme.palette.primary.main,
            },
        },
    };

    return variants[variant];
});

// Helper text styling
const HelperText = styled.span<{ error?: boolean }>(({ theme, error }) => {
    const mode: ThemeMode = theme.palette.mode === "dark" ? "dark" : "light";

    return {
        fontSize: "0.75rem",
        marginTop: 4,
        color: error ? variantTextColors[mode]["error"] : theme.palette.text.secondary,
    };
});

// Styled Input
const StyledInput = styled.input<{
    rows?: number;
    disabled?: boolean;
}>(({ theme, disabled }) => ({
    flex: 1, // Allow the input to take up remaining space
    border: "none",
    outline: "none",
    background: "inherit",
    color: theme.palette.text.primary,
    fontSize: "16px",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    letterSpacing: "0.15px",
    lineHeight: 1.5,
    padding: 0,
    cursor: disabled ? "not-allowed" : "text",
}));

// Clear button styling
const ClearButton = styled.button(({ theme }) => ({
    background: "inherit",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    "&:hover svg": {
        color: theme.palette.action.hover,
    },
}));

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            id,
            label,
            variant = "outlined",
            fullWidth = false,
            error = false,
            helperText,
            disabled = false,
            multiline = false,
            rows = 1,
            startAdornment,
            endAdornment,
            onClear,
            showClearButton = false,
            value,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        const [filled, setFilled] = useState(!!value);

        useEffect(() => {
            setFilled(!!value || !!props.placeholder || !!props.defaultValue);
        }, [value, props.placeholder]);



        const handleFocus = () => setFocused(true);
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            setFilled(!!e.target.value || !!props.placeholder || !!props.defaultValue);
        };

        return (
            <Wrapper fullWidth={fullWidth} disabled={disabled}>
                <div style={{ position: "relative", width: "100%" }}>
                    {label && (
                        <Label htmlFor={id} focused={focused} filled={filled} error={error} disabled={disabled} variant={variant}>
                            {label}
                        </Label>
                    )}

                    <InputContainer
                        variant={variant}
                        error={error}
                        disabled={disabled}
                    >
                        {startAdornment && <div>{startAdornment}</div>}

                        <StyledInput
                            id={id}
                            as={multiline ? "textarea" : "input"}
                            disabled={disabled}
                            ref={ref}
                            value={value}
                            rows={rows}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            {...props}
                        />

                        {endAdornment && <div>{endAdornment}</div>}
                        {showClearButton && value && !disabled && (
                            <ClearButton onClick={onClear} aria-label="Clear">
                                <LYReactIcon icon={LYCloseIcon} size={LYIconSize.small} />
                            </ClearButton>
                        )}
                    </InputContainer>
                </div>

                {helperText && <HelperText error={error}>{helperText}</HelperText>}
            </Wrapper>
        );
    }
);