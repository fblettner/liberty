/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { EChartHeader, IChartsProps } from "@ly_types/lyCharts";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { EApplications } from "@ly_types/lyApplications";

export const lyGetCharts = async (props: IChartsProps) => {
    let filters: IFiltersProperties[] = [];

    filters.push({
        header: "",
        field: EChartHeader.id,
        value: props[EChartHeader.id],
        type: "number",
        operator: "=",
        defined: true,
        rules: null,
        disabled: false,
        values: "",
    });


    let errorFound = false;

    const results = await ToolsQuery.get({
        source: QuerySource.Framework,
        framework_pool: props.appsProperties[EApplications.pool],
        query: GlobalSettings.getFramework.charts_header,
        sessionMode: props.appsProperties[EApplications.session],
        filters: filters,
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    })

    if (results.items[0][EChartHeader.queryID] === null)
        errorFound = true;

    let chart = await ToolsQuery.get({
        source: QuerySource.Query,
        framework_pool: props.appsProperties[EApplications.pool],
        query: results.items[0][EChartHeader.queryID],
        sessionMode: props.appsProperties[EApplications.session],
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    })

    let columns = await ToolsQuery.columns({
        source: QuerySource.Query,
        appsProperties: props.appsProperties,
        userProperties: props.userProperties,
        tableID: results.items[0][EChartHeader.queryID],
        modulesProperties: props.modulesProperties
    })
    return { columns: columns, data: (errorFound) ? [] : chart.items, header: results.items[0] };
}
