/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
/** 
 * @ojmetadata version "5.0.0"
 * @ojmetadata displayName "Tools Excel"
 * @ojmetadata description "Module import/export Excel"
*/

import { ToolsDictionary } from '@ly_services/lyDictionary';
import { EDictionaryType } from '@ly_types/lyDictionary';
import { ETableHeader, ITableHeader, ITableRow, TablesGridHardCoded } from '@ly_types/lyTables';

import { parseISO } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { IContentValue } from '@ly_utils/commonUtils';
import { Column } from '@tanstack/react-table';

export class Excel {
    gridData: ITableRow[];
    columnData: Column<ITableRow, IContentValue>[];
    tableProperties: ITableHeader;
    xlsxColumnID: boolean;

    constructor(exportDP: ITableRow[], columnDP: Column<ITableRow, IContentValue>[], tableProperties: ITableHeader, xlsxColumnID: boolean) {
        this.gridData = exportDP.map((object) => ({ ...object }));
        this.columnData = columnDP.map((object) => ({ ...object }));
        this.tableProperties = tableProperties;
        this.xlsxColumnID = xlsxColumnID;
    }

    public export = async () => {
        if (this.gridData.length === 0) return;
        this.gridData.map((item) => {
            Object.keys(item).map((key) => {
                if (!this.columnData.map((column) => column.columnDef["accessorKey"]).includes(key)) {
                    delete item[key];
                } else {
                    const column = this.columnData.filter((columns) => columns.columnDef.accessorKey === key && columns.id !== 'actions')[0];
                    if ((column.columnDef.type === EDictionaryType.date || column.columnDef.type === EDictionaryType.jdedate) && item[key] !== null) {
                        item[key] = (column.columnDef.type === EDictionaryType.jdedate)
                            ? ToolsDictionary.JdeToDate(item[key] as number)
                            : parseISO(item[key] as string);
                    }
                }
            });
            return item;
        });

        const xlsColumnRename = (worksheet: ExcelJS.Worksheet) => {
            if (!this.xlsxColumnID) {
                worksheet.columns = this.columnData.filter((columns) => columns.id !== 'actions').map((column) => ({
                    header: column.columnDef.header,
                    key: column.columnDef.accessorKey,

                }));
            } else {
                worksheet.columns = this.columnData.filter((columns) => columns.id !== 'actions').map((column) => ({
                    header: column.columnDef.accessorKey,
                    key: column.columnDef.accessorKey,
                    width: 15,
                }));
            }
            // Apply header styles (background color and border)
            worksheet.getRow(1).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '2A3A44' }, // Yellow background for the header
                };
                cell.font = {
                    bold: true,
                    color: { argb: 'FFFFFF' }, // Red text color for the header
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            // Apply borders to all other cells
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) { // Skip header row
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                }
            });

        };

        function DateFormat() {
            return new Date().toISOString().slice(0, 10);
        }

        const workbook = new ExcelJS.Workbook();

        if (this.tableProperties[ETableHeader.burst]) {
            let jsonData: ITableRow[] = [];
            let workbookName = '';
            let sheetName = '';

            if (this.tableProperties[ETableHeader.workbook] !== null && this.tableProperties[ETableHeader.sheet] !== null)
                this.gridData.sort((a, b) => (a[this.tableProperties[ETableHeader.workbook]] as string).toString().localeCompare((b[this.tableProperties[ETableHeader.workbook]] as string).toString())
                    || (a[this.tableProperties[ETableHeader.sheet]] as string).toString().localeCompare((b[this.tableProperties[ETableHeader.sheet]] as string).toString()));
            else
                if (this.tableProperties[ETableHeader.workbook] !== null)
                    this.gridData.sort((a, b) => (a[this.tableProperties[ETableHeader.workbook]] as string).toString().localeCompare((b[this.tableProperties[ETableHeader.workbook]] as string).toString()));
                else
                    if (this.tableProperties[ETableHeader.sheet] !== null)
                        this.gridData.sort((a, b) => (a[this.tableProperties[ETableHeader.sheet]] as string).toString().localeCompare((b[this.tableProperties[ETableHeader.sheet]] as string).toString()));


            const sleepV2 = (ms: number | undefined) => new Promise(r => setTimeout(r, ms));

            for (let i = 0; i < this.gridData.length; i++) {
                const data = this.gridData[i];
                let defaultWorkbook = (this.tableProperties[ETableHeader.workbook] === null) ? this.tableProperties[ETableHeader.description] as string: data[this.tableProperties[ETableHeader.workbook]] as string;
                let defaultSheet = (this.tableProperties[ETableHeader.sheet] === null) ? "export" : data[this.tableProperties[ETableHeader.sheet]] as string;

                if (defaultWorkbook === workbookName || workbookName === '') {
                    workbookName = defaultWorkbook;

                    if (defaultSheet === sheetName || sheetName === '') {
                        sheetName = defaultSheet;
                        jsonData.push(data);
                    } else {
                        const worksheet = workbook.addWorksheet(sheetName);
                        worksheet.addRows(jsonData);
                        xlsColumnRename(worksheet);
                        jsonData = [];
                        jsonData.push(data);
                        sheetName = defaultSheet;
                    }
                } else {
                    const worksheet = workbook.addWorksheet(sheetName);
                    xlsColumnRename(worksheet);
                    worksheet.addRows(jsonData);
                    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
                    const buffer = await workbook.xlsx.writeBuffer();
                    saveAs(new Blob([buffer]), workbookName + '_' + DateFormat() + '.xlsx');
                    await sleepV2(500);
                    jsonData = [];
                    jsonData.push(data);
                    workbookName = defaultWorkbook;
                    sheetName = defaultSheet;
                }
            }

            const finalWorksheet = workbook.addWorksheet(sheetName);
            xlsColumnRename(finalWorksheet);
            finalWorksheet.addRows(jsonData);
            finalWorksheet.views = [{ state: 'frozen', ySplit: 1 }];
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), workbookName + '_' + DateFormat() + '.xlsx');
        } else {
            const worksheet = workbook.addWorksheet('export');
            xlsColumnRename(worksheet);
            worksheet.addRows(this.gridData);
            worksheet.views = [{ state: 'frozen', ySplit: 1 }];
            // Apply autosize for each column
            worksheet.columns.forEach((column) => {
                let maxLength = 10; // Start with a default minimum width

                if (column.eachCell !== undefined) {
                    column.eachCell({ includeEmpty: true }, (cell) => {
                        const columnLength = cell.value ? cell.value.toString().length : 0;
                        if (columnLength > maxLength) {
                            maxLength = columnLength;
                        }
                    });
                    column.width = maxLength + 2; // Add some padding
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), this.tableProperties[ETableHeader.description] + '_' + DateFormat() + '.xlsx');

        }
    };


    public static import = async (file: File) => {
        try {
            // Open Excel
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());

            // Get the first sheet
            const firstSheet = workbook.worksheets[0];

            // Prepare an array to store the cleaned data
            let data: ITableRow[] = [];

            // Loop through each row, skipping the header row
            firstSheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    return; // Skip header row
                }

                // Create an object for each row based on the header
                let rowObject: ITableRow = { [TablesGridHardCoded.row_id]: (rowNumber -1).toString() };

                firstSheet.getRow(1).eachCell((cell, colNumber) => {
                    const headerValue = cell.value?.toString().trim() || "";
                    const cellValue = row.getCell(colNumber).value?.toString(); 
                    rowObject[headerValue] = cellValue || null; 
                });

                // Push the cleaned row object to the data array
                data.push(rowObject);
            });

            return data;
        } catch (err) {
            console.error(err);
        }
    };
}