import React from "react";
import styled from "@emotion/styled";

// Props for Skeleton
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "rounded" | "rectangular" | "circular";
}

// Styled Skeleton
const StyledSkeleton = styled.div<SkeletonProps>(({ theme, width, height, variant }) => ({
  display: "inline-block",
  width: typeof width === "number" ? `${width}px` : width || "100%",
  height: typeof height === "number" ? `${height}px` : height || "16px",
  borderRadius: variant === "rounded" ? "12px" : variant === "circular" ? "50%" : "0px",
  background: theme.palette.mode === "dark"
    ? `linear-gradient(90deg, ${theme.backgroundShades.dark.start} 25%, ${theme.backgroundShades.dark.middle} 50%, ${theme.backgroundShades.dark.start} 75%)`
    : `linear-gradient(90deg, ${theme.backgroundShades.light.start} 25%, ${theme.backgroundShades.light.middle} 50%, ${theme.backgroundShades.light.start} 75%)`,
  animation: "skeleton-loading 1.5s infinite ease-in-out",
  "@keyframes skeleton-loading": {
    "0%": {
      backgroundPosition: "-200%",
    },
    "100%": {
      backgroundPosition: "200%",
    },
  },
}));

// Skeleton Component
export const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = "rounded" }) => {
  return <StyledSkeleton width={width} height={height} variant={variant} />;
};