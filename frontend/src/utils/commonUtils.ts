import { ThemeMode, SeverityVariant } from '@ly_components/types/common';
import { LYComponentEvent } from '@ly_types/lyComponents';
import { DialogKeys } from '@ly_types/lyDialogs';
import { IEnumOption } from '@ly_types/lyEnums';
import { ILookupOption } from '@ly_types/lyLookup';
import { ITableRow } from '@ly_types/lyTables';
import { VirtualElement } from '@popperjs/core';

export const getBoundingClientRectSafe = (element: HTMLElement | VirtualElement | null | undefined | (() => HTMLElement) | (() => VirtualElement)) => {
    if (element) {
        if (typeof element === 'function') {
            element = element(); // Call the function to get the element
        }
        if ('getBoundingClientRect' in element) {
            return element.getBoundingClientRect(); // Now it's safe to call
        }
    }
    throw new Error('Invalid element type: element does not have getBoundingClientRect');
};

export enum ESeverity {
    error = "error",
    warning = "warning",
    info = "info",
    success = "success"
}

export enum EStandardColor {
    primary = 'primary',
    secondary = 'secondary',
    error = 'error',
    info = 'info',
    success = 'success',
    warning = 'warning',
    inherit = 'inherit',
  }


export interface IErrorState {
    open: boolean;
    message: string;
    severity?: ESeverity;

}

export interface IDialogAction {
    event: LYComponentEvent;
    message: string;
    keys: DialogKeys;
}
export enum ActionsType {
    button = "button",
    event = "event"
}

export interface IReserveStatus {
    record: string;
    user: string;
    status: boolean;
}


export interface OnChangeParams {
    id: string;
    value: IContentValue;
    label: string;
    data: IEnumOption | ILookupOption | [];
}

export type IContentValue = string | number | Date | boolean | null | unknown ;

export type IRestData = Record<string, IContentValue>;

export enum EExportType {
    excel = "excel",
    pdf = "pdf",
    csv = "csv"
}


export interface IExportOptions {
    columns: 'allColumns' | 'visibleColumns';  // Group for columns
    header: 'columnId' | 'columnName';        // Group for options
    rows: 'selectedRows' | 'allRows' | 'visibleRows';  // Group for rows
}
export enum DIALOG_WIDGET_DIMENSION {
  width = 1000,
  height = 620
}
// Background Colors for Light and Dark Mode


export const variantBackgroundColors: Record<ThemeMode, Record<SeverityVariant, string>> = {
  light: {
    success: "#E6F4EA", // Soft green
    error: "#FDECEA", // Soft red
    warning: "#FFF4E5", // Soft orange
    info: "#E8F4FD", // Soft blue
  },
  dark: {
    success: "#1B3C28", // Deep green
    error: "#3B1F1F", // Dark red
    warning: "#4A3A18", // Dark amber
    info: "#1A2B3C", // Deep navy blue
  },
};
// Text Colors for Light and Dark Mode

export const variantTextColors: Record<ThemeMode, Record<SeverityVariant, string>> = {
  light: {
    success: "#2E7D32", // Green
    error: "#D32F2F", // Red
    warning: "#ED6C02", // Orange
    info: "#0288D1", // Blue
  },
  dark: {
    success: "#81C784", // Soft green
    error: "#E57373", // Soft red
    warning: "#FFB74D", // Soft amber
    info: "#64B5F6", // Soft blue
  },
};
// Default size

export enum LYIconSize {
  small = 18,
  medium = 24,
  large = 36,
  extra_large = 48
}
export function getThemeColor(theme: any, color: EStandardColor | string): string {
  const mode: ThemeMode = theme.palette.mode === "dark" ? "dark" : "light";

  switch (color) {
    case EStandardColor.primary:
      return theme.palette.primary.main;
    case EStandardColor.secondary:
      return theme.palette.secondary.main;
    case EStandardColor.error:
      return variantTextColors[mode][ESeverity.error];
    case EStandardColor.info:
      return variantTextColors[mode][ESeverity.info];
    case EStandardColor.success:
      return variantTextColors[mode][ESeverity.success];
    case EStandardColor.warning:
      return variantTextColors[mode][ESeverity.warning];
    case EStandardColor.inherit:
      return "inherit";
    default:
      return color; // Custom colors or HEX codes
  }
}
export const drawerWidth = 300;
export const headerHeight = 58;
export const tabHeight = 48;
export const footerHeight = 0;
export const toolbarWidth = 40;
export const toolbarHeight = 40;
export const uploadFileHeight = 120;



