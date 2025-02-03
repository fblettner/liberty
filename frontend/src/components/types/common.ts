
//---------------------------------------------

import { createContext, useContext } from "react";

// Define Theme Modes
export type SeverityVariant = "success" | "error" | "warning" | "info";
export type TextFieldVariants = 'outlined' | 'standard' | 'filled';
export type ThemeMode = "light" | "dark";

export interface AnchorPosition {
    top: number;
    left: number;
  }

export enum DefaultZIndex {
    Component = 1000,
    Dialog = 2000,
    Modal = 3000,
    Menus = 4000,
    Select = 5000,
    Tooltip = 6000,
    Snack = 9999
}

/**
 * Applies alpha (opacity) to a given HEX or RGB color.
 * @param color - The base color in HEX or RGB format.
 * @param opacity - The opacity value between 0 (transparent) and 1 (opaque).
 * @returns A color string in RGBA format.
 */
export function alpha(color: string, opacity: number): string {
  // Ensure opacity is between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  // If color is already in rgba format, just replace the alpha value
  if (color.startsWith("rgba")) {
      return color.replace(/rgba\((\d+), (\d+), (\d+), [^)]+\)/, `rgba($1, $2, $3, ${clampedOpacity})`);
  }

  // If color is in rgb format, convert to rgba
  if (color.startsWith("rgb")) {
      return color.replace(/rgb\((\d+), (\d+), (\d+)\)/, `rgba($1, $2, $3, ${clampedOpacity})`);
  }

  // If color is HEX, convert it to RGB
  if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      let r = 0, g = 0, b = 0;

      if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
      }

      return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
  }

  // If the color format is unsupported, return the color as-is
  return color;
}
export const useZIndex = () => useContext(ZIndexContext);export const ZIndexContext = createContext<{
  getNextZIndex: () => number;
  resetZIndex: () => void;
}>({
  getNextZIndex: () => DefaultZIndex.Modal,
  resetZIndex: () => { },
});

