/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IAppsProps } from "@ly_types/lyApplications";
import { IModulesProps } from "@ly_types/lyModules";
import { ITableRow } from "@ly_types/lyTables";

export enum ETreeColumns {
    id = "TREE_ID",
    description = "TBL_DESCRIPTION",
    type = "TREE_TYPE",
    parent = "TREE_PARENT",
    child = "TREE_CHILD",
    key = "TREE_KEY",
    group = "TREE_GROUP",
    label = "TREE_LABEL",
}

export interface ITreeItem {
    [ETreeColumns.id]: string;
    [ETreeColumns.description]: string;
    [ETreeColumns.type]: string;
    [ETreeColumns.parent]: string;
    [ETreeColumns.child]: string;
    [ETreeColumns.key]: string;
    [ETreeColumns.group]: string;
    [ETreeColumns.label]: string;
  }


export enum ETreeType {
    Group = "GROUP",
    ParentChild = "PARENT",
    Child = "CHILD"
}

export interface ITreeNode {
    id: string;
    label: string;
    children?: ITreeNode[];
}

export interface IGetTreePropertiesParams {
    appsProperties: IAppsProps
    modulesProperties: IModulesProps
    [ETreeColumns.id]: number
    data: ITableRow[]
}

export interface IGetTreeProperties {
    treeProperties: ITreeItem
    data: ITreeNode[]
    status: string
}
