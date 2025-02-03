/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import

//Custom Import
import { ComponentProperties, LYComponentMode, LYComponentType, LYComponentDisplayMode, LYComponentViewMode } from "@ly_types/lyComponents";
import { EDahsboardContent, IDashboardContent, IDashboardState } from "@ly_types/lyDashboard";
import { FormsChart } from "@ly_components/forms/FormsChart/FormsChart";
import { FormsTable } from "@ly_components/forms/FormsTable/FormsTable";
import { FormsTools } from "@ly_components/forms/FormsTools/FormsTools";
import { LYMoreVertIcon } from "@ly_styles/icons";
import { IconButton } from "@ly_components/common/IconButton";
import { Card_Dashboard } from "@ly_components/styles/Card";
import { CardContent, CardHeader } from "@ly_components/common/Card";
import { Div } from "@ly_components/styles/Div";

export interface IDashboardCard {
    dashboardData: IDashboardState;
    row: number;
    column: number;
}

// Helper function to render FormsTable
const renderFormsTable = (component: ComponentProperties, viewMode: LYComponentViewMode, content: IDashboardContent, viewGrid: boolean) => (
    <FormsTable
        key={content[EDahsboardContent.component] + "-" + content[EDahsboardContent.componentID]}
        viewMode={viewMode}
        displayMode={LYComponentDisplayMode.dashboard}
        viewGrid={viewGrid}
        componentProperties={component}
        readonly={false}
    />
);

export const DashboardCard = ({ dashboardData, row, column }: IDashboardCard) => {
    let content = dashboardData.content?.find((item: IDashboardContent) => item[EDahsboardContent.rows] === row && item[EDahsboardContent.columns] === column)
    if (content === undefined)
        return <Div></Div>;

    let targetComponent: ComponentProperties = {
        id: content[EDahsboardContent.componentID],
        type: content[EDahsboardContent.component],
        label: "",
        filters: [],
        showPreviousButton: false,
        componentMode: LYComponentMode.find,
        isChildren: false,
    };

    let displayComponent;

    switch (content[EDahsboardContent.component]) {
        case LYComponentType.FormsChart:
            displayComponent = <FormsChart key={`${content[EDahsboardContent.component]}-${content[EDahsboardContent.componentID]}`} componentProperties={targetComponent} />;
            break;
        case LYComponentType.FormsTree:
            displayComponent = renderFormsTable(targetComponent, LYComponentViewMode.tree, content, false);;
            break;
        case LYComponentType.FormsTable:
            displayComponent = renderFormsTable(targetComponent, LYComponentViewMode.table, content, true);
            break;
        case LYComponentType.FormsList:
            displayComponent = renderFormsTable(targetComponent, LYComponentViewMode.list, content, false);
            break;
        case LYComponentType.FormsTools:
            displayComponent = <FormsTools />;
            break;            
    }
    return (
        <Card_Dashboard >
            {content[EDahsboardContent.display_title] === "Y" &&
                <CardHeader
                    title={content[EDahsboardContent.title]}
                    action={
                        <IconButton 
                            aria-label="settings"
                            icon={LYMoreVertIcon} 
                        />
                    } />
            }
            <CardContent >
                    {displayComponent}
            </CardContent>
        </Card_Dashboard>
    )
}