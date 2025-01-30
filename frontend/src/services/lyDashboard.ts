/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { EDahsboardHeader, IDashboardProps } from "@ly_types/lyDashboard";
import { IFiltersProperties } from "@ly_types/lyFilters";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import { EApplications } from "@ly_types/lyApplications";

export const lyGetDashboard = async (props: IDashboardProps) => {
    let filters: IFiltersProperties[] = [];

    filters.push({
        header: "",
        field: EDahsboardHeader.id,
        value: props[EDahsboardHeader.id],
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
        query: GlobalSettings.getFramework.dashboard_header,
        sessionMode: props.appsProperties[EApplications.session],
        filters: filters,
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    })

    let content = await ToolsQuery.get({
        source: QuerySource.Framework,
        framework_pool: props.appsProperties[EApplications.pool],
        query: GlobalSettings.getFramework.dashboard_content,
        filters: filters,
        sessionMode: props.appsProperties[EApplications.session],
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    })

    return {header: results.items[0], content: (errorFound) ? [] : content.items, status: content.status };
}
