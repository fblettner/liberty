import React, { useState, ReactNode, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { FaGripLinesVertical, FaGripLines } from "react-icons/fa6";
import { useDeviceDetection, useMediaQuery } from "@ly_components/common//UseMediaQuery";

const FlexContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ direction: "horizontal" | "vertical"; isMobile?: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.direction === "horizontal" ? "row" : "column")};
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  /* Add gap only for mobile */
  gap: ${(props) => (props.isMobile ? "16px" : "0")}; // Adjust '16px' as needed
`;

const FlexPanel = styled(animated.div, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.isMobile ? "100%" : "auto")}; /* Full width on mobile */
  height: ${(props) => (props.isMobile ? "100dvh" : "auto")}; /* Full height of viewport on mobile */
  overflow: ${(props) => (props.isMobile ? "auto" : "hidden")}; /* Enable scrolling for content on mobile */
  box-sizing: border-box; /* Ensure padding/border doesn't affect dimensions */
`;

const ResizerButton = styled.div<{ direction: "horizontal" | "vertical" }>`
  ${(props) =>
        props.direction === "horizontal"
            ? `
        width: 28px;
        cursor: col-resize;
        padding-left: 8px;
        padding-right: 8px;
      `
            : `
        height: 28px;
        cursor: row-resize;
        padding-top: 8px;
        padding-bottom: 8px;
      `}
  box-sizing: border-box;
  background: transparent;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: "";
    ${(props) =>
        props.direction === "horizontal"
            ? `
          width: 0;
          height: 40%;
          border-left: 1px dashed rgba(0, 0, 0, 0.5);
        `
            : `
          width: 40%;
          height: 0;
          border-top: 1px dashed rgba(0, 0, 0, 0.5);
        `}
    position: absolute;
    transition: border-color 0.2s ease, size 0.2s ease;
  }

  .resizer-icon {
    color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
    transition: color 0.2s ease, transform 0.2s ease;
    z-index: 2;
  }

    &:hover::before {
        border-color: rgba(0, 0, 0, 0.5); /* Highlight on hover */
        ${(props) =>
        props.direction === "horizontal"
            ? `
               height: 50%; /* Slightly taller for hover feedback */
            `
            : `
              width: 50%; /* Slightly taller for hover feedback */
            `}
    }

  &:hover .resizer-icon {
    color: rgba(0, 0, 0, 0.7);
    transform: scale(1.3);
  }
`;

interface ResizableFlexPanelsProps {
    panels: number[]; // Array of initial flex sizes for each panel
    children: ReactNode[]; // Children components for each panel
    direction?: "horizontal" | "vertical";
    dragEnabled?: boolean;
}


export const FlexPanels: React.FC<ResizableFlexPanelsProps> = ({
    panels,
    children,
    direction = "horizontal",
    dragEnabled = false,
}) => {
    const isSmallScreen = useMediaQuery("(max-width:600px)"); 
    const isMobile = useDeviceDetection();
    const allChildren = React.Children.toArray(children);
    const [flexSizes, setFlexSizes] = useState<number[]>(panels);
    const containerRef = useRef<HTMLDivElement>(null);
    const initialSizesRef = useRef<number[]>([...flexSizes]);

    // State to manage the order of children
    const [childOrder, setChildOrder] = useState<ReactNode[]>([]);

    // Keep childOrder in sync with children
    useEffect(() => {
      setChildOrder(React.Children.toArray(children));
    }, [children]);

    
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Allow dropping
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        event.preventDefault();
        if (draggingIndex === null) return;

        // Update the order of children
        const updatedOrder = [...childOrder];
        const [draggedItem] = updatedOrder.splice(draggingIndex, 1);
        updatedOrder.splice(targetIndex, 0, draggedItem);

        setChildOrder(updatedOrder);
        setDraggingIndex(null);
    };

    const bindDrag = useDrag(
        ({ offset: [offsetX, offsetY], args: [index], first }) => {
            if (isMobile || isSmallScreen) return;

            const containerSize = (
                direction === "horizontal"
                    ? containerRef.current?.offsetWidth || window.innerWidth
                    : containerRef.current?.offsetHeight || window.innerHeight)

            setFlexSizes((sizes) => {
                const totalFlex = sizes[index] + sizes[index + 1];

                if (first) {
                    initialSizesRef.current = [...sizes];
                }

                const initialSize = initialSizesRef.current[index];
                const initialOffset = (initialSize / totalFlex) * containerSize;
                const adjustedOffset = initialOffset + (direction === "horizontal" ? offsetX : offsetY);

                const relativeSize = Math.min(Math.max(adjustedOffset / containerSize, 0), 1);
                const newFlex = relativeSize * totalFlex;

                const newSizes = [...sizes];
                newSizes[index] = Math.max(newFlex, 0.1); // Ensure minimum size
                newSizes[index + 1] = Math.max(totalFlex - newFlex, 0.1); // Ensure minimum size

                return newSizes;
            });
        },
        { axis: direction === "horizontal" ? "x" : "y" }
    );

    const springs = flexSizes.map((size) =>
        useSpring({
            flex: size,
            config: { tension: 170, friction: 26 },
        })
    );

    return (
        <FlexContainer
            ref={containerRef}
            direction={isMobile || isSmallScreen ? "vertical" : direction}
            isMobile={isMobile || isSmallScreen}
        >
            {childOrder.map((child, index) => (
                <React.Fragment key={index}>
                    <FlexPanel
                        isMobile={isMobile || isSmallScreen}
                        style={isMobile || isSmallScreen ? {} : springs[index]} 
                        draggable={!isMobile && !isSmallScreen && dragEnabled} 
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(event) => handleDrop(event, index)}
                    >
                        {child}
                    </FlexPanel>
                    {!isMobile && !isSmallScreen && index < childOrder.length - 1 && (
                        <ResizerButton
                            {...bindDrag(index)}
                            direction={direction}
                            style={{ touchAction: "none" }}
                        >
                            {direction === "horizontal" ? (
                                <FaGripLinesVertical className="resizer-icon" />
                            ) : (
                                <FaGripLines className="resizer-icon" />
                            )}
                        </ResizerButton>
                    )}
                </React.Fragment>
            ))}
        </FlexContainer>
    );
};