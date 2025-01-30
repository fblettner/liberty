/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { lyGetQueryFilters } from "@ly_services/lyFilters";
import { IColumnMetadata, IColumnsProps, IRestMetadata, QueryProperties, QueryRoute, QuerySource, QueryType, ResultStatus } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { EApplications, ESessionMode } from "@ly_types/lyApplications";
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from "@ly_types/lyModules";

import axios from 'axios';
import { EUsers } from "@ly_types/lyUsers";
import { IFiltersProperties } from "@ly_types/lyFilters";


export class QueryDAO {
  modulesProperties: IModulesProps;
  query: QueryProperties;
  offsetQuery: string;
  limitQuery: string;
  filtersQuery: string;
  params: string;
  overridePool: string;

  constructor(query: QueryProperties) {
    this.query = query;
    this.modulesProperties = query.modulesProperties;

    this.query.language = (query.language === undefined) ? "" : "&language=" + query.language;
    this.offsetQuery = (query.offset === undefined) ? "" : "&offset=" + query.offset;
    this.limitQuery = (query.limit === undefined) ? "" : "&limit=" + query.limit;
    this.filtersQuery = (query.filters === undefined) ? "" : lyGetQueryFilters(query.filters);
    this.overridePool = (query.override_target_pool === undefined || query.override_target_pool === null) ? "" : "&overridePool=" + query.override_target_pool;
    this.params = (query.params === undefined) ? "" : "&params=" + query.params;

  }

  public columns = async () => {

    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.crud
      + "?source=" + this.query.source
      + "&type=" + QueryType.Columns
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.overridePool
      + this.filtersQuery
      + this.query.language
      + this.offsetQuery
      + this.limitQuery
      + this.params

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.query.jwt_token },
        withCredentials: true,
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.columns",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Fetch Columns");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "PUT",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Fetch Columns");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

  public get = async () => {

    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.crud
      + "?source=" + this.query.source
      + "&type=" + QueryType.Table
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.overridePool
      + this.filtersQuery
      + this.query.language
      + this.offsetQuery
      + this.limitQuery
      + this.params

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.query.jwt_token },
        withCredentials: true,  // Include cookies if authentication is required
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.get",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Fetch Data");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "PUT",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Fetch Data");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }


  public post = async (stringifyData: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.crud
      + "?source=" + this.query.source
      + "&type=" + QueryType.Table
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.overridePool

    try {
      const request = await axios.post(queryAPI, stringifyData, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + this.query.jwt_token
        }
      });

      const logger = new Logger({
        transactionName: "QueryDAO.post",
        method: "POST",
        url: queryAPI,
        data: request,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Insert Data");

      return request.data;

    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "PUT",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Insert Data");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

  public put = async (stringifyData: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.crud
      + "?source=" + this.query.source
      + "&type=" + QueryType.Table
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.overridePool

    try {
      const request = await axios.put(queryAPI, stringifyData, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + this.query.jwt_token
        }
      });
      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "PUT",
        url: queryAPI,
        data: request,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Update Data");
      return request.data;

    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "PUT",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Update Data");
      return { status: ResultStatus.error, items: [errorData] }
    }

  }

  public delete = async (stringifyData: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.crud
      + "?source=" + this.query.source
      + "&type=" + QueryType.Table
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.overridePool

    try {
      const request = await axios.delete(queryAPI, {
        data: stringifyData,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + this.query.jwt_token
        }
      });

      const logger = new Logger({
        transactionName: "QueryDAO.delete",
        method: "DELETE",
        url: queryAPI,
        data: request,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Delete Data");
      return request.data;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Delete Data");
      return { status: ResultStatus.error, items: [errorData] }
    }

  }

  public token = async (user: string, password: string, pool: string, mode: ESessionMode, type: string) => {

    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.token
      + "?pool=" + pool
      + "&mode=" + mode
      + "&type=" + type

    let stringifyData = JSON.stringify({
      "user": user,
      "password": password
    });

    try {
      const axionsRes = await axios.post(queryAPI, stringifyData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.login",
        method: "POST",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("User Login: Check User and Password");
      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("User Login: Check User and Password");
      return { status: ResultStatus.error, items: [errorData] }
    }

  }

  public user = async (user: string, pool: string, sessionMode: ESessionMode, token: string) => {

    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.user
      + "?user=" + user
      + "&pool=" + pool
      + "&mode=" + sessionMode


    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        withCredentials: true,
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.login",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("User Login: Get User Properties");
      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("User Login: Get User Properties");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

  public open = async (pool: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.open
      + "?framework_pool=" + this.query.framework_pool
      + "&target_pool=" + pool

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.query.jwt_token },
        withCredentials: true,
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.open",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Open Pool");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Open Pool");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

  public modules = async () => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.modules

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json" },
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.modules",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Framework: Load Modules");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Framework: Load Modules");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }  

  public applications = async () => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.applications

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json" },
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.modules",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Framework: Load Applications");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Framework: Load Applications");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }    


  public themes = async () => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.themes
      + "?pool=" + this.query.framework_pool
      + this.filtersQuery
    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json" },
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.modules",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Framework: Load Themes");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Framework: Load Themes");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }      

  public close = async (pool: string, jwt_token: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.close
      + "?pool=" + pool

    try {
      const axionsRes = await axios.get(queryAPI, {
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwt_token },
        withCredentials: true,
      });

      const result = axionsRes.data;

      const logger = new Logger({
        transactionName: "QueryDAO.close",
        method: "GET",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Close Pool");

      return result;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Close Pool");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }


  public encrypt = async (passwd: string) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.encrypt

    try {

      const result = await axios.post(queryAPI, { plain_text: passwd }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const logger = new Logger({
        transactionName: "QueryDAO.encrypt",
        method: "POST",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Tools: Encrypt Password");
      return result.data.encrypted;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Tools: Encrypt Password");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

  public audit = async (tableName: string, userID: string, stringifyData: string | {}) => {
    let queryAPI = GlobalSettings.getBackendURL + QueryRoute.audit
      + "/" + tableName
      + "/" + userID
      + "?source=" + this.query.source
      + "&type=" + QueryType.Table
      + "&pool=" + this.query.framework_pool
      + "&mode=" + this.query.sessionMode
      + "&query=" + this.query.query
      + this.filtersQuery


    try {
      const result = await axios.post(queryAPI, stringifyData, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + this.query.jwt_token
        },
      });

      const logger = new Logger({
        transactionName: "QueryDAO.audit",
        method: "POST",
        url: queryAPI,
        data: result,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseMessage("Database: Audit Trail");

      return result.data;
    } catch (error) {

      let errorData = {
        message: "Unknown error occurred"
      }

      if (error instanceof Error) {
        if (axios.isAxiosError(error) && error.response) {
          errorData = { message: error.message + ": " + error.response.data.message }
        } else {
          errorData = { message: error.message + ": " + error.message }
        }
      }

      const logger = new Logger({
        transactionName: "QueryDAO.put",
        method: "DELETE",
        url: queryAPI,
        data: errorData,
        modulesProperties: this.modulesProperties,
        query: this.query.query
      });
      logger.logDatabaseException("Database: Audit Trail");
      return { status: ResultStatus.error, items: [errorData] }
    }
  }

}

export interface IQueryProps {
  target_pool: string;
  modulesProperties: IModulesProps;
  jwt_token: string
}


export interface IQueryUserProps {
  user: string;
  pool: string;
  sessionMode: ESessionMode;
  modulesProperties: IModulesProps;
  jwt_token: string;
}

export class ToolsQuery {

  /* Get columns definition for a query, used by all components */
  public static columns = async (props: IColumnsProps) => {

    let query = new QueryDAO({
      modulesProperties: props.modulesProperties,
      source: props.source,
      framework_pool: props.appsProperties[EApplications.pool],
      query: props.tableID,
      sessionMode: (props.sessionMode !== undefined) ? props.sessionMode : props.appsProperties[EApplications.session],
      language: props.userProperties[EUsers.language],
      params: props.params,
      override_target_pool: props.overrideQueryPool,
      jwt_token: props.appsProperties[EApplications.jwt_token]
    });

    const results = await query.columns()

    if (results.status === ResultStatus.success) {
      var tempCols: IColumnMetadata[] = [];
      results.metadata.map(function (val: IRestMetadata) {
        tempCols.push({
          header: val.headerName,
          field: val.field,
          type: val.type,
          operator: val.operator,
          defined: false,
          template: val.type,
          rules: val.rules,
          rulesValues: val.rules_values,
          disabled: false,
          required: false,
          visible: true,
        });
      })
      return tempCols;
    } else
      return results
  }

  /* Get data from database using backend API */
  public static get = async (queryProperties: QueryProperties) => {
    let query = new QueryDAO(queryProperties);
    const results = await query.get()
    return results;
  }

  /* Get data from database using backend API */
  public static audit = async (tableName: string, userID: string, queryProperties: QueryProperties, data: string | {}) => {
    let query = new QueryDAO(queryProperties);
    const results = await query.audit(tableName, userID, data);
    return results;
  }

  /* Insert data from database using backend API */
  public static post = async (queryProperties: QueryProperties, data: string) => {
    let query = new QueryDAO(queryProperties);
    const results = await query.post(data)
    return results;
  }


  /* Update data from database using backend API */
  public static put = async (queryProperties: QueryProperties, data: string) => {
    let query = new QueryDAO(queryProperties);
    const results = await query.put(data)
    return results;
  }

  /* Delete data from database using backend API */
  public static delete = async (queryProperties: QueryProperties, data: string) => {
    let query = new QueryDAO(queryProperties);
    const results = await query.delete(data)
    return results;
  }

  public static modules = async (modulesProperties: IModulesProps) => {

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: GlobalSettings.getDefaultPool,
      query: GlobalSettings.getFramework.openPool,
      sessionMode: ESessionMode.framework,
      jwt_token: ""
    });

    const results = await query.modules();
    return results

  }

  public static applications = async (modulesProperties: IModulesProps) => {

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: GlobalSettings.getDefaultPool,
      query: GlobalSettings.getFramework.openPool,
      sessionMode: ESessionMode.framework,
      jwt_token: ""
    });

    const results = await query.applications();
    return results

  }  

  public static themes = async (modulesProperties: IModulesProps, filters: IFiltersProperties[], pool: string) => {

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: pool,
      query: GlobalSettings.getFramework.openPool,
      filters: filters,
      sessionMode: ESessionMode.framework,
      jwt_token: ""
    });

    const results = await query.themes();
    return results

  }    

  public static open = async (props: IQueryProps) => {
    const { target_pool, modulesProperties, jwt_token } = props

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: GlobalSettings.getDefaultPool,
      query: GlobalSettings.getFramework.openPool,
      sessionMode: ESessionMode.framework,
      jwt_token: jwt_token
    });

    const results = await query.open(target_pool);
    return results

  }

  public static close = async (props: IQueryProps) => {
    const { target_pool, modulesProperties, jwt_token } = props

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: target_pool,
      query: -1,
      sessionMode: ESessionMode.framework,
      jwt_token: jwt_token
    });

    const results = await query.close(target_pool, jwt_token);
    return results

  }

  public static encrypt = async (passwd: string, modulesProperties: IModulesProps) => {
    let encrypt = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: "",
      query: -1,
      sessionMode: ESessionMode.framework,
      jwt_token: ""
    });
    const results = await encrypt.encrypt(passwd);
    return results

  }

  public static token = async (user: string, password: string, pool: string, sessionMode: ESessionMode, modulesProperties: IModulesProps, type: string) => {

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: (sessionMode === ESessionMode.framework) ? GlobalSettings.getDefaultPool : pool,
      query: -1,
      sessionMode: sessionMode,
      jwt_token: ""

    });

    const result = await query.token(user, password, pool, sessionMode, type);
    return result;

  }

  public static user = async (props: IQueryUserProps) => {
    const { user, pool, sessionMode, modulesProperties, jwt_token } = props

    let query = new QueryDAO({
      modulesProperties: modulesProperties,
      source: QuerySource.Framework,
      framework_pool: (sessionMode === ESessionMode.framework) ? GlobalSettings.getDefaultPool : pool,
      query: -1,
      sessionMode: sessionMode,
      jwt_token: jwt_token
    });

    const result = await query.user(user, pool, sessionMode, jwt_token);
    return result;

  }



}
