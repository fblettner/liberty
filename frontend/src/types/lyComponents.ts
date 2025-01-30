/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
/* LY_COMPONENTS */


import { IFiltersProperties } from "@ly_types/lyFilters";
import { ESessionMode } from "@ly_types/lyApplications";
import { ITableHeader } from "@ly_types/lyTables";
import { IContentValue } from "@ly_utils/commonUtils";
import { IDialogsTab } from "@ly_types/lyDialogs";

export interface IComponentParameters {
  field: string;
  value: IContentValue;
}

/* Component properties */
/* Properties are used by all components */
/* Data is pass through components properties */
/* Component are stored into an array when displaying content to keep all previous component to go back */
export type ComponentProperties = {
  id: number;
  type: LYComponentType;
  label: string;
  filters: IFiltersProperties[];
  previous?: ComponentProperties;
  showPreviousButton: boolean;
  componentMode: LYComponentMode;
  tableProperties?: ITableHeader;
  initialState?: string,
  isChildren: boolean,
  filterStringDLG?: string,
  currentTab?: IDialogsTab,
  params?: IComponentParameters[],
  sessionMode?: ESessionMode;
  overrideQueryPool?: string;
}

export enum LYComponentEvent {
  Reset = "RESET",
  ColumnsFilter = "FILTER",
  GoPrevious = "PREVIOUS",
  ExcelDownload = "XLSX_DOWNLOAD",
  PDFDownload = "PDF_DOWNLOAD",
  ExcelUpload = "XLSX_UPLOAD",
  Cancel = "CANCEL",
  displayHelp = "HELP",
  Done = "DONE",
  Delete = "DELETE",
  Save = "SAVE",
  SaveClose = "SAVE_CLOSE",
  none = "NONE",
  MenuAction = "MENUS_ACTIONS"
}

export enum LYComponentMode {
  add = "ADD",
  edit = "EDIT",
  copy = "COPY",
  reorder = "REORDER",
  batch = "BATCH",
  find = "FIND",
  import = "IMPORT",
  search = "SEARCH",
  chat = "CHAT",
  standard = "STANDARD"
}

export enum LYComponentType {
  AppsLoginPage = "AppsLoginPage",
  FormsTable = "FormsTable",
  Dictionary = "DD",
  AppsFooter = "AppsFooter",
  AppsLoginMenu = "AppsLoginMenu",
  DialogsUpload = "DialogsUpload",
  FormsDialog = "FormsDialog",
  FormsUpload = "FormsUpload",
  InputAction = "InputAction",
  FormsTree = "FormsTree",
  FormsList = "FormsList",
  FormsChart = "FormsChart",
  FormsDashboard = "FormsDashboard",
  FormsGrid = "FormsGrid",
  FormsAI = "FormsAI",
  FormsTools = "FormsTools"
}

export enum LYComponentDisplayMode {
  dashboard = "dashboard",
  component = "component",
}

export enum LYComponentViewMode {
  table = "table",
  tree = "tree",
  list = "list",
  grid = "grid"
}