/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { t } from "i18next";

// Custom Import
import { Div_Export, Div_ExportGroup } from '@ly_components/styles/Div';
import { EExportType, IExportOptions } from "@ly_utils/commonUtils";
import { LYThumbDownOffIcon, LYThumbUpIcon } from "@ly_styles/icons";
import { Typo_ExportTitle } from "@ly_components/styles/Typography";
import { Paper_Popup } from "@ly_components/styles/Paper";
import { Dialog_Actions, Dialog_Content, Dialog_Title } from "@ly_components/styles/Dialog";
import { Dialog } from "@ly_components/common/Dialog";
import { Button } from "@ly_components/common/Button";
import { Toggle, ToggleGroup } from "@ly_components/common//Toggle";

interface IExportContent {
    exportType: EExportType;
    exportOptions: IExportOptions;
    setExportOptions: React.Dispatch<React.SetStateAction<IExportOptions>>;
}


// content to display depending of the type of the export
// if Excel, display to choose to export column name or column id, and if all columns are exported or only visible columns

export const ExportContent = (props: IExportContent) => {
    const { exportType, exportOptions, setExportOptions } = props;

    const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null, group: string) => {
        if (newValue) { // Ignore if newValue is null (i.e., trying to deselect)
          setExportOptions((prev) => ({
            ...prev,
            [group]: newValue,
          }));
        }
      };

    return (
        <Div_Export>
        {/* Header Selection */}
        <Div_ExportGroup>
          <Typo_ExportTitle>
            {t('dialogs.export.header')}
          </Typo_ExportTitle>
          <ToggleGroup
            value={exportOptions.header}
            exclusive
            onChange={(e, newValue) => handleChange(e, newValue, 'header')}
          >
            <Toggle value="columnName">
              {t('dialogs.export.columnName')}
            </Toggle>
            <Toggle value="columnId">
              {t('dialogs.export.columnId')}
            </Toggle>
          </ToggleGroup>
        </Div_ExportGroup>
  
        {/* Column Selection */}
        <Div_ExportGroup>
          <Typo_ExportTitle>
            {t('dialogs.export.header')}
          </Typo_ExportTitle>
          <ToggleGroup
            value={exportOptions.columns}
            exclusive
            onChange={(e, newValue) => handleChange(e, newValue, 'columns')}
          >
            <Toggle value="allColumns">
              {t('dialogs.export.allColumns')}
            </Toggle>
            <Toggle value="visibleColumns">
              {t('dialogs.export.visibleColumns')}
            </Toggle>
          </ToggleGroup>
        </Div_ExportGroup>
  
        {/* Row Selection */}
        <Div_ExportGroup>
          <Typo_ExportTitle>
            {t('dialogs.export.rows')}
          </Typo_ExportTitle>
          <ToggleGroup
            value={exportOptions.rows}
            exclusive
            onChange={(e, newValue) => handleChange(e, newValue, 'rows')}

          >
            <Toggle value="allRows">
              {t('dialogs.export.allRows')}
            </Toggle>
            <Toggle value="visibleRows">
              {t('dialogs.export.visibleRows')}
            </Toggle>
            <Toggle value="selectedRows">
              {t('dialogs.export.selectedRows')}
            </Toggle>
          </ToggleGroup>
        </Div_ExportGroup>
      </Div_Export>
    );
}

interface IDialogExport {
    open: boolean;
    exportType: EExportType;
    onClose: () => void;
    onAccept: () => void;
    onDecline: () => void;
    exportOptions: IExportOptions;
    setExportOptions: React.Dispatch<React.SetStateAction<IExportOptions>>;
}

export const DialogExport = ({
    open,
    exportType,
    onClose,
    onAccept,
    onDecline,
    exportOptions,
    setExportOptions,
}: IDialogExport) => {

    return (
        <Dialog open={open} onClose={onClose}>
            <Paper_Popup >
                <Dialog_Title>{t("dialogs.export.options")}</Dialog_Title>
                <Dialog_Content>
                    <ExportContent exportType={exportType} exportOptions={exportOptions} setExportOptions={setExportOptions} />
                </Dialog_Content>
                <Dialog_Actions>
                    <Button variant="outlined" onClick={onDecline} startIcon={LYThumbDownOffIcon}>
                        {t('button.no')}
                    </Button>
                    <Button variant="outlined" onClick={onAccept} startIcon={LYThumbUpIcon}>
                        {t('button.yes')}
                    </Button>
                </Dialog_Actions>
            </Paper_Popup>
        </Dialog>
    );
}
