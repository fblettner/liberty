/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";

// Custom Import
import { Div_Loading } from "@ly_components/styles/Div";
import { Typo_Loading } from "@ly_components/styles/Typography";
import { CircularProgress } from "@ly_components/common/CircularProgress";

interface ILoadingIndicator {
    loadingMessage?: string;
    color?: "primary" | "secondary" | "textSecondary" | "error" | "info" | "success" | "warning" | "textPrimary" | "textDisabled" | string; 
}

export const LoadingIndicator = ({ loadingMessage, color = "primary" }: ILoadingIndicator) => {
    const isThemeColor = ["primary", "secondary", "textSecondary", "error", "info", "success", "warning", "textPrimary", "textDisabled"].includes(color);
    const message = loadingMessage ?? t("loading"); // Use i18n default message if no loadingMessage provided

    return (
        <Div_Loading>
            <CircularProgress />
            <Typo_Loading isThemeColor={isThemeColor} >
                {message}
            </Typo_Loading>
        </Div_Loading>
    );
};