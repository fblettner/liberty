/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { ToolsQuery } from "@ly_services/lyQuery";
import { QuerySource } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ILanguageProps } from "@ly_types/lyLanguage";
import { EApplications } from "@ly_types/lyApplications";


export const lyGetLanguage = async (props: ILanguageProps) => {
  const results = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.language,
    sessionMode: props.appsProperties[EApplications.session],
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })
  return results.items;
}
