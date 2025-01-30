import { ITransformedObject } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { IColumnsFilter } from "@ly_types/lyFilters";

/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
export const buildDynamicFilters = (dynamicParams: string | undefined, lookupData: IColumnsFilter | ITransformedObject | undefined) => {
    if (!dynamicParams) return [];
    return dynamicParams.split(';').map((filter) => {
        const [field, key] = filter.split('=');
        const value = lookupData?.[key]?.value ?? null;
        return { field, value, type: 'string', operator: '=', defined: true, disabled: true, header: "", rules: null, values: null };
    });
};

export const buildFixedFilters = (fixedParams: string | undefined) => {
    if (!fixedParams) return [];
    return fixedParams.split(';').map((filter) => {
        const [field, value] = filter.split('=');
        return { field, value, type: 'string', operator: '=', defined: true, disabled: true, header: "", rules: null, values: null };
    });
};