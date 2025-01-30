/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { EApplications, IAppsProps } from "@ly_types/lyApplications";
import { EDialogHeader, EDialogDetails, IDialogDetails, CDialogContent, IDialogHeader, IReservedRecord } from "@ly_types/lyDialogs";
import React from "react";


export interface IGetRecord {
    dialogDetailsRef: React.MutableRefObject<IDialogDetails[]>,
    dialogContent: CDialogContent,
    dialogHeaderRef: React.MutableRefObject<IDialogHeader>,
    appsProperties: IAppsProps,
}


export const getRecordHandler = (params: IGetRecord) => {
    const { dialogDetailsRef, dialogContent, dialogHeaderRef, appsProperties } = params;
    let filtersDLG: IReservedRecord = ["APPS", appsProperties[EApplications.id].toString(), "QRY", dialogHeaderRef.current[EDialogHeader.queryID]];

    dialogDetailsRef.current.filter((keyField: IDialogDetails)=> keyField[EDialogDetails.key] === "Y").forEach((item: IDialogDetails) => {
        filtersDLG.push(dialogContent.fields[item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID]].value);
    });
    return filtersDLG.join("|")
}
