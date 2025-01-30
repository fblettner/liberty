/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

// Props Interface
interface CircularProgressProps {
  size?: number;       // Diameter of the spinner
  thickness?: number;  // Stroke thickness
  color?: string;      // Spinner color
  trackColor?: string; // Background track color
  speed?: number;      // Spin speed in seconds
}

// Spinner Container
const SpinnerWrapper = styled.div<{ size: number }>(({ size }) => ({
  display: "inline-block",
  width: `${size}px`,
  height: `${size}px`,
  position: "relative",
}));

// Spinner Circle with function-based styling
const SpinnerCircle = styled.div<{
  size: number;
  thickness: number;
  color: string;
  speed: number;
}>(({ size, thickness, color, speed }) => ({
  boxSizing: "border-box",
  position: "absolute",
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: "50%",
  border: `${thickness}px solid transparent`,
  borderTopColor: color,
  animation: `spin ${speed}s linear infinite`,
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
}));

// Background Track
const SpinnerTrack = styled.div<{
  size: number;
  thickness: number;
  trackColor: string;
}>(({ size, thickness, trackColor }) => ({
  boxSizing: "border-box",
  position: "absolute",
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: "50%",
  border: `${thickness}px solid ${trackColor}`,
}));

// CircularProgress Component
export function CircularProgress({
  size = 40,
  thickness = 4,
  color,
  trackColor,
  speed = 1.2,
}: CircularProgressProps) {
    const theme = useTheme();

    // Use the provided color or fallback to theme.background.main
    const resolvedColor = color || theme.palette.primary.main;
    const resolvedTrackColor = trackColor || theme.palette.text.primary;
    
  return (
    <SpinnerWrapper size={size}>
      <SpinnerTrack size={size} thickness={thickness} trackColor={resolvedTrackColor} />
      <SpinnerCircle size={size} thickness={thickness} color={resolvedColor} speed={speed} />
    </SpinnerWrapper>
  );
}