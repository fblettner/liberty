/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// Custom Import
import { getAppsProperties, getModules, getUserProperties } from '@ly_features/global';
import { lyGetCharts } from '@ly_services/lyCharts';
import { IAppsProps } from '@ly_types/lyApplications';
import { AxisData, EChartHeader, EChartType, IChartHeader, LYChartPalette, PieData } from '@ly_types/lyCharts';
import { ComponentProperties } from '@ly_types/lyComponents';
import { IUsersProps } from '@ly_types/lyUsers';
import { IModulesProps } from '@ly_types/lyModules';
import { IColumnsProperties, TablesGridHardCoded } from '@ly_types/lyTables';
import { Paper_FormsChart } from '@ly_components/styles/Paper';
import { Stack_FormsChart } from '@ly_components/styles/Stack';
import { BarChart } from '@ly_components/charts/BarChart';
import { PieChart } from '@ly_components/charts/PieChart';
import { LineChart } from '@ly_components/charts/LineChart';
import { useTheme } from '@emotion/react';

type Props = Readonly<{
    componentProperties: ComponentProperties;
}>;

const useChartPalette = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    return isDark ? LYChartPalette.dark : LYChartPalette.light;
  };
  
export function FormsChart(props: Props) {
    const { componentProperties } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const appsProperties: IAppsProps = useSelector(getAppsProperties)
    const userProperties: IUsersProps = useSelector(getUserProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);
    const component = useRef(componentProperties);
    const [chartHeader, setChartHeader] = useState<IChartHeader>({
        [EChartHeader.id]: 0,
        [EChartHeader.label]: '',
        [EChartHeader.type]: '',
        [EChartHeader.grid_hz]: '',
        [EChartHeader.grid_vt]: '',
        [EChartHeader.axis_x]: '',
        [EChartHeader.axis_y1]: '',
        [EChartHeader.axis_y2]: '',
        [EChartHeader.queryID]: 0,
        [EChartHeader.series]: ''
    });
    const [data, setData] = useState([]);
    const [series, setSeries] = useState([]);
    const [axis, setAxis] = useState<AxisData>([]);
    const [pieData, setPieData] = useState<PieData>([])
    const chartPalette = useChartPalette();

    useEffect(() => {
        component.current = componentProperties

        const fetchData = async () => {
            setIsLoading(true);
            const chartData = await lyGetCharts({
                appsProperties: appsProperties,
                userProperties: userProperties,
                modulesProperties: modulesProperties,
                [EChartHeader.id]: component.current.id
            });

            setChartHeader(chartData.header)
            setData(chartData.data)

            let seriesData
            if (chartData.header[EChartHeader.type] === EChartType.line) {
                seriesData = await chartData.columns.filter((column: IColumnsProperties) => column.field !== TablesGridHardCoded.row_id && column.field !== EChartHeader.series).map((column: IColumnsProperties) => ({ dataKey: column.field, label: column.header,yAxisKey: column.field}));
            } else {
                seriesData = await chartData.columns.filter((column: IColumnsProperties) => column.field !== TablesGridHardCoded.row_id && column.field !== EChartHeader.series).map((column: IColumnsProperties) => ({ dataKey: column.field, label: column.header }));
            }
            setSeries(seriesData);

            const axisData = [...new Set<string>(chartData.data.map((data: Record<string, string>) => data[EChartHeader.series]))];
            setAxis(axisData);

            if (chartData.header[EChartHeader.type] === EChartType.pie) {
                let tmpData: { value: number; label: string; }[] = [];
                seriesData.map((serie: { dataKey: string | number; label: string; }) => {
                    for (const item of chartData.data) {
                        tmpData.push({
                            value: item[serie.dataKey],
                            label: serie.label
                        })
                    }
                })
                setPieData(tmpData);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [componentProperties.id]);


    if (isLoading) {
        return
    } else
        return (
            <Stack_FormsChart>
                <Paper_FormsChart elevation={0}>
                    {chartHeader[EChartHeader.type] === EChartType.bar &&
                        <BarChart
                            dataset={data}
                            colors={chartPalette}
                            grid={{
                                horizontal: chartHeader[EChartHeader.grid_hz] === "Y" ? true : false,
                                vertical: chartHeader[EChartHeader.grid_vt] === "Y" ? true : false
                            }}
                            xAxis={[{
                                scaleType: 'band',
                                data: axis,
                                label: chartHeader[EChartHeader.axis_x]

                            },
                            ]}
                            yAxis={[{ label: chartHeader[EChartHeader.axis_y1] }]}
                            series={series}
                        />
                    }
                    {chartHeader[EChartHeader.type] === EChartType.pie &&
                        <PieChart
                            colors={chartPalette}
                            data={pieData}
                        />
                    }
                    {chartHeader[EChartHeader.type] === EChartType.line &&
                        <LineChart
                            dataset={data}
                            colors={chartPalette}
                            grid={{
                                horizontal: chartHeader[EChartHeader.grid_hz] === "Y" ? true : false,
                                vertical: chartHeader[EChartHeader.grid_vt] === "Y" ? true : false
                            }}
                            xAxis={[{
                                scaleType: 'point',
                                data: axis,
                                label: chartHeader[EChartHeader.axis_x]

                            },
                            ]}
                            yAxis={[{ id: chartHeader[EChartHeader.axis_y1], label: chartHeader[EChartHeader.axis_y1] }, { id: chartHeader[EChartHeader.axis_y2], label: chartHeader[EChartHeader.axis_y2] }]}
                            series={series}
                        />
                    }
                </Paper_FormsChart>
            </Stack_FormsChart>
        )
}