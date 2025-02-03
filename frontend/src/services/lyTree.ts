/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IFiltersProperties } from "@ly_types/lyFilters"
import { QuerySource } from "@ly_types/lyQuery"
import { ETreeColumns, ITreeNode, ETreeType, IGetTreePropertiesParams, ITreeItem } from "@ly_types/lyTree"
import { GlobalSettings } from "@ly_utils/GlobalSettings"
import { ToolsQuery } from "@ly_services/lyQuery"
import { ITableRow, TablesGridHardCoded } from "@ly_types/lyTables"
import { EApplications } from "@ly_types/lyApplications"

function getParentChild(arr: ITableRow[], treeProperties: ITreeItem, parent: string = "0", key: string = "0"): ITreeNode[] {
    const parentChildMap = new Map<string, ITableRow[]>();

    // First pass: Build the parent-child map
    for (const obj of arr) {
        const parentKey = obj[treeProperties[ETreeColumns.parent] as keyof ITreeItem] as string;
        if (!parentChildMap.has(parentKey)) {
            parentChildMap.set(parentKey, []);
        }
        parentChildMap.get(parentKey)!.push(obj);  // Use the non-null assertion operator
    }

    // Second pass: Construct the tree
    const buildTree = (parentKey: string, key: string): ITreeNode[] => {
        const children = parentChildMap.get(parentKey.toString()) || [];

        return children.filter(child => (child[treeProperties[ETreeColumns.key] as keyof ITreeItem] as string).includes(key)).map(child => {
            const childNode: ITreeNode = {
                id: child[TablesGridHardCoded.row_id] as string,
                label: child[treeProperties[ETreeColumns.label] as keyof ITreeItem] as string,
                children: []
            };
            const childTree = buildTree(child[treeProperties[ETreeColumns.child] as keyof ITreeItem] as string, child[treeProperties[ETreeColumns.key] as keyof ITreeItem] as string);
            if (childTree.length) {
                childNode.children = childTree;
            } else {
                delete childNode.children;
            }
            return childNode;
        });
    };

    return buildTree(parent, key);  // Start with the provided parent and key
}

export function getParentChildV2(arr: ITableRow[], treeProperties: ITreeItem, rootParentId: string = '0'): ITreeNode[] {
    const parentChildMap = new Map<string, ITableRow[]>();

    // Step 1: Build the parent-child map
    for (const obj of arr) {
        const parentKey = obj[treeProperties[ETreeColumns.parent] as keyof ITreeItem]?.toString() as string;  
        if (!parentChildMap.has(parentKey)) {
            parentChildMap.set(parentKey, []);
        }
        parentChildMap.get(parentKey)!.push(obj);  
    }
    // Step 2: Recursively build the tree starting from rootParentId ('0')
    const buildTree = (parentKey: string): ITreeNode[] => {
        const children = parentChildMap.get(parentKey.toString()) || [];  

        // Map through each child and build their subtree recursively
        return children.map(child => {
            const childNode: ITreeNode = {
                id: child[TablesGridHardCoded.row_id]?.toString() as string,  
                label: child[treeProperties[ETreeColumns.label] as keyof ITreeItem] as string ?? "",  
                children: buildTree(child[treeProperties[ETreeColumns.key] as keyof ITreeItem]?.toString() as string) 
            };

            // If no children exist, delete the `children` property
            if (childNode.children && childNode.children.length === 0) {
                delete childNode.children;
            }

            return childNode;
        });
    };

    // Step 3: Start the tree construction with the root parent (as a string)
    return buildTree(rootParentId.toString());
}


/* Create a tree array from database with group by columns */
export function getUnflattenTree(
    arr: ITableRow[],
    treeProperties: ITreeItem
): ITreeNode[] {
    const keysArray = treeProperties[ETreeColumns.group].split(";");

    interface TreeLevel {
        _: ITreeNode[];
        [key: string]: TreeLevel | ITreeNode[];
    }

    const tree = arr.reduce((root: TreeLevel, obj: ITableRow) => {
        keysArray.reduce((level: TreeLevel, key: string) => {
            const treeLabel = obj[key] as string; // Access the property dynamically

            if (!level[treeLabel]) {
                level[treeLabel] = { _: [] };
                level._.push({
                    id: treeLabel,
                    label: treeLabel,
                    children: (level[treeLabel] as TreeLevel)._,
                });
            }

            return level[treeLabel] as TreeLevel;
        }, root)
            ._
            .push({
                id: obj[TablesGridHardCoded.row_id] as string,
                label: treeProperties[ETreeColumns.label]
                    .split(";")
                    .map((field) => obj[field])
                    .join(" - "),
            });

        return root;
    }, { _: [] } as TreeLevel)._ as ITreeNode[];

    return tree;
}


export const getTreeProperties = async (props: IGetTreePropertiesParams) => {
    let filters: IFiltersProperties[] = [];

    filters.push({
        header: "",
        field: ETreeColumns.id,
        value: props[ETreeColumns.id],
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
        query: GlobalSettings.getFramework.tree,
        sessionMode: props.appsProperties[EApplications.session],
        filters: filters,
        modulesProperties: props.modulesProperties,
        jwt_token: props.appsProperties[EApplications.jwt_token]
    })

    let treeProperties: ITreeItem = {
        [ETreeColumns.id]: results.items[0][ETreeColumns.id],
        [ETreeColumns.description]: results.items[0][ETreeColumns.description],
        [ETreeColumns.type]: results.items[0][ETreeColumns.type],
        [ETreeColumns.parent]: results.items[0][ETreeColumns.parent],
        [ETreeColumns.child]: results.items[0][ETreeColumns.child],
        [ETreeColumns.key]: results.items[0][ETreeColumns.key],
        [ETreeColumns.group]: results.items[0][ETreeColumns.group],
        [ETreeColumns.label]: results.items[0][ETreeColumns.label],
    }
    let tree: ITreeNode[] = [];

    switch (treeProperties[ETreeColumns.type]) {
        case ETreeType.Group:
            tree = getUnflattenTree(props.data, treeProperties)
            break;
        case ETreeType.ParentChild:
            tree = getParentChildV2(props.data, treeProperties)
            break;
        case ETreeType.Child:
            tree = getParentChild(props.data, treeProperties)
            break;            
    }

    return { treeProperties: treeProperties, data: tree, status: results.status }
}