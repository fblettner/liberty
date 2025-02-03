/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IFiltersProperties } from "@ly_types/lyFilters";

  export const lyGetQueryFilters = (filters: IFiltersProperties[]) => {

    let params: string = "";

    if (filters.length > 0) {
      params = "&q={";
      let firstparam: boolean = true;

      for (var i = 0; i < filters.length; i++) {
        if (filters[i].defined) {
          if (!firstparam)
            params += ",";
          if (filters[i].operator == "like") {
            params += "\"" + filters[i]["field"] + "\":" + "{\"like\":\"%25" + filters[i]["value"] + "%25\"}";
            firstparam = false;
          }
          else {
            if (filters[i]["value"] === null)
              params += "\"" + filters[i]["field"] + "\":" + "{\"" + filters[i].operator + "\":" + filters[i]["value"] + "}";
              else
            params += "\"" + filters[i]["field"] + "\":" + "{\"" + filters[i].operator + "\":\"" + filters[i]["value"] + "\"}";
            firstparam = false;
          }
        }
      }
      params += "}";
    }

    return params
  }



