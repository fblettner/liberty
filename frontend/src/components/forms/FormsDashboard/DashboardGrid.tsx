/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import

//Custom Import
import { DashboardCard } from '@ly_components/forms/FormsDashboard/DashboardCard';
import { ComponentProperties } from '@ly_types/lyComponents';
import { IDashboardState } from '@ly_types/lyDashboard';
import { DashboardGridItem } from '@ly_components/common/Grid';
import { useMediaQuery } from '@ly_components/common/UseMediaQuery';
import { Fragment } from 'react/jsx-runtime';
import { AdvancedFlexPanels } from '@ly_components/common/FlexAdvanced';
import { useMemo } from 'react';

export interface IDashboardGrid {
    rows: number[];
    columns: number[];
    gridSize: number;
    dashboardData: IDashboardState;
    component: ComponentProperties;
}

export const DashboardGrid = ({
    rows,
    columns,
    gridSize,
    dashboardData,
    component
}: IDashboardGrid) => {

    const isMobile = useMediaQuery("(max-width:600px)");

    const children = useMemo(
        () =>
            rows.map((row) =>
                columns.map((column) => {
                    return (
                        <DashboardGridItem key={`${row}-${column}`}>
                            <DashboardCard row={row} column={column} dashboardData={dashboardData} />
                        </DashboardGridItem>
                    );
                })
            ),
        [rows, columns, dashboardData]
    );

    if (isMobile) {
        return (
            <Fragment>
                {rows.map((row: number) => (
                    <DashboardGridItem key={row} >
                        {columns.map((column: number) => (
                            <DashboardGridItem key={column} style={{ padding: "8px" }} >
                                <DashboardCard
                                    row={row}
                                    dashboardData={dashboardData}
                                    column={column}
                                />
                            </DashboardGridItem>
                        ))}
                    </DashboardGridItem>
                ))}
            </Fragment>
        )
    }
    return (
        <AdvancedFlexPanels rows={rows.length} columns={columns.length}>
            {children}
        </AdvancedFlexPanels>
    )
}
