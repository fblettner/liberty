/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { ILoggerProps, ILoggerParams, TLoggerData, IBreadcrumbData } from "@ly_types/lyLogging";
import { IModulesProps } from "@ly_types/lyModules";
import { IRestResult } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import * as Sentry from "@sentry/react";

class Logger {
    private level: Sentry.SeverityLevel;
    private transactionName: string;
    private method: string | null;
    private url: string | null;
    private data: TLoggerData;
    private modulesProperties: IModulesProps;
    private query: number | null;

    constructor(props: ILoggerProps) {
        const { level, transactionName, method, url, data, query } = props;
        this.level = level ?? "info";
        this.transactionName = transactionName;
        this.method = method ?? null;
        this.url = url ?? null;
        this.data = data ?? null; // Allow null instead of an empty string
        this.modulesProperties = props.modulesProperties;
        this.query = query ?? null;
    }


    // General log handler (message or exception)
    private log(props: ILoggerParams): void {
        const { message, category, feature, isException } = props;
        if (this.modulesProperties.sentry && this.modulesProperties.sentry.enabled) {
            Sentry.withScope(scope => {
                scope.setTransactionName(this.transactionName);
                scope.setLevel(this.level);

                // Add breadcrumb for additional context, only include result if available
                const breadcrumbData: IBreadcrumbData = {};
                if (this.method) breadcrumbData.method = this.method;
                if (this.url) breadcrumbData.url = this.url;
                if (this.query) breadcrumbData.query = this.query;
                if (this.data) {
                    // Check if this.data is an object and not an array
                    if (typeof this.data === 'object' && !Array.isArray(this.data)) {
                        breadcrumbData.data = { ...this.data };
                        
                        // Check if this.data.items is an array and has more than 5 items
                        if (this.data && 'items' in this.data && Array.isArray(this.data.items)) {
                            if (this.data.items.length > 5) {
                              breadcrumbData.data.items = this.data.items.slice(0, 5);
                            }
                          }
                    } else if (typeof this.data === 'string') {
                        breadcrumbData.data = this.data; 
                      }
                }

                Sentry.addBreadcrumb({
                    category: category,
                    level: this.level,
                    data: breadcrumbData,
                });

                // Parse the JSON string
                const parsedData = JSON.parse(this.modulesProperties.sentry.params ?? "");
                const clientid = parsedData.clientid;
                const environment = parsedData.environment; 
                // Set tags to help categorize the message
                scope.setTags({
                    feature: feature,
                    severity: this.level,
                    clientid: clientid,
                    environment: environment
                });

                // Log message or exception
                if (isException) {
                    Sentry.captureException(new Error(message));
                } else {
                    if (this.modulesProperties.debug.enabled)
                        Sentry.captureMessage(message, this.level);
                }
            });

        } else {
            // Backend logging fallback if Sentry is disabled
            const logToBackendParams = {
                message: message,
                category: category,
                feature: feature,
                isException: isException,
            }
            this.logToBackend(logToBackendParams);
        }
    }


    // Backend logging function
    private async logToBackend(props: ILoggerParams): Promise<void> {
        const { message, category, feature, isException } = props;
        const logData = {
            transactionName: this.transactionName,
            level: this.level,
            method: this.method,
            url: this.url,
            data: this.data,
            message: message,
            category: category,
            feature: feature,
            isException: isException,
        };

        if (this.data) {
            // Check if this.data is an object and not an array
            if (typeof this.data === 'object' && this.data !== null && !Array.isArray(this.data)) {
                logData.data = { ...this.data };
              
                if ('items' in this.data && Array.isArray(this.data.items)) {
                  if (this.data.items.length > 5) {
                    // Narrow down logData.data type before accessing properties
                    if (typeof logData.data === 'object' && logData.data !== null && 'items' in logData.data) {
                      (logData.data as IRestResult).items = this.data.items.slice(0, 5);
                    }
                  }
                }
              } else  {
                // Handle case when this.data is a string
                logData.data = this.data;
            } 
        }

        try {
            if (isException) {
                await fetch(GlobalSettings.getBackendURL + "api/logs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(logData)
                });
            } else
            if (this.modulesProperties.debug && this.modulesProperties.debug.enabled)
                await fetch(GlobalSettings.getBackendURL + "api/logs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(logData)
                });
        } catch (error) {
            console.error("Failed to log to backend:", error);
        }
    }

    // Specific methods for different logging categories

    logDatabaseMessage(message: string): void {
        const logParams = {
            message: message,
            category: "http",
            feature: "database-api",
            isException: false,
        }
        this.log(logParams);
    }

    logDatabaseException(message: string): void {
        const logParams = {
            message: message,
            category: "http",
            feature: "database-api",
            isException: true,
        }
        this.log(logParams);
    }

    logRestMessage(message: string): void {
        const logParams = {
            message: message,
            category: "http",
            feature: "rest-api",
            isException: false,
        }
        this.log(logParams);
    }

    logRestException(message: string): void {
        const logParams = {
            message: message,
            category: "http",
            feature: "rest-api",
            isException: true,
        }
        this.log(logParams);
    }

    logMessage(message: string): void {
        const logParams = {
            message: message,
            category: "debug",
            feature: "console",
            isException: false,
        }
        this.log(logParams);
    }

    logException(message: string): void {
        const logParams = {
            message: message,
            category: "debug",
            feature: "console",
            isException: true,
        }
        this.log(logParams);
    }

}

export default Logger;