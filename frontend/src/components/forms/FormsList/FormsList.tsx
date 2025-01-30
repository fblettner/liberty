/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// Custom Import
import { FormsTable } from "@ly_components/forms/FormsTable/FormsTable";
import { ComponentProperties, LYComponentDisplayMode, LYComponentViewMode } from "@ly_types/lyComponents";

export interface IFormsList {
    componentProperties: ComponentProperties;
}

export function FormsList({componentProperties }: IFormsList) {
    return (
        <FormsTable
            componentProperties={componentProperties}
            displayMode={LYComponentDisplayMode.component}
            viewMode={LYComponentViewMode.list}
            viewGrid={false}
            readonly={false}
        />
    )
}