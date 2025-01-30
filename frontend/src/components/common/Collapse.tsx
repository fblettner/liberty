import React, { ReactNode, useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";

// Props for the Collapse component
interface CollapseProps {
    in: boolean;                 // Controls whether the content is expanded or collapsed
    children: ReactNode;         // Content inside the Collapse
    timeout?: number;            // Duration of the transition (in ms)
    collapsedHeight?: string;    // Height when collapsed (default is "0px")
}

// Styled wrapper for the Collapse transition
const StyledCollapse = styled.div<{
    expanded: boolean;
    collapsedHeight: string;
    timeout: number;
}>(({ expanded, collapsedHeight, timeout }) => ({
    overflow: "hidden",
    height: expanded ? "auto" : collapsedHeight,
    transition: `height ${timeout}ms ease`,
}));

// Collapse Component

export const Collapse = (props: CollapseProps) => {
    const { in: expanded, children, timeout = 0, collapsedHeight = "0px" } = props;
    const [height, setHeight] = useState<string>(collapsedHeight);
    const contentRef = useRef<HTMLDivElement>(null);

    // Adjust height on expand/collapse
    useEffect(() => {
        if (expanded && contentRef.current) {
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(`${contentHeight}px`);

            // Reset to 'auto' after animation for dynamic content
            const timeoutId = setTimeout(() => setHeight("auto"), timeout);
            return () => clearTimeout(timeoutId);
        } else {
            setHeight(collapsedHeight);
        }
    }, [expanded, collapsedHeight, timeout]);

    return (
        <StyledCollapse
            expanded={expanded}
            collapsedHeight={collapsedHeight}
            timeout={timeout}
            style={{ height }}
        >
            <div ref={contentRef}>{children}</div>
        </StyledCollapse>
    );
};