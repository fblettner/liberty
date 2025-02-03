/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import axios from 'axios';

import { GlobalSettings } from '@ly_utils/GlobalSettings';
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from '@ly_types/lyModules';
import { IAPIProperties, EAPIRoute } from '@ly_types/lyApi';

export class APIDAO {

    api: IAPIProperties;
    modulesProperties: IModulesProps;

    constructor(api: IAPIProperties) {
        this.api = api;
        this.modulesProperties = api.modulesProperties;
    }

    public post = async (stringifyData: string) => {
        let queryAPI = GlobalSettings.getBackendURL + "api/" + EAPIRoute.rest
            + "?pool=" + this.api.pool
            + "&mode=" + this.api.sessionMode
            + "&api=" + this.api.api

        try {
            const result = await axios.post(queryAPI, stringifyData, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });

            const logger = new Logger({
                transactionName: "APIDAO.post",
                method: "POST",
                url: queryAPI,
                data: result,
                modulesProperties: this.modulesProperties
            });
            logger.logRestMessage("REST: POST API call");
            return result.data;

        } catch (error) {
            const logger = new Logger({
                transactionName: "APIDAO.post",   
                method: "POST",                  
                url: queryAPI,                    
                data: null,
                modulesProperties: this.modulesProperties
            });                    
            logger.logRestException("REST: Failed POST API call");
        }            
    }
}

export class ToolsAPI {

    /* Call API POST METHOD */
    public static post = async (apiProperties: IAPIProperties, stringifyData: string) => {
        let api = new APIDAO(apiProperties);
        const results = await api.post(stringifyData)
        return results;
    }
}
