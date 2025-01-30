import React, { ReactNode, useState, useRef } from "react";
import styled from "@emotion/styled";
import ReactDOM from "react-dom";
import { DefaultZIndex } from "@ly_components/types/common";

interface TooltipProps {
    title: string;
    children: ReactNode;
}

// Styled Tooltip Content
const TooltipContent = styled.div<{ visible: boolean; position: { top: number; left: number } }>(
    ({ theme, visible, position }) => ({
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: visible ? "visible" : "hidden",
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        padding: "6px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        whiteSpace: "nowrap",
        zIndex: DefaultZIndex.Tooltip,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
    })
);

// Tooltip Component using Portal
export const Tooltip = (props: TooltipProps) => {
    const { title, children } = props;
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({
                top: rect.top - 30, // Adjust vertically
                left: rect.left + rect.width / 2, // Center horizontally
            });
        }
        setVisible(true);
    };

    const hideTooltip = () => setVisible(false);

    return (
        <>
            <div
                ref={wrapperRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                style={{ display: "inline-block" }}
            >
                {children}
            </div>

            {ReactDOM.createPortal(
                <TooltipContent visible={visible} position={position}>
                    {title}
                </TooltipContent>,
                document.body
            )}
        </>
    );
};