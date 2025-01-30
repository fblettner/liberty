import { EApplications, IAppsProps } from '@ly_types/lyApplications';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { ITableRow, ITableHeader, ETableHeader } from '@ly_types/lyTables';
// Import the logo image from the assets folder
import logo from '../assets/logo_ly.png';
import { ToolsDictionary } from '@ly_services/lyDictionary';
import { EDictionaryType } from '@ly_types/lyDictionary';
import { parseISO } from 'date-fns';


interface IPDFColumn {
    title: string,  
    dataKey: string, 
    type: string  

}

function blobToBase64(blob: any) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export class PDF {

    gridData: ITableRow[];
    columnData: IPDFColumn[];
    xlsxColumnID: boolean
    appsProperties: IAppsProps;
    tableProperties: ITableHeader;

    private base64Logo: string | null = null;

    private async preloadLogo(logoUrl: string): Promise<void> {
        try {
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return new Promise((resolve) => {
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        this.base64Logo = reader.result;
                    }
                    resolve();
                };
            });
        } catch (error) {
            console.error("Error preloading logo:", error);
        }
    }

    constructor(exportDP: ITableRow[], columnDP: IPDFColumn[], xlsxColumnID: boolean, appsProperties: IAppsProps, tableProperties: ITableHeader) {

        // Copy data from MutableDataProvider
        // This is important to no replace the value in the source table exported
        this.gridData = exportDP.map((object) => ({ ...object }))
        this.columnData = columnDP.map((object) => ({ ...object }))
        this.xlsxColumnID = xlsxColumnID;
        this.appsProperties = appsProperties;
        this.tableProperties = tableProperties;
    }


    // Function to vertically align text
    private alignTextVertically(containerHeight: number, fontSize: number): number {
        return (containerHeight / 2) + (fontSize / 2) - 2;
    }

    private drawBackgroundRect(doc: jsPDF, x: number, y: number, width: number, height: number, color: [number, number, number]) {
        doc.setFillColor(...color);
        doc.rect(x, y, width, height, 'F');
    }

    // Function to set font properties
    private setFont(doc: jsPDF, size: number, style: 'normal' | 'bold' | 'italic', color: [number, number, number] = [255, 255, 255]) {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
    }

    // Function to add header and footer
    private async addHeaderFooter(doc: jsPDF, headerHeight: number, footerHeight: number): Promise<void> {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const date = new Date().toISOString().slice(0, 10);

        // Draw background for header and footer
 //       this.drawBackgroundRect(doc, 0, 2, pageWidth, headerHeight, [0, 0, 0]);
        //       this.drawBackgroundRect(doc, 0, pageHeight - footerHeight, pageWidth, footerHeight, [44, 83, 100]);

        const headerTextY = headerHeight - 2.5;
        const footerTextY = pageHeight - footerHeight / 2;

        if (this.base64Logo) {
            doc.addImage(this.base64Logo, 'PNG', 5, 1, 15, 15);
        }

        // Add header text
        this.setFont(doc, 12, 'normal', [0, 0, 0]);
        doc.text(this.appsProperties[EApplications.name], 25, headerTextY);

        // Add Title
        this.setFont(doc, 12, 'bold', [0, 0, 0]);
        doc.text("Table: " + this.tableProperties[ETableHeader.description], pageWidth / 2, headerTextY, { align: 'center' });

        // Add Date
        this.setFont(doc, 10, 'italic', [0, 0, 0]);
        doc.text(date, pageWidth - 20, headerTextY);

        // Add Footer
        // const pageCount = doc.internal.getNumberOfPages();
        
        this.setFont(doc, 10, 'italic', [0, 0, 0]);
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 20, footerTextY, { align: 'center' });
    }

    public async export(): Promise<void> {
        const headerHeight = 12;
        const footerHeight = 10;

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        this.gridData.map((item) => {
            Object.keys(item).map((key) => {
                const column = this.columnData.filter((columns) => columns.dataKey === key)[0]
                if (column !== undefined && (column.type === EDictionaryType.jdedate || column.type === EDictionaryType.date) && item[key] !== null) {
                    const dateValue = (column.type === EDictionaryType.jdedate) ? ToolsDictionary.JdeToDate(item[key] as number)?.toLocaleDateString() : parseISO(item[key] as string).toISOString().slice(0, 10);
                    if (dateValue !== undefined) {
                        item[key] = dateValue;
                    }
                }
            })

            return item
        });

        const rowData = this.gridData.slice(0, 500).map(row => {
            return this.columnData.map(col => row[col.dataKey]);
        });

        await this.preloadLogo(logo);

        autoTable(doc, {
            head: [this.columnData.map(col => col.title)],
            body: rowData as RowInput[],
            startY: headerHeight + 5,
            margin: { bottom: footerHeight + 5, left: 8, right: 8 },
            didDrawPage: (data) => {
                this.addHeaderFooter(doc, headerHeight, footerHeight);
                data.settings.margin.top = headerHeight + 5;
            },
            headStyles: {
                fillColor: [44, 83, 100],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center',
            },
            theme: 'grid',
        });

        const exportDate = new Date().toISOString().slice(0, 10);
        doc.save(`${this.tableProperties[ETableHeader.description]}_${exportDate}.pdf`);
    }
}
