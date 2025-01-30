/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import * as Sentry from "@sentry/react";
import { IModulesProps } from "@ly_types/lyModules";
import { IRestResult } from "@ly_types/lyQuery";

export interface ILoggerProps {
    transactionName: string;
    level?: Sentry.SeverityLevel;
    method?: string;
    url?: string;
    data?: unknown;
    modulesProperties: IModulesProps;
    query?: number;
}

export interface ILoggerParams {
    message: string;
    category: string;
    feature: string;
    isException: boolean;
}

export type TLoggerData = unknown | IRestResult | null;

export interface IBreadcrumbData {
    method?: string;
    url?: string;
    query?: number;
    data?: string | (IRestResult & { items?: unknown[]; }) | Record<string, unknown>;
}
