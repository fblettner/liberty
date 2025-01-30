import React, { useState, ReactNode, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { FaGripLinesVertical, FaGripLines } from "react-icons/fa6";

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 1;
`;

const PanelContent = styled(animated.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
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
  touch-action: none;
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

interface BiDimensionalResizableProps {
    rows: number; // Number of rows
    columns: number; // Number of columns
    children: ReactNode[][]; // Bi-dimensional array of children
}

export const AdvancedFlexPanels: React.FC<BiDimensionalResizableProps> = ({
    rows,
    columns,
    children,
}) => {
    const [rowSizes, setRowSizes] = useState<number[]>(
        Array(rows).fill(1 / rows)
    );
    const [columnSizes, setColumnSizes] = useState<number[][]>(
        Array(rows)
            .fill(null)
            .map(() => Array(columns).fill(1 / columns))
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const initialRowSizesRef = useRef<number[]>([...rowSizes]);
    const initialColumnSizesRef = useRef<number[][]>(
        JSON.parse(JSON.stringify(columnSizes))
    );

    const handleResize = useDrag(
        ({ args: [rowIdx, colIdx, type], movement: [mx, my], first }) => {
            const containerSize =
                type === "row"
                    ? containerRef.current?.offsetHeight || window.innerHeight
                    : containerRef.current?.offsetWidth || window.innerWidth;

            const newRowSizes = [...rowSizes];
            const newColumnSizes = JSON.parse(JSON.stringify(columnSizes)); // Deep clone

            if (first) {
                initialRowSizesRef.current = [...rowSizes];
                initialColumnSizesRef.current = JSON.parse(
                    JSON.stringify(columnSizes)
                );
            }

            if (type === "row") {
                // Handle vertical resizing
                const totalFlex = rowSizes[rowIdx] + rowSizes[rowIdx + 1];
                const delta = my / containerSize;

                const newSizeA = initialRowSizesRef.current[rowIdx] + delta;
                const newSizeB = totalFlex - newSizeA;

                if (newSizeA > 0.05 && newSizeB > 0.05) {
                    newRowSizes[rowIdx] = newSizeA;
                    newRowSizes[rowIdx + 1] = newSizeB;
                }

                setRowSizes(newRowSizes);
            } else if (type === "column") {
                // Handle horizontal resizing
                const rowColumns = columnSizes[rowIdx];
                const totalFlex = rowColumns[colIdx] + rowColumns[colIdx + 1];
                const delta = mx / containerSize;

                const newSizeA = initialColumnSizesRef.current[rowIdx][colIdx] + delta;
                const newSizeB = totalFlex - newSizeA;

                if (newSizeA > 0.05 && newSizeB > 0.05) {
                    newColumnSizes[rowIdx][colIdx] = newSizeA;
                    newColumnSizes[rowIdx][colIdx + 1] = newSizeB;
                }

                setColumnSizes(newColumnSizes);
            }
        }
    );

    const rowSprings = rowSizes.map((size) =>
        useSpring({
            flex: size,
            config: { tension: 170, friction: 26 },
        })
    );

    const columnSprings = columnSizes.map((rowColumns) =>
        rowColumns.map((size) =>
            useSpring({
                flex: size,
                config: { tension: 170, friction: 26 },
            })
        )
    );

    const [draggingItem, setDraggingItem] = useState<{ row: number; col: number } | null>(
        null
    );

    const handleDragStart = (row: number, col: number) => {
        setDraggingItem({ row, col });
    };

    const handleDrop = (targetRow: number, targetCol: number) => {
        if (!draggingItem) return;

        const { row: sourceRow, col: sourceCol } = draggingItem;

        // Swap the target and source items
        const updatedChildren = [...children];
        const temp = updatedChildren[sourceRow][sourceCol];
        updatedChildren[sourceRow][sourceCol] = updatedChildren[targetRow][targetCol];
        updatedChildren[targetRow][targetCol] = temp;

        setDraggingItem(null);
    };

    return (
        <FlexContainer ref={containerRef}>
            {rowSizes.map((_, rowIdx) => (
                <React.Fragment key={rowIdx}>
                    <animated.div style={rowSprings[rowIdx]}>
                        <RowContainer>
                            {columnSizes[rowIdx].map((_, colIdx) => (
                                <React.Fragment key={colIdx}>
                                    <PanelContent
                                        draggable
                                        onDragStart={() => handleDragStart(rowIdx, colIdx)}
                                        onDrop={() => handleDrop(rowIdx, colIdx)}
                                        onDragOver={(e) => e.preventDefault()}
                                        style={columnSprings[rowIdx][colIdx]} >
                                        {children[rowIdx][colIdx]}
                                    </PanelContent>
                                    {colIdx < columnSizes[rowIdx].length - 1 && (
                                        <ResizerButton
                                            direction="horizontal"
                                            {...handleResize(rowIdx, colIdx, "column")}
                                        >
                                            <FaGripLinesVertical className="resizer-icon" />
                                        </ResizerButton>
                                    )}
                                </React.Fragment>
                            ))}
                        </RowContainer>
                    </animated.div>
                    {rowIdx < rowSizes.length - 1 && (
                        <ResizerButton
                            direction="vertical"
                            {...handleResize(rowIdx, 0, "row")}
                        >
                            <FaGripLines className="resizer-icon" />
                        </ResizerButton>
                    )}
                </React.Fragment>
            ))}
        </FlexContainer>
    );
};