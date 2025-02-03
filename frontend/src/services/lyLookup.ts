/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IFiltersProperties } from "@ly_types/lyFilters";
import { IFetchParallelLookupData, ILookupProps, ILookupResult, ELookup, ILookupOption } from "@ly_types/lyLookup";
import { QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { GlobalSettings } from "@ly_utils/GlobalSettings";
import { ToolsQuery } from "@ly_services/lyQuery";
import Logger from "@ly_services/lyLogging";
import { EApplications } from "@ly_types/lyApplications";

export const lyGetLookup = async (props: ILookupProps) => {
  let filters: IFiltersProperties[] = [];

  filters.push({
    header: "",
    field: ELookup.id,
    value: props[ELookup.id],
    type: "number",
    operator: "=",
    defined: true,
    rules: null,
    disabled: false,
    values: "",
  });

  const results = await ToolsQuery.get({
    source: QuerySource.Framework,
    framework_pool: props.appsProperties[EApplications.pool],
    query: GlobalSettings.getFramework.lookup,
    sessionMode: (props.sessionMode !== undefined)
      ? props.sessionMode
      : props.appsProperties[EApplications.session],
    filters: filters,
    modulesProperties: props.modulesProperties,
    jwt_token: props.appsProperties[EApplications.jwt_token]
  })

  let errorFound = false;
  let filtersLKP: IFiltersProperties[] = [];

  if (results.items.length > 0) {
    if (props.data !== undefined) {
      /* Create default filter for key */
      if (props.data[results.items[0][ELookup.dd_id]] !== undefined || props.value !== undefined)
        filtersLKP.push({
          header: "",
          field: props.searchbyLabel ? results.items[0][ELookup.dd_label] : results.items[0][ELookup.dd_id],
          value: props.value !== undefined ? props.value : props.data[results.items[0][ELookup.dd_id]].value,
          type: "string",
          operator: "=",
          defined: true,
          rules: "",
          disabled: true,
          values: "",
        });

      /* Create filter from tables or dialogs value */
      let filterString: string;
      if (props.dynamic_params !== null && props.dynamic_params !== "" && props.dynamic_params !== undefined) {
        filterString = props.dynamic_params;

        filterString.split(";").forEach((filters) => {
          let filter = filters.split("=")

          if (props.data![filter[1]] === undefined)
            errorFound = true;
          else
            filtersLKP.push({
              header: "",
              field: filter[0],
              value: props.data![filter[1]].value,
              type: "string",
              operator: "=",
              defined: true,
              rules: "",
              disabled: true,
              values: "",
            });
        })
      }
    }

    /* Create filter for fixed values defined into LY_SEQ_FILTERS */
    if (props.fixed_params !== null && props.fixed_params !== "" && props.fixed_params !== undefined) {
      let filterString = props.fixed_params;
      filterString.split(";").forEach((filters) => {
        let filter = filters.split("=")

        filtersLKP.push({
          header: "",
          field: filter[0],
          value: filter[1],
          type: "string",
          operator: "=",
          defined: true,
          rules: "",
          disabled: true,
          values: "",
        });
      })
    }
  }

  filtersLKP = (props.getAllValues) 
    ? filtersLKP.filter((item: IFiltersProperties) => item.field !== results.items[0][ELookup.dd_id] && item.field !== results.items[0][ELookup.dd_label]) 
    : filtersLKP;

  let lookup: ILookupResult = { items: [], status: ResultStatus.success };
  let columns;
  if (results.items.length === 0 || results.status === ResultStatus.error) {
    errorFound = true

    const logger = new Logger({
      transactionName: "lyLookup.lyGetLookup",
      modulesProperties: props.modulesProperties,
      data: results
    });
    logger.logException("LookupInput: Failed to fetch lookup header");
  }
  else {
    const parallelQuery = 1  // Number of parallel requests

    const lookupParams = {
      appsProperties: props.appsProperties,
      results: results,
      parallelCount: (props.getAllValues) ? parallelQuery : 1,
      filtersLKP: filtersLKP,
      overrideQueryPool: props.overrideQueryPool,
      sessionMode: props.sessionMode,
      modulesProperties: props.modulesProperties
    }
    lookup = await fetchParallelLookupData(lookupParams);
    if (lookup.status === ResultStatus.error) {
      errorFound = true
      const logger = new Logger({
        transactionName: "lyLookup.lyGetLookup",
        modulesProperties: props.modulesProperties,
        data: lookup
      });
      logger.logException("LookupInput: Failed to fetch lookup data");
    }
    else
      columns = await ToolsQuery.columns({
        source: QuerySource.Query,
        appsProperties: props.appsProperties,
        userProperties: props.userProperties,
        tableID: results.items[0][ELookup.queryID],
        sessionMode: (props.sessionMode !== undefined)
          ? props.sessionMode
          : props.appsProperties[EApplications.session],
        overrideQueryPool: props.overrideQueryPool,
        modulesProperties: props.modulesProperties
      })
    if (columns.status === ResultStatus.error)
      errorFound = true
  }

  return { columns: (errorFound) ? [] : columns, data: (errorFound) ? [] : lookup.items, header: results.items[0], status: lookup.status };
}

// Fetch data in parallel
async function fetchParallelLookupData(props: IFetchParallelLookupData): Promise<ILookupResult> {
  const { appsProperties, results, parallelCount, filtersLKP, overrideQueryPool, sessionMode, modulesProperties } = props;
  let currentOffset = 0;
  let allItems: ILookupOption[] = [];
  let overallStatus: ResultStatus = ResultStatus.success;
  let overallHasMore = true;

    while (overallHasMore && currentOffset < appsProperties[EApplications.limit]) {
    // Generate the offsets for the next batch of parallel requests
    const offsets = [];
    // Dynamically generate only the necessary offsets
    let offsetBatchCount = 0;
    while (offsetBatchCount < parallelCount && overallHasMore && currentOffset < appsProperties[EApplications.limit]) {
      offsets.push(currentOffset);
      currentOffset += appsProperties[EApplications.offset];
      offsetBatchCount++;
    }


    // Fetch data for each offset in parallel
    const batchResults = await Promise.all(
      offsets.map(async (offset) => {
        if (overallHasMore) {
          const clonedFiltersLKP = structuredClone(filtersLKP);

          const result = await ToolsQuery.get({
            source: QuerySource.Query,
            framework_pool: appsProperties[EApplications.pool],
            query: results.items[0][ELookup.queryID] as number,
            sessionMode: (sessionMode !== undefined)
              ? sessionMode
              : appsProperties[EApplications.session],
            filters: clonedFiltersLKP,
            override_target_pool: overrideQueryPool,
            limit: appsProperties[EApplications.offset],
            offset: offset,
            modulesProperties,
            jwt_token: props.appsProperties[EApplications.jwt_token]
          });
          // Check the status and return items only if successful
          if (result.status === ResultStatus.success) {
            return {
              items: result.items,
              status: result.status,
              hasMore: result.hasMore
            };
          } else {
            // If result fails, return an empty array and update the overall status
            overallHasMore = false
            return {
              items: [],
              status: result.status,
              hasMore: result.hasMore
            };
          }
        }
      }
      )
    );

    // Flatten and combine items from all successful requests in the current batch
    const combinedBatchItems = batchResults.flatMap(result => result ? result.items : []);

    // Add the current batch of items to the overall result set
    allItems = allItems.concat(combinedBatchItems);
    overallHasMore = batchResults.every((result) => result?.hasMore === true);  // Continue only if request has more data
  }

  // Return both the collected items and the overall status
  return {
    items: allItems,
    status: overallStatus
  };
}