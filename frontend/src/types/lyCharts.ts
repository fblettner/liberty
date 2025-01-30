/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { IUsersProps } from "@ly_types/lyUsers";
import { IModulesProps } from "@ly_types/lyModules";

export enum EChartHeader {
    id = "CRT_ID",
    label = "CRT_LABEL",
    type = "CRT_TYPE",
    grid_hz = "CRT_GRID_HZ",
    grid_vt = "CRT_GRID_VT",
    axis_x = "CRT_AXIS_X",
    axis_y1 = "CRT_AXIS_Y1",
    axis_y2 = "CRT_AXIS_Y2",
    queryID = "CRT_QUERY_ID",
    series = "SERIES"
}

export interface IChartHeader {
    [EChartHeader.id]: number;
    [EChartHeader.label]: string;
    [EChartHeader.type]: string;
    [EChartHeader.grid_hz]: string;
    [EChartHeader.grid_vt]: string;
    [EChartHeader.axis_x]: string;
    [EChartHeader.axis_y1]: string;
    [EChartHeader.axis_y2]: string;
    [EChartHeader.queryID]: number;
    [EChartHeader.series]: string;
}

export enum EChartType {
    bar = "BarChart",
    pie = "PieChart",
    line = "LineChart"
}

export interface IChartsProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps;
    [EChartHeader.id]: number;
  }

export type AxisData = string[];
export type PieData = { value: number; label: string }[];

export const LYChartPalette = {
    light: [
      "#62A7C1", // Light teal blue
      "#8FA9B4", // Soft blue-grey
      "#D1E2E6", // Very light blue-grey
      "#A3CAD9", // Muted sky blue
      "#B4D5E3", // Pastel blue
      "#74B6C5", // Bright teal
      "#9EC1CE", // Light blue
      "#CAE7F2", // Pale icy blue
      "#8BB3C1", // Soft medium teal
      "#B2CFD9", // Soft pastel teal
    ],
    dark: [
      "#2C5364", // Base color - Teal Blue
      "#13232C", // Darker shade
      "#62A7C1", // Lighter than before
      "#8FA9B4", // Light variant
      "#D1E2E6", // Very light, almost pastel
      "#3A6B7E", // Muted blue-grey
      "#4A849C", // Slightly brighter teal
      "#0A1A20", // Deep dark variant
      "#285A6B", // Contrast medium shade
      "#6B8E96", // Medium-light teal
    ],
  };

