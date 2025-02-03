import React, {
    useState,
    useEffect,
    ChangeEvent,
    ReactNode,
    forwardRef,
    useRef,
} from "react";
import styled from "@emotion/styled";
import { Div_AutoCompleteInput } from "@ly_components/styles/Div";
import { Input } from "@ly_components/common/Input";
import { Popper } from "@ly_components/common//Popper";
import { MenuItem } from "@ly_components/common//Menus";
import { Menu_Filters } from "@ly_components/styles/Menus";
import { DefaultZIndex } from "@ly_components/types/common";

// Define Props similar to MUI Autocomplete with a custom PopperComponent
interface SelectProps {
    id: string;
    label?: string;
    options?: any[];
    loading?: boolean;
    freeSolo?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    value: any;
    onChange?: (event: any, value: any) => void;
    onInputChange?: (event: ChangeEvent<HTMLInputElement>, value: string, reason: string) => void;
    getOptionLabel?: (option: any) => string;
    onOpen?: () => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    variant?: "outlined" | "filled" | "standard";
    PopperComponent?: React.ElementType<any>;
    popperProps?: any;
    children?: ReactNode;
    disablePortal?: boolean;
    zIndex?: number;
    showClearButton?: boolean;
    selectOnly?: boolean;
}

// Styled Input Wrapper
const InputWrapper = styled(Div_AutoCompleteInput)<{ fullWidth?: boolean }>(({ fullWidth }) => ({
    width: fullWidth ? "100%" : "300px",
    position: "relative",
}));


export const Select = forwardRef<HTMLInputElement, SelectProps>(({
    id,
    label,
    options,
    loading = false,
    freeSolo = false,
    disabled = false,
    fullWidth = false,
    value,
    onChange,
    onInputChange,
    getOptionLabel = (option) => option.label || option,
    onOpen,
    onBlur,
    onFocus,
    variant = "outlined",
    PopperComponent,
    popperProps,
    children,
    disablePortal = false,
    zIndex = DefaultZIndex.Select,
    showClearButton = true,
    selectOnly = false
}, ref) => {
    const [inputValue, setInputValue] = useState<string | null>(getOptionLabel(value || ""));
    const [isTyping, setIsTyping] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    // Close Popper on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (ref && "current" in ref && ref.current && !ref.current.contains(target)) {
                ref.current.blur();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    useEffect(() => {
        if (!isTyping) {
            if (value) {
                // Find the matching option
                const selectedOption = options?.find((option) => option.value === value);
                setInputValue(selectedOption ? selectedOption.label : getOptionLabel(value));
            } else {
                setInputValue(''); // Clear input if no value
            }
        }
    }, [value, options, isTyping]);


    // Open Popper on focus
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setOpen(true);
        onFocus?.(event);
        onOpen?.();
        setAnchorEl(event.currentTarget);
    };

    // Close Popper on blur
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsTyping(false);
        setOpen(false);
        onBlur?.(event);
    };

    // Handle input change
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setIsTyping(true);
        setInputValue(newValue);
        onInputChange?.(event, newValue, "input");
        if (freeSolo && onChange) {
            onChange(event, newValue);
        }
    };

    const handleClear = () => {
        setInputValue("");
        onChange?.(null, null);
        onInputChange?.({ target: { value: "" } } as ChangeEvent<HTMLInputElement>, "", "clear");
        if (ref && "current" in ref && ref.current) {
            ref.current.focus();
        }
    };

    // Render Options or Children
    const renderOptions = () => {
        const optionsList = (
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setOpen(false)}
                modal
                placement='bottom-start'
                style={{
                    width: "600px", // Use column width if larger than minWidth (300)
                }}
            >
                <Menu_Filters
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    placement='bottom-start'
                    zIndex={zIndex + 1 }
                    onClose={() => setOpen(false)}
                    
                >
                    {children ||
                        options?.map((option, index) => (
                            <MenuItem

                                key={index}
                                onClick={() => {
                                    setOpen(false);
                                    onChange?.(null, option);
                                }}

                            >
                                {getOptionLabel(option)}
                            </MenuItem>
                        ))}
                </Menu_Filters>
            </Popper>
        );

        // Render inline if disablePortal is true
        return (
            <Popper
                open={open}
                anchorEl={anchorEl}
                disablePortal={disablePortal}
                placement="bottom-start"
            >
                {optionsList}
            </Popper>
        )
    };


    return (
        <InputWrapper fullWidth={fullWidth} >
            <Input
                id={id}
                label={label}
                variant={variant}
                ref={ref}
                value={inputValue ?? ""}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={PopperComponent ? handleBlur : undefined}
                onChange={handleInputChange}
                fullWidth={fullWidth}
                onClear={handleClear}
                showClearButton={!!inputValue && showClearButton}
                autoComplete="off"
                readOnly={selectOnly}
            />

            {/* Render the custom PopperComponent */}
            {open && PopperComponent && !loading ? (
                <PopperComponent
                    {...popperProps}
                    open={open}
                    anchorEl={ref && "current" in ref ? ref.current : null}
                    onClose={handleBlur}
                />
            ) : (
                open && !loading && (

                    renderOptions()

                )
            )}
        </InputWrapper>
    );
});