/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { t } from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Custom Import
import { Div_TableTreeTitle } from '@ly_components/styles/Div';
import { LYComponentDisplayMode } from "@ly_types/lyComponents";
import { ITableDisplayView } from "@ly_components/forms/FormsTable/utils/commonUtils";
import { ITableRow, ITableHeader, TablesGridHardCoded, ETableHeader } from "@ly_types/lyTables";
import { IAppsProps } from "@ly_types/lyApplications";
import { getAppsProperties, getModules } from "@ly_features/global";
import { getTreeProperties } from "@ly_services/lyTree";
import { ETreeColumns, IGetTreeProperties } from "@ly_types/lyTree";
import { LoadingIndicator } from "@ly_components/common/LoadingIndicator";
import { AlertMessage } from "@ly_components/common/AlertMessage";
import { ResultStatus } from "@ly_types/lyQuery";
import { ESeverity, IErrorState } from "@ly_utils/commonUtils";
import { ITableState } from "@ly_components/forms/FormsTable/utils/tanstackUtils";
import { IModulesProps } from "@ly_types/lyModules";
import Logger from "@ly_services/lyLogging";
import { Paper_TableTree } from "@ly_components/styles/Paper";
import { Tree } from "@ly_components/common/Tree";

interface ITableTree {
    displayView: ITableDisplayView;
    displayMode: LYComponentDisplayMode;
    table: ITableHeader;
    tableState: ITableState;
    onDoubleClick: (event: React.MouseEvent<Element>, node: ITableRow) => void
    onMouseDown: (event: React.MouseEvent<Element>, node: ITableRow) => void
    onTouchStart: (event: React.TouchEvent<Element>, row: ITableRow) => void
    onTouchEnd: () => void
}

// Define the type for the tree node
interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
}

export const TableTree = (params: ITableTree) => {
    const { displayView, displayMode, table, tableState, onDoubleClick, onMouseDown, onTouchStart, onTouchEnd } = params;
    const appsProperties: IAppsProps = useSelector(getAppsProperties);
    const modulesProperties: IModulesProps = useSelector(getModules);
    const [tree, setTree] = useState<IGetTreeProperties | null>(null); // Track tree data
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorState, setErrorState] = useState<IErrorState>({ message: '', open: false });

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const result = await getTreeProperties({
                    appsProperties,
                    [ETreeColumns.id]: table[ETableHeader.treeID],
                    data: tableState.tableData.rows,
                    modulesProperties
                });
                if (result.status === ResultStatus.success) {
                    setTree(result);
                } else {
                    setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error });
                }
            } catch (error) {
                const logger = new Logger({
                    transactionName: "AppsUser.handleSave",
                    modulesProperties: modulesProperties,
                    data: error
                });
                logger.logException("TableTree: Error fetching tree data");
                setErrorState({ open: true, message: t("unexpectedError"), severity: ESeverity.error });
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [table[ETableHeader.id], appsProperties, tableState.tableData.rows]);



    /**
     * Closes the message and clears the error state.
     */
    const handleMessageClose = useCallback(() => {
        setErrorState({ open: false, message: "" });
    }, [setErrorState]);

    const handleNodeDoubleClick = (e: React.MouseEvent, node: any) => {
        onDoubleClick(e, {ROW_ID: node.id});
      };

      const handleMouseDown = (e: React.MouseEvent, node: any) => {
        onMouseDown(e, {ROW_ID: node.id});
      };

      const handleTouchStart = (e: React.TouchEvent, node: any) => {
        onTouchStart(e, {ROW_ID: node.id});
      };

      const handleTouchEnd = () => {
        onTouchEnd();
      };


    // Display loading indicator until all nodes are fully loaded
    if (isLoading || !tree?.data) return <LoadingIndicator />;

    return (
        <Paper_TableTree elevation={0} displayGrid={displayView.table}>
            <AlertMessage
                open={errorState.open}
                severity={errorState.severity}
                message={errorState.message}
                onClose={handleMessageClose}
            />
            <Div_TableTreeTitle>
                {displayMode === LYComponentDisplayMode.dashboard
                    ? table[ETableHeader.description]
                    : t("button.displayMode.tree")}
            </Div_TableTreeTitle>
            {tree && (
                <Tree
                    nodes={tree.data}
                    onDoubleClick={handleNodeDoubleClick}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />
            )}
        </Paper_TableTree>
    );
};
