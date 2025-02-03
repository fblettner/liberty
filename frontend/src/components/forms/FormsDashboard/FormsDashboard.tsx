/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { t } from 'i18next';

// MUI Import

// Custom Import
import { getAppsProperties, getModules, getUserProperties } from '@ly_features/global';
import { lyGetDashboard } from '@ly_services/lyDashboard';
import { IAppsProps } from '@ly_types/lyApplications';
import { ComponentProperties } from '@ly_types/lyComponents';
import { EDahsboardHeader, IDashboardState } from '@ly_types/lyDashboard';
import { LoadingIndicator } from '@ly_components/common/LoadingIndicator';
import { DashboardGrid } from '@ly_components/forms/FormsDashboard/DashboardGrid';
import { ResultStatus } from '@ly_types/lyQuery';
import { AlertMessage } from '@ly_components/common/AlertMessage';
import { ESeverity, IErrorState } from '@ly_utils/commonUtils';
import { IModulesProps } from '@ly_types/lyModules';
import Logger from '@ly_services/lyLogging';
import { Paper_Dashboard } from '@ly_components/styles/Paper';
import { EUsers, IUsersProps } from '@ly_types/lyUsers';


export interface IFormsDashboard {
    componentProperties: ComponentProperties;
}


export function FormsDashboard({componentProperties }: IFormsDashboard) {
    const dispatch = useDispatch();
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });

    const appsProperties: IAppsProps = useSelector(getAppsProperties);
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules)
    const [dashboardData, setDashboardData] = useState<IDashboardState>({
        header: undefined,
        content: [],
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            const dashboardData = await lyGetDashboard({
                appsProperties: appsProperties,
                [EDahsboardHeader.id]: componentProperties.id,
                modulesProperties: modulesProperties,
            });
            if (dashboardData.status === ResultStatus.success) {
                setDashboardData({
                    header: dashboardData.header,
                    content: dashboardData.content,
                });
            } else {
                const logger = new Logger({
                    transactionName: "FormsDashboard.fetchDashboardData",
                    modulesProperties: modulesProperties,
                    data: dashboardData
                  });
                  logger.logException("Dashboard: Failed to fetch dashboard data");
                setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error });
            }
          } catch (error) {
            const logger = new Logger({
                transactionName: "FormsDashboard.fetchDashboardData",
                modulesProperties: modulesProperties,
                data: error
              });
              logger.logException("Dashboard: Failed to fetch dashboard data");
            setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error});
        }
    },  [appsProperties, componentProperties.id, componentProperties, dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (userProperties[EUsers.status])
                await fetchDashboardData();
            setIsLoading(false);
        };
        fetchData();
    }, [componentProperties.id, fetchDashboardData, userProperties[EUsers.status]]);


    const rows = useMemo(() => {
        return Array.from({ length: dashboardData.header?.[EDahsboardHeader.rows] || 0 }, (_, i) => i + 1);
    }, [dashboardData.header]);

    const columns = useMemo(() => {
        return Array.from({ length: dashboardData.header?.[EDahsboardHeader.columns] || 0 }, (_, i) => i + 1);
    }, [dashboardData.header]);

    const gridSize = useMemo(() => (dashboardData.header?.[EDahsboardHeader.columns] || 1), [dashboardData.header]);

    const handleMessageClose = useCallback(() => {
        setErrorState({ open: false, message: "" });
    }, [setErrorState]);
    
    if (!userProperties[EUsers.status]) return null
    if (isLoading) return <LoadingIndicator />;
    return (
        <Paper_Dashboard elevation={0} >
            <AlertMessage 
                open={errorState.open} 
                severity={errorState.severity}
                message={errorState.message} 
                onClose={handleMessageClose} 
                />
            <DashboardGrid
                rows={rows}
                columns={columns}
                gridSize={gridSize}
                dashboardData={dashboardData}
                component={componentProperties}
            />
        </Paper_Dashboard>

    )
}