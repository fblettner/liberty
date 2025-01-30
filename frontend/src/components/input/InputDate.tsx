/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import dayjs, { Dayjs } from "dayjs";
import { Popper } from "@ly_components/common/Popper";
import { Input } from "@ly_components/common/Input";

// Types
interface DatePickerProps {
    id: string
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    label?: string;
}

// Styled Components
const Wrapper = styled.div<{ fullWidth?: boolean }>(({ theme, fullWidth }) => ({
    position: "relative",
    display: "inline-block",
    width: fullWidth ? "100%" : "300px",
}));


const Dropdown = styled.div(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    marginTop: "4px",
    background: theme.palette.background.paper,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    zIndex: 10000,
    padding: theme.spacing(2),
    width: "400px",
}));

const Header = styled.div(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    cursor: "pointer",
}));

const Button = styled.button(({ theme }) => ({
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
}));

const DaysOfWeek = styled.div(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: "8px",
    textAlign: "center",
    fontWeight: "bold",
}));

const CalendarGrid = styled.div(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
}));

const DayCell = styled.div<{ isToday: boolean; isSelected?: boolean; disabled: boolean }>(
    ({ isToday, isSelected, disabled, theme }) => ({
        width: "36px",
        height: "36px",
        lineHeight: "36px",
        textAlign: "center",
        borderRadius: "50%",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isSelected ? theme.background.default : isToday ? theme.palette.primary.main : "transparent",
        color: isSelected ? "#fff" : disabled ? theme.palette.action.disabled : theme.palette.text.primary,
        "&:hover": {
            background: isSelected || disabled ? "transparent" : theme.background.default,
        },
    })
);

const YearGrid = styled.div(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
}));

const YearCell = styled.div<{ isSelected?: boolean }>(({ isSelected, theme }) => ({
    padding: "8px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "12px",
    background: isSelected ? theme.palette.primary.main : "transparent",
    color: isSelected ? "#fff" : theme.palette.text.primary,
    "&:hover": {
        background: isSelected ? theme.palette.primary.main : theme.background.default,
    },
}));

export const DatePicker: React.FC<DatePickerProps> = ({
    id,
    value,
    onChange,
    disabled = false,
    fullWidth = true,
    label
}) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(value || null);
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(value || dayjs());
    const [isOpen, setIsOpen] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Synchronize `value` prop with `selectedDate` state
    useEffect(() => {
        setSelectedDate(value || null);
        if (value) {
            setCurrentMonth(value); // Ensure the calendar opens to the correct month
        }
    }, [value]);

    // Open/Close Dropdown
    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen((prev) => !prev);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Generate days for the current month
    const generateDays = () => {
        const startOfMonth = currentMonth.startOf("month");
        const endOfMonth = currentMonth.endOf("month");
        const startOfWeek = startOfMonth.startOf("week");
        const endOfWeek = endOfMonth.endOf("week");


        const days = [];
        let day = startOfWeek;

        while (day.isBefore(endOfWeek)) {
            days.push(day);
            day = day.add(1, "day");
        }

        return days;
    };

    // Handle date selection
    const handleDateSelect = (day: Dayjs) => {
        setSelectedDate(day);
        setInputValue(day.format('MM/DD/YYYY'));
        setCurrentMonth(day);
        setIsOpen(false);
        onChange?.(day);
    };

    // Navigate months
    const handlePreviousMonth = () =>
        setCurrentMonth((prev) => prev.subtract(1, "month"));
    const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));

    const days = generateDays();
    const years = Array.from({ length: 12 }, (_, i) => currentMonth.year() - 6 + i);

    const handleYearSelect = (year: number) => {
        const newMonth = currentMonth.year(year);
        setCurrentMonth(newMonth);
        setShowYearPicker(false);
    };


    const dropdownContent = showYearPicker ? (
        <YearGrid>
            {years.map((year) => (
                <YearCell
                    key={year}
                    isSelected={year === currentMonth.year()}
                    onClick={() => handleYearSelect(year)}
                >
                    {year}
                </YearCell>
            ))}
        </YearGrid>
    ) : (
        <>
            <Header>
                <Button onClick={(e) => { e.stopPropagation(); handlePreviousMonth(); }} disabled={disabled}>
                    {"<"}
                </Button>
                <div
                    onClick={() => setShowYearPicker(true)} // Only toggle the year picker when clicking on the title
                    style={{ cursor: "pointer" }}
                >
                    {currentMonth.format("MMMM YYYY")}
                </div>
                <Button onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} disabled={disabled}>
                    {">"}
                </Button>
            </Header>

            <CalendarGrid>
                {days.map((day) => (
                    <DayCell
                        key={day.format("YYYY-MM-DD")}
                        isToday={day.isSame(dayjs(), "day")}
                        isSelected={selectedDate?.isSame(day, "day")}
                        disabled={!day.isSame(currentMonth, "month") || disabled}
                        onClick={() => handleDateSelect(day)}
                    >
                        {day.date()}
                    </DayCell>
                ))}
            </CalendarGrid>
        </>
    );

    const handleClear = () => {
        setSelectedDate(null);
        setInputValue("");
        setCurrentMonth(dayjs());
        onChange?.(null);
    };

    const [inputValue, setInputValue] = useState<string>(value ? value.format('MM/DD/YYYY') : "");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setInputValue(input);

        if (input.length === 10) {
            const inputDate = dayjs(input, "L", true);
            if (inputDate.isValid()) {
                setSelectedDate(inputDate);
                setCurrentMonth(inputDate);
                onChange?.(inputDate);
            } else {
                setSelectedDate(null);
                onChange?.(null);
            }
        }
    };

    return (
        <Wrapper fullWidth={fullWidth}>
            <Input
                id={id}
                label={label}
                ref={inputRef}
                variant="standard"
                value={inputValue}
                onClick={toggleDropdown}
                placeholder="MM/DD/YYYY"
                disabled={disabled}
                fullWidth
                showClearButton
                onClear={handleClear}
                onChange={handleInputChange}
            />

            {isOpen &&
                <Popper
                    open={Boolean(inputRef.current)}
                    anchorEl={inputRef.current}
                    onClose={() => setIsOpen(false)}
                    modal
                    placement='bottom-start'
                >
                    <Dropdown ref={dropdownRef}>{dropdownContent}</Dropdown>
                </Popper>
            }
        </Wrapper>
    );
};