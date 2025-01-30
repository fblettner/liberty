/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
/** 
 * @ojmetadata version "5.0.0"
 * @ojmetadata displayName "Config Module"
 * @ojmetadata description "Module to set global settings"
*/

import settings from "@ly_utils/settings.json";

/* BACKEND_URL USED TO CALL API */
//const BACKEND_URL =  window.location.protocol + '//' + window.location.hostname + ":" + window.location.port;
const BACKEND_URL =  window.location.href;

/* Static settings used by components */
/* Settings are defined into settings.ts, need to recompile when changed */
export class GlobalSettings {

  public static getCopyright = settings.Copyright;
  public static getVersion = settings.version;
  
  public static getDefaultPool = settings.defaultPool
  public static getFramework = settings.Framework
  public static getQuery = settings.Query
  public static getBackendURL = BACKEND_URL;

  public static auditUser = "AUDIT_USER"
  public static auditDate = "AUDIT_DATE"

  public static loading = "loading";
  public static save_ok = "save_ok";
  public static filters = "filters";
  public static login = "login";
  public static tables = "tables";
  public static dialogs = "dialogs";
  public static button = "button";

}

export enum UIDisplayMode  {
  dark = "dark",
  light = "light"
}




