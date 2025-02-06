/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import styled from "@emotion/styled";
import { useDeviceDetection, useMediaQuery } from "@ly_components/common//UseMediaQuery";

// Styled Grid Item
interface GridItemProps {
    size?: number | { xs?: number; sm?: number; md?: number; lg?: number };
    columnSpan?: number | { xs?: number; sm?: number; md?: number; lg?: number };
}

// Styled Grid Container
export const GridContainer = styled.div<{ spacing?: number; py?: number; px?: number; columns?: number | { xs?: number; sm?: number; md?: number; lg?: number } }>(
    ({ spacing = 2, py = 0, px = 0, columns = 1 }) => {

        const isSmallScreen = useMediaQuery("(min-width: 600px)");
        const isMobile = useDeviceDetection();
        const isMediumScreen = useMediaQuery("(min-width: 960px)");
        const isLargeScreen = useMediaQuery("(min-width: 1280px)");
        let cols: number = 1;

        if (typeof columns === "number") {
            cols = columns ?? 1;
        } else if (columns) {
            cols = columns.xs ?? 1;
            if (isSmallScreen || isMobile) {
                cols = columns.sm || cols;
            }
            if (isMediumScreen && !isMobile) {
                cols = columns.md || cols;
            }
            if (isLargeScreen && !isMobile) {
                cols = columns.lg || cols;
            }
        }
        
        return {
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`, // Define the number of columns
            gap: `${spacing * 8}px`, // Spacing between items
            padding: `${py * 8}px ${px * 8}px`,
            width: "100%",
            overflow: "auto",
            
        }
    })


export const GridFlexContainer = styled.div<{
    spacing?: number;
    py?: number;
    px?: number;
    flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
    resizable?: boolean;
}>(({ spacing = 2, py = 0, px = 0, flexDirection, resizable }) => {
    return {
        display: "flex",
        flexWrap: "wrap", 
        flexDirection: flexDirection || "row",
        gap: `${spacing * 8}px`,
        padding: `${py * 8}px ${px * 8}px`,
        width: "100%",
        height: resizable ? "100%" : "auto",
        boxSizing: "border-box",

    };
});

export const GridItem = styled.div<GridItemProps & { spacing?: number }>(
    ({ size, spacing = 2 }) => {
      const isSmallScreen = useMediaQuery("(min-width: 600px)");
      const isMobile = useDeviceDetection();
      const isMediumScreen = useMediaQuery("(min-width: 960px)");
      const isLargeScreen = useMediaQuery("(min-width: 1280px)");
  
      const gapPx = 22; // Gap in px
  
      // Calculate width including gap
      const calculateWidth = (cols: number | undefined) => {
        if (cols && cols === 12) {
          return "100%";
        }
        return cols ? `calc(${(cols / 12) * 100}% - ${gapPx}px)` : `calc(100% - ${gapPx}px)`;
      };
  
      let flexBasis = "100%";
  
      if (typeof size === "number") {
        flexBasis = calculateWidth(size);
      } else if (size) {
        flexBasis = calculateWidth(size.xs);
        if ((isSmallScreen || isMobile) && size.sm) {
          flexBasis = calculateWidth(size.sm) || flexBasis;
        }
        if (isMediumScreen && !isMobile && size.md) {
          flexBasis = calculateWidth(size.md) || flexBasis;
        }
        if (isLargeScreen && !isMobile && size.lg) {
          flexBasis = calculateWidth(size.lg) || flexBasis;
        }
      }
  
      return {
        flex: `0 0 ${flexBasis}`,
        maxWidth: flexBasis, 
        boxSizing: "border-box", 

        
      };
    }
  );


  export const DashboardGridItem = styled.div<GridItemProps & { spacing?: number }>(
    ({ size, spacing = 2 }) => {
    return {
    flex: "1 1 0px", 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden", 
    boxSizing: "border-box",
    height: "100%"
  };
}
);