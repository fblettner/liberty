/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// Custom Import
import { QuerySource } from '@ly_types/lyQuery';
import { ToolsQuery } from '@ly_services/lyQuery';
import { GlobalSettings } from '@ly_utils/GlobalSettings';
import { EApplications, ESessionMode } from '@ly_types/lyApplications';
import { ISaveUserData } from '@ly_types/lyUsers';

export const saveUserData = async (props: ISaveUserData) => {
    return await ToolsQuery.put(
        {
            source: QuerySource.Query,
            framework_pool: props.appsProperties[EApplications.pool],
            query: GlobalSettings.getQuery.users,
            sessionMode: ESessionMode.framework,
            modulesProperties: props.modulesProperties,
            jwt_token: props.appsProperties[EApplications.jwt_token]
        },
        JSON.stringify(props.restData)
    );
};